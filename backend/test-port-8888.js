#!/usr/bin/env node

/**
 * 🎯 Test Port 8888 (Standard Isle RCON Port)
 */

const net = require('net');

const SERVER_HOST = '45.45.238.134';
const RCON_PORT = 8888; // Standard Isle RCON port from documentation
const PASSWORD = 'CookieMonster420';

console.log('🎯 Testing standard Isle RCON port 8888...');
console.log(`📡 Target: ${SERVER_HOST}:${RCON_PORT}`);

async function testPort8888() {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(5000);
        
        let responseReceived = false;
        
        socket.on('connect', () => {
            console.log('✅ TCP connection established on port 8888');
            
            // Send auth packet
            const authPacket = createAuthPacket();
            socket.write(authPacket);
            console.log('🔐 Authentication packet sent');
        });
        
        socket.on('data', (data) => {
            responseReceived = true;
            console.log(`📦 Received response: ${data.length} bytes`);
            console.log(`📋 Hex: ${data.toString('hex')}`);
            
            try {
                if (data.length >= 12) {
                    const size = data.readInt32LE(0);
                    const id = data.readInt32LE(4);
                    const type = data.readInt32LE(8);
                    
                    console.log(`🎉 RCON Response - Size: ${size}, ID: ${id}, Type: ${type}`);
                    
                    if (type === 2) { // SERVERDATA_AUTH_RESPONSE
                        if (id === -1) {
                            console.log('❌ Authentication failed');
                        } else {
                            console.log('🎉 Authentication successful!');
                        }
                    }
                }
            } catch (err) {
                console.log('⚠️  Could not parse response:', err.message);
            }
            
            socket.destroy();
            resolve(responseReceived);
        });
        
        socket.on('timeout', () => {
            console.log('⏰ Connection timeout on port 8888');
            socket.destroy();
            resolve(false);
        });
        
        socket.on('error', (err) => {
            console.log(`❌ Connection error: ${err.message}`);
            resolve(false);
        });
        
        socket.connect(RCON_PORT, SERVER_HOST);
    });
}

function createAuthPacket() {
    const bodyBuffer = Buffer.from(PASSWORD + '\x00\x00', 'ascii');
    const size = bodyBuffer.length + 8;
    
    const packet = Buffer.allocUnsafe(4 + size);
    let offset = 0;
    
    packet.writeInt32LE(size, offset);
    offset += 4;
    packet.writeInt32LE(1, offset); // Auth ID
    offset += 4;
    packet.writeInt32LE(3, offset); // SERVERDATA_AUTH
    offset += 4;
    bodyBuffer.copy(packet, offset);
    
    return packet;
}

testPort8888().then((success) => {
    if (success) {
        console.log('\n🎉 SUCCESS! RCON is working on port 8888');
    } else {
        console.log('\n❌ Port 8888 also not responding to RCON');
        console.log('\n💡 This suggests The Isle Evrima might not support RCON');
        console.log('   or requires different configuration steps.');
    }
});