// sync.js - Backendify Sync Mode
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import { scanFrontendCode } from '../scanner/frontendScanner.js';
import { extractAllApiEndpoints } from '../scanner/apiEndpointExtractor.js';
import { generateAdvancedCrudModel, generateAdvancedCrudRoutes } from '../generator/advancedCrudGenerator.js';

/**
 * Sync backend with frontend changes
 * Only adds/updates backend files for new/changed endpoints
 */
export async function syncBackendWithFrontend(projectPath) {
  const backendPath = path.join(projectPath, 'backend');
  if (!fs.existsSync(backendPath)) {
    console.log(chalk.red('❌ Backend folder not found. Please run `backendify generate` first.'));
    return;
  }

  const spinner = ora('🔄 Scanning frontend for API changes...').start();
  const apiCalls = scanFrontendCode(projectPath);
  spinner.succeed(`✅ Found ${apiCalls.length} API calls in frontend`);

  // Extract endpoints grouped by resource
  const endpointsByResource = extractAllApiEndpoints('', apiCalls);

  // For each resource, check if model/route exists, else create or update/merge
  for (const resourceName in endpointsByResource) {
    const resource = endpointsByResource[resourceName];
    const modelName = resolveModelName(backendPath, resourceName);
    const modelFile = path.join(backendPath, 'models', `${modelName}.js`);
    const routeFile = path.join(backendPath, 'routes', `${resourceName}.routes.js`);

    // --- MODEL SYNC ---
    if (!fs.existsSync(modelFile)) {
      const modelCode = generateAdvancedCrudModel(resourceName, Array.from(resource.fields), resource.hasAuth);
      fs.writeFileSync(modelFile, modelCode, 'utf8');
      console.log(chalk.green(`🆕 Model created: models/${modelName}.js`));
    } else {
      // Smart merge: add missing fields to schema at a stable insertion point.
      let modelContent = fs.readFileSync(modelFile, 'utf8');
      const missingFields = Array.from(resource.fields).filter(
        (field) => !new RegExp(`\\b${escapeRegex(field)}\\s*:`).test(modelContent)
      );

      if (missingFields.length > 0) {
        const fieldBlock = missingFields
          .map((field) => `    ${field}: { type: String, trim: true },`)
          .join('\n');

        if (/\n\s*\/\/ Metadata/.test(modelContent)) {
          modelContent = modelContent.replace(/\n\s*\/\/ Metadata/, `\n${fieldBlock}\n\n    // Metadata`);
        } else if (/\n\s*isActive\s*:/.test(modelContent)) {
          modelContent = modelContent.replace(/\n\s*isActive\s*:/, `\n${fieldBlock}\n\n    isActive:`);
        } else {
          modelContent = modelContent.replace(
            /new mongoose\.Schema\s*\(\s*\{\s*/,
            (match) => `${match}\n${fieldBlock}\n`
          );
        }

        fs.writeFileSync(modelFile, modelContent, 'utf8');
        missingFields.forEach((field) => {
          console.log(chalk.yellow(`➕ Field '${field}' added to models/${modelName}.js`));
        });
      }
    }

    // --- ROUTE SYNC ---
    if (!fs.existsSync(routeFile)) {
      const routeCode = generateAdvancedCrudRoutes(resourceName, Array.from(resource.fields), resource.hasAuth);
      fs.writeFileSync(routeFile, routeCode, 'utf8');
      console.log(chalk.green(`🆕 Route created: routes/${resourceName}.routes.js`));
    } else {
      // Keep existing routes stable; sync only scaffolds missing route files.
      // Route-level AST merging will be handled in a future hardening pass.
    }
  }

  console.log(chalk.cyan('\n✅ Backend sync complete!'));
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function singularize(str) {
  if (!str) return str;
  if (str.endsWith('ies')) return `${str.slice(0, -3)}y`;
  if (str.endsWith('ses')) return str.slice(0, -2);
  if (str.endsWith('s') && !str.endsWith('ss')) return str.slice(0, -1);
  return str;
}

function resolveModelName(backendPath, resourceName) {
  const modelsDir = path.join(backendPath, 'models');
  const singularName = capitalize(singularize(resourceName));
  const pluralName = capitalize(resourceName);

  const singularPath = path.join(modelsDir, `${singularName}.js`);
  const pluralPath = path.join(modelsDir, `${pluralName}.js`);

  if (fs.existsSync(singularPath)) return singularName;
  if (fs.existsSync(pluralPath)) return pluralName;

  return singularName;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
