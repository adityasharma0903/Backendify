import { deployWithCommand, runCommandCapture } from './utils.js';

async function checkRenderLogin() {
  try {
    const result = await runCommandCapture({
      command: 'render',
      args: ['whoami'],
      cwd: process.cwd(),
      streamOutput: false
    });
    return !result.stderr.toLowerCase().includes('not authenticated');
  } catch {
    return false;
  }
}

export async function deployToRender(backendPath) {
  return deployWithCommand({
    providerName: 'Render',
    command: 'render',
    packageName: '@render/cli',
    args: ['deploy'],
    cwd: backendPath,
    urlHints: ['onrender.com'],
    loginCheck: checkRenderLogin,
    loginCommand: { command: 'render', args: ['login'] },
    successLabel: 'Backend deployed on Render'
  });
}
