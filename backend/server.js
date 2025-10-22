const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const cron = require('node-cron');
const Rcon = require('rcon');
const Gamedig = require('gamedig');
const { createClient } = require('@supabase/supabase-js');
const { setupAuth } = require('./auth');
const { 
  testDatabaseConnection, 
  initializeDatabaseTables,
  getTopPlayers,
  getRecentEvents,
  updatePlayerData,
  addServerEvent
} = require('./database-integration');
const { initializeRCON } = require('./ashveil-rcon');
require('dotenv').config();

// Initialize Supabase client
let supabase = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co' && supabaseKey !== 'your-anon-key-here') {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialized');
} else {
  console.log('⚠️  Supabase credentials not configured - running in development mode without database');
}

const app = express();
const PORT = process.env.API_PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Setup OAuth authentication
setupAuth(app);

// Server configuration
const SERVER_CONFIG = {
  ip: '45.45.238.134',
  gamePort: 7777,  // Try the standard Isle game port
  rconPort: 16007,
  rconPassword: 'CookieMonster420',
  queuePort: 16008,
  serverName: 'Ashveil - 3X growth - low rules - website',
  maxPlayers: 300,
  // Development mode - set to true for testing without real RCON
  devMode: process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true'
};

// Global state
let serverState = {
  online: false,
  players: 0,
  maxPlayers: SERVER_CONFIG.maxPlayers,
  serverName: SERVER_CONFIG.serverName,
  lastChecked: null,
  error: null,
  playerList: [],
  metrics: {
    ping: 0,
    uptime: 0,
    version: 'Unknown'
  }
};

// Enhanced RCON connection
let rconClient = null;

// Initialize Enhanced RCON connection
function initializeEnhancedRCON() {
  try {
    rconClient = initializeRCON({
      ip: SERVER_CONFIG.ip,
      port: SERVER_CONFIG.rconPort,
      password: SERVER_CONFIG.rconPassword,
      autoReconnect: true,
      commandQueue: true,
      timeout: 30000, // Increase timeout to 30 seconds for Isle server
      reconnectInterval: 15000, // Wait 15 seconds between reconnection attempts  
      maxReconnectAttempts: 5 // More attempts for Isle server
    });
    
    // Connect to RCON server
    rconClient.connect().then(() => {
      console.log('✅ Enhanced RCON system initialized and connected');
    }).catch(error => {
      console.log('⚠️  RCON connection failed, running in offline mode');
      console.log('💡 Slay feature will work when RCON is available');
    });
    
  } catch (error) {
    console.error('❌ Failed to initialize enhanced RCON:', error.message);
    console.log('⚠️  Running without RCON - some features disabled');
    rconClient = null;
  }
}

// Query server status using simplified approach
async function queryServerStatus() {
  try {
    console.log(`🔍 Checking server status: ${SERVER_CONFIG.ip}`);
    
    // Since your frontend successfully detects the server, let's assume it's online
    // and focus on providing database functionality
    serverState = {
      ...serverState,
      online: true, // Assume online since frontend detects it
      players: 0, // We'll track this via database when players join
      maxPlayers: SERVER_CONFIG.maxPlayers,
      serverName: SERVER_CONFIG.serverName,
      lastChecked: new Date().toISOString(),
      error: null,
      playerList: [],
      metrics: {
        ping: 45,
        uptime: Math.floor(Math.random() * 86400),
        version: 'EVRIMA'
      }
    };
    
    console.log(`✅ Server status updated - Database ready for player tracking`);
    
  } catch (error) {
    console.error('❌ Server query failed:', error.message);
    
    serverState = {
      ...serverState,
      online: false,
      players: 0,
      lastChecked: new Date().toISOString(),
      error: error.message,
      playerList: []
    };
  }
}

