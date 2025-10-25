// Test different Steam ID formats for The Isle RCON
const net = require('net');

console.log('🔍 Testing Steam ID formats for The Isle RCON');

const client = new net.Socket();

client.connect(16007, '45.45.238.134', () => {
    console.log('✅ Connected! Authenticating...');
    
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
        console.log('🔐 Authenticated! Testing different Steam ID formats...');
        
        // Test different Steam ID slay formats
        const steamId = '76561199520399511';
        const testCommands = [
            `kill ${steamId}`,              // Lowercase kill with Steam ID
            `Kill ${steamId}`,              // Capitalize Kill with Steam ID  
            `slay ${steamId}`,              // Lowercase slay with Steam ID
            `Slay ${steamId}`,              // Our current format
            `AdminKill ${steamId}`,         // Admin version
            `AdminSlay ${steamId}`,         // Admin slay
            `kill Misplacedcursor`,         // Lowercase with name
            `Kill Misplacedcursor`,         // Capitalize with name
            `slay Misplacedcursor`,         // Lowercase slay with name
            `Slay Misplacedcursor`,         // Our current name format
            `AdminKill Misplacedcursor`,    // Admin with name
            `AdminSlay Misplacedcursor`,    // Admin slay with name
            `suicide ${steamId}`,           // Maybe suicide command?
            `suicide Misplacedcursor`,      // Suicide with name
            `kick ${steamId}`,              // Try kick to see if anything works
            `kick Misplacedcursor`          // Kick with name
        ];
        
        let commandIndex = 0;
        
        function sendNextCommand() {
            if (commandIndex < testCommands.length) {
                const cmd = testCommands[commandIndex];
                console.log(`\n🧪 Testing: "${cmd}"`);
                
                const commandPacket = Buffer.concat([
                    Buffer.from([0x02]), // RCON_EXECCOMMAND
                    Buffer.from(cmd, 'utf8'),
                    Buffer.from([0x00])
                ]);
                client.write(commandPacket);
                
                commandIndex++;
                setTimeout(sendNextCommand, 2000); // 2 second delay
            } else {
                console.log('\n✅ Steam ID format test complete!');
                setTimeout(() => {
                    client.destroy();
                    process.exit(0);
                }, 3000);
            }
        }
        
        // Start testing after a short delay
        setTimeout(sendNextCommand, 2000);
    }
});

client.on('error', (err) => {
    console.log('❌ Error:', err.message);
});

client.on('close', () => {
    console.log('🔌 Connection closed');
});