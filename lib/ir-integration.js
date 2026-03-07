/**
 * IR Integration - Connects Scanner → IR → Generator
 * 
 * Professional pipeline: Scan → Build IR → Generate Code
 */

import fs from 'fs';
import path from 'path';
import { scanFrontendCode } from './scanner/frontendScanner.js';
import { buildIR, validateIR, printIR } from './ir-builder/irBuilder.js';
import {
  generateBackendFromScanner,
  writeGeneratedFiles,
  generateBackendScaffold,
  printGenerationSummary
} from './generator/irBasedGenerator.js';

/**
 * Complete pipeline: Frontend → IR → Backend
 */
export async function backendifyWithIR(frontendPath, outputPath, options = {}) {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 BACKENDIFY - IR-Based Backend Generation');
  console.log('='.repeat(70) + '\n');

  try {
    // Step 1: Scan frontend
    console.log('📱 STEP 1: Scanning Frontend Code\n');
    const detectedApis = scanFrontendCode(frontendPath);
    
    if (detectedApis.length === 0) {
      console.warn('⚠️  No APIs detected. Make sure frontend has API calls.');
      return;
    }

    console.log(`✅ Detected ${detectedApis.length} API calls\n`);

    // Step 2: Save detected APIs
    const apisPath = path.join(outputPath, 'detected-apis.json');
    if (!fs.existsSync(path.dirname(apisPath))) {
      fs.mkdirSync(path.dirname(apisPath), { recursive: true });
    }
    fs.writeFileSync(apisPath, JSON.stringify(detectedApis, null, 2));
    console.log(`💾 Saved API detections to: detectedapis.json\n`);

    // Step 3: Build IR
    console.log('🧠 STEP 2: Building Intermediate Representation (IR)\n');
    const ir = buildIR(detectedApis, {
      hasAuth: options.hasAuth ?? true,
      dbType: options.dbType ?? 'mongodb',
      apiVersion: options.apiVersion ?? 'v1',
      projectName: options.projectName || path.basename(frontendPath)
    });

    // Validate IR
    const validation = validateIR(ir);
    if (!validation.valid) {
      console.error('❌ IR Validation Failed:');
      validation.errors.forEach(err => console.error(`   - ${err}`));
      throw new Error('Invalid IR structure');
    }

    // Save IR
    const irPath = path.join(outputPath, 'project.ir.json');
    fs.writeFileSync(irPath, JSON.stringify(ir, null, 2));
    console.log(`💾 Saved IR to: project.ir.json`);

    console.log(`✅ IR built with ${ir.resources.length} resources\n`);

    // Step 4: Generate backend
    console.log('🔨 STEP 3: Generating Backend Code\n');
    const result = await generateBackendFromScanner(detectedApis, {
      hasAuth: options.hasAuth ?? true,
      dbType: options.dbType ?? 'mongodb'
    });

    // Step 5: Write files
    console.log('📁 STEP 4: Writing Generated Files\n');
    
    // Create models, routes, validations
    const backendDir = path.join(outputPath, 'generated');
    await writeGeneratedFiles(result.generated, backendDir);

    // Create scaffold (server.js, package.json, etc.)
    await generateBackendScaffold(result.ir, backendDir);

    // Create README
    createReadme(backendDir, ir, options);

    // Step 6: Summary
    printGenerationSummary(result);

    // Additional info
    console.log('📊 IR Structure Breakdown:\n');
    ir.resources.forEach(resource => {
      console.log(`   📦 ${resource.singular}:`);
      console.log(`      Fields: ${resource.fields.map(f => f.name).join(', ')}`);
      console.log(`      Routes: ${resource.routes.join(', ')}`);
      if (resource.validations && Object.keys(resource.validations).length > 0) {
        console.log(`      Validations: ${Object.keys(resource.validations).join(', ')}`);
      }
    });

    console.log('\n' + '='.repeat(70));
    console.log('✨ GENERATION COMPLETE!');
    console.log('='.repeat(70) + '\n');

    console.log('📂 Generated Structure:');
    console.log(`   ${backendDir}/`);
    console.log(`   ├── models/          (Mongoose models)`);
    console.log(`   ├── routes/          (Express routes)`);
    console.log(`   ├── validations/     (Input validators)`);
    console.log(`   ├── middleware/      (Middleware handlers)`);
    console.log(`   ├── config/          (Database config)`);
    console.log(`   ├── server.js        (Express server)`);
    console.log(`   ├── package.json     (Dependencies)`);
    console.log(`   ├── .env.example     (Environment variables)`);
    console.log(`   ├── README.md        (Documentation)`);
    console.log(`   └── ir-schemas/      (IR JSON files)\n`);

    console.log('🚀 Next Steps:');
    console.log(`   1. cd ${backendDir}`);
    console.log(`   2. npm install`);
    console.log(`   3. Configure .env file`);
    console.log(`   4. npm run dev\n`);

    return {
      success: true,
      ir,
      generatedDir: backendDir,
      stats: {
        resourcesGenerated: ir.resources.length,
        endpointsGenerated: ir.resources.reduce((sum, r) => sum + r.endpoints.length, 0),
        fieldsDefinedGenerated: ir.resources.reduce((sum, r) => sum + r.fields.length, 0)
      }
    };

  } catch (error) {
    console.error('\n❌ Generation Failed:');
    console.error(`   ${error.message}\n`);
    throw error;
  }
}

