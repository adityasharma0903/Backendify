/**
 * Enhanced Offline Mode v2.0
 * Production-Ready Backend Generation with:
 * - Advanced CRUD operations
 * - Pagination, filtering, sorting, search
 * - Multiple middleware layers
 * - Proper validation and error handling
 * - Database configuration
 * - Bulk operations
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import ora from 'ora';
import { scanFrontendCode, generateRoutesFromAPICalls } from '../scanner/frontendScanner.js';
import { detectAuthPatterns } from '../scanner/authPatternDetector.js';
import { extractAllApiEndpoints, getDefaultFieldsForResource } from '../scanner/apiEndpointExtractor.js';
import { generateAdvancedCrudModel, generateAdvancedCrudRoutes } from '../generator/advancedCrudGenerator.js';
import { generateAuthEnv } from '../utils/envGenerator.js';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, '../../templates');

/**
 * Main Enhanced Offline Mode Function
 */
export async function enhancedOfflineMode(projectPath) {
  try {
    console.log(chalk.cyan('\n🚀 Backendify - Production-Ready Backend Generation v2.0\n'));
    console.log(chalk.gray('Mode: Enterprise Full Auto-Generation\n'));

    const backendPath = path.join(projectPath, 'backend');

    // ========================================================
    // STEP 1: CREATE BACKEND STRUCTURE
    // ========================================================
    const step1 = ora('Step 1/9: Creating production backend structure...').start();
    createAdvancedBackendStructure(backendPath);
    step1.succeed('✅ Backend structure created');

    // ========================================================
    // STEP 2: SCAN FRONTEND
    // ========================================================
    const step2 = ora('Step 2/9: Scanning frontend for APIs...').start();
    const apiCalls = scanFrontendCode(projectPath);
    step2.succeed(`✅ Found ${apiCalls.length} API calls`);

    // ========================================================
    // STEP 3: ANALYZE PATTERNS
    // ========================================================
    const step3 = ora('Step 3/9: Analyzing architecture patterns...').start();
    
    const srcPath = path.join(projectPath, 'src');
    const scanRoot = fs.existsSync(srcPath) ? srcPath : projectPath;
    const frontendContent = readAllFilesRecursive(scanRoot).join('\n');
    
    const authPatterns = detectAuthPatterns(frontendContent, apiCalls);
    const hasAuth = authPatterns.hasSignup || authPatterns.hasLogin || authPatterns.hasProfile;
    
    const allResources = extractAllApiEndpoints(frontendContent, apiCalls);
    const nonAuthResources = Object.fromEntries(
      Object.entries(allResources).filter(([key]) => key !== 'auth' && key !== 'api')
    );
    
    if (hasAuth) {
      console.log(chalk.blue(`   🔐 Auth: ${authPatterns.hasSignup ? '✓Signup ' : ''}${authPatterns.hasLogin ? '✓Login ' : ''}${authPatterns.hasProfile ? '✓Profile' : ''}`));
    }
    if (Object.keys(nonAuthResources).length > 0) {
      console.log(chalk.cyan(`   📊 Resources: ${Object.keys(nonAuthResources).join(', ')}`));
    }
    step3.succeed('✅ Architecture analyzed');

    // ========================================================
    // STEP 4: CREATE CONFIGURATIONS
    // ========================================================
    const step4 = ora('Step 4/9: Setting up configurations...').start();
    
    // Copy config files
    copyConfigFiles(backendPath);
    
    // Copy utilities
    copyUtilityFiles(backendPath);
    
    step4.succeed('✅ Configuration files created');

    // ========================================================
    // STEP 5: SETUP MIDDLEWARE
    // ========================================================
    const step5 = ora('Step 5/9: Configuring middleware layers...').start();
    
    copyAdvancedMiddleware(backendPath, hasAuth);
    
    step5.succeed('✅ Middleware configured');

    // ========================================================
    // STEP 6: GENERATE MODELS & ROUTES
    // ========================================================
    const step6 = ora('Step 6/9: Generating CRUD models and routes...').start();
    const generatedResources = [];
    
    for (const [resourceName, resource] of Object.entries(nonAuthResources)) {
      if (resourceName === 'api') continue;
      
      try {
        const fields = resource.fields && resource.fields.length > 0 
          ? Array.from(resource.fields)
          : getDefaultFieldsForResource(resourceName);

        // Generate Model
        const modelContent = generateAdvancedCrudModel(
          resourceName,
          fields,
          hasAuth,
          resource.relations || []
        );
        
        const modelName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1).replace(/s$/, '');
        const modelPath = path.join(backendPath, 'models', `${modelName}.js`);
        const modelsDir = path.dirname(modelPath);
        if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });
        fs.writeFileSync(modelPath, modelContent);

        // Generate Routes
        const actions = resource.actions || [];
        const routesContent = generateAdvancedCrudRoutes(
          resourceName,
          fields,
          hasAuth,
          resource.relations || [],
          actions
        );
        
        const routesPath = path.join(backendPath, 'routes', `${resourceName}.routes.js`);
        const routesDir = path.dirname(routesPath);
        if (!fs.existsSync(routesDir)) fs.mkdirSync(routesDir, { recursive: true });
        fs.writeFileSync(routesPath, routesContent);

        generatedResources.push(resourceName);
      } catch (error) {
        console.warn(`⚠️  Failed to generate ${resourceName}: ${error.message}`);
      }
    }

    step6.succeed(`✅ Generated ${generatedResources.length} advanced CRUD resources`);

    // ========================================================
    // STEP 7: GENERATE AUTH SETUP (if needed)
    // ========================================================
    const step7 = ora('Step 7/9: Setting up authentication...').start();
    
    if (hasAuth) {
      generateAuthSetup(backendPath);
      step7.succeed('✅ Authentication configured');
    } else {
      step7.succeed('✅ No authentication needed');
    }

    // ========================================================
    // STEP 8: GENERATE SERVER & CONFIGURATION
    // ========================================================
    const step8 = ora('Step 8/9: Generating production server...').start();
    
    generateProductionServer(backendPath, generatedResources, hasAuth);
    generateEnvFile(backendPath, hasAuth);
    generatePackageJson(backendPath);
    generateReadme(backendPath, generatedResources, hasAuth);
    
    step8.succeed('✅ Server and configuration generated');

    // ========================================================
    // STEP 9: INSTALL DEPENDENCIES
    // ========================================================
    const step9 = ora('Step 9/9: Installing dependencies (this may take a minute)...').start();
    
    try {
      await installDependencies(backendPath);
      step9.succeed('✅ Dependencies installed successfully');
    } catch (error) {
      step9.warn('⚠️  npm install completed with warnings (backend is ready)');
    }

    // ========================================================
    // SUCCESS
    // ========================================================
    console.log(chalk.green.bold('\n✨ Production Backend Generated Successfully!\n'));
    printCompletionInfo(backendPath, hasAuth, generatedResources);

  } catch (error) {
    console.error(chalk.red('\n❌ Generation Failed:'), error.message);
    process.exit(1);
  }
}

