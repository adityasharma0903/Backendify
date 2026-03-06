import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { deployToVercel } from './vercel.js';
import { deployToNetlify } from './netlify.js';
import { deployToCloudflare } from './cloudflare.js';
import { deployToRailway } from './railway.js';
import { deployToRender } from './render.js';
import { deployToFlyIO } from './flyio.js';
import { autoConnectDeployment } from './connect.js';
import { detectBackendPath, detectFrontendPath, normalizeProviderKey } from './utils.js';

const FRONTEND_PROVIDER_CHOICES = [
  { name: 'Vercel', value: 'vercel' },
  { name: 'Netlify', value: 'netlify' },
  { name: 'Cloudflare Pages', value: 'cloudflare' }
];

const BACKEND_PROVIDER_CHOICES = [
  { name: 'Railway', value: 'railway' },
  { name: 'Render', value: 'render' },
  { name: 'Fly.io', value: 'flyio' },
  { name: 'Skip backend', value: 'skip' }
];

const FRONTEND_DEPLOYERS = {
  vercel: deployToVercel,
  netlify: deployToNetlify,
  cloudflare: deployToCloudflare
};

const BACKEND_DEPLOYERS = {
  railway: deployToRailway,
  render: deployToRender,
  flyio: deployToFlyIO,
  skip: null
};

const FRONTEND_ALIASES = {
  vercel: 'vercel',
  netlify: 'netlify',
  cloudflare: 'cloudflare',
  cloudflarepages: 'cloudflare'
};

const BACKEND_ALIASES = {
  railway: 'railway',
  render: 'render',
  flyio: 'flyio',
  fly: 'flyio',
  skip: 'skip',
  skipbackend: 'skip'
};

export async function runDeploymentFlow(projectPath, options = {}) {
  const resolvedProjectPath = path.resolve(projectPath || process.cwd());

  console.log(chalk.cyan('\nBackendify Deployment\n'));

  const selection = await resolveProviders(options);
  const frontendPath = detectFrontendPath(resolvedProjectPath);
  const backendPath = detectBackendPath(resolvedProjectPath);

  const result = {
    frontendProvider: selection.frontend,
    backendProvider: selection.backend,
    frontendUrl: null,
    backendUrl: null,
    connected: null
  };

  if (selection.frontend) {
    const deployFrontend = FRONTEND_DEPLOYERS[selection.frontend];
    if (!deployFrontend) {
      throw new Error(`Unsupported frontend provider: ${selection.frontend}`);
    }

    const frontendDeployResult = await deployFrontend(frontendPath, selection.frontendOptions || {});
    result.frontendUrl = frontendDeployResult.url;
  }

  if (selection.backend && selection.backend !== 'skip') {
    const deployBackend = BACKEND_DEPLOYERS[selection.backend];
    if (!deployBackend) {
      throw new Error(`Unsupported backend provider: ${selection.backend}`);
    }

    const backendDeployResult = await deployBackend(backendPath, selection.backendOptions || {});
    result.backendUrl = backendDeployResult.url;
  }

  if (result.backendUrl) {
    result.connected = autoConnectDeployment({
      projectPath: resolvedProjectPath,
      frontendPath,
      backendUrl: result.backendUrl
    });
  }

  printSummary(result);
}

async function resolveProviders(options) {
  const normalizedFrontend = normalizeFrontendProvider(options.frontend);
  const normalizedBackend = normalizeBackendProvider(options.backend);

  if (options.full) {
    return {
      frontend: normalizedFrontend || 'vercel',
      backend: normalizedBackend || 'railway',
      frontendOptions: await resolveFrontendOptions(normalizedFrontend || 'vercel')
    };
  }

  const answers = [];

  if (!normalizedFrontend) {
    answers.push(
      await inquirer.prompt([
        {
          type: 'list',
          name: 'frontend',
          message: 'Select frontend hosting',
          choices: FRONTEND_PROVIDER_CHOICES
        }
      ])
    );
  }

  if (!normalizedBackend) {
    answers.push(
      await inquirer.prompt([
        {
          type: 'list',
          name: 'backend',
          message: 'Select backend hosting',
          choices: BACKEND_PROVIDER_CHOICES
        }
      ])
    );
  }

  const frontend = normalizedFrontend || answers.find((entry) => entry.frontend)?.frontend;
  const backend = normalizedBackend || answers.find((entry) => entry.backend)?.backend;

  return {
    frontend,
    backend,
    frontendOptions: await resolveFrontendOptions(frontend)
  };
}

function normalizeFrontendProvider(value) {
  if (!value) return null;
  const normalized = normalizeProviderKey(value);
  const provider = FRONTEND_ALIASES[normalized];

  if (!provider) {
    throw new Error(`Invalid frontend provider: ${value}. Use vercel | netlify | cloudflare`);
  }

  return provider;
}

function normalizeBackendProvider(value) {
  if (!value) return null;
  const normalized = normalizeProviderKey(value);
  const provider = BACKEND_ALIASES[normalized];

  if (!provider) {
    throw new Error(`Invalid backend provider: ${value}. Use railway | render | flyio | skip`);
  }

  return provider;
}

async function resolveFrontendOptions(frontendProvider) {
  if (frontendProvider !== 'cloudflare') {
    return {};
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'buildDir',
      message: 'Build output directory for Cloudflare Pages',
      default: 'dist'
    }
  ]);

  return {
    buildDir: answers.buildDir
  };
}

function printSummary(result) {
  console.log(chalk.green('\nDeployment complete\n'));

  if (result.frontendUrl) {
    console.log(chalk.green('✔ Frontend deployed ->'), chalk.white(result.frontendUrl));
  }

  if (result.backendUrl) {
    console.log(chalk.green('✔ Backend deployed ->'), chalk.white(result.backendUrl));
  } else {
    console.log(chalk.yellow('• Backend deployment skipped'));
  }

  if (result.connected) {
    console.log(chalk.green('\n✔ Frontend connected with backend')); 
    console.log(chalk.gray(`  Updated source files: ${result.connected.updatedFileCount}`));
    console.log(chalk.gray(`  Updated env files: ${result.connected.envFilesUpdated.length}`));
  }

  console.log(chalk.cyan('\nApp live:'));
  if (result.frontendUrl) {
    console.log(chalk.white(`Frontend -> ${result.frontendUrl}`));
  }
  if (result.backendUrl) {
    console.log(chalk.white(`Backend  -> ${result.backendUrl}`));
  }
  console.log('');
}
