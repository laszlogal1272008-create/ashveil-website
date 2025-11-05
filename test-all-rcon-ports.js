const net = require('net');

const ISLE_HOST = '45.45.238.134';
const RCON_PASSWORD = 'CookieMonster420';
const PORTS_TO_TEST = [16007, 16008, 16010, 8080];

function createRCONPacket(command, type = 0x02) {
    const cmdBuffer = Buffer.from(command, 'utf8');
    const packet = Buffer.alloc(12 + cmdBuffer.length);
    
    packet.writeInt32LE(8 + cmdBuffer.length, 0);
    packet.writeInt32LE(1, 4);
    packet.writeInt32LE(type, 8);
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

async function testPort(port) {
    return new Promise((resolve) => {
        console.log(`\n🔍 Testing port ${port}...`);
        
        const client = new net.Socket();
        let responseBuffer = Buffer.alloc(0);
        let gotResponse = false;
        
        client.setTimeout(3000);
        
        client.on('connect', () => {
            console.log(`✅ Connected to port ${port}! Sending auth...`);
            const authPacket = createRCONPacket(RCON_PASSWORD, 0x01);
            client.write(authPacket);
        });
        
        client.on('data', (data) => {
            gotResponse = true;
            console.log(`📨 Port ${port} - Got data:`, data.length, 'bytes');
            responseBuffer = Buffer.concat([responseBuffer, data]);
            
            const response = parseRCONResponse(responseBuffer);
            if (response) {
                console.log(`📨 Port ${port} - Server says:`, response.body);
                
                if (response.body.includes('Password Accepted')) {
                    console.log(`🎯 Port ${port} - AUTH SUCCESS! Trying slay...`);
                    const slayPacket = createRCONPacket('/slay Misplacedcursor', 0x02);
                    client.write(slayPacket);
                } else if (response.body.includes('Playables list was updated')) {
                    console.log(`🎉 Port ${port} - SLAY SUCCESS!`);
                    client.end();
                    resolve({ port, success: true, message: 'Slay worked!' });
                } else {
                    console.log(`🤔 Port ${port} - Response:`, response.body);
                    client.end();
                    resolve({ port, success: false, message: response.body });
                }
            } else {
                console.log(`🤔 Port ${port} - Could not parse response`);
                client.end();
                resolve({ port, success: false, message: 'Unparseable response' });
            }
        });
        
        client.on('timeout', () => {
            console.log(`❌ Port ${port} - Timeout`);
            client.destroy();
            resolve({ port, success: false, message: 'Timeout' });
        });
        
        client.on('error', (err) => {
            console.log(`❌ Port ${port} - Error:`, err.message);
            resolve({ port, success: false, message: err.message });
        });
        
        client.connect(port, ISLE_HOST);
    });
}

async function testAllPorts() {
    console.log('🔍 Testing all open ports for RCON...');
    
    for (const port of PORTS_TO_TEST) {
        const result = await testPort(port);
        
        if (result.success) {
            console.log(`\n🎉 FOUND WORKING PORT: ${result.port}`);
            console.log(`✅ Message: ${result.message}`);
            return result.port;
        }
        
        // Wait a bit between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n❌ No working RCON ports found');
    return null;
}

testAllPorts()
    .then(workingPort => {
        if (workingPort) {
            console.log(`\n🎯 USE PORT ${workingPort} FOR RCON!`);
            process.exit(0);
        } else {
            console.log('\n⚠️  RCON might be disabled');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Test failed:', error);
        process.exit(1);
    });