// Simplified Isle RCON test - try different packet formats
const net = require('net');

console.log('🔍 Testing different Isle RCON packet formats...');

const client = new net.Socket();

client.connect(16007, '45.45.238.134', () => {
    console.log('✅ Connected to port 16007');
    
    // Try different authentication formats based on the documentation
    const password = 'CookieMonster420';
    
    console.log('🧪 Testing Format 1: Simple opcode + password');
    // Format 1: Just opcode byte + password string
    const format1 = Buffer.concat([
        Buffer.from([0x01]), // RCON_AUTH opcode
        Buffer.from(password, 'utf8'),
        Buffer.from([0x00]) // null terminator
    ]);
    client.write(format1);
    
    setTimeout(() => {
        console.log('🧪 Testing Format 2: Length + opcode + password');
        // Format 2: Length prefix + opcode + password
        const dataLen = password.length + 1; // +1 for opcode
        const format2 = Buffer.alloc(4 + dataLen);
        format2.writeUInt32LE(dataLen, 0); // Length
        format2.writeUInt8(0x01, 4); // RCON_AUTH opcode
        Buffer.from(password, 'utf8').copy(format2, 5);
        client.write(format2);
    }, 2000);
    
    setTimeout(() => {
        console.log('🧪 Testing Format 3: Source-style with Isle opcode');
        // Format 3: Source RCON format but with Isle opcode
        const packet = Buffer.alloc(14 + password.length);
        packet.writeInt32LE(packet.length - 4, 0); // Size
        packet.writeInt32LE(1, 4); // Request ID
        packet.writeInt32LE(0x01, 8); // Isle AUTH opcode instead of Source 3
        packet.write(password + '\x00\x00', 12); // Password + null terminators
        client.write(packet);
    }, 4000);
    
    setTimeout(() => {
        console.log('🧪 Testing Format 4: Plain text password');
        // Format 4: Maybe it's just plain text?
        client.write(password + '\n');
    }, 6000);
});

client.on('data', (data) => {
    console.log('📨 RESPONSE RECEIVED!');
    console.log('📊 Length:', data.length);
    console.log('🔍 Hex:', data.toString('hex'));
    console.log('📝 ASCII:', data.toString('ascii'));
    
    // If we get ANY response, that means we're on the right track
    if (data.length > 0) {
        console.log('🎉 Server responded! RCON is working!');
        
        // Try sending a test command
        setTimeout(() => {
            console.log('🧪 Testing GetPlayerList command...');
            // Try different command formats
            client.write(Buffer.from([0x40])); // RCON_GETPLAYERLIST opcode
        }, 2000);
    }
});

client.on('error', (err) => {
    console.log('❌ Error:', err.message);
});

client.on('close', () => {
    console.log('🔌 Connection closed');
});

// Timeout after 20 seconds
setTimeout(() => {
    console.log('⏰ Test complete - closing connection');
    client.destroy();
    process.exit(0);
}, 20000);