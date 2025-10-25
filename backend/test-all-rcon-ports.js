#!/usr/bin/env node

/**
 * 🎯 Test RCON Connection on Multiple Ports
 * Based on Isle Evrima documentation and Austin's success
 */

const net = require('net');

const SERVER_HOST = '45.45.238.134';
const PASSWORD = 'CookieMonster420';

// Common RCON ports for The Isle Evrima
const PORTS_TO_TEST = [
    16007,  // Austin confirmed this worked
    8888,   // Default RCON port per documentation
    27015,  // Standard Source RCON
    27016,  // Alternative Source RCON
    16008,  // One port higher than game
    16006,  // One port lower than game  
    25575,  // Minecraft RCON (sometimes used)
    27500,  // Query port +1
];

// RCON packet types
const SERVERDATA_AUTH = 3;
const SERVERDATA_AUTH_RESPONSE = 2;
const SERVERDATA_EXECCOMMAND = 2;
const SERVERDATA_RESPONSE_VALUE = 0;

console.log('🎯 Testing RCON on multiple ports...');
console.log(`📡 Target: ${SERVER_HOST}`);
console.log(`🔐 Password: ${PASSWORD}`);
console.log(`🚪 Testing ports: ${PORTS_TO_TEST.join(', ')}`);

class PortTester {
    constructor(host, port, password) {
        this.host = host;
        this.port = port;
        this.password = password;
        this.socket = null;
        this.requestId = 1;
        this.buffer = Buffer.alloc(0);
    }

    async testPort() {
        return new Promise((resolve) => {
            console.log(`\n🔍 Testing port ${this.port}...`);
            
            const timeout = setTimeout(() => {
                console.log(`⏰ Port ${this.port}: Connection timeout`);
                this.cleanup();
                resolve({ port: this.port, success: false, error: 'timeout' });
            }, 3000);

            this.socket = new net.Socket();
            
            this.socket.on('connect', () => {
                console.log(`✅ Port ${this.port}: TCP connection established`);
                clearTimeout(timeout);
                
                // Send auth packet
                const authPacket = this.createPacket(this.requestId++, SERVERDATA_AUTH, this.password);
                this.socket.write(authPacket);
                
                // Set auth timeout
                const authTimeout = setTimeout(() => {
                    console.log(`❌ Port ${this.port}: RCON auth timeout`);
                    this.cleanup();
                    resolve({ port: this.port, success: false, error: 'auth_timeout' });
                }, 5000);

                this.socket.authTimeout = authTimeout;
            });

            this.socket.on('data', (data) => {
                clearTimeout(this.socket.authTimeout);
                console.log(`📦 Port ${this.port}: Received ${data.length} bytes`);
                
                this.buffer = Buffer.concat([this.buffer, data]);
                const result = this.parseResponse();
                
                if (result) {
                    this.cleanup();
                    resolve({ port: this.port, success: true, response: result });
                }
            });

            this.socket.on('error', (err) => {
                clearTimeout(timeout);
                console.log(`❌ Port ${this.port}: ${err.message}`);
                this.cleanup();
                resolve({ port: this.port, success: false, error: err.message });
            });

            this.socket.on('close', () => {
                clearTimeout(timeout);
                if (this.socket.authTimeout) {
                    clearTimeout(this.socket.authTimeout);
                }
            });

            // Start connection
            this.socket.connect(this.port, this.host);
        });
    }

    parseResponse() {
        if (this.buffer.length < 4) return null;

        const size = this.buffer.readInt32LE(0);
        if (this.buffer.length < 4 + size) return null;

        const packetData = this.buffer.slice(4, 4 + size);
        
        if (packetData.length < 8) return null;

        const id = packetData.readInt32LE(0);
        const type = packetData.readInt32LE(4);
        const body = packetData.slice(8, packetData.length - 2).toString('ascii');

        console.log(`📋 Port ${this.port}: ID=${id}, Type=${type}, Body="${body}"`);

        if (type === SERVERDATA_AUTH_RESPONSE) {
            if (id === -1) {
                return { authenticated: false, message: 'Authentication failed' };
            } else {
                return { authenticated: true, message: 'Authentication successful' };
            }
        }

        return { type, body };
    }

    createPacket(id, type, body) {
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

    cleanup() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.destroy();
        }
    }
}

async function testAllPorts() {
    console.log('🚀 Starting comprehensive port scan...\n');
    
    const results = [];
    
    for (const port of PORTS_TO_TEST) {
        const tester = new PortTester(SERVER_HOST, port, PASSWORD);
        const result = await tester.testPort();
        results.push(result);
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 FINAL RESULTS:');
    console.log('==================');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    if (successful.length > 0) {
        console.log('✅ SUCCESSFUL CONNECTIONS:');
        successful.forEach(result => {
            console.log(`   Port ${result.port}: ${result.response?.authenticated ? 'AUTHENTICATED' : 'CONNECTED'}`);
            if (result.response?.message) {
                console.log(`      → ${result.response.message}`);
            }
        });
    }
    
    if (failed.length > 0) {
        console.log('\n❌ FAILED CONNECTIONS:');
        failed.forEach(result => {
            console.log(`   Port ${result.port}: ${result.error}`);
        });
    }
    
    if (successful.length === 0) {
        console.log('\n💡 TROUBLESHOOTING SUGGESTIONS:');
        console.log('• Check if RCON is properly enabled in Game.ini');
        console.log('• Verify firewall settings on the server');
        console.log('• Confirm the server is actually running');
        console.log('• Try different RCON password formats');
    }
}

testAllPorts().catch(console.error);