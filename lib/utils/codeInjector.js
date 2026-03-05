/**
 * Frontend Code Injector
 * Injects API calls into frontend code where resources are used
 */

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

/**
 * Inject API calls into frontend files
 */
export function injectApiCalls(projectPath, resources) {
  const injectedFiles = [];
  
  // Find all frontend files
  const patterns = [
    'src/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}'
  ];

  const files = [];
  for (const pattern of patterns) {
    files.push(...globSync(pattern, { nodir: true, cwd: projectPath }));
  }

  for (const file of files) {
    try {
      const fullPath = path.join(projectPath, file);
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      for (const resource of resources) {
        // Check if this file uses this resource
        if (usesResource(content, resource)) {
          const result = injectForResource(content, resource, file);
          if (result.modified) {
            content = result.content;
            modified = true;
          }
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        injectedFiles.push(file);
      }
    } catch (error) {
      // Ignore errors
    }
  }

  return injectedFiles;
}

/**
 * Check if file uses a resource
 */
function usesResource(content, resource) {
  const varName = resource.name;
  const singular = resource.singular;
  
  // Check for useState with this variable
  const statePattern = new RegExp(`\\[${varName},\\s*set\\w+\\]\\s*=\\s*useState`, 'g');
  if (statePattern.test(content)) return true;
  
  // Check for array declaration
  const arrayPattern = new RegExp(`const\\s+${varName}\\s*=\\s*\\[\\]`, 'g');
  if (arrayPattern.test(content)) return true;
  
  // Check for map operations
  const mapPattern = new RegExp(`${varName}\\.map\\s*\\(`, 'g');
  if (mapPattern.test(content)) return true;
  
  return false;
}

/**
 * Inject API calls for a specific resource
 */
function injectForResource(content, resource, fileName) {
  let modified = false;
  const resourceName = resource.name;
  const singular = resource.singular;
  const capitalizedSingular = capitalize(singular);

  // Step 1: Add import if not present
  const importStatement = `import { getAll${capitalize(resourceName)} } from './api/${singular}.js';`;
  
  if (!content.includes(`from './api/${singular}.js'`) && 
      !content.includes(`from "../api/${singular}.js"`) &&
      !content.includes(`from "../../api/${singular}.js"`)) {
    
    // Find the right import path based on file location
    const depth = fileName.split('/').length - 2; // -1 for src, -1 for file itself
    const importPath = '../'.repeat(Math.max(0, depth)) + `api/${singular}.js`;
    
    const correctedImport = `import { getAll${capitalize(resourceName)} } from '${importPath}';`;
    
    // Add import after other imports or at the top
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLine = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLine + 1) + correctedImport + '\n' + content.slice(endOfLine + 1);
    } else {
      content = correctedImport + '\n\n' + content;
    }
    modified = true;
  }

  // Step 2: Add useEffect to fetch data
  const statePattern = new RegExp(`const\\s+\\[${resourceName},\\s*set(\\w+)\\]\\s*=\\s*useState`, 'g');
  const match = statePattern.exec(content);
  
  if (match && !content.includes(`getAll${capitalize(resourceName)}()`)) {
    const setterName = 'set' + match[1];
    
    // Add useEffect after the useState
    const useEffectCode = `
  useEffect(() => {
    const fetch${capitalize(resourceName)} = async () => {
      try {
        const data = await getAll${capitalize(resourceName)}();
        ${setterName}(data.data || data);
      } catch (error) {
        console.error('Error fetching ${resourceName}:', error);
      }
    };

    fetch${capitalize(resourceName)}();
  }, []);
`;

    // Find position after useState
    const useStateEnd = content.indexOf(';', match.index) + 1;
    content = content.slice(0, useStateEnd) + '\n' + useEffectCode + content.slice(useStateEnd);
    
    // Add useEffect import if not present
    if (!content.includes('useEffect')) {
      content = content.replace(
        /import\s+(?:React,\s*)?\{([^}]+)\}\s+from\s+['"]react['"]/,
        (match, imports) => {
          if (!imports.includes('useEffect')) {
            return match.replace(imports, imports + ', useEffect');
          }
          return match;
        }
      );
      
      // If no React import found, add it
      if (!content.includes("from 'react'") && !content.includes('from "react"')) {
        content = `import { useEffect } from 'react';\n` + content;
      }
    }
    
    modified = true;
  }

  return { content, modified };
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default { injectApiCalls };
