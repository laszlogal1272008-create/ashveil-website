/**
 * Test Enhanced RCON Bridge Authentication
 */

const http = require('http');

const CONFIG = {
  bridgeUrl: 'http://localhost:3002',
  apiKey: 'ashveil-rcon-bridge-2025'
};

const makeRequest = (path, method = 'GET', body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: method,
      headers: {
        'X-API-Key': CONFIG.apiKey,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
};

const testEnhancedBridge = async () => {
  console.log('🧪 Testing Enhanced RCON Bridge...\n');

  try {
    // Test health
    console.log('1. Testing bridge health...');
    const health = await makeRequest('/health');
    console.log('✅ Health:', health.data.status, '-', health.data.service);
    console.log('   Version:', health.data.version);
    console.log('   Connected:', health.data.rcon_connected);
    console.log('   Authenticated:', health.data.rcon_authenticated);
    console.log('');

    // Test connection with multiple auth methods
    console.log('2. Testing RCON connection...');
    const connect = await makeRequest('/connect', 'POST');
    
    if (connect.data.success) {
      console.log('✅ Connection successful!');
      console.log('   Auth method:', connect.data.auth_method);
      console.log('   Host:', connect.data.host);
      console.log('   Port:', connect.data.port);
      console.log('');

      // Test a command
      console.log('3. Testing RCON command...');
      const command = await makeRequest('/command', 'POST', { command: 'help' });
      
      if (command.data.success) {
        console.log('✅ Command successful!');
        console.log('   Response length:', command.data.response.length);
        console.log('   Preview:', command.data.response.substring(0, 100) + '...');
        console.log('   Method:', command.data.method);
      } else {
        console.log('❌ Command failed:', command.data.error);
      }

    } else {
      console.log('❌ Connection failed:', connect.data.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testEnhancedBridge();