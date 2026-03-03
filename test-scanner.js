import { scanFrontendCode } from './lib/scanner/frontendScanner.js';
import { extractAllApiEndpoints } from './lib/scanner/apiEndpointExtractor.js';
import fs from 'fs';
import path from 'path';

const projectPath = './ecommerce-app';
const srcPath = path.join(projectPath, 'src');

function readAllFilesRecursive(dirPath) {
  const files = [];
  if (!fs.existsSync(dirPath)) return files;
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...readAllFilesRecursive(fullPath));
    } else if (['.js', '.jsx', '.ts', '.tsx'].some(ext => item.endsWith(ext))) {
      try {
        files.push(fs.readFileSync(fullPath, 'utf8'));
      } catch {}
    }
  }
  return files;
}

console.log('Testing Scanner...\n');

const apiCalls = scanFrontendCode(projectPath);
console.log('✅ API Calls Detected:', apiCalls.length);

const frontendContent = readAllFilesRecursive(srcPath).join('\n');
const resources = extractAllApiEndpoints(frontendContent, apiCalls);

console.log('\n📦 Resources Found:');
Object.entries(resources).forEach(([name, resource]) => {
  if (name !== 'api') {
    console.log(`  - ${name}: ${resource.endpoints.length} endpoints, ${resource.fields.length} fields`);
  }
});

const apiCatchAll = resources.api;
if (apiCatchAll) {
  console.log(`\n⚠️  WARNING: Generic API bucket has ${apiCatchAll.endpoints.length} endpoints`);
  console.log('   Sample routes:', apiCatchAll.endpoints.slice(0, 3).map(e => e.path).join(', '));
} else {
  console.log('\n✅ SUCCESS: No generic API catch-all!');
}

console.log('\n📊 Total Resources (excluding "api"):', Object.keys(resources).filter(r => r !== 'api').length);
