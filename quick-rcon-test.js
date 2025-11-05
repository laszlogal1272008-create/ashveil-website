const net = require('net');

const ISLE_HOST = '45.45.238.134';
const ISLE_PORT = 16007;
const RCON_PASSWORD = 'CookieMonster420';

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

console.log('🔍 Quick RCON test...');

const client = new net.Socket();
let responseBuffer = Buffer.alloc(0);

client.setTimeout(5000);

client.on('connect', () => {
    console.log('✅ Connected! Sending auth...');
    const authPacket = createRCONPacket(RCON_PASSWORD, 0x01);
    client.write(authPacket);
});

client.on('data', (data) => {
    console.log('📨 Got data:', data.length, 'bytes');
    responseBuffer = Buffer.concat([responseBuffer, data]);
    
    const response = parseRCONResponse(responseBuffer);
    if (response) {
        console.log('📨 Server says:', response.body);
        
        if (response.body.includes('Password Accepted')) {
            console.log('✅ Auth success! Trying slay...');
            const slayPacket = createRCONPacket('/slay Misplacedcursor', 0x02);
            client.write(slayPacket);
        } else if (response.body.includes('Playables list was updated')) {
            console.log('🎯 SUCCESS! Player was killed!');
            client.end();
        } else {
            console.log('🤔 Unexpected response');
            client.end();
        }
    }
});

client.on('timeout', () => {
    console.log('❌ Timeout');
    client.destroy();
});

client.on('error', (err) => {
    console.log('❌ Error:', err.message);
});

client.connect(ISLE_PORT, ISLE_HOST);