import { deployWithCommand, runCommandCapture } from './utils.js';

async function checkRailwayLogin() {
  try {
    const result = await runCommandCapture({
      command: 'railway',
      args: ['whoami'],
      cwd: process.cwd(),
      streamOutput: false
    });
    return result.stdout.trim().length > 0 && !result.stderr.toLowerCase().includes('not logged in');
  } catch {
    return false;
  }
}

export async function deployToRailway(backendPath) {
  return deployWithCommand({
    providerName: 'Railway',
    command: 'railway',
    packageName: '@railway/cli',
    args: ['up'],
    cwd: backendPath,
    urlHints: ['railway.app', 'up.railway.app'],
    loginCheck: checkRailwayLogin,
    loginCommand: { command: 'railway', args: ['login'] },
    successLabel: 'Backend deployed on Railway'
  });
}
