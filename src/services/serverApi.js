// Server API Service for Ashveil Isle Server
// Connects to backend API for server information

class ServerAPI {
  constructor() {
    // Remove hardcoded sensitive values - these are handled by the backend
    this.serverName = 'Ashveil - 3X growth - low rules - website';
    this.maxPlayers = 300;
    // Use environment-specific backend URL
    this.backendURL = process.env.NODE_ENV === 'production' 
      ? 'https://ashveil.live/api' 
      : 'http://localhost:5000';
    this.discordInvite = 'https://discord.gg/pvZbAT';
    
    // WebSocket connection for real-time updates
    this.ws = null;
    this.initWebSocket();
  }
  
  initWebSocket() {
    try {
      const wsURL = process.env.NODE_ENV === 'production' 
        ? 'wss://ashveil.live/ws' 
        : 'ws://localhost:5001';
      this.ws = new WebSocket(wsURL);
      
      this.ws.onopen = () => {
        console.log('✅ Connected to Ashveil server WebSocket');
      };
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'server_status') {
          // Handle real-time server updates
          console.log('📡 Real-time server update:', data.data);
        }
      };
      
      this.ws.onclose = () => {
        console.log('🔌 WebSocket connection closed, reconnecting...');
        setTimeout(() => this.initWebSocket(), 5000);
      };
      
      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  // Check if server is online and responsive
  async checkServerStatus() {
    try {
      const response = await fetch(`${this.backendURL}/api/server/status`);
      const data = await response.json();
      
      if (data.success) {
        return {
          online: data.data.online,
          ip: data.data.ip,
          port: data.data.port,
          lastChecked: data.data.lastChecked,
          error: data.data.error
        };
      } else {
        throw new Error('Backend API error');
      }
    } catch (error) {
      console.error('Failed to check server status:', error);
      return {
        online: false,
        ip: 'Server IP Hidden',
        port: 'Port Hidden',
        lastChecked: new Date().toISOString(),
        error: 'Backend connection failed'
      };
    }
  }

  // Get detailed server information from backend
  async getServerInfo() {
    try {
      const response = await fetch(`${this.backendURL}/api/server/info`);
      const data = await response.json();
      
      if (data.success) {
        return {
          ...data.data,
          lastUpdate: new Date().toISOString()
        };
      } else {
        throw new Error('Failed to get server info');
      }
    } catch (error) {
      console.error('Failed to get server info:', error);
      throw new Error(`Failed to get server info: ${error.message}`);
    }
  }

  // Get player list from backend
  async getPlayerList() {
    try {
      const response = await fetch(`${this.backendURL}/api/server/players`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error('Failed to get player list');
      }
    } catch (error) {
      console.error('Failed to get player list:', error);
      return [];
    }
  }

  // Send RCON command via backend
  async sendRCONCommand(command) {
    try {
      const response = await fetch(`${this.backendURL}/api/rcon/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: command
          // Password handled securely by backend
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data;
      } else {
        throw new Error(data.error || 'RCON command failed');
      }
    } catch (error) {
      console.error('RCON command failed:', error);
      throw new Error(`RCON command failed: ${error.message}`);
    }
  }

  // Get server performance metrics from backend
  async getServerMetrics() {
    try {
      const response = await fetch(`${this.backendURL}/api/server/metrics`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error('Failed to get server metrics');
      }
    } catch (error) {
      console.error('Failed to get server metrics:', error);
      // Return fallback data
      return {
        cpu: 275,
        memory: 18,
        uptime: 3600,
        tickRate: 60,
        networkIn: 750,
        networkOut: 600,
        lastRestart: new Date(Date.now() - 3600000).toISOString()
      };
    }
  }
}

// Create and export a single instance
const serverApiInstance = new ServerAPI();
export default serverApiInstance;