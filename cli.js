#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { offlineMode } from './lib/modes/offline.js';
import { connectFrontendBackend } from './lib/modes/connect.js';
import { runDoctor } from './lib/utils/doctor.js';

const program = new Command();

program
  .name('backendify')
  .description('⚡ Hybrid Backend Generator - Offline + AI Powered')
  .version('1.0.0');

program
  .command('generate [path]')
  .description('🚀 Generate backend (default mode)')
  .option('--no-auto-connect', 'Skip auto-connect after generation')
  .action(async (projectPath, options) => {
    try {
      const questions = [
        {
          type: 'list',
          name: 'mode',
          message: '🔥 Choose Generation Mode:',
          choices: [
            { name: '⚙️  Offline (Rule-Based Engine - Fast & Stable)', value: 'offline' },
            { name: '🤖 Online (AI-Powered Engine - Smart)', value: 'online' }
          ]
        }
      ];

      const answers = await inquirer.prompt(questions);

      if (answers.mode === 'offline') {
        await offlineMode(projectPath || process.cwd());
        
        // Auto-connect by default (can be skipped with --no-auto-connect)
        if (options.autoConnect) {
          console.log(chalk.cyan('\n🔗 Auto-connecting frontend & backend...\n'));
          await connectFrontendBackend(projectPath || process.cwd());
        }
      } else {
        console.log(chalk.yellow('\n🚧 Online Mode Coming Soon!\n'));
      }
    } catch (error) {
      console.error(chalk.red('❌ Error:', error.message));
      process.exit(1);
    }
  });

program
  .command('connect [path]')
  .description('🔗 Auto-connect frontend & backend (fixes URLs, fields, responses)')
  .action(async (projectPath) => {
    try {
      await connectFrontendBackend(projectPath || process.cwd());
    } catch (error) {
      console.error(chalk.red('❌ Error:', error.message));
      process.exit(1);
    }
  });

program
  .command('sync [path]')
  .description('🔄 Sync backend with frontend changes (update backend for new/changed frontend APIs)')
  .action(async (projectPath) => {
    try {
      const { syncBackendWithFrontend } = await import('./lib/modes/sync.js');
      await syncBackendWithFrontend(projectPath || process.cwd());
    } catch (error) {
      console.error(chalk.red('❌ Error:', error.message));
      process.exit(1);
    }
  });

program
  .command('benchmark [path]')
  .description('⚡ Run scalability & performance tests on your backend')
  .option('--levels <levels>', 'Load levels to test (e.g., 10,100,1000)', '10,100,1000,10000')
  .option('--duration <seconds>', 'Duration of each test in seconds', '10')
  .option('--startup-mode', 'Simulate startup growth over time')
  .action(async (projectPath, options) => {
    try {
      const { runBenchmark } = await import('./lib/modes/benchmark.js');
      await runBenchmark(projectPath || process.cwd(), options);
    } catch (error) {
      console.error(chalk.red('❌ Error:', error.message));
      process.exit(1);
    }
  });

program
  .command('generate-api [path]')
  .description('🎯 Smart API generation - Detect resources from frontend state & generate full-stack APIs')
  .option('--no-inject', 'Skip frontend code injection')
  .action(async (projectPath, options) => {
    try {
      const { generateSmartAPI } = await import('./lib/modes/generateApi.js');
      await generateSmartAPI(projectPath || process.cwd(), options);
    } catch (error) {
      console.error(chalk.red('❌ Error:', error.message));
      process.exit(1);
    }
  });

program
  .command('doctor')
  .description('🏥 Diagnose your system readiness')
  .action(async () => {
    await runDoctor();
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
  console.log(chalk.cyan('\n💡 Quick Start:\n'));
  console.log(chalk.white('  Option 1 (Recommended):'));
  console.log(chalk.gray('    backendify generate                    # Generate + Auto-connect\n'));
  console.log(chalk.white('  Option 2 (Skip auto-connect):'));
  console.log(chalk.gray('    backendify generate --no-auto-connect  # Generate only\n'));
  console.log(chalk.white('  Option 3 (Just connect):'));
  console.log(chalk.gray('    backendify connect [path]              # Auto-connect existing project\n'));
}
