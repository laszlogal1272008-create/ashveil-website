const net = require('net');

console.log('🔍 Deep RCON Protocol Analysis...');
console.log('Testing different connection methods and protocols');

// Test 1: Raw connection with detailed logging
function testRawConnection() {
    return new Promise((resolve) => {
        console.log('\n=== TEST 1: Raw TCP Connection ===');
        const socket = new net.Socket();
        let connected = false;
        
        socket.setTimeout(5000);
        
        socket.on('connect', () => {
            console.log('✅ TCP connected - server is listening');
            connected = true;
            
            // Send raw data and see what happens
            socket.write('hello\n');
            socket.write('test\n');
            socket.write('CookieMonster420\n');
            
            setTimeout(() => {
                socket.destroy();
                resolve(connected);
            }, 3000);
        });
        
        socket.on('data', (data) => {
            console.log('📨 Server sent data:', data.toString());
            console.log('📨 Raw bytes:', Array.from(data).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
        });
        
        socket.on('error', (err) => {
            console.log('❌ Connection failed:', err.message);
            resolve(false);
        });
        
        socket.on('timeout', () => {
            console.log('⏰ Connection timeout');
            socket.destroy();
            resolve(connected);
        });
        
        socket.connect(16007, '45.45.238.134');
    });
}

// Test 2: Standard Source RCON protocol
function testSourceRCON() {
    return new Promise((resolve) => {
        console.log('\n=== TEST 2: Source RCON Protocol ===');
        const socket = new net.Socket();
        
        function createRCONPacket(id, type, body) {
            const bodyBuffer = Buffer.from(body + '\x00\x00', 'ascii');
            const size = bodyBuffer.length + 8;
            
            const packet = Buffer.allocUnsafe(4 + size);
            packet.writeInt32LE(size, 0);
            packet.writeInt32LE(id, 4);
            packet.writeInt32LE(type, 8);
            bodyBuffer.copy(packet, 12);
            
            return packet;
        }
        
        socket.setTimeout(5000);
        let gotResponse = false;
        
        socket.on('connect', () => {
            console.log('✅ Connected, sending Source RCON auth...');
            const authPacket = createRCONPacket(1, 3, 'CookieMonster420');
            socket.write(authPacket);
        });
        
        socket.on('data', (data) => {
            console.log('📨 RCON response received:', data.length, 'bytes');
            gotResponse = true;
            
            if (data.length >= 12) {
                const size = data.readInt32LE(0);
                const id = data.readInt32LE(4);
                const type = data.readInt32LE(8);
                console.log(`📦 Parsed: size=${size}, id=${id}, type=${type}`);
                
                if (id === -1) {
                    console.log('❌ Authentication failed (wrong password)');
                } else if (type === 2) {
                    console.log('✅ Authentication successful!');
                }
            }
            
            setTimeout(() => {
                socket.destroy();
                resolve(gotResponse);
            }, 1000);
        });
        
        socket.on('error', (err) => {
            console.log('❌ Source RCON failed:', err.message);
            resolve(false);
        });
        
        socket.on('timeout', () => {
            console.log('⏰ Source RCON timeout');
            socket.destroy();
            resolve(gotResponse);
        });
        
        socket.connect(16007, '45.45.238.134');
    });
}

// Test 3: Alternative RCON protocols
function testAlternativeProtocols() {
    return new Promise((resolve) => {
        console.log('\n=== TEST 3: Alternative Protocols ===');
        
        const tests = [
            { name: 'Minecraft RCON', data: Buffer.from([0x00, 0x00, 0x00, 0x0E, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x03]) },
            { name: 'Simple Auth', data: Buffer.from('CookieMonster420\r\n') },
            { name: 'HTTP-like', data: Buffer.from('GET /admin HTTP/1.1\r\nAuthorization: CookieMonster420\r\n\r\n') }
        ];
        
        let testIndex = 0;
        
        function runNextTest() {
            if (testIndex >= tests.length) {
                resolve(false);
                return;
            }
            
            const test = tests[testIndex++];
            console.log(`Testing ${test.name}...`);
            
            const socket = new net.Socket();
            socket.setTimeout(3000);
            
            socket.on('connect', () => {
                socket.write(test.data);
            });
            
            socket.on('data', (data) => {
                console.log(`✅ ${test.name} got response:`, data.toString());
                socket.destroy();
                resolve(true);
            });
            
            socket.on('error', () => {
                runNextTest();
            });
            
            socket.on('timeout', () => {
                socket.destroy();
                runNextTest();
            });
            
            socket.connect(16007, '45.45.238.134');
        }
        
        runNextTest();
    });
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting comprehensive RCON analysis...\n');
    
    const test1 = await testRawConnection();
    const test2 = await testSourceRCON();
    const test3 = await testAlternativeProtocols();
    
    console.log('\n=== RESULTS ===');
    console.log('Raw Connection:', test1 ? '✅ SUCCESS' : '❌ FAILED');
    console.log('Source RCON:', test2 ? '✅ SUCCESS' : '❌ FAILED');
    console.log('Alternative Protocols:', test3 ? '✅ SUCCESS' : '❌ FAILED');
    
    console.log('\n=== ANALYSIS ===');
    if (!test1) {
        console.log('🔍 Server might be completely blocking RCON connections');
    } else if (!test2) {
        console.log('🔍 Server accepts connections but doesn\'t use standard Source RCON');
    } else {
        console.log('🔍 RCON is working! Check password/commands');
    }
}

runAllTests();