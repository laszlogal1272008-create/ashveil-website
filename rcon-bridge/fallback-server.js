/**
 * Emergency Fallback System for Ashveil
 * When RCON is unavailable, log commands for manual execution
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.FALLBACK_PORT || 3003;
const COMMANDS_FILE = path.join(__dirname, 'pending-commands.json');

app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://ashveil.live'],
  credentials: true
}));

// In-memory command queue
let pendingCommands = [];
let commandHistory = [];

// Load existing commands on startup
const loadCommands = async () => {
  try {
    const data = await fs.readFile(COMMANDS_FILE, 'utf8');
    const saved = JSON.parse(data);
    pendingCommands = saved.pending || [];
    commandHistory = saved.history || [];
    console.log(`📁 Loaded ${pendingCommands.length} pending commands`);
  } catch (error) {
    console.log('📝 Starting with empty command log');
  }
};

// Save commands to file
const saveCommands = async () => {
  const data = {
    pending: pendingCommands,
    history: commandHistory.slice(-100) // Keep last 100 executed commands
  };
  await fs.writeFile(COMMANDS_FILE, JSON.stringify(data, null, 2));
};

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Ashveil Fallback System',
    pending_commands: pendingCommands.length,
    timestamp: new Date().toISOString()
  });
});

// Add new command to queue
app.post('/command', async (req, res) => {
  try {
    const { command, player, reason } = req.body;
    
    if (!command) {
      return res.status(400).json({
        success: false,
        error: 'Command is required'
      });
    }

    const commandEntry = {
      id: Date.now(),
      command,
      player: player || 'Unknown',
      reason: reason || 'No reason provided',
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    pendingCommands.push(commandEntry);
    await saveCommands();

    console.log(`📋 Added command: ${command} for ${player}`);

    res.json({
      success: true,
      message: 'Command queued for manual execution',
      command_id: commandEntry.id,
      manual_execution_required: true,
      instructions: 'Copy command from /admin panel and execute in Physgun console'
    });

  } catch (error) {
    console.error('❌ Error adding command:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to queue command'
    });
  }
});

// Get pending commands (for admin panel)
app.get('/admin/pending', (req, res) => {
  res.json({
    pending_commands: pendingCommands,
    total: pendingCommands.length,
    timestamp: new Date().toISOString()
  });
});

// Mark command as executed
app.post('/admin/execute/:id', async (req, res) => {
  try {
    const commandId = parseInt(req.params.id);
    const commandIndex = pendingCommands.findIndex(cmd => cmd.id === commandId);
    
    if (commandIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Command not found'
      });
    }

    const command = pendingCommands[commandIndex];
    command.status = 'executed';
    command.executed_at = new Date().toISOString();

    // Move to history
    commandHistory.push(command);
    pendingCommands.splice(commandIndex, 1);

    await saveCommands();

    console.log(`✅ Marked as executed: ${command.command}`);

    res.json({
      success: true,
      message: 'Command marked as executed',
      command: command
    });

  } catch (error) {
    console.error('❌ Error marking command as executed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark command as executed'
    });
  }
});

// Admin panel HTML
app.get('/admin', (req, res) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Ashveil Command Admin Panel</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #1a1a1a; color: #fff; }
        .header { background: #2d2d2d; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .command { background: #333; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #00ff88; }
        .command-text { font-family: monospace; background: #222; padding: 10px; border-radius: 3px; margin: 10px 0; }
        .execute-btn { background: #00ff88; color: black; border: none; padding: 10px 20px; border-radius: 3px; cursor: pointer; }
        .execute-btn:hover { background: #00cc66; }
        .status { color: #888; font-size: 0.9em; }
        .refresh-btn { background: #007acc; color: white; border: none; padding: 10px 20px; border-radius: 3px; cursor: pointer; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎮 Ashveil Command Admin Panel</h1>
        <p>Manual execution required - RCON connection unavailable</p>
        <button class="refresh-btn" onclick="location.reload()">🔄 Refresh</button>
    </div>
    
    <div id="commands">
        <p>Loading commands...</p>
    </div>

    <script>
        async function loadCommands() {
            try {
                const response = await fetch('/admin/pending');
                const data = await response.json();
                
                const container = document.getElementById('commands');
                
                if (data.pending_commands.length === 0) {
                    container.innerHTML = '<p>✅ No pending commands</p>';
                    return;
                }
                
                container.innerHTML = data.pending_commands.map(cmd => \`
                    <div class="command">
                        <div><strong>Player:</strong> \${cmd.player}</div>
                        <div><strong>Reason:</strong> \${cmd.reason}</div>
                        <div><strong>Time:</strong> \${new Date(cmd.timestamp).toLocaleString()}</div>
                        <div class="command-text">\${cmd.command}</div>
                        <button class="execute-btn" onclick="markExecuted(\${cmd.id})">
                            ✅ Mark as Executed
                        </button>
                        <div class="status">Copy command above and paste into Physgun console</div>
                    </div>
                \`).join('');
                
            } catch (error) {
                console.error('Error loading commands:', error);
            }
        }
        
        async function markExecuted(id) {
            try {
                await fetch(\`/admin/execute/\${id}\`, { method: 'POST' });
                loadCommands(); // Refresh
            } catch (error) {
                alert('Error marking command as executed');
            }
        }
        
        loadCommands();
        setInterval(loadCommands, 10000); // Auto-refresh every 10 seconds
    </script>
</body>
</html>`;
  
  res.send(html);
});

// Start server
const startServer = async () => {
  await loadCommands();
  
  app.listen(PORT, () => {
    console.log(`🚀 Ashveil Fallback System running on port ${PORT}`);
    console.log(`📋 Admin panel: http://localhost:${PORT}/admin`);
    console.log(`⚡ Commands will be queued for manual execution`);
    console.log(`🎯 Use this system until RCON is fixed`);
  });
};

startServer().catch(console.error);