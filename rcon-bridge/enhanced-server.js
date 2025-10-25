/**
 * IMPROVED RCON Bridge for Isle Servers
 * Handles multiple authentication methods and protocols
 */

const express = require('express');
const net = require('net');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Configuration
const CONFIG = {
  PORT: process.env.BRIDGE_PORT || 3002,
  API_KEY: process.env.BRIDGE_API_KEY || 'ashveil-rcon-bridge-2025',
  RCON_HOST: process.env.RCON_HOST || '45.45.238.134',
  RCON_PORT: parseInt(process.env.RCON_PORT) || 16007,
  RCON_PASSWORD: process.env.RCON_PASSWORD || 'CookieMonster420',
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,https://ashveil.live').split(','),
  MAX_REQUESTS_PER_MINUTE: parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 30,
  CONNECTION_TIMEOUT: parseInt(process.env.CONNECTION_TIMEOUT) || 10000,
  COMMAND_TIMEOUT: parseInt(process.env.COMMAND_TIMEOUT) || 15000
};

// Middleware
app.use(express.json());
app.use(cors({
  origin: CONFIG.ALLOWED_ORIGINS,
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: CONFIG.MAX_REQUESTS_PER_MINUTE,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// API key authentication
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apikey;
  if (!apiKey || apiKey !== CONFIG.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Valid API key required' });
  }
  next();
};

// Enhanced RCON connection class with multiple auth methods
class IsleRconConnection {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.authenticated = false;
    this.requestId = 1;
    this.pendingRequests = new Map();
    this.authMethod = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = new net.Socket();
      
      const timeout = setTimeout(() => {
        this.socket.destroy();
        reject(new Error('Connection timeout'));
      }, CONFIG.CONNECTION_TIMEOUT);

      this.socket.connect(CONFIG.RCON_PORT, CONFIG.RCON_HOST, () => {
        clearTimeout(timeout);
        console.log(`🔗 Connected to RCON ${CONFIG.RCON_HOST}:${CONFIG.RCON_PORT}`);
        this.connected = true;
        
        // Try multiple authentication methods
        this.tryAuthentication()
          .then(() => {
            console.log(`✅ Authentication successful using method: ${this.authMethod}`);
            resolve();
          })
          .catch(reject);
      });

      this.socket.on('data', (data) => {
        this.handleResponse(data);
      });

      this.socket.on('error', (err) => {
        clearTimeout(timeout);
        console.error('🔥 RCON connection error:', err.message);
        this.connected = false;
        this.authenticated = false;
        reject(err);
      });

      this.socket.on('close', () => {
        console.log('🔌 RCON connection closed');
        this.connected = false;
        this.authenticated = false;
      });
    });
  }

  async tryAuthentication() {
    const authMethods = [
      { name: 'Source RCON', method: () => this.sourceRconAuth() },
      { name: 'Plain Text', method: () => this.plainTextAuth() },
      { name: 'LOGIN Command', method: () => this.loginCommandAuth() },
      { name: 'AUTH Command', method: () => this.authCommandAuth() },
      { name: 'RCON_PASSWORD', method: () => this.rconPasswordAuth() }
    ];

    for (const auth of authMethods) {
      try {
        console.log(`🔐 Trying authentication method: ${auth.name}`);
        await auth.method();
        this.authMethod = auth.name;
        this.authenticated = true;
        return;
      } catch (error) {
        console.log(`❌ ${auth.name} failed: ${error.message}`);
        // Wait a bit before trying next method
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error('All authentication methods failed');
  }

  // Standard Source RCON authentication
  sourceRconAuth() {
    return new Promise((resolve, reject) => {
      const authPacket = this.createSourcePacket(3, CONFIG.RCON_PASSWORD);
      const requestId = this.requestId++;
      
      this.pendingRequests.set(requestId, { 
        resolve, 
        reject, 
        type: 'auth',
        timestamp: Date.now()
      });
      
      this.socket.write(authPacket);
      
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Source RCON auth timeout'));
        }
      }, 5000);
    });
  }

  // Plain text password authentication
  plainTextAuth() {
    return new Promise((resolve, reject) => {
      const responses = [];
      
      const dataHandler = (data) => {
        const response = data.toString().trim();
        responses.push(response);
        console.log(`📨 Plain text response: "${response}"`);
        
        if (this.isAuthSuccess(response)) {
          this.socket.removeListener('data', dataHandler);
          resolve();
        }
      };
      
      this.socket.on('data', dataHandler);
      this.socket.write(`${CONFIG.RCON_PASSWORD}\n`);
      
      setTimeout(() => {
        this.socket.removeListener('data', dataHandler);
        if (responses.length === 0) {
          reject(new Error('No response to plain text auth'));
        } else {
          reject(new Error(`Plain text auth failed: ${responses.join(', ')}`));
        }
      }, 3000);
    });
  }

  // LOGIN command authentication
  loginCommandAuth() {
    return new Promise((resolve, reject) => {
      const responses = [];
      
      const dataHandler = (data) => {
        const response = data.toString().trim();
        responses.push(response);
        console.log(`📨 LOGIN response: "${response}"`);
        
        if (this.isAuthSuccess(response)) {
          this.socket.removeListener('data', dataHandler);
          resolve();
        }
      };
      
      this.socket.on('data', dataHandler);
      this.socket.write(`LOGIN ${CONFIG.RCON_PASSWORD}\n`);
      
      setTimeout(() => {
        this.socket.removeListener('data', dataHandler);
        reject(new Error(`LOGIN command failed: ${responses.join(', ')}`));
      }, 3000);
    });
  }

  // AUTH command authentication
  authCommandAuth() {
    return new Promise((resolve, reject) => {
      const responses = [];
      
      const dataHandler = (data) => {
        const response = data.toString().trim();
        responses.push(response);
        console.log(`📨 AUTH response: "${response}"`);
        
        if (this.isAuthSuccess(response)) {
          this.socket.removeListener('data', dataHandler);
          resolve();
        }
      };
      
      this.socket.on('data', dataHandler);
      this.socket.write(`AUTH ${CONFIG.RCON_PASSWORD}\n`);
      
      setTimeout(() => {
        this.socket.removeListener('data', dataHandler);
        reject(new Error(`AUTH command failed: ${responses.join(', ')}`));
      }, 3000);
    });
  }

  // RCON_PASSWORD command authentication
  rconPasswordAuth() {
    return new Promise((resolve, reject) => {
      const responses = [];
      
      const dataHandler = (data) => {
        const response = data.toString().trim();
        responses.push(response);
        console.log(`📨 RCON_PASSWORD response: "${response}"`);
        
        if (this.isAuthSuccess(response)) {
          this.socket.removeListener('data', dataHandler);
          resolve();
        }
      };
      
      this.socket.on('data', dataHandler);
      this.socket.write(`RCON_PASSWORD ${CONFIG.RCON_PASSWORD}\n`);
      
      setTimeout(() => {
        this.socket.removeListener('data', dataHandler);
        reject(new Error(`RCON_PASSWORD failed: ${responses.join(', ')}`));
      }, 3000);
    });
  }

  // Check if response indicates successful authentication
  isAuthSuccess(response) {
    const successIndicators = [
      'logged in', 'authentication successful', 'welcome', 
      'admin logged in', 'authenticated', 'connected',
      'rcon authenticated', 'password accepted'
    ];
    
    const lowerResponse = response.toLowerCase();
    return successIndicators.some(indicator => lowerResponse.includes(indicator));
  }

  sendCommand(command) {
    return new Promise((resolve, reject) => {
      if (!this.connected || !this.authenticated) {
        reject(new Error('Not connected or authenticated'));
        return;
      }

      console.log(`📤 Executing command: ${command} (using ${this.authMethod})`);

      // Use appropriate command format based on auth method
      let commandToSend;
      if (this.authMethod === 'Source RCON') {
        const commandPacket = this.createSourcePacket(2, command);
        const requestId = this.requestId++;
        
        this.pendingRequests.set(requestId, {
          resolve,
          reject,
          type: 'command',
          command: command,
          timestamp: Date.now()
        });
        
        this.socket.write(commandPacket);
      } else {
        // Use plain text command for other auth methods
        const responses = [];
        
        const dataHandler = (data) => {
          const response = data.toString().trim();
          responses.push(response);
          console.log(`📥 Command response: "${response}"`);
        };
        
        this.socket.on('data', dataHandler);
        this.socket.write(`${command}\n`);
        
        setTimeout(() => {
          this.socket.removeListener('data', dataHandler);
          resolve({
            success: true,
            response: responses.join('\n'),
            command: command,
            method: this.authMethod,
            timestamp: new Date().toISOString()
          });
        }, 3000);
      }
      
      setTimeout(() => {
        reject(new Error('Command timeout'));
      }, CONFIG.COMMAND_TIMEOUT);
    });
  }

  createSourcePacket(type, body) {
    const id = this.requestId;
    const bodyBuffer = Buffer.from(body, 'ascii');
    const packet = Buffer.alloc(14 + bodyBuffer.length);
    
    packet.writeInt32LE(10 + bodyBuffer.length, 0);
    packet.writeInt32LE(id, 4);
    packet.writeInt32LE(type, 8);
    bodyBuffer.copy(packet, 12);
    packet.writeInt16LE(0, 12 + bodyBuffer.length);
    
    return packet;
  }

  handleResponse(data) {
    // Handle Source RCON protocol responses
    if (data.length >= 12) {
      try {
        const size = data.readInt32LE(0);
        const id = data.readInt32LE(4);
        const type = data.readInt32LE(8);
        const body = data.slice(12, 12 + size - 10).toString('ascii');
        
        const request = this.pendingRequests.get(id);
        if (request) {
          this.pendingRequests.delete(id);
          
          if (request.type === 'auth') {
            if (id === -1) {
              request.reject(new Error('Source RCON authentication failed'));
            } else {
              request.resolve({ success: true, authenticated: true });
            }
          } else if (request.type === 'command') {
            request.resolve({
              success: true,
              response: body,
              command: request.command,
              method: this.authMethod,
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error('Error parsing Source RCON response:', error);
      }
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    this.connected = false;
    this.authenticated = false;
    this.pendingRequests.clear();
  }
}

// Global RCON connection
let rconConnection = null;

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Enhanced Isle RCON Bridge',
    version: '2.0.0',
    rcon_connected: rconConnection?.connected || false,
    rcon_authenticated: rconConnection?.authenticated || false,
    auth_method: rconConnection?.authMethod || null,
    timestamp: new Date().toISOString()
  });
});

