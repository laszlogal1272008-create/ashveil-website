const net = require('net');

class SimpleRCON {
    constructor(host, port, password) {
        this.host = host;
        this.port = port;
        this.password = password;
        this.socket = null;
        this.authenticated = false;
        this.requestId = 1;
        this.responses = new Map();
    }

    connect() {
        return new Promise((resolve, reject) => {
            console.log(`🔌 Connecting to ${this.host}:${this.port}...`);
            
            this.socket = new net.Socket();
            this.socket.setTimeout(20000);

            this.socket.on('connect', () => {
                console.log('✅ TCP connected, authenticating...');
                this.authenticate().then(resolve).catch(reject);
            });

            this.socket.on('data', (data) => {
                this.handleData(data);
            });

            this.socket.on('error', (err) => {
                console.error('❌ Socket error:', err.message);
                reject(err);
            });

            this.socket.on('timeout', () => {
                console.error('⏰ Connection timeout');
                reject(new Error('Connection timeout'));
            });

            this.socket.connect(this.port, this.host);
        });
    }

    authenticate() {
        return new Promise((resolve, reject) => {
            const authPacket = this.createPacket(this.requestId++, 3, this.password);
            
            const timeout = setTimeout(() => {
                reject(new Error('Authentication timeout'));
            }, 15000);

            const onAuth = (success) => {
                clearTimeout(timeout);
                if (success) {
                    this.authenticated = true;
                    console.log('✅ RCON authenticated successfully');
                    resolve();
                } else {
                    reject(new Error('Authentication failed - check password'));
                }
            };

            this.once('auth', onAuth);
            this.socket.write(authPacket);
        });
    }

    executeCommand(command) {
        return new Promise((resolve, reject) => {
            if (!this.authenticated) {
                reject(new Error('Not authenticated'));
                return;
            }

            console.log(`📤 Executing: ${command}`);
            const id = this.requestId++;
            const packet = this.createPacket(id, 2, command);

            const timeout = setTimeout(() => {
                this.responses.delete(id);
                reject(new Error('Command timeout'));
            }, 8000);

            this.responses.set(id, { resolve, reject, timeout });
            this.socket.write(packet);
        });
    }

    createPacket(id, type, body) {
        const bodyBuffer = Buffer.from(body + '\x00\x00', 'ascii');
        const size = bodyBuffer.length + 8;
        
        const packet = Buffer.allocUnsafe(4 + size);
        packet.writeInt32LE(size, 0);
        packet.writeInt32LE(id, 4);
        packet.writeInt32LE(type, 8);
        bodyBuffer.copy(packet, 12);
        
        return packet;
    }

    handleData(data) {
        try {
            if (data.length < 12) return;

            const size = data.readInt32LE(0);
            const id = data.readInt32LE(4);
            const type = data.readInt32LE(8);
            
            let response = '';
            if (data.length > 12) {
                const bodyEnd = Math.min(12 + size - 8, data.length);
                response = data.slice(12, bodyEnd).toString('ascii').replace(/\x00+$/, '');
            }

            console.log(`📨 Response: ID=${id}, Type=${type}, Data="${response}"`);

            if (type === 2 && id === -1) {
                // Auth failed
                this.emit('auth', false);
            } else if (type === 2 && !this.authenticated) {
                // Auth success
                this.emit('auth', true);
            } else if (type === 0) {
                // Command response
                const request = this.responses.get(id);
                if (request) {
                    clearTimeout(request.timeout);
                    this.responses.delete(id);
                    request.resolve(response);
                }
            }
        } catch (error) {
            console.error('❌ Error parsing response:', error);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.destroy();
            this.socket = null;
        }
        this.authenticated = false;
    }
}

// Make it an EventEmitter
const EventEmitter = require('events');
Object.setPrototypeOf(SimpleRCON.prototype, EventEmitter.prototype);

module.exports = SimpleRCON;