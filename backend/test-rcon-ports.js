// Test multiple RCON ports
const Rcon = require('rcon');

const SERVER_IP = '45.45.238.134';
const RCON_PASSWORD = 'CookieMonster420';
const COMMON_PORTS = [16007, 27015, 27016, 25575, 19132, 19133];

console.log('🧪 Testing multiple RCON ports...');

async function testPort(port) {
  return new Promise((resolve) => {
    console.log(`\n🔌 Testing port ${port}...`);
    
    const client = new Rcon(SERVER_IP, port, RCON_PASSWORD);
    let resolved = false;
    
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.log(`❌ Port ${port}: Timeout`);
        client.disconnect();
        resolve(false);
      }
    }, 5000);
    
    client.on('auth', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        console.log(`✅ Port ${port}: Connected successfully!`);
        client.disconnect();
        resolve(true);
      }
    });
    
    client.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        console.log(`❌ Port ${port}: ${err.message}`);
        resolve(false);
      }
    });
    
    client.connect();
  });
}

async function testAllPorts() {
  console.log(`📡 Server: ${SERVER_IP}`);
  console.log(`🔑 Password: ${RCON_PASSWORD}`);
  
  for (const port of COMMON_PORTS) {
    const success = await testPort(port);
    if (success) {
      console.log(`\n🎉 Found working RCON port: ${port}`);
      console.log(`💡 Update your server configuration to use port ${port}`);
      return;
    }
  }
  
  console.log('\n❌ No working RCON ports found');
  console.log('💡 Possible solutions:');
  console.log('   1. Enable RCON on your The Isle server');
  console.log('   2. Check the RCON password');
  console.log('   3. Verify server is running');
  console.log('   4. Check firewall settings');
}

testAllPorts().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});