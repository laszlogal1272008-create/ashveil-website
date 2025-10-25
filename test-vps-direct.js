const http = require('http');

console.log('🎯 TESTING DIRECT VPS BRIDGE');
console.log('============================');

// Test direct connection to VPS bridge
const postData = JSON.stringify({
  playerName: 'Misplacedcursor',
  playerSteamId: '76561199520399511'
});

const options = {
  hostname: '104.131.111.229',
  port: 3001,
  path: '/rcon/slay',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  },
  timeout: 10000
};

console.log('🚀 Testing direct VPS connection...');

const req = http.request(options, (res) => {
  console.log(`📡 VPS Response Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('📥 VPS Response:');
      console.log(JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log('');
        console.log('✅ SUCCESS! Enhanced bridge is working perfectly!');
        console.log('🎯 The enhanced bridge with /slay command is operational!');
      }
    } catch (error) {
      console.log('Raw VPS response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ VPS connection error:', error.message);
});

req.on('timeout', () => {
  console.error('❌ VPS connection timeout');
  req.destroy();
});

req.write(postData);
req.end();