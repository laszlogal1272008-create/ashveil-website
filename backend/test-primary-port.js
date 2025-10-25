/**
 * Test RCON on the PRIMARY port (16006)
 * Based on Physgun panel showing 16006 as Primary
 */

const net = require('net');

const CONFIG = {
  host: '45.45.238.134',
  port: 16006,  // PRIMARY PORT from Physgun panel!
  password: 'CookieMonster420',
  timeout: 5000
};

class RconTest {
  async testPrimaryPort() {
    return new Promise((resolve, reject) => {
      console.log(`🔗 Testing PRIMARY port ${CONFIG.port} for RCON...`);
      
      const socket = new net.Socket();
      
      const timeout = setTimeout(() => {
        console.log('❌ Connection timeout');
        socket.destroy();
        reject(new Error('Connection timeout'));
      }, CONFIG.timeout);

      socket.connect(CONFIG.port, CONFIG.host, () => {
        clearTimeout(timeout);
        console.log('✅ Connected to PRIMARY port!');
        
        // Send RCON authentication
        this.sendAuth(socket)
          .then(() => {
            console.log('🎉 RCON AUTHENTICATION SUCCESSFUL!');
            return this.sendCommand(socket, 'help');
          })
          .then((response) => {
            console.log('🎯 RCON COMMAND SUCCESSFUL!');
            console.log('Response:', response.substring(0, 200) + '...');
            resolve(true);
          })
          .catch((err) => {
            console.log('❌ RCON failed:', err.message);
            reject(err);
          })
          .finally(() => {
            socket.destroy();
          });
      });

      socket.on('error', (err) => {
        clearTimeout(timeout);
        console.log('❌ Connection error:', err.message);
        reject(err);
      });

      socket.on('close', () => {
        console.log('🔌 Connection closed');
      });
    });
  }

  sendAuth(socket) {
    return new Promise((resolve, reject) => {
      const authPacket = this.createPacket(3, CONFIG.password); // Type 3 = Auth
      
      socket.once('data', (data) => {
        const response = this.parsePacket(data);
        if (response && response.id === -1) {
          reject(new Error('Invalid password'));
        } else {
          console.log('✅ Authentication packet accepted');
          resolve(response);
        }
      });
      
      socket.write(authPacket);
      
      setTimeout(() => {
        reject(new Error('Auth timeout'));
      }, CONFIG.timeout);
    });
  }

  sendCommand(socket, command) {
    return new Promise((resolve, reject) => {
      const commandPacket = this.createPacket(2, command); // Type 2 = Command
      
      socket.once('data', (data) => {
        const response = this.parsePacket(data);
        if (response) {
          resolve(response.body);
        } else {
          reject(new Error('Invalid response'));
        }
      });
      
      socket.write(commandPacket);
      
      setTimeout(() => {
        reject(new Error('Command timeout'));
      }, CONFIG.timeout);
    });
  }

  createPacket(type, body) {
    const id = 1;
    const bodyBuffer = Buffer.from(body, 'ascii');
    const packet = Buffer.alloc(14 + bodyBuffer.length);
    
    packet.writeInt32LE(10 + bodyBuffer.length, 0); // Size
    packet.writeInt32LE(id, 4); // Request ID
    packet.writeInt32LE(type, 8); // Type
    bodyBuffer.copy(packet, 12); // Body
    packet.writeInt16LE(0, 12 + bodyBuffer.length); // Null terminators
    
    return packet;
  }

  parsePacket(data) {
    if (data.length < 12) return null;
    
    const size = data.readInt32LE(0);
    const id = data.readInt32LE(4);
    const type = data.readInt32LE(8);
    const body = data.slice(12, 12 + size - 10).toString('ascii');
    
    return { size, id, type, body };
  }
}

// Run the test
const runTest = async () => {
  console.log('🚀 Testing RCON on PRIMARY PORT (16006)');
  console.log('=====================================\n');
  
  const test = new RconTest();
  
  try {
    await test.testPrimaryPort();
    console.log('\n🎉 SUCCESS! RCON is working on port 16006!');
    console.log('🔧 Update your RCON bridge to use port 16006');
  } catch (error) {
    console.log('\n❌ Still failed on primary port:', error.message);
    console.log('💡 Try contacting Austin for more details');
  }
};

runTest().catch(console.error);