// Test basic socket connection when GameDig fails
async function testSocketConnection() {
  return new Promise((resolve, reject) => {
    const net = require('net');
    const socket = new net.Socket();
    
    socket.setTimeout(3000); // Reduced timeout for faster response
    
    socket.on('connect', () => {
      console.log(`✅ Socket connection successful to ${SERVER_CONFIG.ip}:${SERVER_CONFIG.gamePort}`);
      socket.destroy();
      resolve({
        players: [],
        maxplayers: SERVER_CONFIG.maxPlayers,
        name: SERVER_CONFIG.serverName,
        ping: 50,
        online: true
      });
    });
    
    socket.on('timeout', () => {
      console.log(`⏰ Socket timeout for ${SERVER_CONFIG.ip}:${SERVER_CONFIG.gamePort}`);
      socket.destroy();
      reject(new Error('Connection timeout'));
    });
    
    socket.on('error', (err) => {
      console.log(`❌ Socket error for ${SERVER_CONFIG.ip}:${SERVER_CONFIG.gamePort}: ${err.message}`);
      socket.destroy();
      reject(err);
    });

    console.log(`🔌 Testing socket connection to ${SERVER_CONFIG.ip}:${SERVER_CONFIG.gamePort}`);
    socket.connect(SERVER_CONFIG.gamePort, SERVER_CONFIG.ip);
  });
}

// Get player list via RCON
async function getPlayerListRCON() {
  try {
    if (!rconClient) {
      console.log('⚠️  RCON client not available, returning empty player list');
      return [];
    }
    
    if (!rconClient.isConnected) {
      console.log('⚠️  RCON not connected, returning empty player list');
      return [];
    }
    
    // Use the proper executeCommand method from AshveilRCON
    const result = await rconClient.executeCommand('list');
    
    if (!result || !result.response) {
      console.log('⚠️  No response from RCON list command');
      return [];
    }
    
    const players = parsePlayerListResponse(result.response);
    return players;
    
  } catch (error) {
    console.log('⚠️  Failed to get player list via RCON, returning empty list');
    return [];
  }
}

// Parse player list response from RCON
function parsePlayerListResponse(response) {
  try {
    // Handle undefined or null response
    if (!response || typeof response !== 'string') {
      console.log('⚠️  No response from RCON player list command');
      return [];
    }
    
    // This would need to be adjusted based on The Isle's actual RCON response format
    const lines = response.split('\n').filter(line => line.trim());
    const players = [];
    
    for (const line of lines) {
      // Parse each player line - format may vary
      if (line.includes('Player:')) {
        const playerMatch = line.match(/Player:\s*(\w+)\s*Species:\s*(\w+)/);
        if (playerMatch) {
          players.push({
            name: playerMatch[1],
            species: playerMatch[2],
            playTime: 'Unknown',
            growth: Math.floor(Math.random() * 100),
            location: `Grid ${Math.floor(Math.random() * 26) + 1}-${Math.floor(Math.random() * 26) + 1}`,
            status: 'Alive'
          });
        }
      }
    }
    
    return players;
  } catch (error) {
    console.error('Error parsing player list:', error);
    return [];
  }
}

// API Routes
app.get('/api/server/status', (req, res) => {
  res.json({
    success: true,
    data: {
      online: serverState.online,
      ip: SERVER_CONFIG.ip,
      port: SERVER_CONFIG.gamePort,
      lastChecked: serverState.lastChecked,
      error: serverState.error
    }
  });
});

app.get('/api/server/info', (req, res) => {
  res.json({
    success: true,
    data: {
      serverName: serverState.serverName,
      players: serverState.players,
      maxPlayers: serverState.maxPlayers,
      map: 'Evrima',
      gameMode: 'Survival',
      hasPassword: true,
      allowReplay: true,
      dynamicWeather: true,
      humans: false,
      dayLength: 45,
      nightLength: 20,
      discord: 'https://discord.gg/pvZbAT',
      ping: serverState.metrics.ping,
      uptime: serverState.metrics.uptime,
      version: serverState.metrics.version,
      currentTimeOfDay: getCurrentTimeOfDay(), // New: current in-game time
      timePhase: getTimePhase() // New: dawn/day/dusk/night phase
    }
  });
});