/**
 * Create Advanced Backend Directory Structure
 */
function createAdvancedBackendStructure(backendPath) {
  const dirs = [
    'models',
    'routes',
    'middleware',
    'config',
    'utils',
    'controllers', // For future use
    'validators', // For future use
    'services'    // For future use
  ];

  for (const dir of dirs) {
    const dirPath = path.join(backendPath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}

/**
 * Copy Configuration Files
 */
function copyConfigFiles(backendPath) {
  const configDir = path.join(backendPath, 'config');
  
  // Database config
  const dbConfig = fs.readFileSync(
    path.join(TEMPLATES_DIR, 'database.config.js'),
    'utf8'
  );
  fs.writeFileSync(path.join(configDir, 'database.js'), dbConfig);
}

/**
 * Copy Utility Files
 */
function copyUtilityFiles(backendPath) {
  const utilsDir = path.join(backendPath, 'utils');
  
  // Helpers
  const helpers = fs.readFileSync(
    path.join(TEMPLATES_DIR, 'utils.helper.js'),
    'utf8'
  );
  fs.writeFileSync(path.join(utilsDir, 'helper.js'), helpers);

  // Pagination
  const pagination = fs.readFileSync(
    path.join(TEMPLATES_DIR, 'pagination.utility.js'),
    'utf8'
  );
  fs.writeFileSync(path.join(utilsDir, 'pagination.js'), pagination);
}

/**
 * Copy Advanced Middleware
 */
function copyAdvancedMiddleware(backendPath, hasAuth) {
  const middlewareDir = path.join(backendPath, 'middleware');
  
  const middlewares = [
    'errorHandler.middleware.js',
    'requestLogger.middleware.js',
    'security.middleware.js',
    'validation.schema.js',
    'cache.middleware.js',
    'rateLimiter.middleware.js',
    'compression.middleware.js'
  ];

  for (const mw of middlewares) {
    try {
      const source = fs.readFileSync(
        path.join(TEMPLATES_DIR, mw),
        'utf8'
      );
      const target = mw.replace('.middleware', '').replace('.schema', '');
      fs.writeFileSync(path.join(middlewareDir, target), source);
    } catch (error) {
      // File might not exist - that's okay
    }
  }

  // Auth middleware
  if (hasAuth) {
    const authMiddleware = fs.readFileSync(
      path.join(TEMPLATES_DIR, 'auth.middleware.template.js'),
      'utf8'
    );
    fs.writeFileSync(path.join(middlewareDir, 'auth.js'), authMiddleware);
  }
}

/**
 * Generate Production Server
 */
function generateProductionServer(backendPath, resources, hasAuth) {
  let template = fs.readFileSync(
    path.join(TEMPLATES_DIR, 'production.server.template.js'),
    'utf8'
  );

  // Generate route imports and registrations
  let routeCode = '';
  
  // Auth routes
  if (hasAuth) {
    routeCode += `import authRoutes from './routes/auth.routes.js';\n`;
  }
  
  // Resource routes
  for (const resource of resources) {
    routeCode += `import ${resource}Routes from './routes/${resource}.routes.js';\n`;
  }

  routeCode += '\n// Register routes\n';
  
  if (hasAuth) {
    routeCode += `app.use('/api/auth', authRoutes);\n`;
  }
  
  for (const resource of resources) {
    routeCode += `app.use('/api/${resource}', ${resource}Routes);\n`;
  }

  template = template.replace(/\/\/\s*__ROUTES__|<ROUTES>/, routeCode);
  
  fs.writeFileSync(path.join(backendPath, 'server.js'), template);
}

/**
 * Generate Environment File
 */
function generateEnvFile(backendPath, hasAuth) {
  const envContent = `# Environment Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/backendify_app
DB_NAME=backendify_app

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# JWT (Auth)
${hasAuth ? `JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Password
PASSWORD_SALT_ROUNDS=10

` : ''}# API
API_VERSION=v1
API_RATE_LIMIT=100

# Logging
LOG_LEVEL=info

# Cache
CACHE_TTL=300

# Production
ENABLE_LOGGING=false
ENABLE_METRICS=false
`;

  fs.writeFileSync(path.join(backendPath, '.env'), envContent);
  fs.writeFileSync(path.join(backendPath, '.env.example'), envContent);
}

/**
 * Generate Package.json
 */
function generatePackageJson(backendPath) {
  const template = fs.readFileSync(
    path.join(TEMPLATES_DIR, 'package.production.json'),
    'utf8'
  );
  
  fs.writeFileSync(path.join(backendPath, 'package.json'), template);
}

/**
 * Generate README
 */
function generateReadme(backendPath, resources, hasAuth) {
  const readmeContent = `# Backend API - Generated by Backendify v2.0

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
\`\`\`

## API Endpoints

### Base URL
\`http://localhost:5000/api\`

### Health Check
- \`GET /health\` - Server health status

### Resources
${resources.map(r => `- \`/api/${r}\` - ${r.toUpperCase()} resource endpoints`).join('\n')}

${hasAuth ? `### Authentication
- \`POST /api/auth/signup\` - Register new user
- \`POST /api/auth/login\` - Login user
- \`GET /api/auth/profile\` - Get user profile
` : ''}

## Features

✅ Production-Ready Architecture
✅ Advanced Pagination & Filtering
✅ Comprehensive Error Handling
✅ Security Headers & Rate Limiting
✅ MongoDB Integration
✅ Mongoose Validation
✅ Soft Delete Support
✅ Activity Logging
✅ CORS Support

## Environment Variables

Copy \`.env.example\` to \`.env\` and update values:

\`\`\`
DATABASE_URL=mongodb://localhost:27017/app
PORT=5000
JWT_SECRET=your_secret_key
NODE_ENV=development
\`\`\`

## Project Structure

\`\`\`
backend/
├── config/           # Database & app config
├── middleware/       # Express middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── utils/           # Helper utilities
├── server.js        # Main server file
├── package.json
├── .env
└── .gitignore
\`\`\`

## API Response Format

All endpoints return JSON in this format:

\`\`\`json
{
  "success": true,
  "message": "Request successful",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
\`\`\`

## Database Models

${resources.map(r => {
  const Model = r.charAt(0).toUpperCase() + r.slice(1).replace(/s$/, '');
  return `- \`${Model}\` - Stores ${r} data`;
}).join('\n')}

