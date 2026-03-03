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
  .option('--auto-connect', 'Auto-connect frontend & backend after generation')
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
        
        // Auto-connect if flag is set
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
  .command('doctor')
  .description('🏥 Diagnose your system readiness')
  .action(async () => {
    await runDoctor();
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
  console.log(chalk.cyan('\n💡 Quick Start:\n'));
  console.log(chalk.white('  Option 1 (Separate commands):'));
  console.log(chalk.gray('    backendify generate                    # Step 1: Generate backend'));
  console.log(chalk.gray('    backendify connect                     # Step 2: Auto-connect & fix\n'));
  console.log(chalk.white('  Option 2 (One command):'));
  console.log(chalk.gray('    backendify generate --auto-connect     # Generate + Auto-connect\n'));
  console.log(chalk.white('  Option 3 (Just connect):'));
  console.log(chalk.gray('    backendify connect [path]              # Auto-connect existing project\n'));
}
