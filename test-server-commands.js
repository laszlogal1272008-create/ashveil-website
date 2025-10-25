// Test basic server commands to see if RCON is fully functional
const net = require('net');

console.log('🔍 Testing basic server commands to verify RCON functionality');

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
        console.log('🔐 Authenticated! Testing basic server commands...');
        
        // Test basic server commands that should always work
        const testCommands = [
            'save',              // Save server state
            'saveworld',         // Save world  
            'time',              // Get server time
            'weather',           // Get weather
            'restart',           // Restart warning (won't actually restart)
            'shutdown',          // Shutdown warning (won't actually shutdown)
            'day',               // Set to day
            'night',             // Set to night
            'morning',           // Set to morning
            'noon',              // Set to noon
            'clear',             // Clear weather
            'rain',              // Set rain
            'fog',               // Set fog
            'version',           // Server version
            'info',              // Server info
            'motd',              // Message of the day
            'rules'              // Server rules
        ];
        
        let commandIndex = 0;
        
        function sendNextCommand() {
            if (commandIndex < testCommands.length) {
                const cmd = testCommands[commandIndex];
                console.log(`\n🧪 Testing basic command: "${cmd}"`);
                
                const commandPacket = Buffer.concat([
                    Buffer.from([0x02]), // RCON_EXECCOMMAND
                    Buffer.from(cmd, 'utf8'),
                    Buffer.from([0x00])
                ]);
                client.write(commandPacket);
                
                commandIndex++;
                setTimeout(sendNextCommand, 1500); // 1.5 second delay
            } else {
                console.log('\n🎯 Now testing with different opcodes for slay...');
                testSlayOpcodes();
            }
        }
        
        function testSlayOpcodes() {
            const slayCommands = [
                { cmd: 'Slay Misplacedcursor', opcode: 0x02 },      // Current
                { cmd: 'Slay Misplacedcursor', opcode: 0x40 },      // Player list opcode
                { cmd: 'Slay Misplacedcursor', opcode: 0x41 },      // Player list full opcode
                { cmd: 'Slay Misplacedcursor', opcode: 0x03 },      // Response value opcode
                { cmd: 'kill Misplacedcursor', opcode: 0x02 },      // Lowercase kill
                { cmd: 'kill 76561199520399511', opcode: 0x02 },    // Steam ID
            ];
            
            let slayIndex = 0;
            
            function sendNextSlay() {
                if (slayIndex < slayCommands.length) {
                    const test = slayCommands[slayIndex];
                    console.log(`\n⚔️ Testing: "${test.cmd}" with opcode 0x${test.opcode.toString(16).padStart(2, '0')}`);
                    
                    const commandPacket = Buffer.concat([
                        Buffer.from([test.opcode]),
                        Buffer.from(test.cmd, 'utf8'),
                        Buffer.from([0x00])
                    ]);
                    client.write(commandPacket);
                    
                    slayIndex++;
                    setTimeout(sendNextSlay, 2000);
                } else {
                    console.log('\n✅ All tests complete!');
                    setTimeout(() => {
                        client.destroy();
                        process.exit(0);
                    }, 3000);
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