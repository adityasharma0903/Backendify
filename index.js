/**
 * Backendify - Hybrid Backend Generator
 * 
 * Main entry point for programmatic usage
 * 
 * Usage:
 * import { offlineMode, runDoctor } from 'backendify';
 * 
 * await offlineMode('/path/to/project');
 * await runDoctor();
 */

export { offlineMode } from './lib/modes/offline.js';
export { runDoctor } from './lib/utils/doctor.js';
export { scanFrontendCode, generateRoutesFromAPICalls, buildHybridIR } from './lib/scanner/frontendScanner.js';
export * from './core/index.js';
