const Rcon = require('rcon');
const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');

class IsleServerManager {
  constructor(config) {
    this.config = config;
    this.rconClient = null;
    this.isConnected = false;
    this.scheduledTasks = new Map();
    this.serverStatus = {
      online: false,
      playerCount: 0,
      maxPlayers: 100,
      uptime: 0,
      lastRestart: null,
      performance: 'unknown'
    };
    
    // Initialize RCON connection
    this.initializeRCON();
    
    // Start monitoring
    this.startMonitoring();
  }

  async initializeRCON() {
    try {
      console.log(`🔌 Connecting to Isle server RCON: ${this.config.ip}:${this.config.rconPort}`);
      
      this.rconClient = new Rcon(this.config.ip, this.config.rconPort, this.config.rconPassword);
      
      this.rconClient.on('auth', () => {
        console.log('✅ RCON authenticated successfully');
        this.isConnected = true;
        this.serverStatus.online = true;
      });

      this.rconClient.on('response', (response) => {
        console.log('📨 RCON Response:', response);
        this.logServerAction('RCON_RESPONSE', response);
      });

      this.rconClient.on('error', (error) => {
        console.error('❌ RCON Error:', error);
        this.isConnected = false;
        this.serverStatus.online = false;
        this.logServerAction('RCON_ERROR', error.message);
        
        // Attempt reconnection after 30 seconds
        setTimeout(() => this.reconnectRCON(), 30000);
      });

      this.rconClient.on('end', () => {
        console.log('🔌 RCON connection ended');
        this.isConnected = false;
        this.serverStatus.online = false;
      });

      // Connect to RCON
      await this.rconClient.connect();
      
    } catch (error) {
      console.error('❌ Failed to initialize RCON:', error);
      this.isConnected = false;
      this.serverStatus.online = false;
    }
  }

  async reconnectRCON() {
    console.log('🔄 Attempting RCON reconnection...');
    try {
      await this.rconClient.connect();
    } catch (error) {
      console.error('❌ RCON reconnection failed:', error);
      // Try again in 60 seconds
      setTimeout(() => this.reconnectRCON(), 60000);
    }
  }