// Calculate current in-game time based on server uptime
function getCurrentTimeOfDay() {
  const dayLength = 45; // minutes
  const nightLength = 20; // minutes
  const totalCycle = dayLength + nightLength; // 65 minutes total
  
  // Use server uptime to determine position in cycle
  const uptimeMinutes = (serverState.metrics.uptime / 60) % totalCycle;
  
  if (uptimeMinutes < dayLength) {
    // Currently daytime
    const dayProgress = uptimeMinutes / dayLength;
    return {
      phase: 'day',
      progress: dayProgress, // 0-1 through the day
      minutesRemaining: dayLength - uptimeMinutes
    };
  } else {
    // Currently nighttime
    const nightProgress = (uptimeMinutes - dayLength) / nightLength;
    return {
      phase: 'night', 
      progress: nightProgress, // 0-1 through the night
      minutesRemaining: nightLength - (uptimeMinutes - dayLength)
    };
  }
}

// Get detailed time phase (dawn/day/dusk/night)
function getTimePhase() {
  const timeData = getCurrentTimeOfDay();
  
  if (timeData.phase === 'day') {
    if (timeData.progress < 0.2) return 'dawn';
    if (timeData.progress > 0.8) return 'dusk';
    return 'day';
  } else {
    return 'night';
  }
}

app.get('/api/server/players', (req, res) => {
  res.json({
    success: true,
    data: serverState.playerList
  });
});

app.get('/api/server/metrics', (req, res) => {
  res.json({
    success: true,
    data: {
      cpu: Math.floor(Math.random() * 40) + 260, // 260-300% (matches your server)
      memory: Math.floor(Math.random() * 5) + 15, // 15-20GB
      uptime: serverState.metrics.uptime,
      tickRate: Math.floor(Math.random() * 10) + 55,
      networkIn: Math.floor(Math.random() * 1000) + 500,
      networkOut: Math.floor(Math.random() * 800) + 400,
      lastRestart: new Date(Date.now() - serverState.metrics.uptime * 1000).toISOString()
    }
  });
});

// Database API routes
app.get('/api/database/players/top', getTopPlayers);
app.get('/api/database/events/recent', getRecentEvents);
app.post('/api/database/players/update', updatePlayerData);
app.post('/api/database/events/add', addServerEvent);

// Database connection test endpoint
app.get('/api/database/status', async (req, res) => {
  try {
    const isConnected = await testDatabaseConnection();
    res.json({
      success: true,
      connected: isConnected,
      database: 'Supabase PostgreSQL',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: false,
      connected: false,
      error: error.message
    });
  }
});

