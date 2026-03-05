import { buildIR, validateIR } from './lib/ir-builder/irBuilder.js';
import { generateBackendFromScanner, writeGeneratedFiles, printGenerationSummary } from './lib/generator/irBasedGenerator.js';
import fs from 'fs';

try {
  // Define API endpoints in scanner format
  const apis = [
    // User endpoints
    { method: 'POST', path: '/api/v1/users/login', resource: 'users' },
    { method: 'POST', path: '/api/v1/users', resource: 'users' },
    { method: 'GET', path: '/api/v1/users/:id', resource: 'users' },
    { method: 'PUT', path: '/api/v1/users/:id', resource: 'users' },
    { method: 'DELETE', path: '/api/v1/users/:id', resource: 'users' },
    
    // Club endpoints
    { method: 'POST', path: '/api/v1/clubs', resource: 'clubs' },
    { method: 'GET', path: '/api/v1/clubs', resource: 'clubs' },
    { method: 'GET', path: '/api/v1/clubs/:id', resource: 'clubs' },
    { method: 'PUT', path: '/api/v1/clubs/:id', resource: 'clubs' },
    { method: 'DELETE', path: '/api/v1/clubs/:id', resource: 'clubs' },
    
    // Event endpoints
    { method: 'POST', path: '/api/v1/events', resource: 'events' },
    { method: 'GET', path: '/api/v1/events', resource: 'events' },
    { method: 'GET', path: '/api/v1/events/:id', resource: 'events' },
    { method: 'PUT', path: '/api/v1/events/:id', resource: 'events' },
    { method: 'DELETE', path: '/api/v1/events/:id', resource: 'events' },
    
    // Registration endpoints
    { method: 'POST', path: '/api/v1/registrations', resource: 'registrations' },
    { method: 'GET', path: '/api/v1/registrations', resource: 'registrations' },
    { method: 'DELETE', path: '/api/v1/registrations/:id', resource: 'registrations' }
  ];

  console.log('📊 Building IR from API definitions...');
  const ir = buildIR(apis, { 
    apiVersion: 'v1', 
    hasAuth: true,
    dbType: 'mongodb'
  });
  
  console.log('✓ IR built with', ir.resources.length, 'resources');
  console.log('Resources:', ir.resources.map(r => r.singular).join(', '));

  console.log('\n🔨 Generating backend...');
  const result = await generateBackendFromScanner(apis, { 
    apiVersion: 'v1', 
    hasAuth: true 
  });
  
  console.log('✓ Generation complete');
  console.log('Generated files:', Object.keys(result.generated).length);

  // Create output directory
  const outputDir = './event-management-backend';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write files
  console.log('\n💾 Writing files...');
  await writeGeneratedFiles(result.generated, outputDir);
  
  console.log('✓ Files written to', outputDir);
  console.log('\n✅ Backend generation complete!');
  console.log('📂 Next step: cd event-management-backend && npm install && npm run dev');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
}

