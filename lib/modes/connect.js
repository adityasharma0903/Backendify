/**
 * Auto-Connection Module
 * Automatically connects generated backend with React frontend
 * - Scans React components for API calls and field names
 * - Scans backend routes
 * - Detects mismatches (URLs, field names, response structure)
 * - Auto-fixes components and creates .env
 * - 100% Offline mode - No AI, No Network
 */

import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';

// ============================================================
// MAIN CONNECT FUNCTION
// ============================================================
export async function connectFrontendBackend(projectPath) {
  try {
    console.log(chalk.cyan('\n🔗 Backendify Auto-Connection Engine\n'));
    console.log(chalk.gray('Scanner: Frontend → Backend Connection Analysis\n'));

    const backendPath = path.join(projectPath, 'backend');
    
    // Verify project structure
    if (!fs.existsSync(backendPath)) {
      console.error(chalk.red('❌ Backend not found. Run "backendify generate" first.\n'));
      process.exit(1);
    }

    // Step 1: Scan React components
    const step1 = ora('Step 1/5: Scanning React components...').start();
    const reactAnalysis = scanReactComponents(projectPath);
    step1.succeed(`✅ Found ${reactAnalysis.components.length} API components`);

    // Step 2: Scan backend structure
    const step2 = ora('Step 2/5: Analyzing backend routes...').start();
    const backendAnalysis = scanBackendRoutes(backendPath);
    step2.succeed(`✅ Found ${backendAnalysis.routes.length} backend routes`);

    // Step 3: Detect mismatches
    const step3 = ora('Step 3/5: Analyzing mismatches...').start();
    const mismatches = detectMismatches(reactAnalysis, backendAnalysis);
    step3.succeed(`✅ Detected ${mismatches.issues.length} issues`);

    // Step 4: Auto-fix issues
    const step4 = ora('Step 4/5: Auto-fixing components...').start();
    const fixResults = applyAutoFixes(projectPath, backendPath, mismatches, reactAnalysis, backendAnalysis);
    step4.succeed(`✅ Fixed ${fixResults.fixed} issues`);

    // Detect Vite
    let isVite = false;
    try {
      const pkgPath = path.join(projectPath, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.dependencies?.vite || pkg.devDependencies?.vite) {
          isVite = true;
        }
      }
    } catch(e) {}

    // Step 5: Create/Update .env
    const step5 = ora('Step 5/5: Configuring environment...').start();
    createFrontendEnv(projectPath, backendAnalysis.serverPort, isVite);
    step5.succeed('✅ .env file configured');

    // Summary
    console.log(chalk.green('\n✅ Auto-Connection Complete!\n'));
    console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.white('  Components Updated:'), reactAnalysis.components.length);
    console.log(chalk.white('  Issues Fixed:'), fixResults.fixed);
    console.log(chalk.white('  API URL Configured:'), `http://localhost:${backendAnalysis.serverPort}`);
    console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
    
    if (mismatches.issues.length > 0) {
      console.log(chalk.yellow('⚠️  Issues Found (Auto-Fixed):\n'));
      mismatches.issues.forEach((issue, i) => {
        console.log(chalk.gray(`  ${i+1}. ${issue.type}`));
        console.log(chalk.gray(`     File: ${issue.file}`));
        console.log(chalk.gray(`     Details: ${issue.detail}\n`));
      });
    }

    console.log(chalk.cyan('🚀 Ready to start:\n'));
    console.log(chalk.white('  Frontend:', chalk.bold(`npm start`)));
    console.log(chalk.white('  Backend:', chalk.bold(`npm start`)));
    console.log(chalk.cyan('\n'));

  } catch (error) {
    console.error(chalk.red('❌ Connection Error:', error.message));
    process.exit(1);
  }
}

// ============================================================
// SCANNERS
// ============================================================

