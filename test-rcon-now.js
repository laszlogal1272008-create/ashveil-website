// Test RCON authentication now that server is fully online
const net = require('net');

const SERVER_IP = '45.45.238.134';
const RCON_PORT = 16007;
const RCON_PASSWORD = 'CookieMonster420';

console.log('🔌 Testing RCON authentication to fully loaded Isle server...');

// Create RCON authentication packet
function createAuthPacket(password) {
    const id = 1;
    const type = 3; // SERVERDATA_AUTH
    const body = password + '\x00\x00'; // null-terminated + padding
    
    const packet = Buffer.alloc(14 + body.length);
    packet.writeInt32LE(packet.length - 4, 0); // Size
    packet.writeInt32LE(id, 4); // Request ID
    packet.writeInt32LE(type, 8); // Type
    packet.write(body, 12); // Body
    
    return packet;
}

const client = new net.Socket();

client.connect(RCON_PORT, SERVER_IP, () => {
    console.log('✅ Connected to Isle server RCON port!');
    
    // Send authentication packet
    const authPacket = createAuthPacket(RCON_PASSWORD);
    console.log('🔐 Sending RCON authentication packet...');
    client.write(authPacket);
});

// Set timeout for authentication response
const authTimeout = setTimeout(() => {
    console.log('⏰ Authentication timeout - no response from server');
    client.destroy();
    process.exit(1);
}, 10000); // 10 second timeout

client.on('data', (data) => {
    clearTimeout(authTimeout);
    
    if (data.length >= 12) {
        const size = data.readInt32LE(0);
        const id = data.readInt32LE(4);
        const type = data.readInt32LE(8);
        
        console.log(`📦 Received RCON response: size=${size}, id=${id}, type=${type}`);
        
        if (type === 2 && id === 1) {
            console.log('🎉 RCON AUTHENTICATION SUCCESSFUL!');
            console.log('✅ Server is responding to RCON commands!');
            
            // Test a command
            console.log('🧪 Testing RCON command execution...');
            const cmdPacket = createCommandPacket('ListPlayers');
            client.write(cmdPacket);
            
        } else if (type === 2 && id === -1) {
            console.log('❌ RCON authentication failed - wrong password');
        } else {
            console.log('📋 Command response received');
            console.log('Raw data:', data.toString());
        }
    }
});

function createCommandPacket(command) {
    const id = 2;
    const type = 2; // SERVERDATA_EXECCOMMAND
    const body = command + '\x00\x00';
    
    const packet = Buffer.alloc(14 + body.length);
    packet.writeInt32LE(packet.length - 4, 0);
    packet.writeInt32LE(id, 4);
    packet.writeInt32LE(type, 8);
    packet.write(body, 12);
    
    return packet;
}

client.on('error', (err) => {
    console.log('❌ Connection error:', err.message);
    process.exit(1);
});

client.on('close', () => {
    console.log('🔌 Connection closed');
    process.exit(0);
});