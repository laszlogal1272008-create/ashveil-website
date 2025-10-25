/**
 * Isle Server Port Scanner & RCON Detector
 * Scans common ports to find the actual RCON service
 */

const net = require('net');

const CONFIG = {
  host: '45.45.238.134',
  password: 'CookieMonster420',
  timeout: 3000
};

// Common RCON ports to test
const commonRconPorts = [
  16007,  // Current assumption
  17007,  // Game port + 1000
  27015,  // Default Source RCON
  27016,  // Alt Source RCON  
  25575,  // Minecraft RCON (sometimes used)
  19132,  // Bedrock
  7777,   // Common game server port
  7778,   // RCON variant
  8080,   // HTTP admin
  8081,   // Alt HTTP admin
  3000,   // Web panel
  3001,   // Alt web panel
  10000,  // High port range
  10001,
  10002,
  16008,  // Game port + 1
  16009,  // Game port + 2
  16010   // Game port + 3
];

class PortScanner {
  async scanPort(port) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve({ port, open: false, reason: 'timeout' });
      }, CONFIG.timeout);

      socket.connect(port, CONFIG.host, () => {
        clearTimeout(timeout);
        console.log(`✅ Port ${port} is OPEN`);
        
        // Test if it responds to data
        this.testRconProtocol(socket, port)
          .then(result => {
            socket.destroy();
            resolve({ port, open: true, ...result });
          })
          .catch(error => {
            socket.destroy();
            resolve({ port, open: true, responds: false, error: error.message });
          });
      });

      socket.on('error', (error) => {
        clearTimeout(timeout);
        resolve({ port, open: false, reason: error.code });
      });
    });
  }

  async testRconProtocol(socket, port) {
    return new Promise((resolve, reject) => {
      let dataReceived = false;
      
      const dataHandler = (data) => {
        dataReceived = true;
        console.log(`📨 Port ${port} responded with ${data.length} bytes`);
        resolve({
          responds: true,
          response_size: data.length,
          response_preview: data.toString().substring(0, 50)
        });
      };

      socket.once('data', dataHandler);
      
      // Try sending RCON auth packet
      const authPacket = this.createRconPacket(3, CONFIG.password);
      socket.write(authPacket);
      
      // Also try simple text commands
      setTimeout(() => {
        if (!dataReceived) {
          socket.write(`${CONFIG.password}\n`);
        }
      }, 500);
      
      setTimeout(() => {
        if (!dataReceived) {
          socket.write('help\n');
        }
      }, 1000);
      
      setTimeout(() => {
        if (!dataReceived) {
          resolve({ responds: false, reason: 'no_response' });
        }
      }, 2000);
    });
  }

  createRconPacket(type, body) {
    const id = 1;
    const bodyBuffer = Buffer.from(body, 'ascii');
    const packet = Buffer.alloc(14 + bodyBuffer.length);
    
    packet.writeInt32LE(10 + bodyBuffer.length, 0);
    packet.writeInt32LE(id, 4);
    packet.writeInt32LE(type, 8);
    bodyBuffer.copy(packet, 12);
    packet.writeInt16LE(0, 12 + bodyBuffer.length);
    
    return packet;
  }

  async scanAllPorts() {
    console.log(`🔍 Scanning ${CONFIG.host} for RCON services...`);
    console.log(`📋 Testing ${commonRconPorts.length} common ports\n`);
    
    const results = [];
    
    for (const port of commonRconPorts) {
      console.log(`🔍 Scanning port ${port}...`);
      const result = await this.scanPort(port);
      results.push(result);
      
      if (result.open) {
        console.log(`   ✅ OPEN - ${result.responds ? 'RESPONDS' : 'no response'}`);
        if (result.responds) {
          console.log(`   📨 Response: "${result.response_preview}"`);
        }
      } else {
        console.log(`   ❌ closed (${result.reason})`);
      }
      console.log('');
    }
    
    return results;
  }

  summarizeResults(results) {
    console.log('\n=== SCAN RESULTS SUMMARY ===\n');
    
    const openPorts = results.filter(r => r.open);
    const respondingPorts = results.filter(r => r.responds);
    
    console.log(`📊 Ports scanned: ${results.length}`);
    console.log(`🔓 Open ports: ${openPorts.length}`);
    console.log(`📨 Responding ports: ${respondingPorts.length}\n`);
    
    if (openPorts.length === 0) {
      console.log('❌ NO OPEN PORTS FOUND');
      console.log('This indicates:');
      console.log('   - RCON might not be enabled');
      console.log('   - Firewall blocking connections');
      console.log('   - Different server IP');
      return;
    }
    
    console.log('🔓 OPEN PORTS:');
    openPorts.forEach(port => {
      console.log(`   Port ${port.port}: ${port.responds ? '✅ RESPONDS' : '⚠️  Silent'}`);
    });
    
    if (respondingPorts.length > 0) {
      console.log('\n🎯 POTENTIAL RCON PORTS:');
      respondingPorts.forEach(port => {
        console.log(`   Port ${port.port}: "${port.response_preview}"`);
      });
      console.log('\n✅ Try these ports in your RCON configuration!');
    } else {
      console.log('\n⚠️  No ports responded to RCON commands');
      console.log('RCON might be disabled or use a different protocol');
    }
    
    console.log('\n🔧 NEXT STEPS:');
    console.log('1. Contact Austin to confirm RCON is enabled');
    console.log('2. Ask for the correct RCON port and password');
    console.log('3. Consider using the fallback command system');
  }
}

// Run the scan
const runScan = async () => {
  const scanner = new PortScanner();
  
  try {
    const results = await scanner.scanAllPorts();
    scanner.summarizeResults(results);
  } catch (error) {
    console.error('❌ Scan failed:', error);
  }
};

console.log('🚀 Isle Server RCON Port Scanner');
console.log('================================\n');
runScan().catch(console.error);