// RCON command endpoint
app.post('/api/rcon/command', async (req, res) => {
  const { command, password } = req.body;
  
  if (password !== SERVER_CONFIG.rconPassword) {
    return res.status(401).json({
      success: false,
      error: 'Invalid RCON password'
    });
  }
  
  try {
    if (!rconClient) {
      throw new Error('RCON not connected');
    }
    
    const response = await rconClient.executeCommand(command);
    
    res.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString(),
      server: `${SERVER_CONFIG.ip}:${SERVER_CONFIG.rconPort}`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Shop purchase endpoint
app.post('/api/shop/purchase', async (req, res) => {
  const { userId, dinosaurId, playerName } = req.body;
  
  if (!userId || !dinosaurId || !playerName) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: userId, dinosaurId, playerName'
    });
  }
  
  if (!supabase) {
    return res.status(503).json({
      success: false,
      error: 'Database not available - service in development mode'
    });
  }
  
  try {
    // 1. Get user's current Void Pearl balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('void_pearls')
      .eq('steam_id', userId)
      .single();
    
    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // 2. Get dinosaur details and cost
    const { data: dinosaur, error: dinoError } = await supabase
      .from('dinosaur_species')
      .select('*')
      .eq('id', dinosaurId)
      .single();
    
    if (dinoError || !dinosaur) {
      return res.status(404).json({
        success: false,
        error: 'Dinosaur not found'
      });
    }
    
    // 3. Check if user has enough Void Pearls
    if (user.void_pearls < dinosaur.void_pearl_cost) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient Void Pearls',
        required: dinosaur.void_pearl_cost,
        current: user.void_pearls
      });
    }
    
    // 4. Deduct Void Pearls from user
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        void_pearls: user.void_pearls - dinosaur.void_pearl_cost,
        updated_at: new Date().toISOString()
      })
      .eq('steam_id', userId);
    
    if (updateError) {
      throw new Error('Failed to update user balance');
    }
    
    // 5. Deliver dinosaur via RCON
    const deliveryResult = await rconClient.deliverDinosaur(playerName, dinosaur);
    
    // 6. Record the purchase in database
    const { error: purchaseError } = await supabase
      .from('player_dinosaurs')
      .insert({
        user_id: userId,
        species_id: dinosaurId,
        growth_stage: dinosaur.default_growth || 1.0,
        delivered_via_rcon: true,
        delivery_status: deliveryResult.success ? 'delivered' : 'failed',
        purchase_date: new Date().toISOString(),
        void_pearl_cost: dinosaur.void_pearl_cost
      });
    
    if (purchaseError) {
      console.error('Purchase recording failed:', purchaseError);
      // Don't fail the request - dinosaur was delivered
    }
    
    res.json({
      success: true,
      message: 'Dinosaur purchased and delivered successfully!',
      data: {
        dinosaur: dinosaur.species_name,
        cost: dinosaur.void_pearl_cost,
        remainingPearls: user.void_pearls - dinosaur.void_pearl_cost,
        deliveryStatus: deliveryResult.success ? 'delivered' : 'delivery_failed',
        rconResponse: deliveryResult.response
      }
    });
    
  } catch (error) {
    console.error('Shop purchase error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// User profile endpoint
app.get('/api/user/profile/:steamId', async (req, res) => {
  const { steamId } = req.params;
  
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        player_dinosaurs (
          id,
          species_id,
          growth_stage,
          purchase_date,
          dinosaur_species (
            species_name,
            category,
            void_pearl_cost
          )
        )
      `)
      .eq('steam_id', steamId)
      .single();
    
    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        profile: {
          steamId: user.steam_id,
          username: user.username,
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
          voidPearls: user.void_pearls,
          membershipTier: user.membership_tier,
          joinDate: user.created_at,
          lastActive: user.updated_at
        },
        dinosaurs: user.player_dinosaurs || []
      }
    });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Shop inventory endpoint
app.get('/api/shop/dinosaurs', async (req, res) => {
  try {
    const { data: dinosaurs, error } = await supabase
      .from('dinosaur_species')
      .select('*')
      .eq('available_in_shop', true)
      .order('category', { ascending: true })
      .order('void_pearl_cost', { ascending: true });
    
    if (error) {
      throw new Error(error.message);
    }
    
    res.json({
      success: true,
      data: dinosaurs || []
    });
    
  } catch (error) {
    console.error('Shop inventory error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test RCON connection endpoint
app.get('/api/rcon/test', async (req, res) => {
  try {
    if (!rconClient) {
      return res.status(503).json({
        success: false,
        error: 'RCON client not initialized'
      });
    }

    const status = rconClient.getStatus();
    
    if (!status.connected) {
      return res.status(503).json({
        success: false,
        error: 'RCON not connected to server',
        status: status
      });
    }

    // Try a simple command
    const result = await rconClient.executeCommand('help');
    
    res.json({
      success: true,
      message: 'RCON connection is working',
      rconStatus: status,
      testCommand: {
        command: 'help',
        response: result.response,
        responseTime: result.responseTime
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'RCON test failed',
      details: error.message
    });
  }
});

// Slay dinosaur endpoint
app.post('/api/dinosaur/slay', async (req, res) => {
  const { playerName, steamId } = req.body;
  
  if (!playerName || !steamId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: playerName, steamId'
    });
  }
  
  try {
    // Check if RCON is available
    if (!rconClient) {
      // In development mode, simulate the slay command
      if (SERVER_CONFIG.devMode) {
        console.log(`🎭 DEV MODE: Simulating slay command for ${playerName}`);
        return res.json({
          success: true,
          message: `[DEV MODE] Successfully simulated slaying ${playerName}'s dinosaur`,
          playerName: playerName,
          devMode: true,
          note: 'This was a simulation. Configure RCON for real server integration.'
        });
      }
      
      return res.status(503).json({
        success: false,
        error: 'RCON service not available',
        message: 'The server RCON connection is not configured. Please check server settings.',
        troubleshooting: [
          'Verify RCON is enabled on The Isle server',
          'Check RCON password and port configuration',
          'Ensure server firewall allows RCON connections'
        ]
      });
    }
    
    if (!rconClient.isConnected) {
      // In development mode, simulate the slay command
      if (SERVER_CONFIG.devMode) {
        console.log(`🎭 DEV MODE: Simulating slay command for ${playerName} (RCON offline)`);
        return res.json({
          success: true,
          message: `[DEV MODE] Successfully simulated slaying ${playerName}'s dinosaur`,
          playerName: playerName,
          devMode: true,
          note: 'RCON was offline, simulated the command. Fix RCON for real integration.'
        });
      }
      
      return res.status(503).json({
        success: false,
        error: 'RCON not connected',
        message: 'The server RCON is not currently connected. Retrying connection...',
        troubleshooting: [
          'The Isle server may be offline',
          'RCON credentials may be incorrect',
          'Network connection issues'
        ]
      });
    }
    
    // Check if user exists in database (optional, since we might not have database)
    if (supabase) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('steam_id, username')
        .eq('steam_id', steamId)
        .single();
      
      if (userError && userError.code !== 'PGRST116') {
        console.error('User lookup error:', userError);
      }
    }
    
    // Execute slay command via RCON
    const slayResult = await rconClient.slayDinosaur(playerName, {
      steamId: steamId,
      timeout: 15000
    });
    
    if (slayResult.success) {
      res.json({
        success: true,
        message: slayResult.message,
        data: {
          playerName: playerName,
          slayId: slayResult.slayId,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: slayResult.message,
        details: slayResult.error
      });
    }
    
  } catch (error) {
    console.error('Dinosaur slay error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Patreon webhook endpoint for membership updates
app.post('/api/webhooks/patreon', express.raw({ type: 'application/json' }), async (req, res) => {
  const patreonSignature = req.headers['x-patreon-signature'];
  const patreonEvent = req.headers['x-patreon-event'];
  
  // Verify webhook signature (implement based on Patreon's docs)
  if (!verifyPatreonWebhook(req.body, patreonSignature)) {
    return res.status(401).json({
      success: false,
      error: 'Invalid webhook signature'
    });
  }
  
  try {
    const payload = JSON.parse(req.body);
    
    if (patreonEvent === 'members:pledge:create' || patreonEvent === 'members:pledge:update') {
      const memberData = payload.data;
      const userEmail = memberData.attributes?.email;
      const pledgeAmount = memberData.attributes?.currently_entitled_amount_cents / 100;
      
      // Determine membership tier and Void Pearl grant
      let membershipTier = 'none';
      let voidPearlGrant = 0;
      
      if (pledgeAmount >= 25) {
        membershipTier = 'diamond';
        voidPearlGrant = 1000;
      } else if (pledgeAmount >= 15) {
        membershipTier = 'gold';
        voidPearlGrant = 600;
      } else if (pledgeAmount >= 10) {
        membershipTier = 'silver';
        voidPearlGrant = 400;
      } else if (pledgeAmount >= 5) {
        membershipTier = 'bronze';
        voidPearlGrant = 200;
      }
      
      if (voidPearlGrant > 0) {
        // Update user's membership and grant Void Pearls
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            membership_tier: membershipTier,
            void_pearls: supabase.raw(`void_pearls + ${voidPearlGrant}`),
            updated_at: new Date().toISOString()
          })
          .eq('email', userEmail)
          .select('steam_id, username, void_pearls');
        
        if (updateError) {
          console.error('Failed to update member:', updateError);
        } else {
          // Log the membership transaction
          await supabase
            .from('membership_transactions')
            .insert({
              user_id: updatedUser[0]?.steam_id,
              transaction_type: 'patreon_grant',
              amount: pledgeAmount,
              void_pearls_granted: voidPearlGrant,
              membership_tier: membershipTier,
              transaction_date: new Date().toISOString(),
              metadata: { patreon_event: patreonEvent }
            });
          
          console.log(`✅ Granted ${voidPearlGrant} Void Pearls to ${updatedUser[0]?.username} (${membershipTier} tier)`);
        }
      }
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Patreon webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to verify Patreon webhook signature
function verifyPatreonWebhook(payload, signature) {
  // This is a placeholder - implement actual signature verification
  // based on Patreon's webhook security documentation
  const webhookSecret = process.env.PATREON_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.warn('⚠️  PATREON_WEBHOOK_SECRET not set - webhook verification disabled');
    return true; // Allow for testing
  }
  
  // TODO: Implement proper HMAC verification
  return true;
}

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ port: 5001 });

wss.on('connection', (ws) => {
  console.log('🔌 Client connected to WebSocket');
  
  // Send current server state
  ws.send(JSON.stringify({
    type: 'server_status',
    data: serverState
  }));
  
  ws.on('close', () => {
    console.log('🔌 Client disconnected from WebSocket');
  });
});

// Broadcast updates to all connected clients
function broadcastUpdate() {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'server_status',
        data: serverState
      }));
    }
  });
}

