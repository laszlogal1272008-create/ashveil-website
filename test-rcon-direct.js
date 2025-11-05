const net = require('net');

const ISLE_HOST = '45.45.238.134';
const ISLE_PORT = 16007;
const RCON_PASSWORD = 'CookieMonster420';

function createRCONPacket(command, type = 0x02) {
    const cmdBuffer = Buffer.from(command, 'utf8');
    const packet = Buffer.alloc(12 + cmdBuffer.length);
    
    packet.writeInt32LE(8 + cmdBuffer.length, 0); // Size
    packet.writeInt32LE(1, 4); // Request ID
    packet.writeInt32LE(type, 8); // Type (0x01=auth, 0x02=command)
    cmdBuffer.copy(packet, 12);
    
    return packet;
}

function parseRCONResponse(buffer) {
    if (buffer.length < 12) return null;
    
    const size = buffer.readInt32LE(0);
    const id = buffer.readInt32LE(4);
    const type = buffer.readInt32LE(8);
    
    if (buffer.length >= 12 + size - 8) {
        const bodyLength = size - 8;
        const body = buffer.slice(12, 12 + bodyLength - 2).toString('utf8');
        return { size, id, type, body };
    }
    return null;
}

async function testConnection() {
    console.log('🔍 Testing direct RCON connection to Isle server...');
    
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        let authenticated = false;
        let responseBuffer = Buffer.alloc(0);
        let stepCount = 0;
        
        client.setTimeout(15000);
        
        client.on('connect', () => {
            console.log('✅ Connected to Isle server successfully');
            stepCount++;
            const authPacket = createRCONPacket(RCON_PASSWORD, 0x01);
            client.write(authPacket);
            console.log(`📤 Step ${stepCount}: Sent authentication packet`);
        });
        
        client.on('data', (data) => {
            responseBuffer = Buffer.concat([responseBuffer, data]);
            
            while (true) {
                const response = parseRCONResponse(responseBuffer);
                if (!response) break;
                
                const totalPacketSize = response.size + 4;
                responseBuffer = responseBuffer.slice(totalPacketSize);
                
                console.log(`📨 Server response: "${response.body}"`);
                
                if (!authenticated && response.body.includes('Password Accepted')) {
                    authenticated = true;
                    stepCount++;
                    console.log(`✅ Step ${stepCount}: RCON Authentication successful!`);
                    
                    // First, list all players to see who's online
                    stepCount++;
                    console.log(`📤 Step ${stepCount}: Requesting player list...`);
                    const listPlayersPacket = createRCONPacket('ListPlayers', 0x02);
                    client.write(listPlayersPacket);
                    
                } else if (authenticated) {
                    stepCount++;
                    console.log(`📨 Step ${stepCount}: Got response for command`);
                    
                    if (response.body.includes('Misplacedcursor') || response.body.includes('Players:')) {
                        console.log('🎯 Found player info! Trying slay commands...');
                        
                        // Try the working command we discovered
                        const slayCommands = [
                            '/slay Misplacedcursor',
                            'slay Misplacedcursor', 
                            '/kill Misplacedcursor',
                            'AdminKill Misplacedcursor',
                            '/AdminKill Misplacedcursor',
                            'KillPlayer Misplacedcursor',
                            '/KillPlayer Misplacedcursor'
                        ];
                        
                        let commandIndex = 0;
                        const tryNextCommand = () => {
                            if (commandIndex < slayCommands.length) {
                                stepCount++;
                                console.log(`📤 Step ${stepCount}: Trying command: "${slayCommands[commandIndex]}"`);
                                const commandPacket = createRCONPacket(slayCommands[commandIndex], 0x02);
                                client.write(commandPacket);
                                commandIndex++;
                                
                                // Try next command after a delay
                                setTimeout(() => {
                                    if (commandIndex < slayCommands.length) {
                                        tryNextCommand();
                                    } else {
                                        client.end();
                                        resolve('All commands attempted');
                                    }
                                }, 2000);
                            }
                        };
                        
                        tryNextCommand();
                        
                    } else {
                        // If we get here without player info, try a simple test command
                        stepCount++;
                        console.log(`📤 Step ${stepCount}: Trying basic test command...`);
                        const testPacket = createRCONPacket('/slay Misplacedcursor', 0x02);
                        client.write(testPacket);
                        
                        setTimeout(() => {
                            client.end();
                            resolve('Test completed');
                        }, 3000);
                    }
                }
            }
        });
        
        client.on('timeout', () => {
            console.log('❌ Connection timeout');
            client.destroy();
            reject(new Error('Connection timeout'));
        });
        
        client.on('error', (err) => {
            console.log(`❌ Connection error: ${err.message}`);
            reject(err);
        });
        
        client.on('close', () => {
            console.log('🔌 Connection closed');
        });
        
        console.log(`🔌 Connecting to ${ISLE_HOST}:${ISLE_PORT}...`);
        client.connect(ISLE_PORT, ISLE_HOST);
    });
}

// Run the test
testConnection()
    .then(result => {
        console.log('✅ Test completed:', result);
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    });