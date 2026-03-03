import fs from 'fs';
import { globSync } from 'glob';
import path from 'path';

const projectPath = './auth-demo-app';

const patterns = [
  'src/**/*.{js,jsx,ts,tsx}',
  'app/**/*.{js,jsx,ts,tsx}',
  'pages/**/*.{js,jsx,ts,tsx}',
  'components/**/*.{js,jsx,ts,tsx}',
  'services/**/*.{js,jsx,ts,tsx}',
  'frontend/**/*.{js,jsx,ts,tsx}',
  'client/**/*.{js,jsx,ts,tsx}',
  'public/**/*.{js,jsx,ts,tsx}',
  '*.{js,jsx,ts,tsx}'
];

console.log('🔍 Testing scanner...\n');

for (const pattern of patterns) {
  const filePath = path.join(projectPath, pattern);
  const files = globSync(filePath, { nodir: true });
  
  if (files.length > 0) {
    console.log(`✅ Pattern: ${pattern}`);
    console.log(`   Found ${files.length} files:`);
    files.forEach(f => console.log(`   - ${f}`));
    console.log('');
  }
}

// Test reading app.js
const appJsPath = './auth-demo-app/frontend/app.js';
if (fs.existsSync(appJsPath)) {
  console.log('📄 Reading app.js...\n');
  const content = fs.readFileSync(appJsPath, 'utf8');
  
  // Test simple fetch pattern
  const fetchSimplePattern = /fetch\s*\(\s*['"`]([^'"` \n]+)['"`]\s*,/g;
  const fetchTemplatePattern = /fetch\s*\(\s*`[^`]*\$\{[^}]+\}([^`]+)`\s*,/g;
  
  console.log('Testing simple fetch pattern:');
  let match;
  let count = 0;
  while ((match = fetchSimplePattern.exec(content)) !== null) {
    count++;
    console.log(`  Match ${count}: ${match[1]}`);
  }
  
  console.log('\nTesting template fetch pattern:');
  count = 0;
  while ((match = fetchTemplatePattern.exec(content)) !== null) {
    count++;
    console.log(`  Match ${count}: ${match[1]}`);
  }
  
  // Show first fetch call
  const firstFetchIndex = content.indexOf('fetch(');
  if (firstFetchIndex !== -1) {
    console.log('\n📝 First fetch call in file:');
    console.log(content.substring(firstFetchIndex, firstFetchIndex + 200));
  }
}
