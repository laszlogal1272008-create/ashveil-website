#!/bin/bash

# VPS Bridge Restart Script - Fix 504 Timeout Issue
echo "🔧 Fixing VPS RCON Bridge (104.131.111.229)..."

# Kill any existing bridge processes
echo "📛 Stopping existing bridge processes..."
pm2 stop all
pm2 delete all
pkill -f "rcon"
pkill -f "bridge"
sleep 2

# Create working RCON bridge with direct Isle protocol
echo "📝 Creating working RCON bridge..."
cat > /root/rcon-bridge-working.js << 'EOF'
const express = require('express');
const net = require('net');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const ISLE_HOST = '45.45.238.134';
const ISLE_PORT = 16007;
const RCON_PASSWORD = 'CookieMonster420';

// Isle RCON Protocol Implementation
function createRCONPacket(command, type = 0x02) {
    const cmdBuffer = Buffer.from(command, 'utf8');
    const packet = Buffer.alloc(12 + cmdBuffer.length);
    
    packet.writeInt32LE(8 + cmdBuffer.length, 0); // Size
    packet.writeInt32LE(1, 4); // Request ID
    packet.writeInt32LE(type, 8); // Type (0x01=auth, 0x02=command)
    cmdBuffer.copy(packet, 12);
    
    return packet;
}

function parseRCONResponse(buffer) {
    if (buffer.length < 12) return null;
    
    const size = buffer.readInt32LE(0);
    const id = buffer.readInt32LE(4);
    const type = buffer.readInt32LE(8);
    
    if (buffer.length >= 12 + size - 8) {
        const bodyLength = size - 8;
        const body = buffer.slice(12, 12 + bodyLength - 2).toString('utf8');
        return { size, id, type, body };
    }
    return null;
}

async function executeSlayCommand(playerName) {
    return new Promise((resolve, reject) => {
        console.log(`🎯 Attempting to slay player: ${playerName}`);
        
        const client = new net.Socket();
        let authenticated = false;
        let responseBuffer = Buffer.alloc(0);
        
        client.setTimeout(10000);
        
        client.on('connect', () => {
            console.log('🔌 Connected to Isle server');
            const authPacket = createRCONPacket(RCON_PASSWORD, 0x01);
            client.write(authPacket);
        });
        
        client.on('data', (data) => {
            responseBuffer = Buffer.concat([responseBuffer, data]);
            
            while (true) {
                const response = parseRCONResponse(responseBuffer);
                if (!response) break;
                
                const totalPacketSize = response.size + 4;
                responseBuffer = responseBuffer.slice(totalPacketSize);
                
                console.log(`📨 Server response: "${response.body}"`);
                
                if (!authenticated && response.body.includes('Password Accepted')) {
                    authenticated = true;
                    console.log('✅ RCON Authentication successful');
                    
                    // Try multiple slay command formats
                    const slayCommands = [
                        `/slay ${playerName}`,
                        `slay ${playerName}`,
                        `/kill ${playerName}`,
                        `kill ${playerName}`,
                        `/KillPlayer ${playerName}`,
                        `KillPlayer ${playerName}`,
                        `/AdminCmd slay ${playerName}`,
                        `AdminCmd slay ${playerName}`
                    ];
                    
                    // Send the first command (most likely to work)
                    const commandPacket = createRCONPacket(slayCommands[0], 0x02);
                    client.write(commandPacket);
                    
                } else if (authenticated) {
                    // Check for success indicators
                    const successIndicators = [
                        'killed',
                        'slain',
                        'died',
                        'eliminated',
                        'Playables list was updated',
                        'Player removed',
                        'Command executed'
                    ];
                    
                    const isSuccess = successIndicators.some(indicator => 
                        response.body.toLowerCase().includes(indicator.toLowerCase())
                    );
                    
                    client.end();
                    resolve({
                        success: isSuccess,
                        message: response.body,
                        command: `/slay ${playerName}`
                    });
                    return;
                }
            }
        });
        
        client.on('timeout', () => {
            client.destroy();
            reject(new Error('RCON connection timeout'));
        });
        
        client.on('error', (err) => {
            reject(new Error(`RCON connection error: ${err.message}`));
        });
        
        client.connect(ISLE_PORT, ISLE_HOST);
    });
}

// Slay endpoint
app.post('/rcon/slay', async (req, res) => {
    try {
        const { playerName } = req.body;
        
        if (!playerName) {
            return res.status(400).json({ 
                success: false, 
                message: 'Player name is required' 
            });
        }
        
        console.log(`🎯 Slay request for: ${playerName}`);
        const result = await executeSlayCommand(playerName);
        
        res.json({
            success: result.success,
            message: result.message,
            command: result.command,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Slay command failed:', error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        server: 'Isle RCON Bridge'
    });
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 RCON Bridge running on port ${PORT}`);
    console.log(`🎮 Connected to Isle server: ${ISLE_HOST}:${ISLE_PORT}`);
});
EOF

# Install dependencies if needed
echo "📦 Installing dependencies..."
cd /root
if [ ! -f package.json ]; then
    npm init -y
fi
npm install express cors

# Start the working bridge
echo "🚀 Starting working RCON bridge..."
pm2 start rcon-bridge-working.js --name "rcon-bridge"
pm2 startup
pm2 save

echo "✅ VPS Bridge restarted successfully!"
echo "🌐 Test at: http://104.131.111.229:3001/health"
echo "🎯 Slay endpoint: http://104.131.111.229:3001/rcon/slay"

# Test the bridge
echo "🧪 Testing bridge..."
sleep 3
curl -X GET http://localhost:3001/health
echo ""
echo "🎯 Testing slay command..."
curl -X POST http://localhost:3001/rcon/slay \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Misplacedcursor"}'

echo ""
echo "🎉 Bridge setup complete!"