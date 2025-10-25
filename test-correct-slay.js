const net = require('net');

console.log('🎯 TESTING CORRECT /SLAY COMMAND');
console.log('================================');

const ISLE_SERVER = {
  host: '45.45.238.134',
  port: 16007,
  password: 'CookieMonster420'
};

function createRCONPacket(opcode, command = '') {
  const commandBuffer = Buffer.from(command, 'utf8');
  const packet = Buffer.alloc(5 + commandBuffer.length);
  
  packet.writeUInt8(opcode, 0);
  packet.writeUInt32LE(commandBuffer.length, 1);
  commandBuffer.copy(packet, 5);
  
  return packet;
}

function testSlayCommand() {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(10000);
    
    socket.connect(ISLE_SERVER.port, ISLE_SERVER.host, () => {
      console.log('✅ Connected to Isle server');
      
      const authPacket = createRCONPacket(0x01, ISLE_SERVER.password);
      socket.write(authPacket);
    });
    
    let authenticated = false;
    
    socket.on('data', (data) => {
      const response = data.toString('utf8');
      console.log('📥 Server Response:', response);
      
      if (response.includes('Password Accepted') && !authenticated) {
        authenticated = true;
        console.log('✅ Authentication successful!');
        console.log('');
        
        // Test the CORRECT /slay command format
        console.log('🔥 Testing CORRECT command: /slay Misplacedcursor');
        const slayPacket = createRCONPacket(0x02, '/slay Misplacedcursor');
        socket.write(slayPacket);
        
        // Wait a bit, then test old format for comparison
        setTimeout(() => {
          console.log('🔄 Testing OLD format for comparison: slay Misplacedcursor');
          const oldSlayPacket = createRCONPacket(0x02, 'slay Misplacedcursor');
          socket.write(oldSlayPacket);
        }, 3000);
        
        // Close after testing both
        setTimeout(() => {
          console.log('');
          console.log('🎯 Test completed! Check responses above for differences.');
          socket.end();
          resolve();
        }, 6000);
      }
    });
    
    socket.on('error', (error) => {
      console.error('❌ Connection error:', error.message);
      resolve();
    });
    
    socket.on('timeout', () => {
      console.error('❌ Connection timeout');
      socket.destroy();
      resolve();
    });
  });
}

testSlayCommand();