// Test specific opcodes from Austin's documentation
const net = require('net');

console.log('🧪 Testing specific Isle RCON opcodes...');

const client = new net.Socket();

client.connect(16007, '45.45.238.134', () => {
    console.log('✅ Connected! Authenticating first...');
    
    // Authenticate first (we know this works)
    const authPacket = Buffer.concat([
        Buffer.from([0x01]), // RCON_AUTH
        Buffer.from('CookieMonster420', 'utf8'),
        Buffer.from([0x00])
    ]);
    client.write(authPacket);
});

let authenticated = false;

client.on('data', (data) => {
    const response = data.toString('ascii');
    console.log('📨 Response:', response);
    
    if (response.includes('Password Accepted') && !authenticated) {
        authenticated = true;
        console.log('🎉 Authenticated! Now testing opcodes...');
        
        // Test the opcodes from Austin's tool
        setTimeout(() => {
            console.log('\n🧪 Testing RCON_GETPLAYERLIST (0x40)');
            client.write(Buffer.from([0x40])); // Just the opcode
        }, 1000);
        
        setTimeout(() => {
            console.log('\n🧪 Testing RCON_GETPLAYERLISTFULL (0x41)');
            client.write(Buffer.from([0x41])); // Just the opcode
        }, 3000);
        
        setTimeout(() => {
            console.log('\n🧪 Testing RCON_GETPLAYERLIST with null terminator');
            client.write(Buffer.from([0x40, 0x00])); // Opcode + null
        }, 5000);
        
        setTimeout(() => {
            console.log('\n🧪 Testing slay command with RCON_EXECCOMMAND (0x02)');
            const slayPacket = Buffer.concat([
                Buffer.from([0x02]), // RCON_EXECCOMMAND
                Buffer.from('Slay TestPlayer', 'utf8'),
                Buffer.from([0x00])
            ]);
            client.write(slayPacket);
        }, 7000);
        
        setTimeout(() => {
            console.log('\n🧪 Testing GetPlayerList as string command (0x02)');
            const cmdPacket = Buffer.concat([
                Buffer.from([0x02]), // RCON_EXECCOMMAND
                Buffer.from('GetPlayerList', 'utf8'),
                Buffer.from([0x00])
            ]);
            client.write(cmdPacket);
        }, 9000);
        
        setTimeout(() => {
            console.log('\n🧪 Testing ListPlayers as string command (0x02)');
            const cmdPacket = Buffer.concat([
                Buffer.from([0x02]), // RCON_EXECCOMMAND
                Buffer.from('ListPlayers', 'utf8'),
                Buffer.from([0x00])
            ]);
            client.write(cmdPacket);
        }, 11000);
        
        setTimeout(() => {
            console.log('\n⏰ Test complete');
            client.destroy();
            process.exit(0);
        }, 15000);
    }
});

client.on('error', (err) => {
    console.log('❌ Error:', err.message);
});

client.on('close', () => {
    console.log('🔌 Connection closed');
});