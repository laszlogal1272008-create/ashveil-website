// VPS Connectivity Test - Check if webhost blocks Isle server connections
const net = require('net');

console.log('🌐 VPS Connectivity Test to Isle Server');
console.log('📋 This will determine if your webhost blocks gaming port connections');
console.log('');

const ISLE_SERVER = '45.45.238.134';
const TEST_PORTS = [
    { port: 16007, name: 'Isle RCON Port' },
    { port: 16006, name: 'Isle Game Port' },
    { port: 16008, name: 'Isle Queue Port' },
    { port: 80, name: 'HTTP (should work)' },
    { port: 443, name: 'HTTPS (should work)' },
    { port: 22, name: 'SSH (might be blocked)' },
    { port: 3306, name: 'MySQL (might be blocked)' }
];

async function testConnection(ip, port, name, timeout = 5000) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const socket = new net.Socket();
        
        socket.setTimeout(timeout);
        
        socket.connect(port, ip, () => {
            const duration = Date.now() - startTime;
            console.log(`✅ ${name} (${port}): Connected successfully (${duration}ms)`);
            socket.destroy();
            resolve({ port, status: 'success', duration });
        });
        
        socket.on('error', (err) => {
            const duration = Date.now() - startTime;
            console.log(`❌ ${name} (${port}): ${err.code || err.message} (${duration}ms)`);
            resolve({ port, status: 'failed', error: err.code || err.message, duration });
        });
        
        socket.on('timeout', () => {
            const duration = Date.now() - startTime;
            console.log(`⏰ ${name} (${port}): Connection timeout (${duration}ms)`);
            socket.destroy();
            resolve({ port, status: 'timeout', duration });
        });
    });
}

async function runConnectivityTest() {
    console.log(`🎯 Testing connections from VPS to ${ISLE_SERVER}...`);
    console.log('');
    
    const results = [];
    
    for (const test of TEST_PORTS) {
        const result = await testConnection(ISLE_SERVER, test.port, test.name);
        results.push({ ...result, name: test.name });
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('');
    console.log('📊 CONNECTIVITY TEST RESULTS:');
    console.log('================================');
    
    const successful = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status === 'failed');
    const timeouts = results.filter(r => r.status === 'timeout');
    
    if (successful.length > 0) {
        console.log('✅ SUCCESSFUL CONNECTIONS:');
        successful.forEach(r => console.log(`   Port ${r.port} (${r.name})`));
    }
    
    if (failed.length > 0) {
        console.log('❌ FAILED CONNECTIONS:');
        failed.forEach(r => console.log(`   Port ${r.port} (${r.name}) - ${r.error}`));
    }
    
    if (timeouts.length > 0) {
        console.log('⏰ CONNECTION TIMEOUTS:');
        timeouts.forEach(r => console.log(`   Port ${r.port} (${r.name})`));
    }
    
    console.log('');
    console.log('🔍 ANALYSIS:');
    
    const httpWorks = results.find(r => r.port === 80)?.status === 'success';
    const isleRconWorks = results.find(r => r.port === 16007)?.status === 'success';
    const isleGameWorks = results.find(r => r.port === 16006)?.status === 'success';
    
    if (httpWorks && !isleRconWorks) {
        console.log('🚧 WEBHOST IS LIKELY BLOCKING GAMING PORTS!');
        console.log('   - HTTP (port 80) works = Basic internet access OK');
        console.log('   - Isle ports fail = Gaming ports are blocked');
        console.log('   - This explains why RCON tests fail from VPS');
        console.log('   - Austin\'s tool works because he connects locally');
        console.log('');
        console.log('💡 SOLUTIONS:');
        console.log('   1. Contact webhost to allow port 16007 outbound');
        console.log('   2. Use a different VPS provider that allows gaming ports');
        console.log('   3. Set up RCON proxy on an allowed port');
        console.log('   4. Run RCON bridge from local machine instead of VPS');
        
    } else if (isleRconWorks) {
        console.log('✅ VPS CAN CONNECT TO ISLE SERVER!');
        console.log('   - The webhost is NOT blocking gaming ports');
        console.log('   - The issue is likely protocol-related, not connectivity');
        console.log('   - We should proceed with asking Austin about the protocol');
        
    } else if (!httpWorks) {
        console.log('🔥 MAJOR CONNECTIVITY ISSUE!');
        console.log('   - Even basic HTTP connections are failing');
        console.log('   - This suggests DNS, routing, or major firewall issues');
        console.log('   - Check VPS network configuration');
        
    } else {
        console.log('🤔 MIXED RESULTS - Need further investigation');
    }
}

// Run the test
runConnectivityTest().catch(console.error);