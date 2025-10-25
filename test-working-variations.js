// Test the working command variations
const net = require('net');

console.log('🎯 Testing variations of the working commands...');

const client = new net.Socket();

client.connect(16007, '45.45.238.134', () => {
    console.log('✅ Connected! Authenticating...');
    
    const authPacket = Buffer.concat([
        Buffer.from([0x01]),
        Buffer.from('CookieMonster420', 'utf8'),
        Buffer.from([0x00])
    ]);
    client.write(authPacket);
});

client.on('data', (data) => {
    const response = data.toString('ascii');
    console.log('📨 Server response:', response);
    
    if (response.includes('Password Accepted')) {
        console.log('🔐 Authenticated! Testing working command variations...');
        
        // Test variations of the commands that gave responses
        const workingCommands = [
            'PlayerList',                      // This saved the game
            'player_kill Misplacedcursor',     // This gave "False" result
            'player_slay Misplacedcursor',     // This gave "False" result
            'playerkill Misplacedcursor',      // Try without underscore
            'playerslay Misplacedcursor',      // Try without underscore
            'killplayer Misplacedcursor',      // Reverse order
            'slayplayer Misplacedcursor',      // Reverse order
            'kill player Misplacedcursor',     // With space
            'slay player Misplacedcursor',     // With space
            'player kill Misplacedcursor',     // With space
            'player slay Misplacedcursor',     // With space
            'Admin_kill Misplacedcursor',      // Admin version
            'Admin_slay Misplacedcursor',      // Admin slay
            'admin_kill Misplacedcursor',      // Lowercase admin
            'admin_slay Misplacedcursor',      // Lowercase admin slay
            'force_kill Misplacedcursor',      // Force version
            'force_slay Misplacedcursor',      // Force slay
            'instant_kill Misplacedcursor',    // Instant version
            'instant_slay Misplacedcursor'     // Instant slay
        ];
        
        let commandIndex = 0;
        
        function sendNextCommand() {
            if (commandIndex < workingCommands.length) {
                const cmd = workingCommands[commandIndex];
                console.log(`\n🧪 Testing: "${cmd}"`);
                
                const commandPacket = Buffer.concat([
                    Buffer.from([0x02]),
                    Buffer.from(cmd, 'utf8'),
                    Buffer.from([0x00])
                ]);
                client.write(commandPacket);
                
                commandIndex++;
                setTimeout(sendNextCommand, 2000);
            } else {
                console.log('\n✅ Working command variations test complete!');
                setTimeout(() => {
                    client.destroy();
                    process.exit(0);
                }, 3000);
            }
        }
        
        setTimeout(sendNextCommand, 2000);
    }
});

client.on('error', (err) => {
    console.log('❌ Error:', err.message);
});

client.on('close', () => {
    console.log('🔌 Connection closed');
});