  async executeCommand(command) {
    if (!this.isConnected) {
      throw new Error('RCON not connected to server');
    }

    try {
      console.log(`⚡ Executing RCON command: ${command}`);
      const response = await this.rconClient.send(command);
      
      // Log the command execution
      this.logServerAction('RCON_COMMAND', command, response);
      
      return {
        success: true,
        command: command,
        response: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ RCON command failed: ${command}`, error);
      this.logServerAction('RCON_COMMAND_FAILED', command, error.message);
      
      return {
        success: false,
        command: command,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Server Management Functions
  async restartServer(reason = 'Manual restart') {
    try {
      console.log(`🔄 Restarting Isle server: ${reason}`);
      
      // Warn players about restart
      await this.executeCommand('broadcast Server restart in 60 seconds! Please find a safe location.');
      await this.sleep(30000); // Wait 30 seconds
      
      await this.executeCommand('broadcast Server restart in 30 seconds!');
      await this.sleep(20000); // Wait 20 seconds
      
      await this.executeCommand('broadcast Server restart in 10 seconds!');
      await this.sleep(10000); // Wait 10 seconds
      
      // Save the world
      await this.executeCommand('save');
      await this.sleep(2000);
      
      // Restart the server
      await this.executeCommand('restart');
      
      this.serverStatus.lastRestart = new Date().toISOString();
      this.logServerAction('SERVER_RESTART', reason);
      
      return { success: true, message: 'Server restart initiated' };
    } catch (error) {
      console.error('❌ Server restart failed:', error);
      this.logServerAction('SERVER_RESTART_FAILED', reason, error.message);
      return { success: false, error: error.message };
    }
  }

  async shutdownServer(reason = 'Manual shutdown') {
    try {
      console.log(`🛑 Shutting down Isle server: ${reason}`);
      
      // Warn players
      await this.executeCommand('broadcast Server shutdown in 60 seconds!');
      await this.sleep(30000);
      
      await this.executeCommand('broadcast Server shutdown in 30 seconds! Please logout safely.');
      await this.sleep(20000);
      
      await this.executeCommand('broadcast Server shutdown in 10 seconds!');
      await this.sleep(10000);
      
      // Save and shutdown
      await this.executeCommand('save');
      await this.sleep(2000);
      await this.executeCommand('shutdown');
      
      this.logServerAction('SERVER_SHUTDOWN', reason);
      return { success: true, message: 'Server shutdown initiated' };
    } catch (error) {
      console.error('❌ Server shutdown failed:', error);
      return { success: false, error: error.message };
    }
  }

  async kickAllPlayers(reason = 'Server maintenance') {
    try {
      console.log(`👥 Kicking all players: ${reason}`);
      
      // Get player list first
      const playersResult = await this.executeCommand('listplayers');
      
      // Broadcast reason
      await this.executeCommand(`broadcast All players being disconnected: ${reason}`);
      await this.sleep(5000);
      
      // Kick all players
      await this.executeCommand('kickall');
      
      this.logServerAction('KICK_ALL_PLAYERS', reason);
      return { success: true, message: 'All players kicked' };
    } catch (error) {
      console.error('❌ Kick all players failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Player Management Functions
  async getPlayerList() {
    try {
      const result = await this.executeCommand('listplayers');
      
      // Parse player list from RCON response
      // The exact format depends on The Isle's RCON implementation
      const players = this.parsePlayerList(result.response);
      
      this.serverStatus.playerCount = players.length;
      return players;
    } catch (error) {
      console.error('❌ Failed to get player list:', error);
      return [];
    }
  }

  parsePlayerList(response) {
    // Parse The Isle's player list format
    // This will need to be adjusted based on actual RCON response format
    const players = [];
    
    if (response && typeof response === 'string') {
      const lines = response.split('\n');
      for (const line of lines) {
        // Example parsing - adjust based on actual format
        if (line.includes('Player:')) {
          const match = line.match(/Player:\s*(.+?)\s*ID:\s*(\d+)/);
          if (match) {
            players.push({
              name: match[1].trim(),
              id: match[2],
              connected: true
            });
          }
        }
      }
    }
    
    return players;
  }

  async kickPlayer(playerName, reason = 'Kicked by admin') {
    try {
      const result = await this.executeCommand(`kick "${playerName}" "${reason}"`);
      this.logServerAction('KICK_PLAYER', `${playerName}: ${reason}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to kick player ${playerName}:`, error);
      return { success: false, error: error.message };
    }
  }

  async teleportPlayer(playerName, location) {
    try {
      const result = await this.executeCommand(`teleport "${playerName}" ${location}`);
      this.logServerAction('TELEPORT_PLAYER', `${playerName} to ${location}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to teleport player ${playerName}:`, error);
      return { success: false, error: error.message };
    }
  }

  async messagePlayer(playerName, message) {
    try {
      const result = await this.executeCommand(`message "${playerName}" "${message}"`);
      this.logServerAction('MESSAGE_PLAYER', `${playerName}: ${message}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to message player ${playerName}:`, error);
      return { success: false, error: error.message };
    }
  }

  async broadcastMessage(message) {
    try {
      // Try both announce and broadcast commands for The Isle compatibility
      const result = await this.executeCommand(`announce ${message}`);
      this.logServerAction('BROADCAST', message);
      return result;
    } catch (error) {
      console.error('❌ Failed to broadcast message:', error);
      return { success: false, error: error.message };
    }
  }

  async slayDinosaur(playerName, options = {}) {
    try {
      const reason = options.reason || 'Admin action';
      const result = await this.executeCommand(`slay ${playerName}`);
      this.logServerAction('SLAY_DINOSAUR', `${playerName} - ${reason}`);
      
      return {
        success: true,
        message: `Successfully slayed ${playerName}'s dinosaur`,
        slayId: Date.now().toString(),
        response: result.response
      };
    } catch (error) {
      console.error(`❌ Failed to slay ${playerName}:`, error);
      return { 
        success: false, 
        message: `Failed to slay ${playerName}`,
        error: error.message 
      };
    }
  }

  // Scheduled Management
  scheduleRestart(cronExpression, reason = 'Scheduled restart') {
    console.log(`📅 Scheduling server restart: ${cronExpression}`);
    
    const task = cron.schedule(cronExpression, async () => {
      console.log('⏰ Executing scheduled server restart');
      await this.restartServer(reason);
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });
    
    this.scheduledTasks.set('restart', task);
    this.logServerAction('SCHEDULE_RESTART', `${cronExpression}: ${reason}`);
    
    return { success: true, message: 'Restart scheduled successfully' };
  }

  cancelScheduledRestart() {
    const task = this.scheduledTasks.get('restart');
    if (task) {
      task.destroy();
      this.scheduledTasks.delete('restart');
      this.logServerAction('CANCEL_SCHEDULE_RESTART', 'Scheduled restart cancelled');
      return { success: true, message: 'Scheduled restart cancelled' };
    }
    return { success: false, message: 'No scheduled restart found' };
  }

  // Server Monitoring
  startMonitoring() {
    console.log('📊 Starting server monitoring...');
    
    // Monitor every 30 seconds
    setInterval(async () => {
      await this.updateServerStatus();
    }, 30000);
    
    // Detailed monitoring every 5 minutes
    setInterval(async () => {
      await this.performDetailedMonitoring();
    }, 300000);
  }

  async updateServerStatus() {
    try {
      if (this.isConnected) {
        // Get basic server info
        const players = await this.getPlayerList();
        this.serverStatus.playerCount = players.length;
        this.serverStatus.online = true;
        
        // Check server performance (if RCON supports it)
        const statusResult = await this.executeCommand('status');
        if (statusResult.success) {
          this.parseServerStatus(statusResult.response);
        }
      }
    } catch (error) {
      console.error('❌ Server monitoring error:', error);
      this.serverStatus.online = false;
    }
  }

