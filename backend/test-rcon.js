// Simple RCON connection test
const Rcon = require('rcon');

const SERVER_IP = '45.45.238.134';
const RCON_PORT = 16007;
const RCON_PASSWORD = 'CookieMonster420';

console.log('🧪 Testing RCON connection...');
console.log(`📡 Server: ${SERVER_IP}:${RCON_PORT}`);
console.log(`🔑 Password: ${RCON_PASSWORD}`);

const client = new Rcon(SERVER_IP, RCON_PORT, RCON_PASSWORD);

client.on('auth', () => {
  console.log('✅ RCON Authentication successful!');
  
  // Try a simple command
  client.send('help', (response) => {
    console.log('📤 Sent: help');
    console.log('📥 Response:', response);
    
    // Try list players command
    client.send('listplayers', (response) => {
      console.log('📤 Sent: listplayers');
      console.log('📥 Response:', response);
      
      // Try another common command
      client.send('list', (response) => {
        console.log('📤 Sent: list');
        console.log('📥 Response:', response);
        
        client.disconnect();
        console.log('✅ Test completed successfully');
        process.exit(0);
      });
    });
  });
});

client.on('response', (str) => {
  console.log('📡 RCON Response:', str);
});

client.on('error', (err) => {
  console.error('❌ RCON Error:', err.message);
  console.error('💡 Possible issues:');
  console.error('   1. Wrong RCON password');
  console.error('   2. RCON not enabled on server');
  console.error('   3. Server firewall blocking connection');
  console.error('   4. Server not running');
  process.exit(1);
});

client.on('end', () => {
  console.log('🔌 RCON connection closed');
});

// Connect with timeout
console.log('🔌 Connecting to RCON...');
client.connect();

// Timeout after 20 seconds
setTimeout(() => {
  console.error('⏰ Connection timeout after 20 seconds');
  console.error('💡 This usually means:');
  console.error('   - Server is not responding to RCON connections');
  console.error('   - RCON port is blocked');
  console.error('   - Server RCON is disabled');
  process.exit(1);
}, 20000);