// Test Isle-specific commands based on the server response format
const net = require('net');

console.log('🔍 Testing Isle-specific commands...');

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
        console.log('🔐 Authenticated! Testing Isle-specific commands...');
        
        // Based on the response format, try Isle-specific commands
        const isleCommands = [
            'PlayerList',                     // Get all players
            'GetAllPlayers',                  // Alternative player list
            'ListAllPlayers',                 // Another variant
            'KillPlayer Misplacedcursor',     // Kill player command
            'SlayPlayer Misplacedcursor',     // Slay player command  
            'RemovePlayer Misplacedcursor',   // Remove player
            'KickPlayer Misplacedcursor',     // Kick player
            'BanPlayer Misplacedcursor',      // Ban player (we'll unban later)
            'TeleportPlayer Misplacedcursor', // Teleport player
            'HealPlayer Misplacedcursor',     // Heal player
            'FeedPlayer Misplacedcursor',     // Feed player
            'GrowPlayer Misplacedcursor',     // Grow player
            'SetGrowth Misplacedcursor 1.0',  // Set growth
            'SetHealth Misplacedcursor 0.1',  // Set low health (might kill)
            'DamagePlayer Misplacedcursor 100', // Damage player
            'kill_player Misplacedcursor',    // Underscore version
            'slay_player Misplacedcursor',    // Underscore slay
            'player_kill Misplacedcursor',    // Different order
            'player_slay Misplacedcursor',    // Different order slay
            'suicide Misplacedcursor',        // Force suicide
            'eliminate Misplacedcursor',      // Eliminate
            'terminate Misplacedcursor',      // Terminate
            'destroy Misplacedcursor'         // Destroy
        ];
        
        let commandIndex = 0;
        
        function sendNextCommand() {
            if (commandIndex < isleCommands.length) {
                const cmd = isleCommands[commandIndex];
                console.log(`\n🧪 Testing Isle command: "${cmd}"`);
                
                const commandPacket = Buffer.concat([
                    Buffer.from([0x02]),
                    Buffer.from(cmd, 'utf8'),
                    Buffer.from([0x00])
                ]);
                client.write(commandPacket);
                
                commandIndex++;
                setTimeout(sendNextCommand, 2000);
            } else {
                console.log('\n✅ Isle command test complete!');
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