  async performDetailedMonitoring() {
    try {
      if (this.isConnected) {
        // Perform comprehensive server check
        await this.executeCommand('save'); // Auto-save
        
        // Log server statistics
        this.logServerAction('SERVER_MONITOR', JSON.stringify(this.serverStatus));
        
        // Check if server needs maintenance
        if (this.serverStatus.uptime > 24 * 60 * 60 * 1000) { // 24 hours
          console.log('⚠️ Server has been running for over 24 hours - consider restart');
        }
      }
    } catch (error) {
      console.error('❌ Detailed monitoring error:', error);
    }
  }

  parseServerStatus(statusResponse) {
    // Parse server status from RCON response
    // This depends on The Isle's status command format
    if (statusResponse && typeof statusResponse === 'string') {
      // Example parsing - adjust based on actual format
      if (statusResponse.includes('TPS:')) {
        const tpsMatch = statusResponse.match(/TPS:\s*([\d.]+)/);
        if (tpsMatch) {
          const tps = parseFloat(tpsMatch[1]);
          this.serverStatus.performance = tps > 19 ? 'excellent' : 
                                         tps > 15 ? 'good' : 
                                         tps > 10 ? 'poor' : 'critical';
        }
      }
    }
  }

  // Logging System
  async logServerAction(action, details, response = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: action,
      details: details,
      response: response,
      server_ip: this.config.ip,
      server_port: this.config.rconPort
    };
    
    try {
      // Log to database if available
      if (this.config.supabase) {
        await this.config.supabase
          .from('server_logs')
          .insert([logEntry]);
      }
      
      // Also log to console
      console.log(`📝 Server Log: ${action} - ${details}`);
    } catch (error) {
      console.error('❌ Failed to log server action:', error);
    }
  }

  // Utility Functions
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getServerStatus() {
    return {
      ...this.serverStatus,
      isConnected: this.isConnected,
      scheduledTasks: Array.from(this.scheduledTasks.keys())
    };
  }

  // Maintenance Mode
  async enableMaintenanceMode() {
    try {
      console.log('🔧 Enabling maintenance mode');
      
      // Kick all players
      await this.kickAllPlayers('Server entering maintenance mode');
      
      // Set server to maintenance
      await this.executeCommand('maintenance on');
      
      this.logServerAction('MAINTENANCE_MODE_ON', 'Maintenance mode enabled');
      return { success: true, message: 'Maintenance mode enabled' };
    } catch (error) {
      console.error('❌ Failed to enable maintenance mode:', error);
      return { success: false, error: error.message };
    }
  }

  async disableMaintenanceMode() {
    try {
      console.log('✅ Disabling maintenance mode');
      
      await this.executeCommand('maintenance off');
      await this.broadcastMessage('Server maintenance complete - welcome back!');
      
      this.logServerAction('MAINTENANCE_MODE_OFF', 'Maintenance mode disabled');
      return { success: true, message: 'Maintenance mode disabled' };
    } catch (error) {
      console.error('❌ Failed to disable maintenance mode:', error);
      return { success: false, error: error.message };
    }
  }

  // Server Configuration
  async updateServerConfig(settings) {
    try {
      console.log('⚙️ Updating server configuration');
      
      const results = [];
      
      for (const [key, value] of Object.entries(settings)) {
        try {
          const result = await this.executeCommand(`config ${key} ${value}`);
          results.push({ setting: key, value, success: result.success });
        } catch (error) {
          results.push({ setting: key, value, success: false, error: error.message });
        }
      }
      
      this.logServerAction('UPDATE_CONFIG', JSON.stringify(settings));
      return { success: true, results };
    } catch (error) {
      console.error('❌ Failed to update server config:', error);
      return { success: false, error: error.message };
    }
  }

  // Emergency Functions
  async emergencyShutdown() {
    console.log('🚨 EMERGENCY SHUTDOWN INITIATED');
    
    try {
      // Immediate shutdown without warnings
      await this.executeCommand('save');
      await this.executeCommand('shutdown');
      
      this.logServerAction('EMERGENCY_SHUTDOWN', 'Emergency shutdown executed');
      return { success: true, message: 'Emergency shutdown completed' };
    } catch (error) {
      console.error('❌ Emergency shutdown failed:', error);
      return { success: false, error: error.message };
    }
  }

  async emergencyRestart() {
    console.log('🚨 EMERGENCY RESTART INITIATED');
    
    try {
      // Quick restart with minimal warning
      await this.executeCommand('broadcast EMERGENCY RESTART IN 10 SECONDS!');
      await this.sleep(10000);
      await this.executeCommand('save');
      await this.executeCommand('restart');
      
      this.logServerAction('EMERGENCY_RESTART', 'Emergency restart executed');
      return { success: true, message: 'Emergency restart completed' };
    } catch (error) {
      console.error('❌ Emergency restart failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = IsleServerManager;