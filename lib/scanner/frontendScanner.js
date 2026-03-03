import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import ora from 'ora';

/**
 * Frontend Code Scanner
 * Detects API calls from fetch() and axios
 * Extracts: method, route, body fields
 */

export function scanFrontendCode(projectPath) {
  const spinner = ora('🔍 Scanning frontend code...').start();
  
  try {
    // Find all JS/JSX/TS/TSX files with common API patterns
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

    const files = [];
    for (const pattern of patterns) {
      // Use cwd option instead of path.join for better cross-platform support
      files.push(...globSync(pattern, { nodir: true, cwd: projectPath }));
    }

    const apiCalls = [];

    for (const file of files) {
      try {
        // file is relative to projectPath, so join them
        const fullPath = path.join(projectPath, file);
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Pattern 1: fetch() calls - handles both simple strings and template literals
        // Matches: fetch('url', ...) or fetch(`${baseUrl}/path`, ...)
        const fetchSimplePattern = /fetch\s*\(\s*['"`]([^'"` \n]+)['"`]\s*,/g;
        const fetchTemplatePattern = /fetch\s*\(\s*`[^`]*\$\{[^}]+\}([^`]+)`\s*,/g;
        const axiosPattern = /axios\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"` \n]+)['"`]\s*,?\s*(\{[^}]*\})?\s*\)/g;

        let match;

        // Extract simple fetch calls (skip template literals)
        while ((match = fetchSimplePattern.exec(content)) !== null) {
          const route = match[1];
          
          // Skip if it contains template variable syntax
          if (route.includes('${') || route.includes('}')) {
            continue;
          }
          
          const method = extractMethodAfterFetch(content, match.index);
          const fields = extractFieldsAfterFetch(content, match.index);
          
          apiCalls.push({
            file,
            type: 'fetch',
            method: method || 'GET',
            route,
            fields,
            line: content.substring(0, match.index).split('\n').length
          });
        }

        // Extract template literal fetch calls
        while ((match = fetchTemplatePattern.exec(content)) !== null) {
          const route = match[1]; // The part after ${...}
          const method = extractMethodAfterFetch(content, match.index);
          const fields = extractFieldsAfterFetch(content, match.index);
          
          if (route && route.trim()) {
            apiCalls.push({
              file,
              type: 'fetch',
              method: method || 'GET',
              route,
              fields,
              line: content.substring(0, match.index).split('\n').length
            });
          }
        }

        // Extract axios calls
        while ((match = axiosPattern.exec(content)) !== null) {
          const [fullMatch, method, route, dataStr] = match;
          const fields = dataStr ? extractFieldsFromAxios(dataStr) : [];
          
          apiCalls.push({
            file,
            type: 'axios',
            method: method.toUpperCase(),
            route,
            fields,
            line: content.substring(0, match.index).split('\n').length
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    spinner.succeed(`✅ Found ${apiCalls.length} API calls`);
    return apiCalls;
  } catch (error) {
    spinner.fail('Failed to scan code');
    throw error;
  }
}

function extractMethodFromConfig(configStr) {
  const methodMatch = configStr.match(/method\s*:\s*['"]([A-Z]+)['"]/i);
  return methodMatch ? methodMatch[1] : null;
}

function extractMethodAfterFetch(content, startIndex) {
  // Look ahead for method: 'POST'/'GET'/etc within next 200 chars
  const snippet = content.substring(startIndex, startIndex + 200);
  const methodMatch = snippet.match(/method\s*:\s*['"]([A-Z]+)['"]/i);
  return methodMatch ? methodMatch[1].toUpperCase() : 'GET';
}

function extractFieldsAfterFetch(content, startIndex) {
  // Look ahead for body: JSON.stringify({ fields }) within next 500 chars
  const snippet = content.substring(startIndex, startIndex + 500);
  const bodyMatch = snippet.match(/body\s*:\s*JSON\.stringify\s*\(\s*\{([^}]+)\}/);
  
  if (!bodyMatch) return [];
  
  const fieldStr = bodyMatch[1];
  const fields = fieldStr.match(/(\w+)\s*[,:]/g);
  return fields ? fields.map(f => f.replace(/[,:]/g, '').trim()) : [];
}

function extractFieldsFromConfig(configStr) {
  const bodyMatch = configStr.match(/body\s*:\s*JSON\.stringify\s*\(\{([^}]+)\}\)/);
  if (!bodyMatch) return [];
  
  const fieldStr = bodyMatch[1];
  const fields = fieldStr.match(/(\w+)\s*:/g);
  return fields ? fields.map(f => f.replace(':', '').trim()) : [];
}

function extractFieldsFromAxios(dataStr) {
  // Simple extraction from axios data object
  const fields = dataStr.match(/(\w+)\s*:/g);
  return fields ? fields.map(f => f.replace(':', '').trim()).filter(f => f !== 'headers' && f !== 'timeout') : [];
}

/**
 * Smart Route Mapping
 * Maps detected API calls to CRUD operations
 */

export function generateRoutesFromAPICalls(apiCalls) {
  const routeMap = new Map();

  for (const call of apiCalls) {
    // Extract base resource from route (e.g., /auth/signup -> auth)
    const baseResource = getBaseResource(call.route);
    const key = baseResource;
    
    if (!routeMap.has(key)) {
      routeMap.set(key, {
        route: `/${baseResource}`,
        model: generateModelName(baseResource),
        operations: [],
        subRoutes: new Set()
      });
    }

    const routeInfo = routeMap.get(key);
    
    // Track sub-routes (e.g., /auth/signup, /auth/login)
    routeInfo.subRoutes.add(call.route);
    
    routeInfo.operations.push({
      method: call.method,
      route: call.route,
      fields: call.fields,
      description: getOperationDescription(call.method)
    });
  }

  return Array.from(routeMap.values());
}

function getBaseResource(route) {
  // /auth/signup -> auth
  // /users -> users
  // /api/products/:id -> products
  return route
    .replace(/^\/+/, '') // Remove leading slashes
    .split('/')[0] // Get first segment
    .replace(/[^\w]/g, ''); // Remove special chars
}

function generateModelName(route) {
  // auth -> Auth, users -> User, products -> Product
  const clean = route
    .replace(/^\//, '')
    .split('/')[0]
    .replace(/s$/, ''); // Remove trailing s
  
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function getOperationDescription(method) {
  const descriptions = {
    'GET': 'Fetch data',
    'POST': 'Create new',
    'PUT': 'Update data',
    'PATCH': 'Partial update',
    'DELETE': 'Remove data'
  };
  return descriptions[method] || method;
}
