import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import ora from 'ora';

const execAsync = promisify(exec);

export async function runDoctor() {
  console.log(chalk.cyan('\n🏥 Backendify Doctor - System Health Check\n'));

  const checks = [
    { name: 'Node.js', test: checkNode },
    { name: 'npm', test: checkNpm },
    { name: 'MongoDB', test: checkMongoDB },
    { name: 'Port 5000', test: checkPort }
  ];

  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    const spinner = ora(`Checking ${check.name}...`).start();
    try {
      const result = await check.test();
      if (result.success) {
        spinner.succeed(`✅ ${check.name} ${result.message}`);
        passed++;
      } else {
        spinner.warn(`⚠️  ${check.name} ${result.message}`);
      }
    } catch (error) {
      spinner.fail(`❌ ${check.name} - ${error.message}`);
      failed++;
    }
  }

  console.log(chalk.cyan('\n📊 Summary:\n'));
  console.log(`   ${chalk.green('✅ Passed:')} ${passed}`);
  console.log(`   ${chalk.red('❌ Failed:')} ${failed}\n`);

  if (failed === 0) {
    console.log(chalk.green('✨ All systems ready! You\\ re good to go.\n'));
  } else {
    console.log(chalk.yellow('⚠️  Fix issues above before using Backendify.\n'));
  }
}

async function checkNode() {
  try {
    const { stdout } = await execAsync('node --version');
    return {
      success: true,
      message: `(${stdout.trim()})`
    };
  } catch {
    return {
      success: false,
      message: '- Install from nodejs.org'
    };
  }
}

async function checkNpm() {
  try {
    const { stdout } = await execAsync('npm --version');
    return {
      success: true,
      message: `(${stdout.trim()})`
    };
  } catch {
    return {
      success: false,
      message: '- Install Node.js which includes npm'
    };
  }
}

async function checkMongoDB() {
  try {
    // Try to connect to local MongoDB
    const { stdout } = await execAsync('mongosh --eval "db.adminCommand(\'ping\')" --quiet');
    return {
      success: true,
      message: '(Running locally)'
    };
  } catch {
    return {
      success: false,
      message: '- MongoDB not running. Start with: mongod or use MongoDB Atlas'
    };
  }
}

async function checkPort() {
  try {
    // Check if port 5000 is available (simple check)
    const net = await import('net');
    const server = net.createServer()
      .once('error', () => {
        return {
          success: false,
          message: '- Port 5000 is in use'
        };
      })
      .once('listening', () => {
        server.close();
        return {
          success: true,
          message: '(Available)'
        };
      })
      .listen(5000);

    return new Promise(resolve => {
      setTimeout(() => {
        server.close();
        resolve({
          success: true,
          message: '(Available)'
        });
      }, 100);
    });
  } catch {
    return {
      success: false,
      message: '- Port 5000 might be in use'
    };
  }
}
