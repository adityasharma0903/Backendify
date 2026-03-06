/**
 * Test Socket Detection
 * Quick test to verify Socket.io detection works
 */

import { buildHybridIR } from './index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testSocketDetection() {
  console.log('🧪 Testing Socket.io Detection...\n');

  try {
    // Test with current project
    const projectPath = __dirname;
    
    console.log('📂 Scanning project:', projectPath);
    
    const ir = buildHybridIR(projectPath);
    
    console.log('\n📊 Socket Detection Results:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (ir.socketDetection) {
      const sd = ir.socketDetection;
      
      console.log('✅ Socket Detected:', sd.hasSocket);
      console.log('✅ Chat Detected:', sd.hasChat);
      console.log('✅ Socket Type:', sd.socketType || 'N/A');
      console.log('✅ Rooms Support:', sd.rooms);
      console.log('✅ Presence Support:', sd.presence);
      console.log('✅ Events Found:', sd.events.length);
      
      if (sd.events.length > 0) {
        console.log('\n📡 Detected Events:');
        sd.events.slice(0, 10).forEach(event => {
          console.log(`   • ${event.type}: ${event.name}`);
        });
        if (sd.events.length > 10) {
          console.log(`   ... and ${sd.events.length - 10} more`);
        }
      }
      
      if (sd.files && sd.files.length > 0) {
        console.log('\n📁 Files with Socket Code:');
        sd.files.slice(0, 5).forEach(file => {
          console.log(`   • ${file}`);
        });
      }
    } else {
      console.log('❌ No socket patterns detected');
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Socket detection test completed!\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run test if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSocketDetection();
}

export { testSocketDetection };
