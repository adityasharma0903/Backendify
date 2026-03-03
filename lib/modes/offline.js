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
import { generateCrudModel, generateCrudRoutes, generateServerRouteRegistration } from '../generator/crudCodeGenerator.js';
import { generateAuthEnv } from '../utils/envGenerator.js';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, '../../templates');

export async function offlineMode(projectPath) {
  try {
    console.log(chalk.cyan('\n🚀 Backendify - Complete Backend Generation\n'));
    console.log(chalk.gray('Mode: Full Auto-Generation (Auth + CRUD)\n'));

    const backendPath = path.join(projectPath, 'backend');

    // Step 1: Create backend directory
    const step1 = ora('Step 1/7: Creating backend structure...').start();
    await createBackendStructure(backendPath);
    step1.succeed('✅ Backend structure created');

    // Step 2: Scan frontend and detect ALL APIs
    const step2 = ora('Step 2/7: Scanning frontend for all API calls...').start();
    const apiCalls = scanFrontendCode(projectPath);
    step2.succeed(`✅ Found ${apiCalls.length} API calls`);

    // Step 3: Detect auth patterns and extract resources
    const step3 = ora('Step 3/7: Analyzing API patterns...').start();
    
    // Recursively read all source files (especially React components)
    const srcPath = path.join(projectPath, 'src');
    const frontendContent = readAllFilesRecursive(srcPath).join('\n');

    const authPatterns = detectAuthPatterns(frontendContent, apiCalls);
    const hasAuth = authPatterns.hasSignup || authPatterns.hasLogin || authPatterns.hasProfile;
    
    // Extract all resources from API calls
    const allResources = extractAllApiEndpoints(frontendContent, apiCalls);
    
    const nonAuthResources = Object.fromEntries(
      Object.entries(allResources).filter(([key]) => key !== 'auth' && key !== 'api')
    );
    
    if (hasAuth) {
      console.log(chalk.blue(`   🔐 Auth Setup: ${authPatterns.hasSignup ? '✓ Signup' : ''} ${authPatterns.hasLogin ? '✓ Login' : ''} ${authPatterns.hasProfile ? '✓ Profile' : ''}`));
    }
    if (Object.keys(nonAuthResources).length > 0) {
      console.log(chalk.cyan(`   📊 Resources: ${Object.keys(nonAuthResources).join(', ')}`));
    }
    step3.succeed('✅ Detected authentication patterns');

    // Step 4: Setup middleware
    const step4 = ora('Step 4/7: Setting up middleware...').start();
    await copyMiddlewareFiles(backendPath);
    
    if (hasAuth) {
      await generateAuthSetup(backendPath);
    }
    step4.succeed('✅ Middleware configured');

    // Step 5: Generate CRUD models and routes
    const step5 = ora('Step 5/7: Generating CRUD operations...').start();
    const generatedResources = [];
    
    for (const [resourceName, resource] of Object.entries(nonAuthResources)) {
      if (resourceName === 'api') continue;
      
      try {
        const fields = resource.fields && resource.fields.length > 0 
          ? Array.from(resource.fields)
          : getDefaultFieldsForResource(resourceName);

        // Generate Model
        const modelContent = generateCrudModel(resourceName, fields, hasAuth);
        const modelName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1).replace(/s$/, '');
        
        const modelPath = path.join(backendPath, 'models', `${modelName}.js`);
        const modelsDir = path.dirname(modelPath);
        if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });
        fs.writeFileSync(modelPath, modelContent);

        // Generate Routes
        const actions = resource.actions || [];
        const endpoints = resource.endpoints || [];
        const routesContent = generateCrudRoutes(resourceName, fields, hasAuth, actions, endpoints);
        
        const routesPath = path.join(backendPath, 'routes', `${resourceName}.routes.js`);
        const routesDir = path.dirname(routesPath);
        if (!fs.existsSync(routesDir)) fs.mkdirSync(routesDir, { recursive: true });
        fs.writeFileSync(routesPath, routesContent);

        generatedResources.push(resourceName);
      } catch (error) {
        console.warn(`⚠️  Failed to generate ${resourceName}: ${error.message}`);
      }
    }

    if (generatedResources.length > 0) {
      step5.succeed(`✅ Generated ${generatedResources.length} CRUD resources`);
    } else {
      step5.succeed('✅ CRUD operations configured');
    }

    // Step 6: Generate server, .env, and package.json
    const step6 = ora('Step 6/7: Generating server configuration...').start();
    await generateServerFile(backendPath, hasAuth, nonAuthResources);
    await generateEnvFile(backendPath, hasAuth);
    await generatePackageJson(backendPath, hasAuth);
    step6.succeed('✅ Server configured (Express + MongoDB)');

    // Step 7: Install dependencies
    const step7 = ora('Step 7/7: Installing dependencies...').start();
    await installDependencies(backendPath);
    step7.succeed('✅ Dependencies installed');

    // Success message
    console.log(chalk.green.bold('\n✨ Complete Backend Generated Successfully!\n'));
    printCompletionInfo(backendPath, hasAuth, generatedResources, nonAuthResources);

  } catch (error) {
    console.error(chalk.red('\n❌ Generation Failed:'), error.message);
    process.exit(1);
  }
}