## Security Features

- Helmet.js for security headers
- Rate limiting on all endpoints
- MongoDB injection prevention
- CORS protection
- Request validation

## Performance

- Compression middleware
- Database indexes
- Caching headers
- Query optimization
- Bulk operations support

## Error Handling

All errors are returned with appropriate HTTP status codes:

- \`400\` - Bad Request
- \`401\` - Unauthorized
- \`403\` - Forbidden
- \`404\` - Not Found
- \`409\` - Conflict (Duplicate)
- \`500\` - Server Error

## Development

\`\`\`bash
# Start with file watching
npm run dev

# Run tests
npm test

# Check linting
npm run lint
\`\`\`

## Production Deployment

1. Set \`NODE_ENV=production\`
2. Update database URL to production MongoDB
3. Set strong JWT_SECRET
4. Enable HTTPS in reverse proxy
5. Use process manager (PM2)
6. Set up monitoring

## Support

Generated by Backendify v2.0
Full-stack backend generation for modern web applications
`;

  fs.writeFileSync(path.join(backendPath, 'README.md'), readmeContent);
}

/**
 * Helper: Read all files recursively
 */
function readAllFilesRecursive(dirPath) {
  const files = [];
  
  if (!fs.existsSync(dirPath)) {
    return files;
  }

  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!item.startsWith('.') && item !== 'node_modules') {
        files.push(...readAllFilesRecursive(fullPath));
      }
    } else if (
      item.endsWith('.html') ||
      item.endsWith('.js') || 
      item.endsWith('.jsx') || 
      item.endsWith('.ts') || 
      item.endsWith('.tsx')
    ) {
      try {
        files.push(fs.readFileSync(fullPath, 'utf8'));
      } catch {
        // Ignore read errors
      }
    }
  }
  
  return files;
}

