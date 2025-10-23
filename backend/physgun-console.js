const axios = require('axios');
const cheerio = require('cheerio');

class PhysgunConsole {
    constructor(serverUrl, username, password) {
        this.serverUrl = serverUrl;
        this.username = username;
        this.password = password;
        this.sessionCookie = null;
        this.csrfToken = null;
    }

    // Login to Physgun panel
    async login() {
        try {
            console.log('🔐 Logging into Physgun panel...');
            
            // Get login page and CSRF token
            const loginPage = await axios.get(`${this.serverUrl}/login`);
            const $ = cheerio.load(loginPage.data);
            this.csrfToken = $('input[name="_token"]').val();
            
            // Login with credentials
            const loginData = {
                username: this.username,
                password: this.password,
                _token: this.csrfToken
            };
            
            const loginResponse = await axios.post(`${this.serverUrl}/login`, loginData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                maxRedirects: 0,
                validateStatus: status => status < 400
            });
            
            // Extract session cookie
            const cookies = loginResponse.headers['set-cookie'];
            if (cookies) {
                this.sessionCookie = cookies.find(cookie => cookie.includes('session'));
                console.log('✅ Logged into Physgun panel');
                return true;
            }
            
            throw new Error('No session cookie received');
            
        } catch (error) {
            console.error('❌ Physgun login failed:', error.message);
            return false;
        }
    }

    // Execute command via Physgun console
    async executeCommand(command) {
        try {
            if (!this.sessionCookie) {
                const loginSuccess = await this.login();
                if (!loginSuccess) {
                    throw new Error('Failed to login to Physgun');
                }
            }
            
            console.log(`📤 Executing command: ${command}`);
            
            // Send command to console endpoint
            const commandData = {
                command: command,
                _token: this.csrfToken
            };
            
            const response = await axios.post(`${this.serverUrl}/console/execute`, commandData, {
                headers: {
                    'Cookie': this.sessionCookie,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            console.log('✅ Command executed via Physgun console');
            return response.data;
            
        } catch (error) {
            console.error('❌ Command execution failed:', error.message);
            throw error;
        }
    }

    // Slay a player
    async slayPlayer(playerName) {
        try {
            const command = `KillCharacter ${playerName}`;
            const result = await this.executeCommand(command);
            console.log(`💀 Slayed player: ${playerName}`);
            return result;
        } catch (error) {
            console.error(`❌ Failed to slay ${playerName}:`, error.message);
            throw error;
        }
    }

    // Get player list
    async getPlayerList() {
        try {
            const result = await this.executeCommand('list');
            console.log('👥 Retrieved player list');
            return result;
        } catch (error) {
            console.error('❌ Failed to get player list:', error.message);
            throw error;
        }
    }

    // Send server message
    async sendMessage(message) {
        try {
            const command = `say ${message}`;
            const result = await this.executeCommand(command);
            console.log(`📢 Sent message: ${message}`);
            return result;
        } catch (error) {
            console.error('❌ Failed to send message:', error.message);
            throw error;
        }
    }
}

module.exports = PhysgunConsole;