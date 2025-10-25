// RCON Diagnostic Tool - Find the Right Command Format
const net = require('net');

console.log('🔍 RCON Diagnostic Tool - Testing Command Formats');

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
        console.log('🔐 Authenticated! Testing different command formats...');
        
        // Test different command formats one by one
        const testCommands = [
            'ListPlayers',           // See who's online
            'GetPlayers',           // Alternative player list
            'AdminListPlayers',     // Admin version
            'ShowPlayers',          // Another variant
            'Help',                 // Get available commands
            'Commands',             // List commands
            '?',                    // Help alternative
            'AdminHelp',            // Admin help
            'Status',               // Server status
            'GetServerInfo',        // Server info
            'ListAdmins',           // List admins
            'AdminList'             // Admin list
        ];
        
        let commandIndex = 0;
        
        function sendNextCommand() {
            if (commandIndex < testCommands.length) {
                const cmd = testCommands[commandIndex];
                console.log(`\n🧪 Testing command: "${cmd}"`);
                
                const commandPacket = Buffer.concat([
                    Buffer.from([0x02]), // RCON_EXECCOMMAND
                    Buffer.from(cmd, 'utf8'),
                    Buffer.from([0x00])
                ]);
                client.write(commandPacket);
                
                commandIndex++;
                setTimeout(sendNextCommand, 3000); // 3 second delay between commands
            } else {
                console.log('\n🎯 Now testing slay commands with different formats...');
                testSlayCommands();
            }
        }
        
        function testSlayCommands() {
            const slayCommands = [
                'Slay *',               // Slay all
                'Kill *',               // Kill all
                'AdminKill *',          // Admin kill all
                'AdminSlay *',          // Admin slay all
                'Slay TestPlayer',      // Test with fake name
                'Kill TestPlayer',      // Test with fake name
                'AdminKill TestPlayer', // Test with fake name
                'AdminSlay TestPlayer'  // Test with fake name
            ];
            
            let slayIndex = 0;
            
            function sendNextSlay() {
                if (slayIndex < slayCommands.length) {
                    const cmd = slayCommands[slayIndex];
                    console.log(`\n⚔️ Testing slay: "${cmd}"`);
                    
                    const commandPacket = Buffer.concat([
                        Buffer.from([0x02]), // RCON_EXECCOMMAND
                        Buffer.from(cmd, 'utf8'),
                        Buffer.from([0x00])
                    ]);
                    client.write(commandPacket);
                    
                    slayIndex++;
                    setTimeout(sendNextSlay, 3000);
                } else {
                    console.log('\n✅ Diagnostic complete! Check output above for any responses.');
                    setTimeout(() => {
                        client.destroy();
                        process.exit(0);
                    }, 5000);
                }
            }
            
            sendNextSlay();
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