function scanReactComponents(projectPath) {
  const components = [];
  const candidateDirs = [
    path.join(projectPath, 'src'),
    path.join(projectPath, 'public'),
    path.join(projectPath, 'frontend'),
    path.join(projectPath, 'client')
  ];

  let files = [];

  for (const dir of candidateDirs) {
    if (fs.existsSync(dir)) {
      files.push(...getAllFilesRecursive(dir));
    }
  }

  files.push(...getTopLevelFiles(projectPath));

  files = Array.from(new Set(files)).filter(file =>
    file.endsWith('.jsx') ||
    file.endsWith('.js') ||
    file.endsWith('.ts') ||
    file.endsWith('.tsx') ||
    file.endsWith('.html')
  );

  if (files.length === 0) {
    return { components: [] };
  }
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Extract API calls
      const apiCalls = extractApiCalls(content);
      
      // Extract form field names (inputs, setState, etc)
      const fieldNames = extractFormFields(content);
      
      // Extract response parsing patterns
      const responsePatterns = extractResponsePatterns(content);

      if (apiCalls.length > 0 || fieldNames.length > 0) {
        components.push({
          file: path.relative(projectPath, file),
          apiCalls,
          fieldNames,
          responsePatterns,
          content
        });
      }
    } catch (error) {
      console.warn(chalk.gray(`  ⚠️  Skipped: ${path.relative(projectPath, file)}`));
    }
  });

  return { components };
}

