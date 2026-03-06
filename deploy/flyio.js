import { deployWithCommand, runCommandCapture } from './utils.js';

async function checkFlyLogin() {
  try {
    const result = await runCommandCapture({
      command: 'flyctl',
      args: ['auth', 'whoami'],
      cwd: process.cwd(),
      streamOutput: false
    });
    return !result.stdout.toLowerCase().includes('not logged in');
  } catch {
    return false;
  }
}

export async function deployToFlyIO(backendPath) {
  return deployWithCommand({
    providerName: 'Fly.io',
    command: 'flyctl',
    packageName: 'flyctl',
    args: ['deploy', '--remote-only'],
    cwd: backendPath,
    urlHints: ['fly.dev'],
    loginCheck: checkFlyLogin,
    loginCommand: { command: 'flyctl', args: ['auth', 'login'] },
    successLabel: 'Backend deployed on Fly.io'
  });
}
