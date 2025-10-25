/**
 * Simple Command Logger for Ashveil
 * Logs commands for manual execution - no RCON needed
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;
const API_KEY = 'ashveil-rcon-bridge-2025';
const COMMANDS_FILE = path.join(__dirname, 'command-log.json');

app.use(express.json());
app.use(cors({ origin: '*', credentials: true }));

// Command storage
let commandLog = [];

// Load existing commands
const loadCommands = async () => {
  try {
    const data = await fs.readFile(COMMANDS_FILE, 'utf8');
    commandLog = JSON.parse(data);
    console.log(`📁 Loaded ${commandLog.length} previous commands`);
  } catch (error) {
    console.log('📝 Starting with empty command log');
  }
};

// Save commands
const saveCommands = async () => {
  await fs.writeFile(COMMANDS_FILE, JSON.stringify(commandLog, null, 2));
};

// API key auth
const auth = (req, res, next) => {
  const key = req.headers['x-api-key'] || req.query.apikey;
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Ashveil Command Logger',
    version: '1.0.0',
    connected: true,
    authenticated: true,
    commands_logged: commandLog.length,
    timestamp: new Date().toISOString()
  });
});

// Status endpoint (for compatibility)
app.get('/status', auth, (req, res) => {
  res.json({
    connected: true,
    authenticated: true,
    method: 'Manual Execution',
    pending_commands: commandLog.filter(c => c.status === 'pending').length,
    executed_commands: commandLog.filter(c => c.status === 'executed').length,
    timestamp: new Date().toISOString()
  });
});

// Connect endpoint (for compatibility)
app.post('/connect', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Command logger ready',
    connected: true,
    authenticated: true,
    method: 'Manual Execution'
  });
});

// Command endpoint - logs commands for manual execution
app.post('/command', auth, async (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({
        success: false,
        error: 'Command required'
      });
    }

    const commandEntry = {
      id: Date.now(),
      command: command,
      timestamp: new Date().toISOString(),
      status: 'pending',
      user_agent: req.headers['user-agent'] || 'Unknown',
      ip: req.ip || 'Unknown'
    };

    commandLog.push(commandEntry);
    await saveCommands();

    console.log(`📋 Command logged: ${command} (ID: ${commandEntry.id})`);

    res.json({
      success: true,
      response: `Command "${command}" logged for manual execution`,
      command: command,
      command_id: commandEntry.id,
      method: 'Manual Execution',
      timestamp: commandEntry.timestamp,
      instructions: 'Execute this command in your Physgun server console'
    });

  } catch (error) {
    console.error('❌ Error logging command:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log command'
    });
  }
});

// Admin panel to view/manage commands
app.get('/admin', (req, res) => {
  const pendingCommands = commandLog.filter(c => c.status === 'pending');
  const executedCommands = commandLog.filter(c => c.status === 'executed');

  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Ashveil Command Manager</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #1a1a1a; color: #fff; }
        .header { background: #2d2d2d; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .stats { display: flex; gap: 20px; margin-bottom: 20px; }
        .stat-box { background: #333; padding: 15px; border-radius: 5px; text-align: center; }
        .command { background: #333; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .pending { border-left: 4px solid #ff6b35; }
        .executed { border-left: 4px solid #00ff88; }
        .command-text { font-family: monospace; background: #222; padding: 10px; border-radius: 3px; margin: 10px 0; font-size: 14px; }
        .execute-btn { background: #00ff88; color: black; border: none; padding: 8px 16px; border-radius: 3px; cursor: pointer; margin: 5px; }
        .execute-btn:hover { background: #00cc66; }
        .refresh-btn { background: #007acc; color: white; border: none; padding: 10px 20px; border-radius: 3px; cursor: pointer; }
        .meta { color: #888; font-size: 0.9em; margin: 5px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎮 Ashveil Command Manager</h1>
        <p>Manual execution required - RCON bypass system</p>
        <button class="refresh-btn" onclick="location.reload()">🔄 Refresh</button>
    </div>

    <div class="stats">
        <div class="stat-box">
            <h3>${pendingCommands.length}</h3>
            <p>Pending Commands</p>
        </div>
        <div class="stat-box">
            <h3>${executedCommands.length}</h3>
            <p>Executed Commands</p>
        </div>
        <div class="stat-box">
            <h3>${commandLog.length}</h3>
            <p>Total Commands</p>
        </div>
    </div>

    <h2>📋 Pending Commands</h2>
    ${pendingCommands.length === 0 ? '<p>✅ No pending commands</p>' : 
      pendingCommands.map(cmd => `
        <div class="command pending">
            <div class="meta">
                <strong>ID:</strong> ${cmd.id} | 
                <strong>Time:</strong> ${new Date(cmd.timestamp).toLocaleString()}
            </div>
            <div class="command-text">${cmd.command}</div>
            <button class="execute-btn" onclick="markExecuted(${cmd.id})">
                ✅ Mark as Executed
            </button>
            <div class="meta">
                Copy the command above and paste it into your Physgun server console
            </div>
        </div>
      `).join('')
    }

    <h2>✅ Recently Executed</h2>
    ${executedCommands.slice(-10).reverse().map(cmd => `
        <div class="command executed">
            <div class="meta">
                <strong>ID:</strong> ${cmd.id} | 
                <strong>Executed:</strong> ${new Date(cmd.executed_at || cmd.timestamp).toLocaleString()}
            </div>
            <div class="command-text">${cmd.command}</div>
        </div>
    `).join('')}

    <script>
        async function markExecuted(id) {
            try {
                const response = await fetch(\`/admin/execute/\${id}\`, {
                    method: 'POST',
                    headers: { 'X-API-Key': '${API_KEY}' }
                });
                
                if (response.ok) {
                    location.reload();
                } else {
                    alert('Failed to mark command as executed');
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
    </script>
</body>
</html>`;

  res.send(html);
});

// Mark command as executed
app.post('/admin/execute/:id', auth, async (req, res) => {
  try {
    const commandId = parseInt(req.params.id);
    const command = commandLog.find(c => c.id === commandId);
    
    if (!command) {
      return res.status(404).json({ success: false, error: 'Command not found' });
    }

    command.status = 'executed';
    command.executed_at = new Date().toISOString();
    
    await saveCommands();
    
    console.log(`✅ Command marked as executed: ${command.command}`);
    
    res.json({ success: true, command: command });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
const startServer = async () => {
  await loadCommands();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Ashveil Command Logger running on port ${PORT}`);
    console.log(`📋 Admin panel: http://localhost:${PORT}/admin`);
    console.log(`🔑 API Key: ${API_KEY}`);
    console.log(`📁 Commands saved to: ${COMMANDS_FILE}`);
    console.log(`⚡ Ready to log commands for manual execution!`);
  });
};

startServer().catch(console.error);