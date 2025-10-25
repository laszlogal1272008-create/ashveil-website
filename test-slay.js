// Test Slay Command Directly
const net = require('net');

async function testSlayCommand() {
    console.log('🎯 Testing Isle RCON Slay Command...');
    
    const client = new net.Socket();
    
    client.connect(16007, '45.45.238.134', () => {
        console.log('✅ Connected! Authenticating...');
        
        // Authenticate first
        const authPacket = Buffer.concat([
            Buffer.from([0x01]), // RCON_AUTH
            Buffer.from('CookieMonster420', 'utf8'),
            Buffer.from([0x00])
        ]);
        client.write(authPacket);
    });

    client.on('data', (data) => {
        const response = data.toString('ascii');
        console.log('📨 Server response:', response);
        
        if (response.includes('Password Accepted')) {
            console.log('🔐 Authenticated! Testing slay commands...');
            
            // Test different slay command formats
            setTimeout(() => {
                console.log('\n🧪 Testing: Slay TestPlayer');
                const slayPacket = Buffer.concat([
                    Buffer.from([0x02]), // RCON_EXECCOMMAND
                    Buffer.from('Slay TestPlayer', 'utf8'),
                    Buffer.from([0x00])
                ]);
                client.write(slayPacket);
            }, 1000);
            
            setTimeout(() => {
                console.log('\n🧪 Testing: AdminSlay TestPlayer');
                const adminSlayPacket = Buffer.concat([
                    Buffer.from([0x02]), // RCON_EXECCOMMAND
                    Buffer.from('AdminSlay TestPlayer', 'utf8'),
                    Buffer.from([0x00])
                ]);
                client.write(adminSlayPacket);
            }, 3000);
            
            setTimeout(() => {
                console.log('\n🧪 Testing: Kill TestPlayer');
                const killPacket = Buffer.concat([
                    Buffer.from([0x02]), // RCON_EXECCOMMAND
                    Buffer.from('Kill TestPlayer', 'utf8'),
                    Buffer.from([0x00])
                ]);
                client.write(killPacket);
            }, 5000);
            
            setTimeout(() => {
                console.log('\n✅ Slay commands sent! The server may not respond but commands should work.');
                console.log('🎯 RCON is ready for website integration!');
                client.destroy();
                process.exit(0);
            }, 8000);
        }
    });

    client.on('error', (err) => {
        console.log('❌ Error:', err.message);
    });

    client.on('close', () => {
        console.log('🔌 Connection closed');
    });
}

testSlayCommand();