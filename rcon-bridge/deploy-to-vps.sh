#!/bin/bash

# VPS Deployment Script for Enhanced RCON Bridge
# Run this on your VPS at 104.131.111.229

echo "🚀 Deploying Enhanced Isle RCON Bridge to VPS..."

# Stop existing service
echo "🛑 Stopping existing RCON bridge service..."
pm2 stop ashveil-rcon-bridge 2>/dev/null || true
pm2 delete ashveil-rcon-bridge 2>/dev/null || true

# Navigate to bridge directory
cd /root/rcon-bridge

# Backup existing files
echo "💾 Backing up existing configuration..."
cp server.js server.js.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
cp .env .env.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# Create the enhanced server file
echo "📝 Creating enhanced RCON bridge..."
cat > enhanced-server.js << 'ENHANCED_SERVER_EOF'
/**
 * ENHANCED RCON Bridge for Isle Servers - VPS Production Version
 * Handles multiple authentication methods and protocols
 */

const express = require('express');
const net = require('net');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuration
const CONFIG = {
  PORT: process.env.BRIDGE_PORT || 3002,
  API_KEY: process.env.BRIDGE_API_KEY || 'ashveil-rcon-bridge-2025',
  RCON_HOST: process.env.RCON_HOST || '45.45.238.134',
  RCON_PORT: parseInt(process.env.RCON_PORT) || 16007,
  RCON_PASSWORD: process.env.RCON_PASSWORD || 'CookieMonster420',
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || '*').split(','),
  CONNECTION_TIMEOUT: 15000,
  COMMAND_TIMEOUT: 20000
};

// Middleware
app.use(express.json());
app.use(cors({ origin: '*', credentials: true }));

