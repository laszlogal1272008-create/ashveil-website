const PhysgunConsole = require('./physgun-console');

// Configuration for your Physgun panel
const PHYSGUN_CONFIG = {
    serverUrl: 'https://your-physgun-panel-url.com', // Replace with your actual Physgun panel URL
    username: 'your-username', // Replace with your Physgun username
    password: 'your-password'  // Replace with your Physgun password
};

class PhysgunConsoleManager {
    constructor() {
        this.console = new PhysgunConsole(
            PHYSGUN_CONFIG.serverUrl,
            PHYSGUN_CONFIG.username,
            PHYSGUN_CONFIG.password
        );
        this.isConnected = false;
        this.lastConnectionAttempt = null;
    }

    // Initialize connection
    async initialize() {
        try {
            console.log('🎮 Initializing Physgun Console Manager...');
            const success = await this.console.login();
            this.isConnected = success;
            this.lastConnectionAttempt = new Date();
            
            if (success) {
                console.log('✅ Physgun Console Manager ready');
            } else {
                console.log('❌ Physgun Console Manager failed to initialize');
            }
            
            return success;
        } catch (error) {
            console.error('❌ Physgun Console Manager initialization error:', error.message);
            this.isConnected = false;
            return false;
        }
    }

    // Execute slay command
    async slayPlayer(playerName) {
        try {
            console.log(`💀 Slaying player via Physgun Console: ${playerName}`);
            
            if (!this.isConnected) {
                console.log('🔄 Reconnecting to Physgun Console...');
                await this.initialize();
            }
            
            const result = await this.console.slayPlayer(playerName);
            
            return {
                success: true,
                message: `Successfully slayed ${playerName}'s dinosaur! You can now respawn as a juvenile.`,
                method: 'physgun_console',
                data: result,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error(`❌ Failed to slay ${playerName} via Physgun Console:`, error.message);
            
            return {
                success: false,
                message: `Failed to slay ${playerName}: ${error.message}`,
                method: 'physgun_console',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Get player list
    async getPlayerList() {
        try {
            console.log('👥 Getting player list via Physgun Console...');
            
            if (!this.isConnected) {
                await this.initialize();
            }
            
            const result = await this.console.getPlayerList();
            return result;
            
        } catch (error) {
            console.error('❌ Failed to get player list via Physgun Console:', error.message);
            throw error;
        }
    }

    // Send server message
    async sendServerMessage(message) {
        try {
            console.log(`📢 Sending server message via Physgun Console: ${message}`);
            
            if (!this.isConnected) {
                await this.initialize();
            }
            
            const result = await this.console.sendMessage(message);
            return result;
            
        } catch (error) {
            console.error('❌ Failed to send server message via Physgun Console:', error.message);
            throw error;
        }
    }

    // Execute any command
    async executeCommand(command) {
        try {
            console.log(`📤 Executing command via Physgun Console: ${command}`);
            
            if (!this.isConnected) {
                await this.initialize();
            }
            
            const result = await this.console.executeCommand(command);
            return result;
            
        } catch (error) {
            console.error(`❌ Failed to execute command via Physgun Console:`, error.message);
            throw error;
        }
    }
}

module.exports = PhysgunConsoleManager;