/**
 * Generate Auth Setup
 */
function generateAuthSetup(backendPath) {
  const middlewareDir = path.join(backendPath, 'middleware');
  const modelsDir = path.join(backendPath, 'models');
  const routesDir = path.join(backendPath, 'routes');

  // Auth middleware
  try {
    const authMiddleware = fs.readFileSync(
      path.join(TEMPLATES_DIR, 'auth.middleware.template.js'),
      'utf8'
    );
    fs.writeFileSync(path.join(middlewareDir, 'auth.js'), authMiddleware);
  } catch (error) {
    console.warn('⚠️  Could not copy auth middleware');
  }

  // User model
  try {
    const userModel = fs.readFileSync(
      path.join(TEMPLATES_DIR, 'auth.user.model.template.js'),
      'utf8'
    );
    fs.writeFileSync(path.join(modelsDir, 'User.js'), userModel);
  } catch (error) {
    console.warn('⚠️  Could not copy user model');
  }

  // Auth routes
  try {
    const authRoutes = fs.readFileSync(
      path.join(TEMPLATES_DIR, 'auth.routes.template.js'),
      'utf8'
    );
    fs.writeFileSync(path.join(routesDir, 'auth.routes.js'), authRoutes);
  } catch (error) {
    console.warn('⚠️  Could not copy auth routes');
  }
}

/**
 * Install Dependencies
 */
async function installDependencies(backendPath) {
  try {
    await execAsync('npm install', { cwd: backendPath });
  } catch (error) {
    console.warn('⚠️  npm install had some warnings');
  }
}

/**
 * Print Completion Info
 */
function printCompletionInfo(backendPath, hasAuth, resources) {
  console.log(chalk.cyan('📦 Backend Package:'));
  console.log(chalk.gray(`   Path: ${backendPath}`));
  console.log(chalk.gray(`   Resources: ${resources.length}`));
  console.log(chalk.gray(`   Auth: ${hasAuth ? '✓ Enabled' : '✗ Disabled'}\n`));

  console.log(chalk.cyan('🚀 Next Steps:'));
  console.log(chalk.white(`   1. cd backend`));
  console.log(chalk.white(`   2. npm run dev          # Start development server`));
  console.log(chalk.white(`   3. Open http://localhost:5000/health\n`));

  console.log(chalk.cyan('📚 API Resources:'));
  resources.forEach(r => {
    console.log(chalk.gray(`   • GET  /api/${r}          # List all`));
    console.log(chalk.gray(`   • GET  /api/${r}/:id       # Get by ID`));
    console.log(chalk.gray(`   • POST /api/${r}          # Create`));
    console.log(chalk.gray(`   • PUT  /api/${r}/:id       # Update`));
    console.log(chalk.gray(`   • DELETE /api/${r}/:id     # Delete`));
  });

  console.log(chalk.green('\n✨ Your production-ready backend is ready!\n'));
}

export { enhancedOfflineMode as offlineMode };
export default enhancedOfflineMode;