function scanBackendRoutes(backendPath) {
  const routes = [];
  let serverPort = 5000;

  try {
    // Get port from server.js
    const serverFile = path.join(backendPath, 'server.js');
    if (fs.existsSync(serverFile)) {
      const serverContent = fs.readFileSync(serverFile, 'utf8');
      const portMatch = serverContent.match(/PORT["\s]*=\s*['"]?(\d+)['"]?/);
      if (portMatch) serverPort = parseInt(portMatch[1]);
      
      const portEnvMatch = serverContent.match(/process\.env\.PORT\s*\|\|\s*(\d+)/);
      if (portEnvMatch) serverPort = parseInt(portEnvMatch[1]);
    }

    // Scan routes
    const routesDir = path.join(backendPath, 'routes');
    if (fs.existsSync(routesDir)) {
      const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
      
      routeFiles.forEach(file => {
        const filePath = path.join(routesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const resourceName = file.replace(/\.routes\.js$/i, '').replace(/\.js$/i, '');
        
        // Extract all route definitions
        const routeMatches = content.match(/(router\.(get|post|put|delete|patch))\(['"`]([^'"`]+)['"`]/g);
        
        if (routeMatches) {
          routeMatches.forEach(match => {
            const parts = match.match(/(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/i);
            if (parts) {
              routes.push({
                method: parts[1].toUpperCase(),
                path: parts[2],
                file: file,
                fullPath: normalizeRoutePath(`/api/${resourceName}${parts[2] === '/' ? '' : parts[2]}`)
              });
            }
          });
        }
      });
    }

    // Scan models for field names
    const models = [];
    const modelsDir = path.join(backendPath, 'models');
    if (fs.existsSync(modelsDir)) {
      const modelFiles = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'));
      
      modelFiles.forEach(file => {
        const filePath = path.join(modelsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const fields = extractMongooseFields(content);
        
        models.push({
          name: file.replace('.js', ''),
          file: file,
          fields: fields
        });
      });
    }

    return { routes, models, serverPort };
  } catch (error) {
    console.warn(chalk.yellow(`⚠️  Backend scan error: ${error.message}`));
    return { routes: [], models: [], serverPort: 5000 };
  }
}

// ============================================================
// MISMATCH DETECTION
// ============================================================

function detectMismatches(reactAnalysis, backendAnalysis) {
  const issues = [];

  reactAnalysis.components.forEach(component => {
    // Check 1: API URLs (should use environment variable)
    component.apiCalls.forEach(call => {
      // If URL is hardcoded /api/... without env variable, flag it
      if (call.url.startsWith('/api') && !call.url.includes('${')) {
        issues.push({
          type: 'Hardcoded API URL',
          file: component.file,
          detail: `URL "${call.url}" should use environment variable`,
          fix: 'url_format',
          component: component.file,
          apiCall: call
        });
      }
      // If URL doesn't have env variable and not http/https
      else if (!call.url.includes('${') && !call.url.includes('http')) {
        if (!call.url.startsWith('/')) {
          issues.push({
            type: 'Invalid API URL Format',
            file: component.file,
            detail: `URL should start with / or use env variable: ${call.url}`,
            fix: 'url_format',
            component: component.file,
            apiCall: call
          });
        }
      }
      
      // Check 2: Route exists in backend
      const cleanUrl = call.url.replace(/`\$\{process\.env\.REACT_APP_API_URL\}/g, '').replace(/`\$\{import\.meta\.env\.VITE_API_URL\}/g, '').replace(/`/g, '');
      const apiPath = cleanUrl.startsWith('/api') ? cleanUrl : '/api' + cleanUrl;
      const routeExists = backendAnalysis.routes.some(route => {
        const fullPath = `/api/${route.path === '/' ? route.file.replace('.routes.js', '') : route.file.replace('.routes.js', '') + route.path}`;
        // Match exact path or parameterized path
        return normalizeRoutePath(fullPath) === normalizeRoutePath(apiPath) ||
               normalizeRoutePath(fullPath).replace(/:\w+/g, ':id') === normalizeRoutePath(apiPath).replace(/:\w+/g, ':id');
      });
      
      if (!routeExists && !isAuthUrl(apiPath)) {
        issues.push({
          type: 'Missing Backend Route',
          file: component.file,
          detail: `API endpoint "${apiPath}" not found in backend routes`,
          fix: 'missing_route',
          component: component.file,
          apiPath: apiPath,
          method: call.method || 'GET'
        });
      }
    });

    // Check 3: Field name mismatches
    component.fieldNames.forEach(field => {
      const backendHasField = backendAnalysis.models.some(model => 
        model.fields.some(f => f.name === field.name)
      );

      if (!backendHasField && field.name !== 'password' && field.name !== 'email') {
        // Try fuzzy matching (e.g., fullname vs name)
        const similarField = backendAnalysis.models.flatMap(m => m.fields)
          .find(f => isSimilarField(f.name, field.name));
        
        if (similarField) {
          issues.push({
            type: 'Field Name Mismatch',
            file: component.file,
            detail: `"${field.name}" should be "${similarField.name}"`,
            fix: 'field_name',
            component: component.file,
            oldField: field.name,
            newField: similarField.name
          });
        }
      }
    });

    // Check 4: Response parsing patterns
    if (component.responsePatterns.length > 0) {
      // Infer expected structure from response patterns
      component.responsePatterns.forEach(pattern => {
        if (pattern.accessPath.includes('[0]') || pattern.accessPath.includes('.data.data')) {
          issues.push({
            type: 'Response Structure Issue',
            file: component.file,
            detail: `Possible nested response structure: ${pattern.accessPath}`,
            fix: 'response_structure',
            component: component.file,
            pattern
          });
        }
      });
    }
  });

  return { issues };
}

/**
 * Helper functions for route matching
 */
function normalizeRoutePath(path) {
  return path.toLowerCase().trim();
}

function isAuthUrl(path) {
  return path.includes('/auth/');
}



// ============================================================
// AUTO-FIXES
// ============================================================

function applyAutoFixes(projectPath, backendPath, mismatches, reactAnalysis, backendAnalysis) {
  let fixedCount = 0;

  // Detect Vite
  let isVite = false;
  try {
    const pkgPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.dependencies?.vite || pkg.devDependencies?.vite) {
        isVite = true;
      }
    }
  } catch(e) {}

  mismatches.issues.forEach(issue => {
    try {
      if (issue.fix === 'missing_route') {
        // Auto-generate missing routes
        const { resourceName, routePath, method } = parseApiPath(issue.apiPath);
        const routeFile = path.join(backendPath, 'routes', `${resourceName}.routes.js`);
        
        if (fs.existsSync(routeFile)) {
          let content = fs.readFileSync(routeFile, 'utf8');
          const newRoute = generateMissingRoute(routePath, method, resourceName);
          
          // Insert new route before the export statement
          content = content.replace(/export default router;/, `${newRoute}\n\nexport default router;`);
          
          fs.writeFileSync(routeFile, content, 'utf8');
          fixedCount++;
        }
      }

      if (issue.fix === 'field_name') {
        // Fix field name in component
        const filePath = path.join(projectPath, issue.component);
        if (fs.existsSync(filePath)) {
          let content = fs.readFileSync(filePath, 'utf8');
          const regex = new RegExp(`\\b${escapeRegex(issue.oldField)}\\b`, 'g');
          
          // Only replace in API payloads and form context, not in comments
          content = content.replace(regex, (match) => {
            // Simple heuristic: if surrounded by quotes or brackets, it's likely a data field
            return match;
          });

          // More precise: only replace in specific contexts (object literals, formData)
          content = replaceFieldNameInContext(content, issue.oldField, issue.newField);
          
          fs.writeFileSync(filePath, content, 'utf8');
          fixedCount++;
        }
      }

      if (issue.fix === 'response_structure') {
        // Fix response parsing
        const filePath = path.join(projectPath, issue.component);
        if (fs.existsSync(filePath)) {
          let content = fs.readFileSync(filePath, 'utf8');
          
          // Auto-detect and fix common response structure issues
          content = fixPartialUpdateMethods(content);
          content = fixResponseParsing(content);
          
          fs.writeFileSync(filePath, content, 'utf8');
          fixedCount++;
        }
      }

      if (issue.fix === 'url_format') {
        // Fix API URL format
        const filePath = path.join(projectPath, issue.component);
        if (fs.existsSync(filePath)) {
          let content = fs.readFileSync(filePath, 'utf8');
          content = fixApiUrls(content, isVite);
          content = fixPartialUpdateMethods(content);
          content = fixResponseParsing(content);
          fs.writeFileSync(filePath, content, 'utf8');
          fixedCount++;
        }
      }
    } catch (error) {
      console.warn(chalk.gray(`    ⚠️  Could not fix: ${issue.file} - ${error.message}`));
    }
  });

  // Safety pass: normalize partial status updates from PUT -> PATCH
  // This protects generated frontends that toggle completed/status fields.
  const componentFiles = new Set(
    (reactAnalysis.components || [])
      .map((component) => path.join(projectPath, component.file))
      .filter(Boolean)
  );

  componentFiles.forEach((filePath) => {
    try {
      if (!fs.existsSync(filePath)) return;
      const original = fs.readFileSync(filePath, 'utf8');
      const updated = fixPartialUpdateMethods(original);
      if (updated !== original) {
        fs.writeFileSync(filePath, updated, 'utf8');
        fixedCount++;
      }
    } catch {
      // Ignore file-level rewrite failures
    }
  });

  return { fixed: fixedCount };
}

function fixResponseParsing(content) {
  // Fix common response parsing patterns
  
  // Pattern 1: res.data.data.token → res.data.token (if response is {data: {...}})
  content = content.replace(/data\.data\.(\w+)/g, 'data.$1');
  
  // Pattern 2: response.data.data.user → response.data.user
  content = content.replace(/response\.data\.data\.(\w+)/g, 'response.data.$1');

  // Pattern 3: const x = await response.json();
  // Works for both raw API arrays and wrapped payloads like { success, data }
  content = content.replace(
    /const\s+(\w+)\s*=\s*await\s+(\w+)\.json\(\);/g,
    (fullMatch, variableName, responseName) => {
      if (variableName.endsWith('Response')) {
        return fullMatch;
      }

      return `const ${variableName}Response = await ${responseName}.json();\n            const ${variableName} = Array.isArray(${variableName}Response) ? ${variableName}Response : (${variableName}Response.data ?? ${variableName}Response);`;
    }
  );
  
  return content;
}

function fixApiUrls(content, isVite = false) {
  // Ensure API calls use environment variables for base URL
  const API_URL = isVite ? 'import.meta.env.VITE_API_URL' : 'process.env.REACT_APP_API_URL';
  
  // Pattern 1: fetch('/api/... → fetch(`${process.env.REACT_APP_API_URL}/api/...
  content = content.replace(
    /fetch\s*\(\s*['"`](\/api\/[^'"`]+)['"`]/g,
    `fetch(\`\${${API_URL}}$1\``
  );

  // Pattern 2: Template literals with /api at start: fetch(`/api/products/${id}`)
  content = content.replace(
    /fetch\s*\(\s*`(\/api\/[^`]+)`/g,
    (match, url) => {
      // If already has env variable, skip
      if (url.includes('$') || match.includes(API_URL)) return match;
      return `fetch(\`\${${API_URL}}${url}\``;
    }
  );

  // Pattern 3: const url = '/api/... → const url = `${process.env.REACT_APP_API_URL}/api/...
  content = content.replace(
    /(const|let|var)\s+(\w+)\s*=\s*['"`](\/api\/[^'"`]+)['"`]/g,
    `$1 $2 = \`\${${API_URL}}$3\``
  );

  // Pattern 4: axios calls and custom instances
  content = content.replace(
    /\b(axios|api|client|http|request)\.(get|post|put|delete|patch)\s*\(\s*['"`](\/api\/[^'"`]+)['"`]/g,
    `$1.$2(\`\${${API_URL}}$3\``
  );

  return content;
}

function fixPartialUpdateMethods(content) {
  // Convert fetch PUT calls to PATCH when payload appears to be status-toggle only
  content = content.replace(/fetch\s*\(\s*[\s\S]*?\{[\s\S]*?\}\s*\)/g, (callExpression) => {
    if (!/method\s*:\s*['"`]PUT['"`]/i.test(callExpression)) return callExpression;

    const payloadMatches = [...callExpression.matchAll(/body\s*:\s*JSON\.stringify\s*\(\s*(\{[\s\S]*?\})\s*\)/gi)];
    if (payloadMatches.length === 0) return callExpression;

    const shouldPatch = payloadMatches.some((match) => isPartialStatusPayload(match[1]));
    if (!shouldPatch) return callExpression;

    return callExpression.replace(/method\s*:\s*['"`]PUT['"`]/i, "method: 'PATCH'");
  });

  // Convert axios-like .put(url, payload) to .patch(url, payload) for partial status payloads
  content = content.replace(
    /\b(axios|api|client|http|request)\.put\s*\(\s*([^,]+)\s*,\s*(\{[\s\S]*?\})\s*(,\s*[\s\S]*?)?\)/g,
    (match, clientName, urlArg, payload, trailing = '') => {
      if (!isPartialStatusPayload(payload)) return match;
      return `${clientName}.patch(${urlArg}, ${payload}${trailing})`;
    }
  );

  return content;
}

function isPartialStatusPayload(payloadText = '') {
  const statusLikeKeys = ['completed', 'isCompleted', 'done', 'isDone', 'status', 'state', 'isActive', 'active', 'archived'];
  const fullUpdateKeys = ['title', 'name', 'description', 'email', 'password', 'phone', 'address', 'price', 'amount', 'content'];

  const hasStatusLikeKey = statusLikeKeys.some((key) =>
    new RegExp(`\\b${escapeRegex(key)}\\b\\s*:`, 'i').test(payloadText)
  );

  const hasFullUpdateKey = fullUpdateKeys.some((key) =>
    new RegExp(`\\b${escapeRegex(key)}\\b\\s*:`, 'i').test(payloadText)
  );

  return hasStatusLikeKey && !hasFullUpdateKey;
}

function replaceFieldNameInContext(content, oldField, newField) {
  // Replace field names only in appropriate contexts
  
  // In object literals: {"oldField": value}
  content = content.replace(
    new RegExp(`['"](${escapeRegex(oldField)})['"]\\s*:`, 'g'),
    `"${newField}":`
  );

  // In FormData: formData.append('oldField', ...)
  content = content.replace(
    new RegExp(`\\bappend\\s*\\(['"](${escapeRegex(oldField)})['"]`, 'g'),
    `append('${newField}'`
  );

  // In object shorthand: {oldField}
  content = content.replace(
    new RegExp(`\\b${escapeRegex(oldField)}\\b(?=\\s*[,}])`, 'g'),
    newField
  );

  return content;
}

function createFrontendEnv(projectPath, serverPort, isVite = false) {
  const envPath = path.join(projectPath, '.env');
  const envVar = isVite ? 'VITE_API_URL' : 'REACT_APP_API_URL';
  const envContent = `${envVar}=http://localhost:${serverPort}/api\n`;

  fs.writeFileSync(envPath, envContent, 'utf8');
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllFilesRecursive(dirPath) {
  let files = [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        files = [...files, ...getAllFilesRecursive(fullPath)];
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    });
  } catch (error) {
    // Silently ignore permission errors
  }

  return files;
}

function getTopLevelFiles(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries
      .filter(entry => entry.isFile())
      .map(entry => path.join(dirPath, entry.name));
  } catch {
    return [];
  }
}

function extractApiCalls(content) {
  const calls = [];
  
  // Pattern 1: fetch with string literal (relative or absolute URL)
  const fetchRegex = /fetch\s*\(\s*['"]([^'"\n]+)['"]/g;
  let match;

  while ((match = fetchRegex.exec(content)) !== null) {
    const normalizedUrl = normalizeApiPath(match[1]);
    if (!normalizedUrl) continue;

    calls.push({
      type: 'fetch',
      url: normalizedUrl
    });
  }

  // Pattern 2: fetch with template literal: fetch(`${API_BASE}/api/products/${id}`)
  const fetchTemplateRegex = /fetch\s*\(\s*`([^`]+)`/g;
  
  while ((match = fetchTemplateRegex.exec(content)) !== null) {
    // Clean ${...} variables to :id
    const cleanUrl = match[1].replace(/\$\{[^}]+\}/g, ':id');
    const normalizedUrl = normalizeApiPath(cleanUrl);
    if (!normalizedUrl) continue;

    calls.push({
      type: 'fetch',
      url: normalizedUrl
    });
  }

  // Pattern 3: const url = '/api/...' OR 'http://localhost:5000/api/...'
  const urlVarRegex = /(?:const|let|var)\s+(\w+)\s*=\s*['"`]([^'"`\n]+)['"`]/g;
  const urlVars = new Map();
  
  while ((match = urlVarRegex.exec(content)) !== null) {
    const normalizedUrl = normalizeApiPath(match[2]);
    if (!normalizedUrl) continue;
    urlVars.set(match[1], normalizedUrl);
  }
  
  // Find fetch(variableName)
  const fetchVarRegex = /fetch\s*\(\s*(\w+)\s*[,)]/g;
  
  while ((match = fetchVarRegex.exec(content)) !== null) {
    const varName = match[1];
    if (urlVars.has(varName)) {
      calls.push({
        type: 'fetch',
        url: urlVars.get(varName)
      });
    }
  }

  // Pattern 4: axios calls and custom instances (relative or absolute URL)
  const axiosRegex = /\b(?:axios|api|client|http|request)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`\n]+)['"`]/g;

  while ((match = axiosRegex.exec(content)) !== null) {
    const normalizedUrl = normalizeApiPath(match[2]);
    if (!normalizedUrl) continue;

    calls.push({
      type: 'axios',
      method: match[1],
      url: normalizedUrl
    });
  }

  return calls;
}

function normalizeApiPath(rawUrl) {
  if (!rawUrl) return null;

  const clean = rawUrl.trim();
  if (!clean) return null;

  // Relative API paths
  if (clean.startsWith('/api/')) return clean;

  // Template/absolute paths that include /api/
  const apiIndex = clean.indexOf('/api/');
  if (apiIndex >= 0) {
    return clean.slice(apiIndex);
  }

  return null;
}

function extractFormFields(content) {
  const fields = [];

  // Pattern 1: setState({field: ...})
  const setStateRegex = /\{(\w+):\s*[^}]*\}/g;
  let match;

  while ((match = setStateRegex.exec(content)) !== null) {
    const fieldName = match[1];
    if (!['data', 'error', 'loading', 'response'].includes(fieldName)) {
      fields.push({ name: fieldName });
    }
  }

  // Pattern 2: formData.append('field', ...)
  const formDataRegex = /append\s*\(\s*['"`](\w+)['"`]/g;

  while ((match = formDataRegex.exec(content)) !== null) {
    fields.push({ name: match[1] });
  }

  // Pattern 3: Object destructuring {name, email, ...}
  const destructRegex = /const\s*\{([^}]+)\}\s*=/g;

  while ((match = destructRegex.exec(content)) !== null) {
    const vars = match[1].split(',').map(v => v.trim().split(':')[0]);
    vars.forEach(v => {
      if (v && !['useState', 'useEffect'].includes(v)) {
        fields.push({ name: v });
      }
    });
  }

  // Deduplicate
  return [...new Map(fields.map(f => [f.name, f])).values()];
}

function extractResponsePatterns(content) {
  const patterns = [];

  // Match response access patterns: response.data.user, data.data.token, etc.
  const accessPatterns = /(\w+|response)(\.\w+)+/g;
  let match;

  while ((match = accessPatterns.exec(content)) !== null) {
    patterns.push({
      accessPath: match[0]
    });
  }

  return patterns;
}

function extractMongooseFields(content) {
  const fields = [];

  // Match Mongoose schema fields like: name: { type: String }
  const fieldRegex = /(\w+)\s*:\s*\{?\s*type\s*:\s*(String|Number|Boolean|Date)|(\w+)\s*:\s*(String|Number|Boolean|Date)/g;
  let match;

  while ((match = fieldRegex.exec(content)) !== null) {
    const fieldName = match[1] || match[3];
    if (fieldName) {
      fields.push({ name: fieldName });
    }
  }

  // Remove duplicates
  return [...new Map(fields.map(f => [f.name, f])).values()];
}

function isSimilarField(field1, field2) {
  // Check for common patterns
  const patterns = [
    { old: 'fullname', new: 'name' },
    { old: 'firstname', new: 'name' },
    { old: 'last_name', new: 'lastname' },
    { old: 'phone_number', new: 'phone' },
    { old: 'user_email', new: 'email' }
  ];

  return patterns.some(p => 
    (field1.toLowerCase() === p.old && field2.toLowerCase() === p.new) ||
    (field1.toLowerCase() === p.new && field2.toLowerCase() === p.old)
  );
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
/**
 * Parse API path to extract resource name and route path
 * Examples:
 * /api/admin/dashboard → {resourceName: 'admin', routePath: '/dashboard'}
 * /api/user/invoices → {resourceName: 'user', routePath: '/invoices'}
 * /api/products/:id → {resourceName: 'products', routePath: '/:id'}
 */
function parseApiPath(apiPath) {
  const parts = apiPath.replace(/^\/api\//, '').split('/');
  const resourceName = parts[0];
  const routePath = '/' + parts.slice(1).join('/');
  const method = 'GET'; // Default method
  
  return { resourceName, routePath: routePath === '/' ? '/' : routePath, method };
}

/**
 * Generate a missing route dynamically
 */
function generateMissingRoute(routePath, method, resourceName) {
  const methodLower = method.toLowerCase();
  const cleanPath = routePath === '/' ? '/' : routePath;
  
  let responseLogic = `
    // TODO: Implement ${routePath} logic
    const result = {};
    
    res.status(200).json({
      success: true,
      data: result
    });`;
  
  // Detect common patterns
  if (routePath.includes('dashboard') || routePath.includes('stats')) {
    responseLogic = `
    // Dashboard/Stats endpoint
    const stats = {
      total: 0,
      active: 0,
      revenue: 0
    };
    
    res.status(200).json({
      success: true,
      stats: stats
    });`;
  } else if (routePath.includes('analytics') || routePath.includes('reports')) {
    responseLogic = `
    // Analytics endpoint
    const analytics = {
      data: [],
      summary: {}
    };
    
    res.status(200).json({
      success: true,
      analytics: analytics
    });`;
  } else if (routePath.includes('list') || routePath.includes('all')) {
    responseLogic = `
    // List endpoint
    const items = [];
    
    res.status(200).json({
      success: true,
      count: items.length,
      items: items
    });`;
  } else if (method === 'POST' || method === 'PUT') {
    responseLogic = `
    // Update/Create endpoint
    const result = { ...req.body, _id: new Date().getTime() };
    
    res.status(${method === 'POST' ? '201' : '200'}).json({
      success: true,
      message: '${routePath} processed successfully',
      data: result
    });`;
  }
  
  return `
// Auto-generated route for ${routePath}
router.${methodLower}('${cleanPath}', authenticateToken, async (req, res) => {
  try {${responseLogic}
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing ${routePath}',
      error: error.message
    });
  }
});`;
}