/**
 * Create README for generated project
 */
function createReadme(outputDir, ir, options) {
  const resources = ir.resources.map(r => 
    `- **${r.singular}** (\`${r.plural}\`): ${r.fields.map(f => f.name).join(', ')}`
  ).join('\n');

  const readme = `# Generated Backend

Auto-generated with **Backendify IR Architecture**

Generated on: ${new Date().toLocaleString()}

## 📦 Resources

${resources}

## 🚀 Getting Started

\`\`\`bash
npm install
\`\`\`

### Configuration

Create a \`.env\` file (copy from \`.env.example\`):

\`\`\`env
MONGODB_URI=mongodb://localhost:27017/backendify-${ir.settings.apiVersion}
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
\`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

Server will start on \`http://localhost:3000\`

## 📚 API Documentation

### Base URL

\`/api/${ir.settings.apiVersion}\`

### Endpoints

${ir.resources.map(r => {
  const endpoints = r.endpoints.map(e => {
    const method = e.method;
    const path = `/api/` + r.plural + (method === 'GET' && e.path.includes(':id') ? '/:id' : '');
    return '- `' + method + ' ' + path + '`';
  }).join('\n');
  return '#### ' + r.singular + '\n\n' + endpoints;
}).join('\n\n')}

## 🔒 Authentication

${ir.settings.hasAuth ? 'Authentication is enabled. Include JWT token in Authorization header.' : 'No authentication configured.'}

## 📂 Project Structure

\`\`\`
.
├── models/          Mongoose schemas
├── routes/          Express route handlers  
├── validations/     Input validation schemas
├── middleware/      Custom middleware
├── config/          Database & environment config
├── server.js        Express server entry point
└── package.json     Dependencies
\`\`\`

## 🔧 Customization

Generated files are ready for customization:

1. **Add Business Logic**: Edit files in \`models/\` and \`routes/\`
2. **Extend Validation**: Modify validation files
3. **Add Middleware**: Create new middleware in \`middleware/\`
4. **Database Hooks**: Add Mongoose hooks in model files

## 🧪 Testing

\`\`\`bash
npm test
\`\`\`

## 📝 Environment Variables

See \`.env.example\` for all configuration options.

## 🚀 Deployment

### Using Docker

Create \`Dockerfile\`:

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

Build and run:

\`\`\`bash
docker build -t backendify-app .
docker run -p 3000:3000 backendify-app
\`\`\`

### Using Node.js

\`\`\`bash
npm install
NODE_ENV=production npm start
\`\`\`

## 📊 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Validation**: Joi
- **Logger**: Built-in request logger

## 📄 License

Generated by Backendify IR Architecture

---

**Generated by**: Backendify  
**Generation Date**: ${new Date().toISOString()}  
**IR Version**: ${ir.version}
`;

  const readmePath = path.join(outputDir, 'README.md');
  fs.writeFileSync(readmePath, readme);
  console.log(`   ✅ ${path.relative(process.cwd(), readmePath)}`);
}

/**
 * Quick start: Directory → Full Backend
 */
export async function quickGenerate(frontendPath, options = {}) {
  const projectName = path.basename(frontendPath);
  const outputPath = `./backendify-${projectName}`;

  return backendifyWithIR(frontendPath, outputPath, {
    projectName,
    ...options
  });
}

/**
 * CLI Helper
 */
export async function runFromCLI(args) {
  const [command, frontendPath, outputPath] = args;

  if (!frontendPath) {
    console.log('\n📖 Usage: node ir-integration.js <frontend-path> [output-path]\n');
    console.log('Examples:');
    console.log('  node ir-integration.js ./my-app');
    console.log('  node ir-integration.js ./frontend ./generated-backend\n');
    process.exit(1);
  }

  if (!fs.existsSync(frontendPath)) {
    console.error(`❌ Frontend path not found: ${frontendPath}`);
    process.exit(1);
  }

  const out = outputPath || `./backendify-${path.basename(frontendPath)}`;

  try {
    await backendifyWithIR(frontendPath, out, {
      hasAuth: true,
      projectName: path.basename(frontendPath)
    });
  } catch (error) {
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runFromCLI(process.argv.slice(2));
}

export default backendifyWithIR;
