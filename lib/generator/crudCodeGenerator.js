/**
 * CRUD Code Generator
 * Generates complete CRUD model and routes for any resource
 */

export function generateCrudModel(resourceName, fields = [], hasAuth = false) {
  const modelName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1).replace(/s$/, '');
  const collectionName = resourceName.toLowerCase();

  const fieldDefinitions = generateFieldDefinitions(fields);

  return `import mongoose from 'mongoose';

const ${modelName}Schema = new mongoose.Schema(
  {
${fieldDefinitions}
  },
  {
    timestamps: true,
    collection: '${collectionName}'
  }
);

${hasAuth ? `
// Add userId reference if authenticated resources
${modelName}Schema.add({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
` : ''}

${modelName}Schema.index({ createdAt: -1 });

const ${modelName} = mongoose.model('${modelName}', ${modelName}Schema);

export default ${modelName};
`;
}

/**
 * Generate Mongoose field definitions from field names
 */
function generateFieldDefinitions(fields) {
  const fieldDefs = [];

  for (const field of fields) {
    const normalized = field.toLowerCase();

    // Determine field type based on name
    let fieldDef = '';
    if (normalized === 'email') {
      fieldDef = `    ${field}: { type: String, lowercase: true, match: /.+\\@.+\\..+/ }`;
    } else if (normalized === 'price' || normalized === 'cost' || normalized === 'rating') {
      fieldDef = `    ${field}: { type: Number, default: 0 }`;
    } else if (normalized === 'status') {
      fieldDef = `    ${field}: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' }`;
    } else if (normalized === 'views' || normalized === 'likes' || normalized === 'count') {
      fieldDef = `    ${field}: { type: Number, default: 0 }`;
    } else if (normalized === 'userid' || normalized === 'authorid' || normalized === 'postid') {
      fieldDef = `    ${field}: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }`;
    } else if (normalized === 'duedate' || normalized === 'deadline' || normalized === 'startdate') {
      fieldDef = `    ${field}: { type: Date }`;
    } else if (normalized === 'completed' || normalized === 'active' || normalized === 'published') {
      fieldDef = `    ${field}: { type: Boolean, default: false }`;
    } else if (normalized === 'tags') {
      fieldDef = `    ${field}: [{ type: String }]`;
    } else if (normalized === 'items' || normalized === 'comments' || normalized === 'reviews') {
      fieldDef = `    ${field}: [{ type: mongoose.Schema.Types.ObjectId }]`;
    } else {
      // Default to string
      fieldDef = `    ${field}: { type: String }`;
    }

    fieldDefs.push(fieldDef);
  }

  return fieldDefs.length > 0 ? fieldDefs.join(',\n') : '    _id: mongoose.Schema.Types.ObjectId';
}

/**
 * Generate CRUD routes for a resource
 */
export function generateCrudRoutes(resourceName, fields = [], hasAuth = false) {
  const modelName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1).replace(/s$/, '');
  const routePath = `/${resourceName.toLowerCase()}`;

  const authMiddleware = hasAuth ? ', authenticateToken' : '';
  const userIdAssignment = hasAuth ? `
    if (req.user) {
      data.userId = req.user.id;
    }` : '';

  return `import express from 'express';
import ${modelName} from '../models/${modelName}.js';
${hasAuth ? "import { authenticateToken } from '../middleware/auth.js';" : ''}

const router = express.Router();

// ===== CREATE =====
router.post('/'${authMiddleware}, async (req, res) => {
  try {
    const data = req.body;
${userIdAssignment}

    const item = new ${modelName}(data);
    await item.save();

    res.status(201).json({
      success: true,
      message: '${modelName} created successfully',
      data: item
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating ${modelName}',
      error: error.message
    });
  }
});

// ===== READ ALL (LIST) =====
router.get('/'${authMiddleware}, async (req, res) => {
  try {
    const query = ${hasAuth ? "req.user ? { userId: req.user.id } : {}" : "{}"};
    const items = await ${modelName}.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ${modelName}s',
      error: error.message
    });
  }
});

// ===== READ SINGLE =====
router.get('/:id'${authMiddleware}, async (req, res) => {
  try {
    const item = await ${modelName}.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: '${modelName} not found'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ${modelName}',
      error: error.message
    });
  }
});

// ===== UPDATE =====
router.put('/:id'${authMiddleware}, async (req, res) => {
  try {
    const item = await ${modelName}.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: '${modelName} not found'
      });
    }

    res.status(200).json({
      success: true,
      message: '${modelName} updated successfully',
      data: item
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating ${modelName}',
      error: error.message
    });
  }
});

// ===== DELETE =====
router.delete('/:id'${authMiddleware}, async (req, res) => {
  try {
    const item = await ${modelName}.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: '${modelName} not found'
      });
    }

    res.status(200).json({
      success: true,
      message: '${modelName} deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting ${modelName}',
      error: error.message
    });
  }
});

export default router;
`;
}

/**
 * Generate server imports and route registrations
 */
export function generateServerRouteRegistration(resources, hasAuth = false) {
  const imports = [];
  const registrations = [];

  for (const [resourceName, resource] of Object.entries(resources)) {
    if (resourceName === 'api') continue; // Skip generic api resource

    const modelName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1).replace(/s$/, '');
    imports.push(`import ${resourceName}Routes from './routes/${resourceName}.routes.js';`);
    registrations.push(`app.use('/api/${resourceName}', ${resourceName}Routes);`);
  }

  let code = '';
  
  if (imports.length > 0) {
    code += '// Resource Routes\\n' + imports.join('\\n') + '\\n\\n';
  }

  if (registrations.length > 0) {
    code += '// Register Routes\\n' + registrations.join('\\n');
  }

  return code;
}

/**
 * Generate updated package.json dependencies for CRUD
 */
export function getRequiredCrudDependencies() {
  return {
    'express': '^4.18.2',
    'mongoose': '^8.0.0',
    'bcryptjs': '^2.4.3',
    'jsonwebtoken': '^9.1.0',
    'cors': '^2.8.5',
    'dotenv': '^16.3.1'
  };
}

/**
 * Validate if resource has proper CRUD structure
 */
export function validateCrudResource(resource) {
  const errors = [];

  if (!resource.name) {
    errors.push('Resource must have a name');
  }

  if (resource.methods.length === 0) {
    errors.push('Resource must have at least one HTTP method');
  }

  if (resource.fields.length === 0) {
    errors.push('Resource should have at least one field defined');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
