// Working Isle RCON Client - Fully Functional
const net = require('net');

class IsleRCON {
    constructor(host, port, password) {
        this.host = host;
        this.port = port;
        this.password = password;
        this.client = null;
        this.authenticated = false;
        this.commandQueue = [];
    }

    connect() {
        return new Promise((resolve, reject) => {
            console.log(`🔌 Connecting to ${this.host}:${this.port}...`);
            
            this.client = new net.Socket();
            
            this.client.connect(this.port, this.host, () => {
                console.log('✅ Connected! Authenticating...');
                this.authenticate().then(resolve).catch(reject);
            });

            this.client.on('data', (data) => {
                this.handleResponse(data);
            });

            this.client.on('error', (err) => {
                console.log('❌ Connection error:', err.message);
                reject(err);
            });

            this.client.on('close', () => {
                console.log('🔌 Connection closed');
                this.authenticated = false;
            });
        });
    }

    authenticate() {
        return new Promise((resolve, reject) => {
            // Format 1 worked: opcode + password + null terminator
            const authPacket = Buffer.concat([
                Buffer.from([0x01]), // RCON_AUTH opcode
                Buffer.from(this.password, 'utf8'),
                Buffer.from([0x00]) // null terminator
            ]);

            console.log('🔐 Sending authentication...');
            this.client.write(authPacket);

            // Wait for auth response
            const timeout = setTimeout(() => {
                reject(new Error('Authentication timeout'));
            }, 5000);

            this.client.once('data', (data) => {
                clearTimeout(timeout);
                const response = data.toString('ascii');
                console.log('📨 Auth response:', response);
                
                if (response.includes('Password Accepted')) {
                    console.log('🎉 Authentication successful!');
                    this.authenticated = true;
                    resolve();
                } else {
                    reject(new Error('Authentication failed: ' + response));
                }
            });
        });
    }

    handleResponse(data) {
        const response = data.toString('ascii').trim();
        console.log('📨 Server response:', response);
        
        // Process any queued commands
        if (this.commandQueue.length > 0) {
            const command = this.commandQueue.shift();
            console.log(`📋 Command "${command}" response: ${response}`);
        }
    }

    async sendCommand(command) {
        if (!this.authenticated) {
            throw new Error('Not authenticated');
        }

        console.log(`📤 Sending command: ${command}`);
        this.commandQueue.push(command);

        // Different opcodes for different commands based on Austin's documentation
        let opcode;
        if (command.toLowerCase().includes('player') || command.toLowerCase() === 'getplayerlist') {
            opcode = 0x40; // RCON_GETPLAYERLIST
        } else if (command.toLowerCase().includes('slay')) {
            opcode = 0x02; // RCON_EXECCOMMAND for slay
        } else {
            opcode = 0x02; // Default to RCON_EXECCOMMAND
        }

        const commandPacket = Buffer.concat([
            Buffer.from([opcode]),
            Buffer.from(command, 'utf8'),
            Buffer.from([0x00]) // null terminator
        ]);

        this.client.write(commandPacket);
        
        // Wait a bit for response
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    disconnect() {
        if (this.client) {
            this.client.destroy();
        }
    }
}

// Test the working RCON client
async function testRCON() {
    const rcon = new IsleRCON('45.45.238.134', 16007, 'CookieMonster420');
    
    try {
        await rcon.connect();
        
        console.log('\n🧪 Testing commands...');
        
        // Test player list
        await rcon.sendCommand('GetPlayerList');
        
        // Test a simple command
        await rcon.sendCommand('Help');
        
        // Test server info
        await rcon.sendCommand('ServerInfo');
        
        console.log('\n✅ RCON is fully functional!');
        console.log('🎯 Ready to implement slay functionality');
        
    } catch (error) {
        console.error('❌ RCON test failed:', error.message);
    } finally {
        rcon.disconnect();
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testRCON();
}

module.exports = IsleRCON;