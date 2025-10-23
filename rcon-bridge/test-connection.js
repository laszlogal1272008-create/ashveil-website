/**
 * RCON Bridge Connection Test
 * Tests the bridge service and RCON connectivity
 */

const https = require('https');
const http = require('http');

const CONFIG = {
  bridgeUrl: 'http://localhost:3002',
  apiKey: 'ashveil-rcon-bridge-2025',
  timeout: 10000
};

// HTTP request helper
const makeRequest = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const requestOptions = {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': CONFIG.apiKey,
        ...options.headers
      },
      timeout: CONFIG.timeout
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
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
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
};

// Test functions
const testBridgeHealth = async () => {
  console.log('🧪 Testing bridge health...');
  try {
    const response = await makeRequest(`${CONFIG.bridgeUrl}/health`);
    if (response.status === 200) {
      console.log('✅ Bridge service is healthy');
      console.log('   Service:', response.data.service);
      console.log('   Version:', response.data.version);
      return true;
    } else {
      console.log('❌ Bridge health check failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Bridge health check failed:', error.message);
    return false;
  }
};

const testBridgeStatus = async () => {
  console.log('🧪 Testing bridge status...');
  try {
    const response = await makeRequest(`${CONFIG.bridgeUrl}/status`);
    if (response.status === 200) {
      console.log('✅ Bridge status retrieved');
      console.log('   Connected:', response.data.connected);
      console.log('   RCON Host:', response.data.rcon_host);
      console.log('   RCON Port:', response.data.rcon_port);
      return true;
    } else {
      console.log('❌ Bridge status failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Bridge status failed:', error.message);
    return false;
  }
};

const testRconConnection = async () => {
  console.log('🧪 Testing RCON connection...');
  try {
    const response = await makeRequest(`${CONFIG.bridgeUrl}/connect`, {
      method: 'POST',
      body: {}
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ RCON connection successful');
      console.log('   Host:', response.data.host);
      console.log('   Port:', response.data.port);
      console.log('   Connected:', response.data.connected);
      return true;
    } else {
      console.log('❌ RCON connection failed:', response.data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ RCON connection failed:', error.message);
    return false;
  }
};

const testRconCommand = async (command = 'info') => {
  console.log(`🧪 Testing RCON command: ${command}`);
  try {
    const response = await makeRequest(`${CONFIG.bridgeUrl}/command`, {
      method: 'POST',
      body: { command }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ RCON command successful');
      console.log('   Command:', response.data.command);
      console.log('   Response:', response.data.response.substring(0, 100) + '...');
      return true;
    } else {
      console.log('❌ RCON command failed:', response.data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ RCON command failed:', error.message);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('=== RCON Bridge Test Suite ===\n');
  
  let passed = 0;
  let total = 0;
  
  const runTest = async (testName, testFn) => {
    total++;
    console.log(`\n--- ${testName} ---`);
    const success = await testFn();
    if (success) passed++;
    return success;
  };
  
  // Run tests in sequence
  await runTest('Bridge Health Check', testBridgeHealth);
  await runTest('Bridge Status Check', testBridgeStatus);
  
  const connected = await runTest('RCON Connection Test', testRconConnection);
  
  if (connected) {
    await runTest('RCON Info Command', () => testRconCommand('info'));
    await runTest('RCON List Command', () => testRconCommand('list'));
  } else {
    console.log('\n⚠️  Skipping command tests - RCON not connected');
  }
  
  // Results
  console.log('\n=== Test Results ===');
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${total - passed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! RCON bridge is working correctly.');
  } else {
    console.log('\n❌ Some tests failed. Check the bridge service and RCON connection.');
  }
};

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testBridgeHealth, testRconConnection, testRconCommand };