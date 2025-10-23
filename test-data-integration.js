#!/usr/bin/env node

/**
 * Data Integration Test Suite
 * Tests the real/mock data switching functionality
 * Run with: node test-data-integration.js
 */

const https = require('https');
const http = require('http');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'https://ashveil-website.onrender.com',
  localUrl: 'http://localhost:3001',
  testSteamId: '76561198000000000',
  timeout: 10000
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.blue}🧪 ${msg}${colors.reset}`)
};

// HTTP request helper
const makeRequest = (url) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, TEST_CONFIG.timeout);

    client.get(url, (res) => {
      clearTimeout(timeout);
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
    }).on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
};

// Test functions
const testServerHealth = async (baseUrl) => {
  log.test(`Testing server health at ${baseUrl}`);
  try {
    const response = await makeRequest(`${baseUrl}/api/test`);
    if (response.status === 200) {
      log.success(`Server is healthy (${response.status})`);
      return true;
    } else {
      log.warn(`Server responded with status ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`Server health check failed: ${error.message}`);
    return false;
  }
};

const testPlayerInventory = async (baseUrl, steamId) => {
  log.test(`Testing player inventory endpoint for Steam ID: ${steamId}`);
  try {
    const response = await makeRequest(`${baseUrl}/api/player/${steamId}/inventory`);
    if (response.status === 200 && Array.isArray(response.data)) {
      log.success(`Inventory endpoint working - ${response.data.length} items returned`);
      console.log(`   Sample item:`, response.data[0] || 'No items');
      return true;
    } else {
      log.warn(`Inventory endpoint returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`Inventory test failed: ${error.message}`);
    return false;
  }
};

const testPlayerCurrency = async (baseUrl, steamId) => {
  log.test(`Testing player currency endpoint for Steam ID: ${steamId}`);
  try {
    const response = await makeRequest(`${baseUrl}/api/player/${steamId}/currency`);
    if (response.status === 200 && response.data) {
      log.success(`Currency endpoint working`);
      console.log(`   Currency data:`, response.data);
      return true;
    } else {
      log.warn(`Currency endpoint returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`Currency test failed: ${error.message}`);
    return false;
  }
};

const testPlayerData = async (baseUrl, steamId) => {
  log.test(`Testing player data endpoint for Steam ID: ${steamId}`);
  try {
    const response = await makeRequest(`${baseUrl}/api/player/${steamId}`);
    if (response.status === 200 && response.data) {
      log.success(`Player data endpoint working`);
      console.log(`   Player info:`, response.data);
      return true;
    } else {
      log.warn(`Player data endpoint returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`Player data test failed: ${error.message}`);
    return false;
  }
};

const testServerStatus = async (baseUrl) => {
  log.test(`Testing server status endpoint`);
  try {
    const response = await makeRequest(`${baseUrl}/api/server/status`);
    if (response.status === 200 && response.data) {
      log.success(`Server status endpoint working`);
      console.log(`   Server online:`, response.data.online);
      console.log(`   Players:`, response.data.players);
      return true;
    } else {
      log.warn(`Server status endpoint returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`Server status test failed: ${error.message}`);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log(`${colors.bright}=== Data Integration Test Suite ===${colors.reset}`);
  console.log(`${colors.bright}Testing Ashveil website data endpoints${colors.reset}\n`);

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  const runTest = async (testName, testFunction) => {
    results.total++;
    log.info(`Running test: ${testName}`);
    try {
      const success = await testFunction();
      if (success) {
        results.passed++;
        log.success(`${testName} - PASSED`);
      } else {
        results.failed++;
        log.error(`${testName} - FAILED`);
      }
    } catch (error) {
      results.failed++;
      log.error(`${testName} - ERROR: ${error.message}`);
    }
    console.log(''); // Empty line for readability
  };

  // Test production server
  log.info('Testing production server endpoints...');
  await runTest('Production Server Health', () => testServerHealth(TEST_CONFIG.baseUrl));
  await runTest('Production Player Inventory', () => testPlayerInventory(TEST_CONFIG.baseUrl, TEST_CONFIG.testSteamId));
  await runTest('Production Player Currency', () => testPlayerCurrency(TEST_CONFIG.baseUrl, TEST_CONFIG.testSteamId));
  await runTest('Production Player Data', () => testPlayerData(TEST_CONFIG.baseUrl, TEST_CONFIG.testSteamId));
  await runTest('Production Server Status', () => testServerStatus(TEST_CONFIG.baseUrl));

  // Test local server (if available)
  log.info('Testing local development server endpoints...');
  const localHealthy = await testServerHealth(TEST_CONFIG.localUrl);
  if (localHealthy) {
    await runTest('Local Player Inventory', () => testPlayerInventory(TEST_CONFIG.localUrl, TEST_CONFIG.testSteamId));
    await runTest('Local Player Currency', () => testPlayerCurrency(TEST_CONFIG.localUrl, TEST_CONFIG.testSteamId));
    await runTest('Local Player Data', () => testPlayerData(TEST_CONFIG.localUrl, TEST_CONFIG.testSteamId));
    await runTest('Local Server Status', () => testServerStatus(TEST_CONFIG.localUrl));
  } else {
    log.warn('Local server not available - skipping local tests');
    results.total -= 4; // Adjust total count
  }

  // Print summary
  console.log(`${colors.bright}=== Test Results ===${colors.reset}`);
  console.log(`Total Tests: ${results.total}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`Success Rate: ${successRate}%`);

  if (results.failed === 0) {
    log.success('All tests passed! 🎉');
    process.exit(0);
  } else {
    log.error(`${results.failed} test(s) failed`);
    process.exit(1);
  }
};

// Configuration validation
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Data Integration Test Suite

Usage: node test-data-integration.js [options]

Options:
  --help, -h     Show this help message
  --steamid ID   Use custom Steam ID for testing (default: ${TEST_CONFIG.testSteamId})
  --timeout MS   Set request timeout in milliseconds (default: ${TEST_CONFIG.timeout})

Examples:
  node test-data-integration.js
  node test-data-integration.js --steamid 76561198123456789
  node test-data-integration.js --timeout 5000
  `);
  process.exit(0);
}

// Parse command line arguments
const steamIdIndex = process.argv.indexOf('--steamid');
if (steamIdIndex !== -1 && process.argv[steamIdIndex + 1]) {
  TEST_CONFIG.testSteamId = process.argv[steamIdIndex + 1];
}

const timeoutIndex = process.argv.indexOf('--timeout');
if (timeoutIndex !== -1 && process.argv[timeoutIndex + 1]) {
  TEST_CONFIG.timeout = parseInt(process.argv[timeoutIndex + 1]) || TEST_CONFIG.timeout;
}

// Run the tests
runTests().catch((error) => {
  log.error(`Test suite failed: ${error.message}`);
  process.exit(1);
});