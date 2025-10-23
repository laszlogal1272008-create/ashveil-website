const net = require('net');
const EventEmitter = require('events');

class IsleRCON extends EventEmitter {
    constructor(host, port, password) {
        super();
        this.host = host;
        this.port = port;
        this.password = password;
        this.socket = null;
        this.authenticated = false;
        this.connected = false;
    }

    connect() {
        return new Promise((resolve, reject) => {
            console.log(`🔌 Connecting to Isle server: ${this.host}:${this.port}`);
            
            this.socket = new net.Socket();
            this.socket.setTimeout(10000);
            
            this.socket.on('connect', () => {
                console.log('✅ TCP connection established');
                this.connected = true;
                
                // The Isle typically expects immediate password authentication
                this.authenticate().then(resolve).catch(reject);
            });
            
            this.socket.on('data', (data) => {
                this.handleData(data);
            });
            
            this.socket.on('error', (err) => {
                console.error('❌ Socket error:', err.message);
                reject(err);
            });
            
            this.socket.on('close', () => {
                console.log('🔌 Connection closed');
                this.connected = false;
                this.authenticated = false;
            });
            
            this.socket.on('timeout', () => {
                console.log('⏰ Connection timeout');
                this.socket.destroy();
                reject(new Error('Connection timeout'));
            });
            
            this.socket.connect(this.port, this.host);
        });
    }

    authenticate() {
        return new Promise((resolve, reject) => {
            console.log('🔐 Attempting authentication...');
            
            // Try different Isle authentication methods
            const authMethods = [
                // Method 1: Simple password + newline
                `${this.password}\n`,
                // Method 2: Password + carriage return + newline  
                `${this.password}\r\n`,
                // Method 3: LOGIN command format
                `LOGIN ${this.password}\n`,
                // Method 4: AUTH command format
                `AUTH ${this.password}\n`,
                // Method 5: RCON_PASSWORD format
                `RCON_PASSWORD ${this.password}\n`
            ];
            
            let methodIndex = 0;
            
            const tryNextMethod = () => {
                if (methodIndex >= authMethods.length) {
                    reject(new Error('All authentication methods failed'));
                    return;
                }
                
                const method = authMethods[methodIndex];
                console.log(`📤 Trying auth method ${methodIndex + 1}: ${method.trim()}`);
                
                this.socket.write(method);
                methodIndex++;
                
                // Wait for response before trying next method
                setTimeout(() => {
                    if (!this.authenticated) {
                        tryNextMethod();
                    }
                }, 2000);
            };
            
            // Set up response handler
            const authTimeout = setTimeout(() => {
                if (!this.authenticated) {
                    reject(new Error('Authentication timeout'));
                }
            }, 15000);
            
            this.once('authenticated', () => {
                clearTimeout(authTimeout);
                resolve();
            });
            
            this.once('authFailed', () => {
                clearTimeout(authTimeout);
                reject(new Error('Authentication failed'));
            });
            
            // Start trying authentication methods
            tryNextMethod();
        });
    }

    handleData(data) {
        const response = data.toString();
        console.log(`📨 Server response: "${response.trim()}"`);
        
        // Check for authentication success indicators
        if (response.includes('Logged in') || 
            response.includes('Authentication successful') ||
            response.includes('Welcome') ||
            response.includes('Admin logged in') ||
            response.toLowerCase().includes('authenticated')) {
            
            console.log('✅ Authentication successful!');
            this.authenticated = true;
            this.emit('authenticated');
            return;
        }
        
        // Check for authentication failure indicators
        if (response.includes('Invalid password') ||
            response.includes('Authentication failed') ||
            response.includes('Access denied') ||
            response.includes('Wrong password')) {
            
            console.log('❌ Authentication failed');
            this.emit('authFailed');
            return;
        }
        
        // Emit data for command responses
        this.emit('response', response);
    }

    executeCommand(command) {
        return new Promise((resolve, reject) => {
            if (!this.connected || !this.authenticated) {
                reject(new Error('Not connected or authenticated'));
                return;
            }
            
            console.log(`📤 Executing command: ${command}`);
            
            // Set up response handler
            const responseTimeout = setTimeout(() => {
                reject(new Error('Command timeout'));
            }, 10000);
            
            const responseHandler = (response) => {
                clearTimeout(responseTimeout);
                this.removeListener('response', responseHandler);
                resolve(response);
            };
            
            this.once('response', responseHandler);
            
            // Send command with newline
            this.socket.write(`${command}\n`);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.destroy();
        }
        this.connected = false;
        this.authenticated = false;
    }
}

module.exports = IsleRCON;