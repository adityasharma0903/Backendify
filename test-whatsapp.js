import { buildHybridIR } from './lib/scanner/frontendScanner.js';
import path from 'path';

const projectPath = 'test-apps/whatsapp-clone/src';

console.log('🧪 Testing WhatsApp Clone Socket Detection...\n');

try {
  const ir = await buildHybridIR(projectPath);
  
  console.log('✅ Scan Complete!');
  console.log('\n📊 Results:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (ir.socketDetection) {
    const sd = ir.socketDetection;
    console.log('Socket Detected:', sd.hasSocket ? '✅ YES' : '❌ NO');
    console.log('Chat Detected:', sd.hasChat ? '✅ YES' : '❌ NO');
    console.log('Socket Type:', sd.socketType || 'N/A');
    console.log('Rooms Support:', sd.rooms ? '✅' : '❌');
    console.log('Presence Support:', sd.presence ? '✅' : '❌');
    console.log('Events Found:', sd.events.length);
    
    if (sd.events && sd.events.length > 0) {
      console.log('\n📡 Socket Events:');
      sd.events.forEach(e => console.log(`   • ${e.type}: ${e.name}`));
    }
    
    if (sd.files && sd.files.length > 0) {
      console.log('\n📁 Files:');
      sd.files.forEach(f => console.log(`   • ${f}`));
    }
  } else {
    console.log('❌ No socket detection data found');
  }
  
  console.log('\n📦 Resources Found:', ir.resources?.length || 0);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
}
