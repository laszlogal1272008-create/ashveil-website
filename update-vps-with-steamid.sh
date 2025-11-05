#!/bin/bash

# Update VPS Bridge with Correct Slay Command Format
echo "🎯 Updating VPS bridge with correct slay command format..."

# SSH into VPS and update the bridge
cat > /tmp/update-bridge.sh << 'EOF'
# Stop current bridge
pm2 stop rcon-bridge

# Update the bridge with correct command format
cat > /root/rcon-bridge-working.js << 'BRIDGE_EOF'
const express = require('express');
const net = require('net');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const ISLE_HOST = '45.45.238.134';
const ISLE_PORT = 16007;
const RCON_PASSWORD = 'CookieMonster420';

// Player name to Steam ID mapping
const PLAYER_IDS = {
    'Misplacedcursor': '76561199520399511'
};

// Isle RCON Protocol Implementation
function createRCONPacket(command, type = 0x02) {
    const cmdBuffer = Buffer.from(command, 'utf8');
    const packet = Buffer.alloc(12 + cmdBuffer.length + 2);
    
    packet.writeInt32LE(8 + cmdBuffer.length + 2, 0);
    packet.writeInt32LE(1, 4);
    packet.writeInt32LE(type, 8);
    cmdBuffer.copy(packet, 12);
    packet.writeInt8(0, 12 + cmdBuffer.length);
    packet.writeInt8(0, 12 + cmdBuffer.length + 1);
    
    return packet;
}

function parseRCONResponse(buffer) {
    if (buffer.length < 12) return null;
    
    const size = buffer.readInt32LE(0);
    const id = buffer.readInt32LE(4);
    const type = buffer.readInt32LE(8);
    
    if (buffer.length >= 4 + size) {
        const bodyEnd = Math.min(12 + size - 8, buffer.length - 2);
        const body = buffer.slice(12, bodyEnd).toString('utf8').replace(/\0/g, '');
        return { size, id, type, body };
    }
    return null;
}

async function executeSlayCommand(playerName) {
    return new Promise((resolve, reject) => {
        console.log(`🎯 Attempting to slay player: ${playerName}`);
        
        // Get Steam ID for player
        const steamID = PLAYER_IDS[playerName];
        if (!steamID) {
            reject(new Error(`Player ${playerName} not found in ID mapping`));
            return;
        }
        
        console.log(`🔍 Using Steam ID: ${steamID}`);
        
        const client = new net.Socket();
        let authenticated = false;
        let responseBuffer = Buffer.alloc(0);
        
        client.setTimeout(15000);
        
        client.on('connect', () => {
            console.log('🔌 Connected to Isle server');
            const authPacket = createRCONPacket(RCON_PASSWORD, 0x03);
            client.write(authPacket);
        });
        
        client.on('data', (data) => {
            responseBuffer = Buffer.concat([responseBuffer, data]);
            
            while (true) {
                const response = parseRCONResponse(responseBuffer);
                if (!response) break;
                
                const packetSize = response.size + 4;
                responseBuffer = responseBuffer.slice(packetSize);
                
                console.log(`📨 Server response: "${response.body}"`);
                
                if (!authenticated && (response.type === 0x02 || response.id === 1)) {
                    authenticated = true;
                    console.log('✅ RCON Authentication successful');
                    
                    // Use correct Isle Evrima slay command format
                    const slayCommand = `slay ${steamID}`;
                    console.log(`📤 Sending command: ${slayCommand}`);
                    
                    const commandPacket = createRCONPacket(slayCommand, 0x02);
                    client.write(commandPacket);
                    
                } else if (authenticated) {
                    console.log(`🎯 Slay command response: "${response.body}"`);
                    
                    // Check for success indicators
                    const successIndicators = [
                        'killed',
                        'slain',
                        'eliminated',
                        'Player killed',
                        'successfully',
                        'executed'
                    ];
                    
                    const isSuccess = successIndicators.some(indicator => 
                        response.body.toLowerCase().includes(indicator.toLowerCase())
                    ) || response.body.trim().length === 0; // Empty response often means success
                    
                    client.end();
                    resolve({
                        success: isSuccess,
                        message: response.body || 'Command executed',
                        command: `slay ${steamID}`,
                        steamID: steamID
                    });
                    return;
                }
            }
        });
        
        client.on('timeout', () => {
            console.log('❌ Connection timeout');
            client.destroy();
            reject(new Error('RCON connection timeout'));
        });
        
        client.on('error', (err) => {
            console.log(`❌ Connection error: ${err.message}`);
            reject(err);
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
            message: `Player ${playerName} (${result.steamID}) - ${result.message}`,
            command: result.command,
            steamID: result.steamID,
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
        server: 'Isle RCON Bridge - Using Steam IDs'
    });
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 RCON Bridge running on port ${PORT}`);
    console.log(`🎮 Connected to Isle server: ${ISLE_HOST}:${ISLE_PORT}`);
    console.log(`🆔 Using Steam ID format: slay <PlayerID>`);
});
BRIDGE_EOF

# Restart the bridge
pm2 start rcon-bridge-working.js --name "rcon-bridge"
pm2 save

echo "✅ Bridge updated with Steam ID format!"
echo "🎯 Now using: slay 76561199520399511"
EOF

echo "📡 Copy this script and run it on your VPS:"
cat /tmp/update-bridge.sh