app.get('/status', authenticateApiKey, (req, res) => {
  res.json({
    connected: rconConnection?.connected || false,
    authenticated: rconConnection?.authenticated || false,
    auth_method: rconConnection?.authMethod || null,
    rcon_host: CONFIG.RCON_HOST,
    rcon_port: CONFIG.RCON_PORT,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.post('/connect', authenticateApiKey, async (req, res) => {
  try {
    if (rconConnection?.connected && rconConnection?.authenticated) {
      return res.json({ 
        success: true, 
        message: 'Already connected and authenticated',
        connected: true,
        authenticated: true,
        auth_method: rconConnection.authMethod
      });
    }

    console.log('🚀 Starting enhanced RCON connection...');
    rconConnection = new IsleRconConnection();
    await rconConnection.connect();
    
    res.json({ 
      success: true, 
      message: 'Connected and authenticated to RCON server',
      connected: true,
      authenticated: true,
      auth_method: rconConnection.authMethod,
      host: CONFIG.RCON_HOST,
      port: CONFIG.RCON_PORT
    });
  } catch (error) {
    console.error('🔥 Enhanced connection failed:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      connected: false,
      authenticated: false
    });
  }
});

app.post('/disconnect', authenticateApiKey, (req, res) => {
  if (rconConnection) {
    rconConnection.disconnect();
    rconConnection = null;
  }
  
  res.json({ 
    success: true, 
    message: 'Disconnected from RCON server',
    connected: false,
    authenticated: false
  });
});

app.post('/command', authenticateApiKey, async (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command || typeof command !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Command is required and must be a string' 
      });
    }

    if (!rconConnection?.connected || !rconConnection?.authenticated) {
      return res.status(503).json({ 
        success: false, 
        error: 'Not connected or authenticated to RCON server',
        message: 'Use /connect endpoint first'
      });
    }

    const result = await rconConnection.sendCommand(command);
    console.log(`📥 Command executed successfully:`, result);
    res.json(result);
  } catch (error) {
    console.error('🔥 Command failed:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      command: req.body.command
    });
  }
});

// Start server
app.listen(CONFIG.PORT, '0.0.0.0', () => {
  console.log(`🚀 Enhanced Isle RCON Bridge v2.0 started on port ${CONFIG.PORT}`);
  console.log(`🎯 Target RCON: ${CONFIG.RCON_HOST}:${CONFIG.RCON_PORT}`);
  console.log(`🔑 API Key: ${CONFIG.API_KEY}`);
  console.log(`🌍 Allowed origins: ${CONFIG.ALLOWED_ORIGINS.join(', ')}`);
  console.log(`🔐 Multiple authentication methods enabled`);
  console.log(`⚡ Rate limit: ${CONFIG.MAX_REQUESTS_PER_MINUTE} requests/minute`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Enhanced Isle RCON Bridge...');
  if (rconConnection) {
    rconConnection.disconnect();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  if (rconConnection) {
    rconConnection.disconnect();
  }
  process.exit(0);
});