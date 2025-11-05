// Direct RCON command tester - bypasses all bridge complexity
const net = require('net');

const rconConfig = {
    host: '45.45.238.134',
    port: 16007,
    password: 'CookieMonster420'
};

const commands = [
    'kill Misplacedcursor',
    'murder Misplacedcursor', 
    'admin_kill Misplacedcursor',
    'slay Misplacedcursor',
    'eliminate Misplacedcursor',
    'death Misplacedcursor'
];

async function testCommand(command) {
    return new Promise((resolve) => {
        console.log(`\n🎮 Testing: ${command}`);
        
        const client = new net.Socket();
        let authenticated = false;
        
        const timeout = setTimeout(() => {
            client.destroy();
            console.log(`❌ ${command} - Timeout`);
            resolve(false);
        }, 3000);

        client.connect(rconConfig.port, rconConfig.host, () => {
            console.log(`🔌 Connected for: ${command}`);
            
            // Send authentication
            const authPacket = Buffer.concat([
                Buffer.from([0x01]), // RCON_AUTH
                Buffer.from(rconConfig.password, 'utf8'),
                Buffer.from([0x00])
            ]);
            client.write(authPacket);
        });

        client.on('data', (data) => {
            if (!authenticated) {
                console.log(`🔓 Authenticated, sending: ${command}`);
                authenticated = true;
                
                // Send the actual command
                const commandPacket = Buffer.concat([
                    Buffer.from([0x02]),
                    Buffer.from(command, 'utf8'),
                    Buffer.from([0x00])
                ]);
                client.write(commandPacket);
            } else {
                console.log(`📨 Response for ${command}:`, data.toString());
            }
        });

        client.on('close', () => {
            clearTimeout(timeout);
            console.log(`✅ ${command} - Command sent`);
            resolve(true);
        });

        client.on('error', (error) => {
            clearTimeout(timeout);
            console.error(`❌ ${command} - Error:`, error.message);
            resolve(false);
        });
    });
}

async function testAllCommands() {
    console.log('🚀 Starting direct RCON command testing...');
    console.log('👀 Watch your character in Isle for any deaths!');
    
    for (const command of commands) {
        await testCommand(command);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between commands
    }
    
    console.log('\n🏁 All commands tested! Did any kill your character?');
}

testAllCommands();