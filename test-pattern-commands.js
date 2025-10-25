// Test commands based on the server's interpretation pattern
const net = require('net');

console.log('🔍 Testing commands based on server interpretation pattern...');

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
        console.log('🔐 Authenticated! Testing pattern-based commands...');
        
        // Based on server interpretation, try these formats
        const patternCommands = [
            // If it's cutting off "p" and interpreting as "layer", try:
            'pkill Misplacedcursor',           // Might become "kill" 
            'pslay Misplacedcursor',           // Might become "slay"
            
            // Direct commands without player prefix:
            'kill Misplacedcursor',
            'slay Misplacedcursor', 
            'execute Misplacedcursor',
            'remove Misplacedcursor',
            'delete Misplacedcursor',
            
            // Try the "layer" commands directly since server mentions them:
            'layer_kill Misplacedcursor',
            'layer_slay Misplacedcursor',
            'layerkill Misplacedcursor',
            'layerslay Misplacedcursor',
            
            // Try commands that worked in other tests:
            'weather Misplacedcursor',         // Weather gave us player data
            'time Misplacedcursor',            // Time might do something
            'save Misplacedcursor',            // Save might affect player
            
            // Try Steam ID instead of name:
            'kill 76561199520399511',
            'slay 76561199520399511',
            'player_kill 76561199520399511',
            'player_slay 76561199520399511',
            
            // Try different case variations:
            'KILL Misplacedcursor',
            'SLAY Misplacedcursor',
            'Kill Misplacedcursor',
            'Slay Misplacedcursor'
        ];
        
        let commandIndex = 0;
        
        function sendNextCommand() {
            if (commandIndex < patternCommands.length) {
                const cmd = patternCommands[commandIndex];
                console.log(`\n🧪 Testing pattern command: "${cmd}"`);
                
                const commandPacket = Buffer.concat([
                    Buffer.from([0x02]),
                    Buffer.from(cmd, 'utf8'),
                    Buffer.from([0x00])
                ]);
                client.write(commandPacket);
                
                commandIndex++;
                setTimeout(sendNextCommand, 1500);
            } else {
                console.log('\n✅ Pattern command test complete!');
                console.log('💡 Check if any of these killed your Pachycephalosaurus!');
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