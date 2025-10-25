// Check if RCON might be working but with different protocol or timing
const net = require('net');

const SERVER_IP = '45.45.238.134';
const RCON_PORT = 16007;
const RCON_PASSWORD = 'CookieMonster420';

console.log('🔍 Detailed RCON connection analysis...');

const client = new net.Socket();

client.connect(RCON_PORT, SERVER_IP, () => {
    console.log('✅ TCP connection established to', SERVER_IP + ':' + RCON_PORT);
    console.log('🕐 Waiting 2 seconds before sending auth packet...');
    
    setTimeout(() => {
        // Try different RCON packet format
        const authPacket = Buffer.from([
            0x0A, 0x00, 0x00, 0x00,  // Size: 10 bytes
            0x01, 0x00, 0x00, 0x00,  // ID: 1
            0x03, 0x00, 0x00, 0x00,  // Type: 3 (AUTH)
            // Password as ASCII + null terminator
            ...Buffer.from(RCON_PASSWORD + '\x00\x00')
        ]);
        
        console.log('📤 Sending auth packet:', authPacket);
        client.write(authPacket);
        
        // Wait for response
        setTimeout(() => {
            console.log('⏱️  Still waiting for response...');
        }, 3000);
        
    }, 2000);
});

client.on('data', (data) => {
    console.log('📨 Raw response data:', data);
    console.log('📨 Response length:', data.length);
    console.log('📨 Response as hex:', data.toString('hex'));
    console.log('📨 Response as string:', data.toString());
    
    if (data.length >= 12) {
        try {
            const size = data.readInt32LE(0);
            const id = data.readInt32LE(4);
            const type = data.readInt32LE(8);
            console.log(`📦 Parsed: size=${size}, id=${id}, type=${type}`);
        } catch (e) {
            console.log('❌ Could not parse as RCON packet:', e.message);
        }
    }
});

client.on('error', (err) => {
    console.log('❌ Socket error:', err);
});

client.on('close', () => {
    console.log('🔌 Connection closed by server');
});

// Timeout after 15 seconds
setTimeout(() => {
    console.log('⏰ Test timeout reached');
    client.destroy();
    process.exit(0);
}, 15000);