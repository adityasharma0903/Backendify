/**
 * Antyx - Hybrid Backend Generator
 * 
 * Main entry point for programmatic usage
 * 
 * Usage:
 * import { offlineMode, runDoctor } from 'antyx';
 * 
 * await offlineMode('/path/to/project');
 * await runDoctor();
 */

export { offlineMode } from './lib/modes/offline.js';
export { runDoctor } from './lib/utils/doctor.js';
export { scanFrontendCode, generateRoutesFromAPICalls, buildHybridIR } from './lib/scanner/frontendScanner.js';
export { detectSocket } from './core/detector/detectSocket.js';
export { generateSocketBackend, generateServerWithSocket } from './core/generator/generateSocket.js';
export * from './core/index.js';
