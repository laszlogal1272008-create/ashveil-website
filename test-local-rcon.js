const net = require('net');

// Test the enhanced bridge locally before deploying
console.log('🔍 LOCAL TEST: Enhanced RCON Bridge');
console.log('================================');

const ISLE_SERVER = {
  host: '45.45.238.134',
  port: 16007,
  password: 'CookieMonster420'
};

// Create RCON packet
function createRCONPacket(opcode, command = '') {
  const commandBuffer = Buffer.from(command, 'utf8');
  const packet = Buffer.alloc(5 + commandBuffer.length);
  
  packet.writeUInt8(opcode, 0);        // Opcode
  packet.writeUInt32LE(commandBuffer.length, 1);  // Command length
  commandBuffer.copy(packet, 5);       // Command
  
  return packet;
}

function testRCONConnection() {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setTimeout(5000);
    
    socket.connect(ISLE_SERVER.port, ISLE_SERVER.host, () => {
      console.log('✅ Connected to Isle server');
      
      // Send auth
      const authPacket = createRCONPacket(0x01, ISLE_SERVER.password);
      socket.write(authPacket);
    });
    
    socket.on('data', (data) => {
      try {
        const response = data.toString('utf8');
        console.log('📥 Server Response:', response);
        
        if (response.includes('Password Accepted')) {
          console.log('✅ Authentication successful!');
          
          // Test slay command
          console.log('🔥 Testing slay command...');
          const slayPacket = createRCONPacket(0x02, 'slay Misplacedcursor');
          socket.write(slayPacket);
          
          setTimeout(() => {
            socket.end();
            resolve(true);
          }, 2000);
        }
      } catch (error) {
        console.error('❌ Error processing response:', error);
        socket.end();
        reject(error);
      }
    });
    
    socket.on('error', (error) => {
      console.error('❌ Connection error:', error.message);
      reject(error);
    });
    
    socket.on('timeout', () => {
      console.error('❌ Connection timeout');
      socket.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Run test
console.log('🚀 Starting local RCON test...');
testRCONConnection()
  .then(() => {
    console.log('✅ Local test completed successfully!');
    console.log('📤 Ready to deploy enhanced bridge to VPS');
  })
  .catch((error) => {
    console.error('❌ Local test failed:', error.message);
  });