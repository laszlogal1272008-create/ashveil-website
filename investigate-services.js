// Test what services are running on the discovered open ports
const net = require('net');
const http = require('http');

const SERVER_IP = '45.45.238.134';
const OPEN_PORTS = [80, 3306, 8080, 16007, 16008];

console.log('🔍 Investigating services on open ports...');

// Test HTTP services
async function testHTTP(port) {
    return new Promise((resolve) => {
        const options = {
            hostname: SERVER_IP,
            port: port,
            path: '/',
            method: 'GET',
            timeout: 5000
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`\n🌐 HTTP Port ${port}:`);
                console.log(`Status: ${res.statusCode}`);
                console.log(`Headers:`, res.headers);
                if (data.length < 500) {
                    console.log(`Body preview:`, data.substring(0, 200));
                } else {
                    console.log(`Body length: ${data.length} bytes`);
                }
                resolve();
            });
        });
        
        req.on('error', (err) => {
            console.log(`❌ HTTP Port ${port}: ${err.message}`);
            resolve();
        });
        
        req.on('timeout', () => {
            console.log(`⏰ HTTP Port ${port}: Timeout`);
            req.destroy();
            resolve();
        });
        
        req.end();
    });
}

// Test raw TCP services
async function testTCP(port) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(3000);
        
        socket.connect(port, SERVER_IP, () => {
            console.log(`\n🔌 TCP Port ${port}: Connected`);
            
            // Send some test data
            if (port === 16007) {
                console.log('  Testing RCON protocol...');
                const authPacket = Buffer.from([
                    0x0A, 0x00, 0x00, 0x00,  // Size
                    0x01, 0x00, 0x00, 0x00,  // ID
                    0x03, 0x00, 0x00, 0x00,  // Type (AUTH)
                    ...Buffer.from('test\x00\x00')
                ]);
                socket.write(authPacket);
            } else if (port === 3306) {
                console.log('  Testing MySQL protocol...');
                // MySQL will send greeting immediately
            } else {
                console.log('  Sending test data...');
                socket.write('GET / HTTP/1.1\r\nHost: ' + SERVER_IP + '\r\n\r\n');
            }
        });
        
        socket.on('data', (data) => {
            console.log(`  📨 Response (${data.length} bytes):`, data.toString().substring(0, 100));
            socket.destroy();
            resolve();
        });
        
        socket.on('error', (err) => {
            console.log(`  ❌ Error: ${err.message}`);
            resolve();
        });
        
        socket.on('timeout', () => {
            console.log(`  ⏰ No response received`);
            socket.destroy();
            resolve();
        });
    });
}

async function investigateServices() {
    // Test HTTP services first
    for (const port of [80, 8080]) {
        await testHTTP(port);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    }
    
    // Test TCP services
    for (const port of [3306, 16007, 16008]) {
        await testTCP(port);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    }
    
    console.log('\n🎯 Analysis complete!');
    console.log('💡 Look for any admin interfaces on HTTP ports');
    console.log('💡 Check if port 16007 responds differently than expected');
}

investigateServices().catch(console.error);