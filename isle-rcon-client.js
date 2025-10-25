// The Isle Evrima RCON Client - Correct Protocol Implementation
const net = require('net');

class IsleRconClient {
    constructor(host, port, password) {
        this.host = host;
        this.port = port;
        this.password = password;
        this.socket = null;
        this.authenticated = false;
        
        // RCON Protocol Opcodes from official documentation
        this.OPCODES = {
            RCON_AUTH: 0x01,
            RCON_EXECCOMMAND: 0x02,
            RCON_RESPONSE_VALUE: 0x03,
            RCON_ANNOUNCE: 0x10,
            RCON_DIRECTMESSAGE: 0x11,
            RCON_SERVERDETAILS: 0x12,
            RCON_UPDATEPLAYABLES: 0x15,
            RCON_BANPLAYER: 0x20,
            RCON_KICKPLAYER: 0x30,
            RCON_GETPLAYERLIST: 0x40,
            RCON_SAVE: 0x50,
            RCON_GETPLAYERDATA: 0x77,
            RCON_TOGGLEWHITELIST: 0x81,
            RCON_ADDWHITELISTID: 0x82,
            RCON_REMOVEWHITELISTID: 0x83,
            RCON_TOGGLEGLOBALCHAT: 0x84,
            RCON_TOGGLEHUMANS: 0x86,
            RCON_TOGGLEAI: 0x90,
            RCON_DISABLEAICLASSES: 0x91,
            RCON_AIDENSITY: 0x92,
            RCON_WIPECORPSES: 0x13
        };
    }
    
    createPacket(opcode, data = '') {
        // Create Isle RCON packet format
        const dataBuffer = Buffer.from(data, 'utf8');
        const packet = Buffer.allocUnsafe(5 + dataBuffer.length);
        
        // Write packet structure (assuming similar to Source RCON but with Isle opcodes)
        packet.writeUInt32LE(1 + dataBuffer.length, 0); // Size
        packet.writeUInt8(opcode, 4); // Opcode
        dataBuffer.copy(packet, 5); // Data
        
        return packet;
    }
    
    connect() {
        return new Promise((resolve, reject) => {
            console.log(`🔌 Connecting to Isle server ${this.host}:${this.port}...`);
            
            this.socket = new net.Socket();
            this.socket.setTimeout(10000);
            
            this.socket.connect(this.port, this.host, () => {
                console.log('✅ Connected! Sending authentication...');
                this.authenticate().then(resolve).catch(reject);
            });
            
            this.socket.on('error', (err) => {
                console.log('❌ Connection error:', err.message);
                reject(err);
            });
            
            this.socket.on('timeout', () => {
                console.log('⏰ Connection timeout');
                reject(new Error('Connection timeout'));
            });
            
            this.socket.on('data', (data) => {
                this.handleResponse(data);
            });
        });
    }
    
    authenticate() {
        return new Promise((resolve, reject) => {
            console.log('🔐 Authenticating with password...');
            
            // Send RCON_AUTH packet with password
            const authPacket = this.createPacket(this.OPCODES.RCON_AUTH, this.password);
            console.log('📤 Sending auth packet:', authPacket.toString('hex'));
            
            this.socket.write(authPacket);
            
            // Set up response handler
            this.authResolver = resolve;
            this.authRejecter = reject;
            
            // Timeout after 10 seconds
            setTimeout(() => {
                if (!this.authenticated) {
                    reject(new Error('Authentication timeout'));
                }
            }, 10000);
        });
    }
    
    handleResponse(data) {
        console.log('📨 Received response:');
        console.log('📊 Length:', data.length);
        console.log('🔍 Hex:', data.toString('hex'));
        console.log('📝 ASCII:', data.toString('ascii'));
        
        if (data.length >= 5) {
            const size = data.readUInt32LE(0);
            const opcode = data.readUInt8(4);
            const responseData = data.slice(5).toString('utf8');
            
            console.log(`📦 Parsed - Size: ${size}, Opcode: 0x${opcode.toString(16).padStart(2, '0')}, Data: "${responseData}"`);
            
            // Check if authentication response
            if (opcode === this.OPCODES.RCON_RESPONSE_VALUE && !this.authenticated) {
                console.log('🎉 Authentication successful!');
                this.authenticated = true;
                if (this.authResolver) {
                    this.authResolver();
                }
            }
        }
    }
    
    async getPlayerList() {
        if (!this.authenticated) {
            throw new Error('Not authenticated');
        }
        
        console.log('👥 Requesting player list...');
        const packet = this.createPacket(this.OPCODES.RCON_GETPLAYERLIST);
        this.socket.write(packet);
    }
    
    async kickPlayer(playerId) {
        if (!this.authenticated) {
            throw new Error('Not authenticated');
        }
        
        console.log(`👢 Kicking player: ${playerId}`);
        const packet = this.createPacket(this.OPCODES.RCON_KICKPLAYER, playerId);
        this.socket.write(packet);
    }
    
    async announce(message) {
        if (!this.authenticated) {
            throw new Error('Not authenticated');
        }
        
        console.log(`📢 Announcing: ${message}`);
        const packet = this.createPacket(this.OPCODES.RCON_ANNOUNCE, message);
        this.socket.write(packet);
    }
    
    disconnect() {
        if (this.socket) {
            this.socket.end();
        }
    }
}

// Test the implementation
async function testIsleRcon() {
    const client = new IsleRconClient('45.45.238.134', 16007, 'CookieMonster420');
    
    try {
        await client.connect();
        console.log('🎉 RCON connection established!');
        
        // Test getting player list
        setTimeout(() => client.getPlayerList(), 2000);
        
        // Test announcement
        setTimeout(() => client.announce('Hello from Node.js RCON!'), 4000);
        
        // Keep connection alive for testing
        setTimeout(() => {
            console.log('🔌 Disconnecting...');
            client.disconnect();
            process.exit(0);
        }, 10000);
        
    } catch (error) {
        console.error('❌ RCON test failed:', error);
        process.exit(1);
    }
}

// Run the test
testIsleRcon();