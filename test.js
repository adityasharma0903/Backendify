#!/usr/bin/env node

/**
 * Backendify Test Script
 * Demonstrates the offline generator in action
 */

import { offlineMode } from './lib/modes/offline.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runTest() {
  const testProjectPath = path.join(__dirname, 'test-project');
  
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Running Backendify Test');
  console.log('='.repeat(60) + '\n');
  
  try {
    await offlineMode(testProjectPath);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test Passed! Backend Generated Successfully');
    console.log('='.repeat(60) + '\n');
    
    console.log('📂 Generated backend location:');
    console.log(`   ${testProjectPath}/backend\n`);
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    process.exit(1);
  }
}

runTest();