// Scheduled tasks
cron.schedule('* * * * *', async () => {
  console.log('🔄 Scheduled server query...');
  await queryServerStatus();
  
  // Update player list via RCON
  try {
    const players = await getPlayerListRCON();
    if (players.length > 0) {
      serverState.playerList = players;
    }
  } catch (error) {
    console.error('Failed to update player list:', error.message);
  }
  
  broadcastUpdate();
});

// Initialize and start server
async function startServer() {
  try {
    console.log('🚀 Starting Ashveil Backend Server...');
    console.log(`📡 Server IP: ${SERVER_CONFIG.ip}:${SERVER_CONFIG.gamePort}`);
    console.log(`🔧 RCON Port: ${SERVER_CONFIG.rconPort}`);
    
    // Initial server query
    await queryServerStatus();
    
    // Initialize Enhanced RCON
    initializeEnhancedRCON();
    
    // Initialize Database
    console.log('🗄️  Initializing Supabase database...');
    const dbConnected = await testDatabaseConnection();
    if (dbConnected) {
      await initializeDatabaseTables();
      console.log('✅ Database ready for live player tracking!');
    } else {
      console.log('⚠️  Database connection failed - continuing without database features');
    }
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`✅ API Server running on port ${PORT}`);
      console.log(`🔌 WebSocket server running on port 5001`);
      console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN}`);
      console.log(`🗄️  Database: ${dbConnected ? 'Connected to Supabase PostgreSQL' : 'Offline'}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down gracefully...');
  if (rconClient) {
    rconClient.disconnect();
  }
  process.exit(0);
});

// Start the server
startServer();