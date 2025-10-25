// Simple HTTP test to verify VPS can make outbound connections
const http = require('http');

console.log('🌐 Testing VPS outbound connectivity...');

// Test if we can make HTTP requests (this proves internet access)
const testUrl = 'http://httpbin.org/ip'; // Returns your public IP

const req = http.get(testUrl, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('✅ VPS has internet access');
        console.log('📍 Public IP response:', data);
        
        // Now test Isle server HTTP port
        testIsleHTTP();
    });
});

req.on('error', (err) => {
    console.log('❌ VPS internet test failed:', err.message);
    console.log('🚨 This suggests VPS networking issues');
});

function testIsleHTTP() {
    console.log('\n🎯 Testing Isle server HTTP access...');
    
    const options = {
        hostname: '45.45.238.134',
        port: 80,
        path: '/',
        method: 'GET',
        timeout: 10000
    };
    
    const req = http.request(options, (res) => {
        console.log('✅ Can reach Isle server HTTP (port 80)');
        console.log('📊 Status:', res.statusCode);
        
        // If HTTP works, RCON ports should work too
        console.log('\n💡 CONCLUSION:');
        console.log('   - VPS has internet access ✅');
        console.log('   - Can reach Isle server ✅');
        console.log('   - Gaming ports (16007) should also work ✅');
        console.log('   - Issue is likely RCON protocol, not connectivity');
    });
    
    req.on('error', (err) => {
        console.log('❌ Cannot reach Isle server:', err.message);
        console.log('🚨 This suggests networking/firewall issues');
        console.log('\n💡 CONCLUSION:');
        console.log('   - VPS may have restricted outbound access');
        console.log('   - Gaming ports might be blocked');
        console.log('   - Need to check VPS firewall settings');
    });
    
    req.on('timeout', () => {
        console.log('⏰ Timeout reaching Isle server');
        console.log('🚨 This suggests potential firewall blocking');
        req.destroy();
    });
    
    req.end();
}

req.setTimeout(10000);
req.on('timeout', () => {
    console.log('⏰ Internet connectivity timeout');
    console.log('🚨 VPS may have no internet access');
    req.destroy();
});