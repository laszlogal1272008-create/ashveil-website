#!/usr/bin/env node

/**
 * 🔍 Focused Test on Responsive Ports
 */

const net = require('net');

const SERVER_HOST = '45.45.238.134';
const PASSWORD = 'CookieMonster420';
const PORTS = [16007, 16008];

// RCON packet types
const SERVERDATA_AUTH = 3;
const SERVERDATA_AUTH_RESPONSE = 2;

console.log('🎯 Focused test on responsive ports...');

async function testPort(port) {
    return new Promise((resolve) => {
        console.log(`\n🔍 Testing port ${port} with detailed analysis...`);
        
        const socket = new net.Socket();
        let buffer = Buffer.alloc(0);
        let requestId = 1;
        
        const cleanup = () => {
            socket.removeAllListeners();
            socket.destroy();
        };
        
        const timeout = setTimeout(() => {
            console.log(`⏰ Port ${port}: Overall timeout`);
            cleanup();
            resolve({ port, status: 'timeout' });
        }, 8000);
        
        socket.on('connect', () => {
            console.log(`✅ Port ${port}: TCP connected`);
            
            // Send auth packet
            const authPacket = createPacket(requestId++, SERVERDATA_AUTH, PASSWORD);
            console.log(`🔐 Port ${port}: Sending auth packet (${authPacket.length} bytes)`);
            socket.write(authPacket);
        });
        
        socket.on('data', (data) => {
            console.log(`📦 Port ${port}: Received ${data.length} bytes`);
            console.log(`📋 Port ${port}: Raw data: ${data.toString('hex')}`);
            
            buffer = Buffer.concat([buffer, data]);
            
            // Try to parse response
            if (buffer.length >= 4) {
                const size = buffer.readInt32LE(0);
                console.log(`📏 Port ${port}: Packet size: ${size}`);
                
                if (buffer.length >= 4 + size) {
                    const packetData = buffer.slice(4, 4 + size);
                    
                    if (packetData.length >= 8) {
                        const id = packetData.readInt32LE(0);
                        const type = packetData.readInt32LE(4);
                        const body = packetData.slice(8, packetData.length - 2).toString('ascii');
                        
                        console.log(`📨 Port ${port}: ID=${id}, Type=${type}, Body="${body}"`);
                        
                        clearTimeout(timeout);
                        cleanup();
                        resolve({ 
                            port, 
                            status: 'success', 
                            response: { id, type, body },
                            authenticated: type === SERVERDATA_AUTH_RESPONSE && id !== -1
                        });
                        return;
                    }
                }
            }
            
            // If we get any data, it's responsive
            clearTimeout(timeout);
            cleanup();
            resolve({ 
                port, 
                status: 'data_received', 
                rawData: data.toString('hex'),
                dataLength: data.length 
            });
        });
        
        socket.on('error', (err) => {
            console.log(`❌ Port ${port}: ${err.message}`);
            clearTimeout(timeout);
            cleanup();
            resolve({ port, status: 'error', error: err.message });
        });
        
        socket.on('close', () => {
            console.log(`🔌 Port ${port}: Connection closed`);
        });
        
        // Connect
        socket.connect(port, SERVER_HOST);
    });
}

function createPacket(id, type, body) {
    const bodyBuffer = Buffer.from(body + '\x00\x00', 'ascii');
    const size = bodyBuffer.length + 8;
    
    const packet = Buffer.allocUnsafe(4 + size);
    let offset = 0;
    
    packet.writeInt32LE(size, offset);
    offset += 4;
    packet.writeInt32LE(id, offset);
    offset += 4;
    packet.writeInt32LE(type, offset);
    offset += 4;
    bodyBuffer.copy(packet, offset);
    
    return packet;
}

async function runTests() {
    for (const port of PORTS) {
        const result = await testPort(port);
        console.log(`\n📊 Port ${port} Result:`, JSON.stringify(result, null, 2));
        
        // Wait between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🏁 All tests completed');
}

runTests().catch(console.error);