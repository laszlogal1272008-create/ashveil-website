// Minimal test server for slay functionality
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

console.log('🚀 Starting Minimal Test Server...');

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Test server is working!',
    timestamp: new Date().toISOString()
  });
});

// RCON test endpoint
app.get('/api/rcon/test', (req, res) => {
  res.json({
    success: false,
    error: 'RCON not connected',
    message: 'Real RCON is offline, but server is working',
    devMode: true
  });
});

// Slay endpoint with development mode simulation
app.post('/api/dinosaur/slay', (req, res) => {
  const { playerName, steamId } = req.body;
  
  console.log(`🎭 DEV MODE: Slay request for ${playerName} (Steam: ${steamId})`);
  
  if (!playerName || !steamId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: playerName, steamId'
    });
  }
  
  // Simulate successful slay
  console.log(`💀 Simulating slay command: KillCharacter ${playerName}`);
  
  res.json({
    success: true,
    message: `[DEV MODE] Successfully simulated slaying ${playerName}'s dinosaur`,
    playerName: playerName,
    steamId: steamId,
    devMode: true,
    slayId: `test_${Date.now()}`,
    note: 'This was a simulation. Configure RCON for real server integration.',
    command: `KillCharacter ${playerName}`,
    timestamp: new Date().toISOString()
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`🔗 Test URL: http://localhost:${PORT}/test`);
  console.log(`💀 Slay URL: http://localhost:${PORT}/api/dinosaur/slay`);
  console.log('🎭 Running in development mode - slay commands are simulated');
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});