const net = require('net');

console.log('🔍 Testing standard Source RCON protocol...');

// Create a proper RCON packet
function createRCONPacket(id, type, body) {
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

const client = new net.Socket();
client.setTimeout(10000);

let buffer = Buffer.alloc(0);

client.connect(16007, '45.45.238.134', () => {
    console.log('✅ TCP Connected!');
    
    // Send proper RCON authentication packet
    const authPacket = createRCONPacket(1, 3, 'CookieMonster420');
    client.write(authPacket);
    console.log('📤 Sent RCON auth packet');
});

client.on('data', (data) => {
    console.log('📨 Received data length:', data.length);
    console.log('📨 Raw data:', data.toString('hex'));
    
    buffer = Buffer.concat([buffer, data]);
    
    // Try to parse RCON response
    if (buffer.length >= 4) {
        const size = buffer.readInt32LE(0);
        console.log('📦 Packet size:', size);
        
        if (buffer.length >= 4 + size) {
            const id = buffer.readInt32LE(4);
            const type = buffer.readInt32LE(8);
            const body = buffer.slice(12, 4 + size - 2).toString('ascii');
            
            console.log('📨 ID:', id, 'Type:', type, 'Body:', body);
            
            if (type === 2 && id !== -1) {
                console.log('✅ Authentication successful!');
                
                // Send a test command
                setTimeout(() => {
                    const cmdPacket = createRCONPacket(2, 2, 'help');
                    client.write(cmdPacket);
                    console.log('📤 Sent help command');
                }, 1000);
            } else if (id === -1) {
                console.log('❌ Authentication failed!');
            }
        }
    }
});

client.on('error', (err) => {
    console.error('❌ Error:', err.message);
});

client.on('timeout', () => {
    console.log('⏰ Timeout - server not responding');
    client.destroy();
});

client.on('close', () => {
    console.log('🔌 Connection closed');
});

setTimeout(() => {
    console.log('🛑 Test complete');
    client.destroy();
}, 15000);