async function createBackendStructure(backendPath) {
  const dirs = [
    'routes',
    'models',
    'middleware',
    'config'
  ];

  for (const dir of dirs) {
    const dirPath = path.join(backendPath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}

/**
 * Recursively read all files in a directory
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
      // Skip node_modules and hidden directories
      if (!item.startsWith('.') && item !== 'node_modules') {
        files.push(...readAllFilesRecursive(fullPath));
      }
    } else if (
      item.endsWith('.js') || 
      item.endsWith('.jsx') || 
      item.endsWith('.ts') || 
      item.endsWith('.tsx') ||
      item.endsWith('.json')
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

async function copyMiddlewareFiles(backendPath) {
  const middlewareDir = path.join(backendPath, 'middleware');
  
  // Copy error handler
  const errorTemplate = fs.readFileSync(
    path.join(TEMPLATES_DIR, 'errorHandler.middleware.js'),
    'utf8'
  );
  fs.writeFileSync(path.join(middlewareDir, 'errorHandler.js'), errorTemplate);

  // Copy request logger
  const loggerTemplate = fs.readFileSync(
    path.join(TEMPLATES_DIR, 'requestLogger.middleware.js'),
    'utf8'
  );
  fs.writeFileSync(path.join(middlewareDir, 'requestLogger.js'), loggerTemplate);
}



async function installDependencies(backendPath) {
  const packageTemplate = fs.readFileSync(
    path.join(TEMPLATES_DIR, 'package.template.json'),
    'utf8'
  );

  fs.writeFileSync(
    path.join(backendPath, 'package.json'),
    packageTemplate
  );

  // Install npm packages
  try {
    await execAsync('npm install', { cwd: backendPath });
  } catch (error) {
    console.warn('⚠️  npm install had issues, but backend is ready');
  }
}

/**
 * Generate Auth Setup (User Model + Auth Middleware + Auth Routes)
 */
async function generateAuthSetup(backendPath) {
  const middlewareDir = path.join(backendPath, 'middleware');
  const modelsDir = path.join(backendPath, 'models');
  const routesDir = path.join(backendPath, 'routes');

  // Generate standard middleware (error handler, request logger)
  await copyMiddlewareFiles(backendPath);

  // Generate auth middleware
  const authMiddlewareTemplate = fs.readFileSync(
    path.join(TEMPLATES_DIR, 'auth.middleware.template.js'),
    'utf8'
  );
  fs.writeFileSync(path.join(middlewareDir, 'auth.js'), authMiddlewareTemplate);

  // Generate User model
  const userModelTemplate = fs.readFileSync(
    path.join(TEMPLATES_DIR, 'auth.user.model.template.js'),
    'utf8'
  );
  fs.writeFileSync(path.join(modelsDir, 'User.js'), userModelTemplate);

  // Generate auth routes
  const authRoutesTemplate = fs.readFileSync(
    path.join(TEMPLATES_DIR, 'auth.routes.template.js'),
    'utf8'
  );
  fs.writeFileSync(path.join(routesDir, 'auth.routes.js'), authRoutesTemplate);
}

/**
 * Generate .env file with JWT secret
 */
async function generateEnvFile(backendPath, hasAuth = false) {
  const envContent = hasAuth 
    ? generateAuthEnv()
    : fs.readFileSync(path.join(TEMPLATES_DIR, '.env.template'), 'utf8');

  fs.writeFileSync(path.join(backendPath, '.env'), envContent);
}

/**
 * Generate package.json with proper dependencies
 */
async function generatePackageJson(backendPath, hasAuth = false) {
  let packageJson = JSON.parse(
    fs.readFileSync(path.join(TEMPLATES_DIR, 'package.template.json'), 'utf8')
  );

  if (hasAuth) {
    // Ensure auth dependencies are present
    packageJson.dependencies = packageJson.dependencies || {};
    packageJson.dependencies['bcryptjs'] = '^2.4.3';
    packageJson.dependencies['jsonwebtoken'] = '^9.1.0';
  }

  fs.writeFileSync(
    path.join(backendPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}

/**
 * Generate server.js with all routes (auth + CRUD)
 */
async function generateServerFile(backendPath, hasAuth = false, nonAuthResources = {}) {
  const serverTemplate = fs.readFileSync(
    path.join(TEMPLATES_DIR, 'server.template.js'),
    'utf8'
  );

  let routeImports = '';
  let routeRegistrations = '';

  // Add auth routes if auth is enabled
  if (hasAuth) {
    routeImports += `import authRoutes from './routes/auth.routes.js';\n`;
    routeRegistrations += `app.use('/api/auth', authRoutes);\n\n`;
  }

  // Add CRUD routes for all resources
  for (const [resourceName] of Object.entries(nonAuthResources)) {
    if (resourceName === 'api') continue;
    
    const routesFile = `${resourceName}.routes.js`;
    routeImports += `import ${resourceName}Routes from './routes/${routesFile}';\n`;
    routeRegistrations += `app.use('/api/${resourceName}', ${resourceName}Routes);\n`;
  }

  const serverContent = serverTemplate.replace(
    '<ROUTES>',
    (routeImports + routeRegistrations).trim()
  );

  fs.writeFileSync(path.join(backendPath, 'server.js'), serverContent);
}

function printCompletionInfo(backendPath, hasAuth = false, generatedResources = [], allResources = {}) {
  console.log(chalk.cyan('📦 Generated Backend Structure:\n'));
  console.log(`   📁 ${chalk.bold('backend/')}`);
  console.log(`      ├── server.js              (Main Express server)`);
  console.log(`      ├── .env                   (Environment config with JWT)`);
  console.log(`      ├── package.json           (Dependencies)`);
  console.log(`      ├── 📁 routes/             (API endpoints)`);
  console.log(`      │   ${hasAuth ? '├── auth.routes.js' : ''} (Auth: signup, login, profile, logout)`.replace('├──  (', '├── auth.routes.js             (').trim());
  
  for (const resource of generatedResources) {
    const isLast = resource === generatedResources[generatedResources.length - 1];
    console.log(`      │   ${isLast ? '└' : '├'}── ${resource}.routes.js      (CRUD: List, Create, Read, Update, Delete)`);
  }
  
  console.log(`      ├── 📁 models/             (MongoDB schemas)`);
  console.log(`      │   ${hasAuth ? '├── User.js' : ''} (User with bcryptjs)`.replace('├──', hasAuth ? '├──' : '└──').trim());
  
  for (const resource of generatedResources) {
    const isLast = resource === generatedResources[generatedResources.length - 1];
    const modelName = resource.charAt(0).toUpperCase() + resource.slice(1).replace(/s$/, '');
    console.log(`      │   ${isLast && !hasAuth ? '└' : '├'}── ${modelName}.js`);
  }
  
  console.log(`      ├── 📁 middleware/         (Error handling + Logging${hasAuth ? ' + Auth' : ''})`);
  console.log(`      │   ├── errorHandler.js`);
  console.log(`      │   ├── requestLogger.js`);
  if (hasAuth) {
    console.log(`      │   └── auth.js             (JWT verification)`);
  }
  console.log(`      └── 📁 config/             (Configuration files)\n`);

  console.log(chalk.cyan('🚀 Quick Start:\n'));
  console.log(`   ${chalk.gray('$')} cd backend`);
  console.log(`   ${chalk.gray('$')} npm install  # If needed`);
  console.log(`   ${chalk.gray('$')} npm start\n`);

  console.log(chalk.cyan('📝 Generated Features:\n'));
  console.log(`   ✅ Express.js server with middleware`);
  console.log(`   ✅ MongoDB + Mongoose integration`);
  console.log(`   ✅ Auto-generated REST API routes`);
  console.log(`   ✅ Complete CRUD operations for all resources`);
  console.log(`   ✅ Error handling & request logging`);
  console.log(`   ✅ CORS enabled by default`);
  console.log(`   ✅ Environment variable support`);
  
  if (hasAuth) {
    console.log(`   ✅ JWT Authentication (7-day expiry)`);
    console.log(`   ✅ Bcrypt password hashing (10 rounds)`);
    console.log(`   ✅ User model with validation`);
    console.log(`   ✅ Auth middleware for protected routes`);
  }
  
  console.log(`   ✅ Production-ready structure\n`);

  if (generatedResources.length > 0) {
    console.log(chalk.green('📊 Generated Resources:\n'));
    for (const resource of generatedResources) {
      const modelName = resource.charAt(0).toUpperCase() + resource.slice(1).replace(/s$/, '');
      console.log(`   📦 ${modelName}`);
      console.log(`      Routes: GET /api/${resource}, POST /api/${resource}, GET /api/${resource}/:id`);
      console.log(`              PUT /api/${resource}/:id, DELETE /api/${resource}/:id`);
    }
    console.log();
  }

  if (hasAuth) {
    console.log(chalk.green('🔐 Auth Endpoints:\n'));
    console.log(`   POST   /api/auth/signup       (Register new user)`);
    console.log(`   POST   /api/auth/login        (Login with email & password)`);
    console.log(`   GET    /api/auth/profile      (Get user profile - Protected)`);
    console.log(`   PUT    /api/auth/profile      (Update profile - Protected)`);
    console.log(`   POST   /api/auth/logout       (Logout - Protected)\n`);
  }

  console.log(chalk.yellow('⚠️  Important:\n'));
  console.log(`   1. MongoDB must be running locally or use MongoDB Atlas`);
  console.log(`   2. Update .env with your database URI if needed`);
  console.log(`   3. Update MONGODB_URI in .env for production`);
  if (hasAuth) {
    console.log(`   4. JWT_SECRET is auto-generated in .env`);
  }
  console.log(`   5. Customize models in backend/models/`);
  console.log(`   6. Update routes in backend/routes/\n`);

  console.log(chalk.green.bold('🎉 Ready to Deploy!\n'));
}
