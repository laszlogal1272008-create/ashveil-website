const net = require('net');

const ISLE_HOST = '45.45.238.134';
const RCON_PORT = 16007;
const RCON_PASSWORD = 'CookieMonster420';

function createRCONPacket(command, type = 0x02) {
    const cmdBuffer = Buffer.from(command, 'utf8');
    const packet = Buffer.alloc(12 + cmdBuffer.length + 2); // +2 for null terminators
    
    packet.writeInt32LE(8 + cmdBuffer.length + 2, 0); // Size includes terminators
    packet.writeInt32LE(1, 4); // Request ID
    packet.writeInt32LE(type, 8); // Type (0x03=auth, 0x02=command in Source RCON)
    cmdBuffer.copy(packet, 12);
    packet.writeInt8(0, 12 + cmdBuffer.length); // Null terminator
    packet.writeInt8(0, 12 + cmdBuffer.length + 1); // Second null terminator
    
    return packet;
}

function parseRCONResponse(buffer) {
    if (buffer.length < 12) return null;
    
    const size = buffer.readInt32LE(0);
    const id = buffer.readInt32LE(4);
    const type = buffer.readInt32LE(8);
    
    if (buffer.length >= 4 + size) {
        const bodyEnd = Math.min(12 + size - 8, buffer.length - 2);
        const body = buffer.slice(12, bodyEnd).toString('utf8').replace(/\0/g, '');
        return { size, id, type, body };
    }
    return null;
}

console.log('🎯 Testing RCON with your exact server config...');
console.log(`Server: ${ISLE_HOST}:${RCON_PORT}`);
console.log(`Password: ${RCON_PASSWORD}`);

const client = new net.Socket();
let responseBuffer = Buffer.alloc(0);
let authenticated = false;
let commandSent = false;

client.setTimeout(10000);

client.on('connect', () => {
    console.log('✅ Connected to server!');
    console.log('📤 Sending authentication packet...');
    
    // Use type 0x03 for Source RCON authentication
    const authPacket = createRCONPacket(RCON_PASSWORD, 0x03);
    console.log('📦 Auth packet size:', authPacket.length);
    client.write(authPacket);
});

client.on('data', (data) => {
    console.log('📨 Received', data.length, 'bytes');
    responseBuffer = Buffer.concat([responseBuffer, data]);
    
    // Try to parse all complete responses
    while (true) {
        const response = parseRCONResponse(responseBuffer);
        if (!response) break;
        
        console.log('📋 Response:', {
            id: response.id,
            type: response.type,
            body: `"${response.body}"`
        });
        
        // Remove processed packet from buffer
        const packetSize = response.size + 4;
        responseBuffer = responseBuffer.slice(packetSize);
        
        if (!authenticated && (response.type === 0x02 || response.body.includes('Password') || response.id === 1)) {
            authenticated = true;
            console.log('🎉 Authentication successful!');
            
            // Now try the slay command
            console.log('📤 Sending slay command...');
            const slayPacket = createRCONPacket('/slay Misplacedcursor', 0x02);
            client.write(slayPacket);
            commandSent = true;
            
        } else if (authenticated && commandSent) {
            console.log('🎯 Slay command response:', response.body);
            
            if (response.body.includes('Playables list was updated') || 
                response.body.includes('killed') || 
                response.body.includes('slain')) {
                console.log('🎉 SUCCESS! Player was slain!');
            } else {
                console.log('🤔 Command executed but unclear result');
            }
            
            client.end();
            return;
        }
    }
});

client.on('timeout', () => {
    console.log('❌ Connection timeout after 10 seconds');
    client.destroy();
});

client.on('error', (err) => {
    console.log('❌ Connection error:', err.message);
});

client.on('close', () => {
    console.log('🔌 Connection closed');
    process.exit(0);
});

console.log('🔌 Connecting...');
client.connect(RCON_PORT, ISLE_HOST);