import offlineEnhanced from './lib/modes/offline.enhanced.js';
import path from 'path';

const projectPath = 'test-apps/whatsapp-clone/src';
const outputDir = 'test-apps/whatsapp-clone/generated-backend';

console.log('🚀 Generating WhatsApp-like Backend with Socket.io...\n');

try {
  await offlineEnhanced(projectPath, outputDir);
  console.log('\n✅ Backend Generation Complete!');
  console.log('📂 Check:', outputDir);
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
}
