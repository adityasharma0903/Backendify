#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { offlineMode } from './lib/modes/offline.js';
import { runDoctor } from './lib/utils/doctor.js';

const program = new Command();

program
  .name('backendify')
  .description('⚡ Hybrid Backend Generator - Offline + AI Powered')
  .version('1.0.0');

program
  .command('generate [path]')
  .description('🚀 Generate backend (default mode)')
  .action(async (projectPath) => {
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
      } else {
        console.log(chalk.yellow('\n🚧 Online Mode Coming Soon!\n'));
      }
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
  console.log(chalk.cyan('\n💡 Quick Start: backendify generate\n'));
}
