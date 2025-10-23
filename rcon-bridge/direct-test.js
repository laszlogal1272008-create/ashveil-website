/**
 * Direct RCON Connection Test
 * Tests direct connection to Isle RCON server
 */

const net = require('net');

const CONFIG = {
  host: '45.45.238.134',
  port: 16007,
  password: 'CookieMonster420',
  timeout: 5000
};

class SimpleRconTest {
  constructor() {
    this.socket = null;
    this.requestId = 1;
  }

  async testConnection() {
    return new Promise((resolve, reject) => {
      console.log(`🔗 Connecting to RCON ${CONFIG.host}:${CONFIG.port}...`);
      
      this.socket = new net.Socket();
      
      const timeout = setTimeout(() => {
        console.log('❌ Connection timeout');
        this.socket.destroy();
        reject(new Error('Connection timeout'));
      }, CONFIG.timeout);

      this.socket.connect(CONFIG.port, CONFIG.host, () => {
        clearTimeout(timeout);
        console.log('✅ Connected to RCON server');
        
        // Send authentication packet
        this.sendAuth()
          .then(() => {
            console.log('✅ Authentication successful');
            resolve(true);
          })
          .catch((err) => {
            console.log('❌ Authentication failed:', err.message);
            reject(err);
          });
      });

      this.socket.on('error', (err) => {
        clearTimeout(timeout);
        console.log('❌ Connection error:', err.message);
        reject(err);
      });

      this.socket.on('close', () => {
        console.log('🔌 Connection closed');
      });
    });
  }

  sendAuth() {
    return new Promise((resolve, reject) => {
      const packet = this.createPacket(3, CONFIG.password); // Type 3 = Auth
      
      this.socket.once('data', (data) => {
        const response = this.parsePacket(data);
        if (response.id === -1) {
          reject(new Error('Invalid password'));
        } else {
          resolve(response);
        }
      });
      
      this.socket.write(packet);
      
      setTimeout(() => {
        reject(new Error('Auth timeout'));
      }, CONFIG.timeout);
    });
  }

  createPacket(type, body) {
    const id = this.requestId++;
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

  disconnect() {
    if (this.socket) {
      this.socket.destroy();
    }
  }
}

// Run test
const runTest = async () => {
  console.log('=== Direct RCON Connection Test ===\n');
  
  const test = new SimpleRconTest();
  
  try {
    await test.testConnection();
    console.log('\n🎉 RCON connection test successful!');
    console.log('The RCON server is working correctly.');
    console.log('Austin was right - the server is accepting connections.');
  } catch (error) {
    console.log('\n❌ RCON connection test failed:', error.message);
    console.log('This might indicate an issue with the RCON server or network.');
  } finally {
    test.disconnect();
  }
};

runTest().catch(console.error);