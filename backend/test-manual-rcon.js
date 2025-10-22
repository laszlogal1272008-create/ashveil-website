// Quick RCON test for The Isle
const net = require('net');

// Create basic RCON packet
function createRCONPacket(id, type, command) {
    const body = Buffer.from(command + '\x00\x00', 'ascii');
    const size = body.length + 8; // id(4) + type(4) + body
    
    const packet = Buffer.allocUnsafe(4 + size);
    packet.writeInt32LE(size, 0);        // Size
    packet.writeInt32LE(id, 4);          // Request ID
    packet.writeInt32LE(type, 8);        // Type
    body.copy(packet, 12);               // Body
    
    return packet;
}

// Test RCON connection with manual packet creation
async function testManualRCON() {
    return new Promise((resolve, reject) => {
        console.log('🔧 Testing manual RCON connection...');
        
        const socket = new net.Socket();
        socket.setTimeout(8000);
        
        let step = 'connecting';
        let authenticated = false;
        
        socket.on('connect', () => {
            console.log('✅ TCP connected, sending auth...');
            step = 'authenticating';
            
            // Send authentication packet
            const authPacket = createRCONPacket(1, 3, 'CookieMonster420');
            socket.write(authPacket);
        });
        
        socket.on('data', (data) => {
            console.log(`📨 Received ${data.length} bytes:`, data);
            
            try {
                if (data.length >= 12) {
                    const size = data.readInt32LE(0);
                    const id = data.readInt32LE(4);
                    const type = data.readInt32LE(8);
                    
                    console.log(`   Size: ${size}, ID: ${id}, Type: ${type}`);
                    
                    if (type === 2 && id === -1) {
                        console.log('❌ Authentication failed - wrong password');
                        socket.destroy();
                        reject(new Error('Authentication failed'));
                        return;
                    }
                    
                    if (type === 2 && id === 1) {
                        console.log('✅ Authentication successful!');
                        authenticated = true;
                        step = 'testing_commands';
                        
                        // Try different slay commands for The Isle
                        setTimeout(() => {
                            console.log('🧪 Testing slay commands...');
                            
                            // Command 1: KillCharacter (common in The Isle)
                            const slayPacket1 = createRCONPacket(2, 2, 'KillCharacter Misplacedcursor');
                            socket.write(slayPacket1);
                            
                            // Command 2: Alternative syntax
                            setTimeout(() => {
                                const slayPacket2 = createRCONPacket(3, 2, 'slay Misplacedcursor');
                                socket.write(slayPacket2);
                            }, 1000);
                            
                            // Command 3: kill command
                            setTimeout(() => {
                                const slayPacket3 = createRCONPacket(4, 2, 'kill Misplacedcursor');
                                socket.write(slayPacket3);
                            }, 2000);
                            
                        }, 500);
                    }
                    
                    if (type === 0 && authenticated) {
                        // Command response
                        const response = data.slice(12).toString('ascii').replace(/\x00+$/, '');
                        console.log(`📋 Command response (ID ${id}): "${response}"`);
                        
                        if (id >= 2) {
                            // Got all responses
                            setTimeout(() => {
                                socket.destroy();
                                resolve('Test completed');
                            }, 1000);
                        }
                    }
                }
            } catch (err) {
                console.error('Error parsing response:', err);
            }
        });
        
        socket.on('error', (err) => {
            console.error(`❌ Socket error during ${step}:`, err.message);
            reject(err);
        });
        
        socket.on('timeout', () => {
            console.error(`⏰ Timeout during ${step}`);
            reject(new Error(`Timeout during ${step}`));
        });
        
        socket.on('close', () => {
            console.log('🔌 Connection closed');
            if (!authenticated && step !== 'testing_commands') {
                reject(new Error('Connection closed before auth'));
            }
        });
        
        // Connect
        console.log('🔌 Connecting to 45.45.238.134:16007...');
        socket.connect(16007, '45.45.238.134');
    });
}

testManualRCON()
    .then(result => console.log('✅ Test completed:', result))
    .catch(error => console.error('❌ Test failed:', error.message));