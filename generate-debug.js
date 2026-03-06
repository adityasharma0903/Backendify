import { buildHybridIR } from './lib/scanner/frontendScanner.js';
import offlineEnhanced from './lib/modes/offline.enhanced.js';

const projectPath = 'test-apps/whatsapp-clone/src';
const outputDir = 'test-apps/whatsapp-clone/generated-backend-v2';

console.log('🚀 Generating WhatsApp Backend with Debug Info...\n');

try {
  // First, check what IR detects
  const ir = await buildHybridIR(projectPath);
  
  console.log('🔍 Debug - IR socketDetection:');
  console.log(JSON.stringify(ir.socketDetection, null, 2));
  console.log('\n');
  
  // Now generate
  await offlineEnhanced(projectPath, outputDir);
  console.log('\n✅ Complete!');
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
}
