// Test different RCON handshake approaches for The Isle server
const net = require('net');

// RCON packet types
const PACKET_TYPES = {
    SERVERDATA_AUTH: 3,
    SERVERDATA_AUTH_RESPONSE: 2,
    SERVERDATA_EXECCOMMAND: 2,
    SERVERDATA_RESPONSE_VALUE: 0
};

// Create RCON packet
function createPacket(id, type, body) {
    const bodyBuffer = Buffer.from(body + '\x00\x00', 'ascii');
    const size = bodyBuffer.length + 8; // Add 8 bytes for ID and Type
    
    const packet = Buffer.allocUnsafe(4 + size);
    let offset = 0;
    
    // Write size
    packet.writeInt32LE(size, offset);
    offset += 4;
    
    // Write ID
    packet.writeInt32LE(id, offset);
    offset += 4;
    
    // Write type
    packet.writeInt32LE(type, offset);
    offset += 4;
    
    // Write body
    bodyBuffer.copy(packet, offset);
    
    return packet;
}

// Test different handshake timings and approaches
async function testIsleHandshake() {
    console.log('🔍 Testing Isle server RCON handshake variations...');
    
    const configs = [
        { name: 'Standard timing', delay: 0 },
        { name: 'Wait 1 second', delay: 1000 },
        { name: 'Wait 3 seconds', delay: 3000 },
        { name: 'Wait 5 seconds', delay: 5000 }
    ];
    
    for (const config of configs) {
        console.log(`\n🧪 Testing: ${config.name}`);
        await testConnection(config.delay);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait between tests
    }
}

async function testConnection(authDelay) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        const timeout = 20000; // 20 second timeout
        let buffer = Buffer.alloc(0);
        let authSent = false;
        
        const timer = setTimeout(() => {
            console.log(`⏰ Timeout after ${timeout/1000}s - no auth response`);
            socket.destroy();
            resolve();
        }, timeout);
        
        socket.on('connect', () => {
            console.log('  🔗 TCP connection established');
            
            // Wait before sending auth
            setTimeout(() => {
                console.log(`  🔐 Sending auth (after ${authDelay}ms delay)...`);
                
                const authPacket = createPacket(1, PACKET_TYPES.SERVERDATA_AUTH, 'CookieMonster420');
                socket.write(authPacket);
                authSent = true;
                
                console.log(`  📤 Auth packet sent (${authPacket.length} bytes)`);
            }, authDelay);
        });
        
        socket.on('data', (data) => {
            console.log(`  📨 Received ${data.length} bytes:`, data.toString('hex').substring(0, 40) + '...');
            
            buffer = Buffer.concat([buffer, data]);
            
            // Try to parse response
            if (buffer.length >= 4) {
                const size = buffer.readInt32LE(0);
                console.log(`  📦 Packet size: ${size}`);
                
                if (buffer.length >= size + 4) {
                    const id = buffer.readInt32LE(4);
                    const type = buffer.readInt32LE(8);
                    console.log(`  📨 Complete packet: ID=${id}, Type=${type}`);
                    
                    if (type === PACKET_TYPES.SERVERDATA_AUTH_RESPONSE) {
                        if (id === -1) {
                            console.log('  ❌ Authentication FAILED - wrong password');
                        } else {
                            console.log('  ✅ Authentication SUCCESS!');
                        }
                    }
                    
                    clearTimeout(timer);
                    socket.destroy();
                    resolve();
                }
            }
        });
        
        socket.on('error', (err) => {
            console.log(`  ❌ Socket error: ${err.message}`);
            clearTimeout(timer);
            resolve();
        });
        
        socket.on('close', () => {
            console.log('  🔌 Connection closed');
            clearTimeout(timer);
            resolve();
        });
        
        socket.on('timeout', () => {
            console.log('  ⏰ Socket timeout');
            clearTimeout(timer);
            socket.destroy();
            resolve();
        });
        
        // Connect
        console.log(`  🔌 Connecting to 45.45.238.134:16007...`);
        socket.setTimeout(timeout);
        socket.connect(16007, '45.45.238.134');
    });
}

// Run the test
testIsleHandshake().then(() => {
    console.log('\n🏁 Handshake testing complete');
    process.exit(0);
}).catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});