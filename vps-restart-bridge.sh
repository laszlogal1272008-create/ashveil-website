#!/bin/bash
# VPS Bridge Restart Script - Run this on your VPS

echo "🚀 Restarting VPS Bridge with Correct /slay Command"
echo "=================================================="

# Stop current bridge
echo "🛑 Stopping current bridge..."
pm2 stop rcon-bridge
pm2 delete rcon-bridge

# Create updated bridge with /slay command first
echo "📝 Creating updated bridge with /slay command..."
cat > /root/rcon-bridge-enhanced.js << 'EOF'
const express = require('express');
const net = require('net');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const ISLE_SERVER = {
  host: '45.45.238.134',
  port: 16007,
  password: 'CookieMonster420'
};

function createRCONPacket(opcode, command = '') {
  const commandBuffer = Buffer.from(command, 'utf8');
  const packet = Buffer.alloc(5 + commandBuffer.length);
  packet.writeUInt8(opcode, 0);
  packet.writeUInt32LE(commandBuffer.length, 1);
  commandBuffer.copy(packet, 5);
  return packet;
}

async function executeRCONCommand(command) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(10000);
    
    socket.connect(ISLE_SERVER.port, ISLE_SERVER.host, () => {
      console.log('🔌 Connected to Isle server');
      const authPacket = createRCONPacket(0x01, ISLE_SERVER.password);
      socket.write(authPacket);
    });
    
    let authenticated = false;
    
    socket.on('data', (data) => {
      const response = data.toString('utf8');
      console.log('📥 Server Response:', response);
      
      if (response.includes('Password Accepted') && !authenticated) {
        authenticated = true;
        console.log('✅ Authenticated, sending command:', command);
        const commandPacket = createRCONPacket(0x02, command);
        socket.write(commandPacket);
        
        setTimeout(() => {
          socket.end();
          resolve({ success: true, response: response, command: command });
        }, 3000);
      }
    });
    
    socket.on('error', () => {
      resolve({ success: false, error: 'Connection failed' });
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/rcon/slay', async (req, res) => {
  try {
    const { playerName, playerSteamId } = req.body;
    const target = playerName || playerSteamId || 'Misplacedcursor';
    
    console.log('🎯 Enhanced slay request for:', target);
    
    // Try multiple command formats - /slay FIRST!
    const slayCommands = [
      `/slay ${target}`,           // CORRECT FORMAT FIRST!
      `/kill ${target}`,           
      `slay ${target}`,            
      `kill ${target}`,            
      `pslay ${target}`,           
      `pkill ${target}`,           
      `/admin_slay ${target}`,     
      `admin_slay ${target}`,      
      `player_slay ${target}`,     
      `force_slay ${target}`,      
      `instant_slay ${target}`     
    ];
    
    const results = [];
    let foundSuccess = false;
    
    for (const command of slayCommands) {
      console.log('🧪 Trying command:', command);
      const result = await executeRCONCommand(command);
      results.push({ command, result });
      
      // Check if this command worked (Playables list updated = success!)
      if (result.response && result.response.includes('Playables list was updated')) {
        console.log('🎉 SUCCESS! Found working command:', command);
        foundSuccess = true;
        break;
      }
      
      // Small delay between commands
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    res.json({
      success: true,
      message: foundSuccess ? 'Player killed successfully!' : 'Slay commands sent',
      successFound: foundSuccess,
      commandsAttempted: slayCommands.length,
      results: results,
      target: target,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Enhanced slay error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3001, '0.0.0.0', () => {
  console.log('🚀 Enhanced RCON Bridge running on port 3001');
  console.log('🎯 Ready with /slay command FIRST in priority!');
});
EOF

# Start the updated bridge
echo "🚀 Starting enhanced bridge..."
pm2 start rcon-bridge-enhanced.js --name rcon-bridge
pm2 save

echo "✅ Enhanced bridge restarted with /slay command priority!"
echo "🎯 Your website should now work!"
echo ""
echo "📊 Check status with: pm2 status"
echo "📋 Check logs with: pm2 logs rcon-bridge"