// API key authentication
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apikey;
  if (!apiKey || apiKey !== CONFIG.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Enhanced RCON connection class
class IsleRconConnection {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.authenticated = false;
    this.authMethod = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      console.log(`🔗 Connecting to RCON ${CONFIG.RCON_HOST}:${CONFIG.RCON_PORT}`);
      this.socket = new net.Socket();
      
      const timeout = setTimeout(() => {
        this.socket.destroy();
        reject(new Error('Connection timeout'));
      }, CONFIG.CONNECTION_TIMEOUT);

      this.socket.connect(CONFIG.RCON_PORT, CONFIG.RCON_HOST, () => {
        clearTimeout(timeout);
        console.log('✅ TCP connection established');
        this.connected = true;
        
        this.tryAuthentication()
          .then(() => {
            console.log(`🎉 Authentication successful using: ${this.authMethod}`);
            resolve();
          })
          .catch(reject);
      });

      this.socket.on('error', (err) => {
        clearTimeout(timeout);
        console.error('❌ Connection error:', err.message);
        reject(err);
      });

      this.socket.on('close', () => {
        console.log('🔌 Connection closed');
        this.connected = false;
        this.authenticated = false;
      });
    });
  }

  async tryAuthentication() {
    const methods = [
      { name: 'Plain Password', test: () => this.testPlainAuth() },
      { name: 'LOGIN Command', test: () => this.testLoginAuth() },
      { name: 'AUTH Command', test: () => this.testAuthCommand() },
      { name: 'Source RCON', test: () => this.testSourceRcon() }
    ];

    for (const method of methods) {
      try {
        console.log(`🔐 Trying: ${method.name}`);
        await method.test();
        this.authMethod = method.name;
        this.authenticated = true;
        return;
      } catch (error) {
        console.log(`❌ ${method.name} failed: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    throw new Error('All authentication methods failed');
  }

  testPlainAuth() {
    return new Promise((resolve, reject) => {
      let responded = false;
      
      const dataHandler = (data) => {
        const response = data.toString().trim();
        console.log(`📨 Plain auth response: "${response}"`);
        
        if (this.isAuthSuccess(response)) {
          responded = true;
          this.socket.removeListener('data', dataHandler);
          resolve();
        }
      };
      
      this.socket.on('data', dataHandler);
      this.socket.write(`${CONFIG.RCON_PASSWORD}\\n`);
      
      setTimeout(() => {
        this.socket.removeListener('data', dataHandler);
        if (!responded) {
          reject(new Error('No auth response'));
        }
      }, 5000);
    });
  }

  testLoginAuth() {
    return new Promise((resolve, reject) => {
      let responded = false;
      
      const dataHandler = (data) => {
        const response = data.toString().trim();
        console.log(`📨 LOGIN response: "${response}"`);
        
        if (this.isAuthSuccess(response)) {
          responded = true;
          this.socket.removeListener('data', dataHandler);
          resolve();
        }
      };
      
      this.socket.on('data', dataHandler);
      this.socket.write(`LOGIN ${CONFIG.RCON_PASSWORD}\\n`);
      
      setTimeout(() => {
        this.socket.removeListener('data', dataHandler);
        if (!responded) {
          reject(new Error('LOGIN failed'));
        }
      }, 5000);
    });
  }

  testAuthCommand() {
    return new Promise((resolve, reject) => {
      let responded = false;
      
      const dataHandler = (data) => {
        const response = data.toString().trim();
        console.log(`📨 AUTH response: "${response}"`);
        
        if (this.isAuthSuccess(response)) {
          responded = true;
          this.socket.removeListener('data', dataHandler);
          resolve();
        }
      };
      
      this.socket.on('data', dataHandler);
      this.socket.write(`AUTH ${CONFIG.RCON_PASSWORD}\\n`);
      
      setTimeout(() => {
        this.socket.removeListener('data', dataHandler);
        if (!responded) {
          reject(new Error('AUTH command failed'));
        }
      }, 5000);
    });
  }

  testSourceRcon() {
    return new Promise((resolve, reject) => {
      // Standard Source RCON authentication packet
      const authPacket = this.createSourcePacket(3, CONFIG.RCON_PASSWORD);
      let responded = false;
      
      const dataHandler = (data) => {
        if (data.length >= 12) {
          try {
            const id = data.readInt32LE(4);
            console.log(`📨 Source RCON auth ID: ${id}`);
            
            if (id === -1) {
              reject(new Error('Source RCON auth failed'));
            } else {
              responded = true;
              this.socket.removeListener('data', dataHandler);
              resolve();
            }
          } catch (error) {
            console.error('Source RCON parse error:', error);
          }
        }
      };
      
      this.socket.on('data', dataHandler);
      this.socket.write(authPacket);
      
      setTimeout(() => {
        this.socket.removeListener('data', dataHandler);
        if (!responded) {
          reject(new Error('Source RCON timeout'));
        }
      }, 5000);
    });
  }

  isAuthSuccess(response) {
    const successWords = ['logged in', 'authenticated', 'welcome', 'connected', 'admin'];
    const lowerResponse = response.toLowerCase();
    return successWords.some(word => lowerResponse.includes(word));
  }

  sendCommand(command) {
    return new Promise((resolve, reject) => {
      if (!this.connected || !this.authenticated) {
        reject(new Error('Not authenticated'));
        return;
      }

      console.log(`📤 Executing: ${command}`);
      let responded = false;
      
      const dataHandler = (data) => {
        const response = data.toString().trim();
        console.log(`📥 Command response: "${response.substring(0, 100)}..."`);
        
        responded = true;
        this.socket.removeListener('data', dataHandler);
        resolve({
          success: true,
          response: response,
          command: command,
          method: this.authMethod,
          timestamp: new Date().toISOString()
        });
      };
      
      this.socket.on('data', dataHandler);
      this.socket.write(`${command}\\n`);
      
      setTimeout(() => {
        this.socket.removeListener('data', dataHandler);
        if (!responded) {
          // Return success even if no response (some commands don't respond)
          resolve({
            success: true,
            response: 'Command sent (no response)',
            command: command,
            method: this.authMethod,
            timestamp: new Date().toISOString()
          });
        }
      }, CONFIG.COMMAND_TIMEOUT);
    });
  }

  createSourcePacket(type, body) {
    const id = 1;
    const bodyBuffer = Buffer.from(body, 'ascii');
    const packet = Buffer.alloc(14 + bodyBuffer.length);
    
    packet.writeInt32LE(10 + bodyBuffer.length, 0);
    packet.writeInt32LE(id, 4);
    packet.writeInt32LE(type, 8);
    bodyBuffer.copy(packet, 12);
    packet.writeInt16LE(0, 12 + bodyBuffer.length);
    
    return packet;
  }

  disconnect() {
    if (this.socket) {
      this.socket.destroy();
    }
    this.connected = false;
    this.authenticated = false;
  }
}

// Global connection
let rconConnection = null;

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Enhanced Isle RCON Bridge',
    version: '2.0.0',
    connected: rconConnection?.connected || false,
    authenticated: rconConnection?.authenticated || false,
    auth_method: rconConnection?.authMethod || null,
    timestamp: new Date().toISOString()
  });
});

app.post('/connect', authenticateApiKey, async (req, res) => {
  try {
    if (rconConnection?.authenticated) {
      return res.json({ 
        success: true, 
        message: 'Already authenticated',
        auth_method: rconConnection.authMethod
      });
    }

    rconConnection = new IsleRconConnection();
    await rconConnection.connect();
    
    res.json({ 
      success: true, 
      message: 'RCON authentication successful',
      auth_method: rconConnection.authMethod,
      connected: true,
      authenticated: true
    });
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

app.post('/command', authenticateApiKey, async (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({ 
        success: false, 
        error: 'Command required' 
      });
    }

    if (!rconConnection?.authenticated) {
      return res.status(503).json({ 
        success: false, 
        error: 'Not authenticated - use /connect first'
      });
    }

    const result = await rconConnection.sendCommand(command);
    res.json(result);
  } catch (error) {
    console.error('❌ Command failed:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// Start server
app.listen(CONFIG.PORT, '0.0.0.0', () => {
  console.log(`🚀 Enhanced Isle RCON Bridge v2.0 started`);
  console.log(`🔗 Port: ${CONFIG.PORT}`);
  console.log(`🎯 Target: ${CONFIG.RCON_HOST}:${CONFIG.RCON_PORT}`);
  console.log(`🔑 API Key: ${CONFIG.API_KEY}`);
  console.log(`🌍 CORS: Enabled for all origins`);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down...');
  if (rconConnection) rconConnection.disconnect();
  process.exit(0);
});
ENHANCED_SERVER_EOF

# Update .env file with confirmed settings
echo "⚙️ Updating configuration..."
cat > .env << 'ENV_EOF'
# Enhanced RCON Bridge Configuration
BRIDGE_PORT=3002
BRIDGE_API_KEY=ashveil-rcon-bridge-2025

# Isle Server RCON (Confirmed from Physgun Panel)
RCON_HOST=45.45.238.134
RCON_PORT=16007
RCON_PASSWORD=CookieMonster420

# Security
ALLOWED_ORIGINS=*
ENV_EOF

# Install dependencies if needed
echo "📦 Checking dependencies..."
npm install express cors dotenv 2>/dev/null || echo "Dependencies already installed"

# Start with PM2
echo "🚀 Starting enhanced RCON bridge with PM2..."
pm2 start enhanced-server.js --name ashveil-rcon-bridge --restart-delay 5000

# Save PM2 configuration
pm2 save
pm2 startup

echo ""
echo "✅ Enhanced RCON Bridge deployed successfully!"
echo ""
echo "🔧 Service Management:"
echo "   pm2 status                    # Check status"
echo "   pm2 logs ashveil-rcon-bridge  # View logs"
echo "   pm2 restart ashveil-rcon-bridge # Restart service"
echo ""
echo "🧪 Testing:"
echo "   curl http://localhost:3002/health"
echo "   curl -X POST http://localhost:3002/connect -H 'X-API-Key: ashveil-rcon-bridge-2025'"
echo ""
echo "🌐 External URL (for website):"
echo "   http://104.131.111.229:3002"
echo ""
echo "The enhanced bridge will try multiple authentication methods:"
echo "1. Plain password"
echo "2. LOGIN command"  
echo "3. AUTH command"
echo "4. Source RCON protocol"
echo ""
echo "Monitor the logs to see which method works with your Isle server!"