// Test RCON after Engine.ini creation and server restart
const net = require('net');

const SERVER_IP = '45.45.238.134';
const RCON_PORT = 16007;
const RCON_PASSWORD = 'CookieMonster420';

console.log('🎯 Testing RCON after Engine.ini creation...');
console.log('📋 Server should now have both Game.ini AND Engine.ini configured');

function createRconPacket(id, type, body) {
    const packet = Buffer.alloc(14 + body.length);
    packet.writeInt32LE(packet.length - 4, 0); // Size
    packet.writeInt32LE(id, 4); // Request ID  
    packet.writeInt32LE(type, 8); // Type
    packet.write(body + '\x00\x00', 12); // Body with null terminators
    return packet;
}

const client = new net.Socket();

client.connect(RCON_PORT, SERVER_IP, () => {
    console.log('✅ Connected to Isle server port 16007');
    console.log('🔐 Sending RCON authentication...');
    
    const authPacket = createRconPacket(1, 3, RCON_PASSWORD); // ID=1, Type=3 (AUTH)
    client.write(authPacket);
});

client.on('data', (data) => {
    console.log('📨 RCON RESPONSE RECEIVED!');
    console.log('📊 Data length:', data.length);
    console.log('🔍 Raw data:', data.toString('hex'));
    
    if (data.length >= 12) {
        const size = data.readInt32LE(0);
        const id = data.readInt32LE(4); 
        const type = data.readInt32LE(8);
        
        console.log(`📦 Parsed response: size=${size}, id=${id}, type=${type}`);
        
        if (type === 2) { // SERVERDATA_RESPONSE_VALUE
            if (id === 1) {
                console.log('🎉 RCON AUTHENTICATION SUCCESSFUL!');
                console.log('✅ Engine.ini fix worked! RCON is now responding!');
                
                // Test a command
                console.log('🧪 Testing ListPlayers command...');
                const cmdPacket = createRconPacket(2, 2, 'ListPlayers'); // ID=2, Type=2 (EXECCOMMAND)
                client.write(cmdPacket);
                
            } else if (id === -1) {
                console.log('❌ Authentication failed - invalid password');
            } else {
                console.log('📋 Command response received');
                const response = data.slice(12).toString().replace(/\0/g, '');
                console.log('💬 Response:', response);
                console.log('🎯 RCON is working! Ready to deploy bridge!');
                client.end();
            }
        }
    }
});

client.on('error', (err) => {
    console.log('❌ Connection error:', err.message);
});

client.on('close', () => {
    console.log('🔌 Connection closed');
    process.exit(0);
});

// Timeout after 10 seconds
setTimeout(() => {
    console.log('⏰ No response - server may still be starting up');
    console.log('💡 Try again once you see "Server marked as ON" in console');
    client.destroy();
    process.exit(1);
}, 10000);