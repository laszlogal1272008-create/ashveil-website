/**
 * RCON Bridge Service
 * Bridges HTTP requests to Isle RCON TCP connection
 * Bypasses Render.com connection restrictions
 */

const express = require('express');
const net = require('net');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Configuration
const CONFIG = {
  // Bridge service
  PORT: process.env.BRIDGE_PORT || 3002,
  API_KEY: process.env.BRIDGE_API_KEY || 'your-secure-api-key-here',
  
  // Isle server RCON
  RCON_HOST: process.env.RCON_HOST || '45.45.238.134',
  RCON_PORT: parseInt(process.env.RCON_PORT) || 16007,
  RCON_PASSWORD: process.env.RCON_PASSWORD || 'CookieMonster420',
  
  // Security
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,https://ashveil-website.netlify.app').split(','),
  MAX_REQUESTS_PER_MINUTE: parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 30,
  
  // Connection
  CONNECTION_TIMEOUT: parseInt(process.env.CONNECTION_TIMEOUT) || 5000,
  COMMAND_TIMEOUT: parseInt(process.env.COMMAND_TIMEOUT) || 10000
};

// Middleware
app.use(express.json());
app.use(cors({
  origin: CONFIG.ALLOWED_ORIGINS,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: CONFIG.MAX_REQUESTS_PER_MINUTE,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// API key authentication
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apikey;
  
  if (!apiKey || apiKey !== CONFIG.API_KEY) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Valid API key required' 
    });
  }
  
  next();
};

// RCON connection class
class RconConnection {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.requestId = 1;
    this.pendingRequests = new Map();
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
        
        // Send authentication
        this.sendAuthPacket()
          .then(() => {
            this.connected = true;
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
        reject(err);
      });

      this.socket.on('close', () => {
        console.log('🔌 RCON connection closed');
        this.connected = false;
      });
    });
  }

  sendAuthPacket() {
    return new Promise((resolve, reject) => {
      const authPacket = this.createPacket(3, CONFIG.RCON_PASSWORD); // Type 3 = Auth
      
      const requestId = this.requestId++;
      this.pendingRequests.set(requestId, { resolve, reject, type: 'auth' });
      
      this.socket.write(authPacket);
      
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Authentication timeout'));
        }
      }, CONFIG.COMMAND_TIMEOUT);
    });
  }

  sendCommand(command) {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        reject(new Error('Not connected to RCON server'));
        return;
      }

      const commandPacket = this.createPacket(2, command); // Type 2 = Command
      const requestId = this.requestId++;
      
      this.pendingRequests.set(requestId, { 
        resolve, 
        reject, 
        type: 'command',
        command: command,
        timestamp: Date.now()
      });
      
      this.socket.write(commandPacket);
      
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Command timeout'));
        }
      }, CONFIG.COMMAND_TIMEOUT);
    });
  }

  createPacket(type, body) {
    const id = this.requestId;
    const bodyBuffer = Buffer.from(body, 'ascii');
    const packet = Buffer.alloc(14 + bodyBuffer.length);
    
    packet.writeInt32LE(10 + bodyBuffer.length, 0); // Size
    packet.writeInt32LE(id, 4); // Request ID
    packet.writeInt32LE(type, 8); // Type
    bodyBuffer.copy(packet, 12); // Body
    packet.writeInt16LE(0, 12 + bodyBuffer.length); // Null terminators
    
    return packet;
  }

  handleResponse(data) {
    // Parse RCON response packet
    if (data.length < 12) return;
    
    const size = data.readInt32LE(0);
    const id = data.readInt32LE(4);
    const type = data.readInt32LE(8);
    const body = data.slice(12, 12 + size - 10).toString('ascii');
    
    const request = this.pendingRequests.get(id);
    if (request) {
      this.pendingRequests.delete(id);
      
      if (type === 2) { // Command response
        request.resolve({
          success: true,
          response: body,
          command: request.command,
          timestamp: new Date().toISOString()
        });
      } else if (type === 0 || type === 3) { // Auth response
        if (id === -1) {
          request.reject(new Error('Authentication failed'));
        } else {
          request.resolve({ success: true, authenticated: true });
        }
      }
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    this.connected = false;
    this.pendingRequests.clear();
  }
}

// Global RCON connection
let rconConnection = null;

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'RCON Bridge',
    version: '1.0.0',
    rcon_connected: rconConnection?.connected || false,
    timestamp: new Date().toISOString()
  });
});

app.get('/status', authenticateApiKey, (req, res) => {
  res.json({
    connected: rconConnection?.connected || false,
    rcon_host: CONFIG.RCON_HOST,
    rcon_port: CONFIG.RCON_PORT,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.post('/connect', authenticateApiKey, async (req, res) => {
  try {
    if (rconConnection?.connected) {
      return res.json({ 
        success: true, 
        message: 'Already connected',
        connected: true 
      });
    }

    rconConnection = new RconConnection();
    await rconConnection.connect();
    
    res.json({ 
      success: true, 
      message: 'Connected to RCON server',
      connected: true,
      host: CONFIG.RCON_HOST,
      port: CONFIG.RCON_PORT
    });
  } catch (error) {
    console.error('🔥 Connection failed:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      connected: false
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
    connected: false
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

    if (!rconConnection?.connected) {
      return res.status(503).json({ 
        success: false, 
        error: 'Not connected to RCON server',
        message: 'Use /connect endpoint first'
      });
    }

    console.log(`📤 Executing command: ${command}`);
    const result = await rconConnection.sendCommand(command);
    
    console.log(`📥 Command result:`, result);
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
app.listen(CONFIG.PORT, () => {
  console.log(`🚀 RCON Bridge Service started on port ${CONFIG.PORT}`);
  console.log(`🎯 Target RCON: ${CONFIG.RCON_HOST}:${CONFIG.RCON_PORT}`);
  console.log(`🔑 API Key required: ${CONFIG.API_KEY}`);
  console.log(`🌍 Allowed origins: ${CONFIG.ALLOWED_ORIGINS.join(', ')}`);
  console.log(`⚡ Rate limit: ${CONFIG.MAX_REQUESTS_PER_MINUTE} requests/minute`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down RCON Bridge Service...');
  if (rconConnection) {
    rconConnection.disconnect();
  }
  process.exit(0);
});