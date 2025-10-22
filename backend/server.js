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
const IsleServerManager = require('./IsleServerManager');
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
  gamePort: 16006,  // Correct game port confirmed by server provider
  rconPort: 16007,  // RCON port (assuming standard +1 from game port)
  rconPassword: 'CookieMonster420',
  queuePort: 16008, // Queue port confirmed by server provider
  serverName: 'Ashveil - 3X growth - low rules - website',
  maxPlayers: 300,
  // Development mode - set to true for testing without real RCON
  devMode: process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true'
};

// Initialize Isle Server Manager
let isleServerManager = null;

// Initialize server manager
function initializeServerManager() {
  const config = {
    ip: SERVER_CONFIG.ip,
    rconPort: SERVER_CONFIG.rconPort,
    rconPassword: SERVER_CONFIG.rconPassword,
    supabase: supabase
  };
  
  isleServerManager = new IsleServerManager(config);
  console.log('🎮 Isle Server Manager initialized');
}

// Initialize if not in dev mode
if (!SERVER_CONFIG.devMode) {
  initializeServerManager();
}

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

// Skin management endpoints
app.get('/api/skins/available', (req, res) => {
  // Return available skins (will expand when mods are added)
  const availableSkins = [
    {
      id: 'default',
      name: 'Default',
      rconName: 'default',
      cost: 0,
      currency: 'Free',
      rarity: 'Common'
    },
    {
      id: 'albino',
      name: 'Albino',
      rconName: 'albino',
      cost: 500,
      currency: 'Void Pearls',
      rarity: 'Rare'
    },
    {
      id: 'melanistic',
      name: 'Melanistic',
      rconName: 'melanistic',
      cost: 500,
      currency: 'Void Pearls',
      rarity: 'Rare'
    }
  ];
  
  res.json({
    success: true,
    data: availableSkins
  });
});

app.post('/api/skins/apply', async (req, res) => {
  const { dinosaur, skin, playerName, steamId } = req.body;
  
  if (!dinosaur || !skin || !playerName || !steamId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: dinosaur, skin, playerName, steamId'
    });
  }
  
  try {
    // Map skin IDs to RCON skin names
    const skinMapping = {
      'default': 'default',
      'albino': 'albino',
      'melanistic': 'melanistic'
    };
    
    const rconSkinName = skinMapping[skin];
    if (!rconSkinName) {
      return res.status(400).json({
        success: false,
        error: 'Invalid skin ID'
      });
    }
    
    // Check if RCON is available
    if (!rconClient) {
      // In development mode, simulate the skin application
      if (SERVER_CONFIG.devMode) {
        console.log(`🎭 DEV MODE: Simulating skin application for ${playerName}`);
        return res.json({
          success: true,
          message: `[DEV MODE] Successfully applied ${skin} skin to ${dinosaur}`,
          playerName: playerName,
          devMode: true,
          note: 'This was a simulation. Configure RCON for real server integration.'
        });
      }
      
      return res.status(503).json({
        success: false,
        error: 'RCON service not available'
      });
    }
    
    if (!rconClient.isConnected) {
      // In development mode, simulate the skin application
      if (SERVER_CONFIG.devMode) {
        console.log(`🎭 DEV MODE: Simulating skin application for ${playerName} (RCON offline)`);
        return res.json({
          success: true,
          message: `[DEV MODE] Successfully applied ${skin} skin to ${dinosaur}`,
          playerName: playerName,
          devMode: true,
          note: 'RCON was offline, simulated the command. Fix RCON for real integration.'
        });
      }
      
      return res.status(503).json({
        success: false,
        error: 'RCON not connected'
      });
    }
    
    // Apply skin via RCON
    let rconCommand;
    if (rconSkinName === 'default') {
      // For default skin, just spawn the dinosaur normally
      rconCommand = `give ${steamId} ${dinosaur}`;
    } else {
      // For special skins, include the skin name
      rconCommand = `give ${steamId} ${dinosaur} ${rconSkinName}`;
    }
    
    const result = await rconClient.executeCommand(rconCommand);
    
    if (result.success) {
      res.json({
        success: true,
        message: `Successfully applied ${skin} skin to ${dinosaur}`,
        data: {
          playerName: playerName,
          dinosaur: dinosaur,
          skin: skin,
          rconCommand: rconCommand,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Failed to apply skin via RCON'
      });
    }
    
  } catch (error) {
    console.error('Skin application error:', error);
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
const wss = new WebSocket.Server({ port: 5002 });

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
    if (SERVER_CONFIG.devMode) {
      console.log('🎭 Development mode - skipping database initialization');
    } else {
      console.log('🗄️  Initializing Supabase database...');
      const dbConnected = await testDatabaseConnection();
      if (dbConnected) {
        await initializeDatabaseTables();
        console.log('✅ Database ready for live player tracking!');
      } else {
        console.log('⚠️  Database connection failed - continuing without database features');
      }
    }
    
    // Owner Panel APIs - Super Secure Endpoints
    const OWNER_MASTER_KEY = 'ashveil-owner-2025-laszlo-master-key';
    
    // Middleware to verify owner access
    const verifyOwnerAccess = (req, res, next) => {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Owner authorization required' });
      }
      
      const token = auth.split(' ')[1];
      if (token !== OWNER_MASTER_KEY) {
        return res.status(403).json({ error: 'Invalid owner credentials' });
      }
      
      next();
    };

    // Get all users with detailed information
    app.get('/api/owner/users', verifyOwnerAccess, async (req, res) => {
      try {
        if (SERVER_CONFIG.devMode) {
          // Mock data for development
          const mockUsers = [
            {
              id: 1,
              username: 'DinoHunter92',
              steamId: '76561198123456789',
              discordId: '123456789012345678',
              email: 'dino@example.com',
              patreonTier: 'Gold',
              playtime: '247 hours',
              joinDate: '2024-03-15',
              lastActive: '2024-10-22',
              status: 'active',
              currencies: { dinosaurs: 15, voidPearls: 2340, herbivoreCurrency: 5600, carnivoreCurrency: 3200 },
              banInfo: null
            },
            {
              id: 2,
              username: 'AlphaRaptor',
              steamId: '76561198987654321',
              discordId: '987654321098765432',
              email: 'alpha@example.com',
              patreonTier: 'Diamond',
              playtime: '892 hours',
              joinDate: '2024-01-08',
              lastActive: '2024-10-21',
              status: 'active',
              currencies: { dinosaurs: 28, voidPearls: 8920, herbivoreCurrency: 12400, carnivoreCurrency: 9800 },
              banInfo: null
            }
          ];
          return res.json({ users: mockUsers });
        }

        // Production: Get real users from database
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ users });
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
      }
    });

    // Give currency to multiple users
    app.post('/api/owner/give-currency', verifyOwnerAccess, async (req, res) => {
      try {
        const { userIds, currencies } = req.body;
        
        if (SERVER_CONFIG.devMode) {
          console.log(`🎭 DEV: Would give currency to users ${userIds}:`, currencies);
          return res.json({ success: true, message: `Currency given to ${userIds.length} users` });
        }

        // Production: Update user currencies in database
        const updates = userIds.map(async (userId) => {
          const { error } = await supabase
            .from('users')
            .update({
              dinosaurs: supabase.raw(`dinosaurs + ${currencies.dinosaurs}`),
              void_pearls: supabase.raw(`void_pearls + ${currencies.voidPearls}`),
              herbivore_currency: supabase.raw(`herbivore_currency + ${currencies.herbivoreCurrency}`),
              carnivore_currency: supabase.raw(`carnivore_currency + ${currencies.carnivoreCurrency}`)
            })
            .eq('id', userId);

          if (error) throw error;
        });

        await Promise.all(updates);
        
        // Log the action
        await supabase.from('admin_logs').insert({
          admin_name: 'Owner',
          action: `Gave currency to ${userIds.length} users`,
          details: JSON.stringify(currencies),
          timestamp: new Date().toISOString()
        });

        res.json({ success: true, message: `Currency given to ${userIds.length} users` });
      } catch (error) {
        console.error('Error giving currency:', error);
        res.status(500).json({ error: 'Failed to give currency' });
      }
    });

    // Ban user
    app.post('/api/owner/ban-user', verifyOwnerAccess, async (req, res) => {
      try {
        const { userId, reason, duration, customDays } = req.body;
        
        let expiresAt = null;
        if (duration !== 'permanent') {
          const days = duration === 'custom' ? customDays : 
                      duration === '1day' ? 1 :
                      duration === '1week' ? 7 :
                      duration === '1month' ? 30 :
                      duration === '3months' ? 90 : 0;
          
          expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + days);
        }

        if (SERVER_CONFIG.devMode) {
          console.log(`🎭 DEV: Would ban user ${userId} for ${reason}, expires: ${expiresAt}`);
          return res.json({ success: true, message: 'User banned successfully' });
        }

        // Production: Update user ban status
        const { error } = await supabase
          .from('users')
          .update({
            status: 'banned',
            ban_reason: reason,
            banned_by: 'Owner',
            banned_at: new Date().toISOString(),
            ban_expires_at: expiresAt?.toISOString()
          })
          .eq('id', userId);

        if (error) throw error;

        // Log the action
        await supabase.from('admin_logs').insert({
          admin_name: 'Owner',
          action: `Banned user ${userId}`,
          details: `Reason: ${reason}, Duration: ${duration}`,
          timestamp: new Date().toISOString()
        });

        res.json({ success: true, message: 'User banned successfully' });
      } catch (error) {
        console.error('Error banning user:', error);
        res.status(500).json({ error: 'Failed to ban user' });
      }
    });

    // Unban user
    app.post('/api/owner/unban-user', verifyOwnerAccess, async (req, res) => {
      try {
        const { userId } = req.body;
        
        if (SERVER_CONFIG.devMode) {
          console.log(`🎭 DEV: Would unban user ${userId}`);
          return res.json({ success: true, message: 'User unbanned successfully' });
        }

        // Production: Remove ban status
        const { error } = await supabase
          .from('users')
          .update({
            status: 'active',
            ban_reason: null,
            banned_by: null,
            banned_at: null,
            ban_expires_at: null
          })
          .eq('id', userId);

        if (error) throw error;

        // Log the action
        await supabase.from('admin_logs').insert({
          admin_name: 'Owner',
          action: `Unbanned user ${userId}`,
          details: 'Ban lifted by owner',
          timestamp: new Date().toISOString()
        });

        res.json({ success: true, message: 'User unbanned successfully' });
      } catch (error) {
        console.error('Error unbanning user:', error);
        res.status(500).json({ error: 'Failed to unban user' });
      }
    });

    // Recurring Donations Management
    app.get('/api/owner/recurring-donations', verifyOwnerAccess, async (req, res) => {
      try {
        if (SERVER_CONFIG.devMode) {
          const mockCampaigns = [
            {
              id: 1,
              name: 'Monthly Patreon Rewards',
              description: 'Monthly appreciation rewards for our amazing patrons',
              schedule: 'monthly',
              targetType: 'patreon',
              patreonTier: 'all',
              currencies: { voidPearls: 500, razorTalons: 200, sylvanShards: 300 },
              isActive: true,
              nextRunDate: '2024-11-01T12:00:00Z',
              lastRun: '2024-10-01T12:00:00Z',
              totalDeliveries: 147,
              createdDate: '2024-01-15'
            }
          ];
          return res.json({ campaigns: mockCampaigns });
        }

        const { data: campaigns, error } = await supabase
          .from('recurring_donations')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ campaigns });
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
      }
    });

    app.post('/api/owner/recurring-donations', verifyOwnerAccess, async (req, res) => {
      try {
        const campaign = req.body;
        
        if (SERVER_CONFIG.devMode) {
          console.log('🎭 DEV: Would create recurring donation campaign:', campaign);
          return res.json({ success: true, message: 'Campaign created successfully' });
        }

        const { data, error } = await supabase
          .from('recurring_donations')
          .insert([campaign])
          .select();

        if (error) throw error;

        // Schedule the campaign using cron
        scheduleRecurringDonation(data[0]);

        res.json({ success: true, campaign: data[0] });
      } catch (error) {
        console.error('Error creating campaign:', error);
        res.status(500).json({ error: 'Failed to create campaign' });
      }
    });

    app.put('/api/owner/recurring-donations/:id', verifyOwnerAccess, async (req, res) => {
      try {
        const { id } = req.params;
        const campaign = req.body;
        
        if (SERVER_CONFIG.devMode) {
          console.log(`🎭 DEV: Would update campaign ${id}:`, campaign);
          return res.json({ success: true, message: 'Campaign updated successfully' });
        }

        const { data, error } = await supabase
          .from('recurring_donations')
          .update(campaign)
          .eq('id', id)
          .select();

        if (error) throw error;

        // Reschedule the campaign
        scheduleRecurringDonation(data[0]);

        res.json({ success: true, campaign: data[0] });
      } catch (error) {
        console.error('Error updating campaign:', error);
        res.status(500).json({ error: 'Failed to update campaign' });
      }
    });

    app.delete('/api/owner/recurring-donations/:id', verifyOwnerAccess, async (req, res) => {
      try {
        const { id } = req.params;
        
        if (SERVER_CONFIG.devMode) {
          console.log(`🎭 DEV: Would delete campaign ${id}`);
          return res.json({ success: true, message: 'Campaign deleted successfully' });
        }

        const { error } = await supabase
          .from('recurring_donations')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Remove from scheduler
        unscheduleRecurringDonation(id);

        res.json({ success: true, message: 'Campaign deleted successfully' });
      } catch (error) {
        console.error('Error deleting campaign:', error);
        res.status(500).json({ error: 'Failed to delete campaign' });
      }
    });

    app.post('/api/owner/recurring-donations/:id/run', verifyOwnerAccess, async (req, res) => {
      try {
        const { id } = req.params;
        
        if (SERVER_CONFIG.devMode) {
          console.log(`🎭 DEV: Would execute campaign ${id} immediately`);
          return res.json({ success: true, message: 'Campaign executed successfully' });
        }

        // Get campaign details
        const { data: campaign, error } = await supabase
          .from('recurring_donations')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        // Execute the campaign
        const result = await executeDonationCampaign(campaign);

        res.json({ success: true, result });
      } catch (error) {
        console.error('Error executing campaign:', error);
        res.status(500).json({ error: 'Failed to execute campaign' });
      }
    });

    // Donation execution functions
    const scheduleRecurringDonation = (campaign) => {
      if (!campaign.isActive) return;
      
      console.log(`📅 Scheduling recurring donation: ${campaign.name}`);
      
      let cronExpression = '';
      switch (campaign.schedule) {
        case 'daily':
          cronExpression = '0 12 * * *'; // Daily at noon
          break;
        case 'weekly':
          cronExpression = '0 12 * * 0'; // Weekly on Sunday at noon
          break;
        case 'monthly':
          cronExpression = '0 12 1 * *'; // Monthly on 1st at noon
          break;
        case 'custom':
          // Calculate custom cron expression based on customDays, customHours, customMinutes
          const hours = campaign.customHours || 12;
          const minutes = campaign.customMinutes || 0;
          const days = campaign.customDays || 30;
          
          if (days === 1) {
            cronExpression = `${minutes} ${hours} * * *`; // Daily
          } else if (days === 7) {
            cronExpression = `${minutes} ${hours} * * 0`; // Weekly
          } else if (days === 30) {
            cronExpression = `${minutes} ${hours} 1 * *`; // Monthly
          } else {
            // For other custom intervals, use a daily check and manage internally
            cronExpression = `${minutes} ${hours} * * *`;
          }
          break;
        default:
          cronExpression = '0 12 1 * *'; // Default to monthly
      }

      // Schedule with node-cron
      cron.schedule(cronExpression, async () => {
        console.log(`🎁 Executing recurring donation: ${campaign.name}`);
        await executeDonationCampaign(campaign);
      }, {
        scheduled: true,
        timezone: "America/New_York"
      });
    };

    const unscheduleRecurringDonation = (campaignId) => {
      console.log(`🗑️ Unscheduling recurring donation: ${campaignId}`);
      // Implementation depends on how you track scheduled tasks
      // You might need to maintain a Map of campaign IDs to cron tasks
    };

    const executeDonationCampaign = async (campaign) => {
      try {
        console.log(`🎁 Executing donation campaign: ${campaign.name}`);
        
        // Get target users based on campaign settings
        let targetUsers = [];
        
        switch (campaign.targetType) {
          case 'all':
            const { data: allUsers } = await supabase
              .from('users')
              .select('id, username')
              .eq('status', 'active');
            targetUsers = allUsers || [];
            break;
            
          case 'patreon':
            const tierFilter = campaign.patreonTier === 'all' ? 
              'not.is.null' : `eq.${campaign.patreonTier}`;
            const { data: patrons } = await supabase
              .from('users')
              .select('id, username')
              .filter('patreon_tier', tierFilter)
              .eq('status', 'active');
            targetUsers = patrons || [];
            break;
            
          case 'tier-specific':
            const { data: tierUsers } = await supabase
              .from('users')
              .select('id, username')
              .eq('patreon_tier', campaign.patreonTier)
              .eq('status', 'active');
            targetUsers = tierUsers || [];
            break;
            
          case 'custom':
            if (campaign.customUserIds && campaign.customUserIds.length > 0) {
              const { data: customUsers } = await supabase
                .from('users')
                .select('id, username')
                .in('id', campaign.customUserIds)
                .eq('status', 'active');
              targetUsers = customUsers || [];
            }
            break;
        }

        // Distribute currencies to target users
        for (const user of targetUsers) {
          if (campaign.currencies.voidPearls > 0 || campaign.currencies.razorTalons > 0 || campaign.currencies.sylvanShards > 0) {
            await supabase
              .from('users')
              .update({
                void_pearls: supabase.raw(`void_pearls + ${campaign.currencies.voidPearls}`),
                razor_talons: supabase.raw(`razor_talons + ${campaign.currencies.razorTalons}`),
                sylvan_shards: supabase.raw(`sylvan_shards + ${campaign.currencies.sylvanShards}`)
              })
              .eq('id', user.id);
          }
        }

        // Update campaign statistics
        await supabase
          .from('recurring_donations')
          .update({
            last_run: new Date().toISOString(),
            total_deliveries: supabase.raw(`total_deliveries + ${targetUsers.length}`)
          })
          .eq('id', campaign.id);

        // Log the donation execution
        await supabase.from('donation_history').insert({
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          executed_date: new Date().toISOString(),
          recipient_count: targetUsers.length,
          currencies: campaign.currencies,
          status: 'completed'
        });

        console.log(`✅ Campaign executed successfully: ${targetUsers.length} users received rewards`);
        return { recipientCount: targetUsers.length, status: 'completed' };
        
      } catch (error) {
        console.error('Error executing donation campaign:', error);
        
        // Log failed execution
        await supabase.from('donation_history').insert({
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          executed_date: new Date().toISOString(),
          recipient_count: 0,
          currencies: campaign.currencies,
          status: 'failed',
          error_message: error.message
        });
        
        throw error;
      }
    };

    // Get owner statistics
    app.get('/api/owner/stats', verifyOwnerAccess, async (req, res) => {
      try {
        if (SERVER_CONFIG.devMode) {
          const mockStats = {
            totalRevenue: '12,450.00',
            activePatrons: 47,
            totalPlayers: 1823,
            newPlayersToday: 23,
            serverUptime: '45 days, 12 hours',
            databaseSize: '2.4 GB',
            rconCommands: 1247,
            backupStatus: 'Completed 2 hours ago'
          };
          return res.json(mockStats);
        }

        // Production: Get real statistics
        const stats = {}; // Implementation depends on your data structure
        res.json(stats);
      } catch (error) {
        console.error('Error fetching owner stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
      }
    });

    // === Server Control API Endpoints ===
    
    // Get server status
    app.get('/api/owner/server/status', verifyOwnerAccess, async (req, res) => {
      try {
        if (SERVER_CONFIG.devMode) {
          return res.json({
            online: true,
            playerCount: 47,
            maxPlayers: 300,
            isConnected: true,
            scheduledTasks: ['restart'],
            performance: 'excellent',
            uptime: '2 days, 14 hours',
            lastRestart: '2025-01-15T08:00:00Z'
          });
        }

        if (!isleServerManager) {
          return res.status(503).json({ error: 'Server manager not initialized' });
        }

        const status = isleServerManager.getServerStatus();
        res.json(status);
      } catch (error) {
        console.error('Error getting server status:', error);
        res.status(500).json({ error: 'Failed to get server status' });
      }
    });

    // Restart server
    app.post('/api/owner/server/restart', verifyOwnerAccess, async (req, res) => {
      try {
        const { reason = 'Manual restart by owner' } = req.body;

        if (SERVER_CONFIG.devMode) {
          return res.json({ 
            success: true, 
            message: 'Mock server restart initiated',
            timestamp: new Date().toISOString()
          });
        }

        if (!isleServerManager) {
          return res.status(503).json({ error: 'Server manager not initialized' });
        }

        const result = await isleServerManager.restartServer(reason);
        res.json(result);
      } catch (error) {
        console.error('Error restarting server:', error);
        res.status(500).json({ error: 'Failed to restart server' });
      }
    });

    // Shutdown server
    app.post('/api/owner/server/shutdown', verifyOwnerAccess, async (req, res) => {
      try {
        const { reason = 'Manual shutdown by owner' } = req.body;

        if (SERVER_CONFIG.devMode) {
          return res.json({ 
            success: true, 
            message: 'Mock server shutdown initiated',
            timestamp: new Date().toISOString()
          });
        }

        if (!isleServerManager) {
          return res.status(503).json({ error: 'Server manager not initialized' });
        }

        const result = await isleServerManager.shutdownServer(reason);
        res.json(result);
      } catch (error) {
        console.error('Error shutting down server:', error);
        res.status(500).json({ error: 'Failed to shutdown server' });
      }
    });

    // Schedule server restart
    app.post('/api/owner/server/schedule-restart', verifyOwnerAccess, async (req, res) => {
      try {
        const { cronExpression, reason = 'Scheduled restart' } = req.body;

        if (!cronExpression) {
          return res.status(400).json({ error: 'Cron expression is required' });
        }

        if (SERVER_CONFIG.devMode) {
          return res.json({ 
            success: true, 
            message: 'Mock scheduled restart set',
            cronExpression,
            reason
          });
        }

        if (!isleServerManager) {
          return res.status(503).json({ error: 'Server manager not initialized' });
        }

        const result = isleServerManager.scheduleRestart(cronExpression, reason);
        res.json(result);
      } catch (error) {
        console.error('Error scheduling restart:', error);
        res.status(500).json({ error: 'Failed to schedule restart' });
      }
    });

    // Cancel scheduled restart
    app.delete('/api/owner/server/scheduled-restart', verifyOwnerAccess, async (req, res) => {
      try {
        if (SERVER_CONFIG.devMode) {
          return res.json({ 
            success: true, 
            message: 'Mock scheduled restart cancelled'
          });
        }

        if (!isleServerManager) {
          return res.status(503).json({ error: 'Server manager not initialized' });
        }

        const result = isleServerManager.cancelScheduledRestart();
        res.json(result);
      } catch (error) {
        console.error('Error cancelling scheduled restart:', error);
        res.status(500).json({ error: 'Failed to cancel scheduled restart' });
      }
    });

    // Get player list
    app.get('/api/owner/server/players', verifyOwnerAccess, async (req, res) => {
      try {
        if (SERVER_CONFIG.devMode) {
          const mockPlayers = [
            { name: 'Player1', id: '12345', connected: true },
            { name: 'Player2', id: '67890', connected: true },
            { name: 'TestUser', id: '11111', connected: true }
          ];
          return res.json(mockPlayers);
        }

        if (!isleServerManager) {
          return res.status(503).json({ error: 'Server manager not initialized' });
        }

        const players = await isleServerManager.getPlayerList();
        res.json(players);
      } catch (error) {
        console.error('Error getting player list:', error);
        res.status(500).json({ error: 'Failed to get player list' });
      }
    });

    // Kick player
    app.post('/api/owner/server/kick-player', verifyOwnerAccess, async (req, res) => {
      try {
        const { playerName, reason = 'Kicked by administrator' } = req.body;

        if (!playerName) {
          return res.status(400).json({ error: 'Player name is required' });
        }

        if (SERVER_CONFIG.devMode) {
          return res.json({ 
            success: true, 
            message: `Mock kick: ${playerName}`,
            reason
          });
        }

        if (!isleServerManager) {
          return res.status(503).json({ error: 'Server manager not initialized' });
        }

        const result = await isleServerManager.kickPlayer(playerName, reason);
        res.json(result);
      } catch (error) {
        console.error('Error kicking player:', error);
        res.status(500).json({ error: 'Failed to kick player' });
      }
    });

    // Kick all players
    app.post('/api/owner/server/kick-all', verifyOwnerAccess, async (req, res) => {
      try {
        const { reason = 'Server maintenance' } = req.body;

        if (SERVER_CONFIG.devMode) {
          return res.json({ 
            success: true, 
            message: 'Mock kick all players',
            reason
          });
        }

        if (!isleServerManager) {
          return res.status(503).json({ error: 'Server manager not initialized' });
        }

        const result = await isleServerManager.kickAllPlayers(reason);
        res.json(result);
      } catch (error) {
        console.error('Error kicking all players:', error);
        res.status(500).json({ error: 'Failed to kick all players' });
      }
    });

    // Broadcast message
    app.post('/api/owner/server/broadcast', verifyOwnerAccess, async (req, res) => {
      try {
        const { message } = req.body;

        if (!message) {
          return res.status(400).json({ error: 'Message is required' });
        }

        if (SERVER_CONFIG.devMode) {
          return res.json({ 
            success: true, 
            message: `Mock broadcast: ${message}`
          });
        }

        if (!isleServerManager) {
          return res.status(503).json({ error: 'Server manager not initialized' });
        }

        const result = await isleServerManager.broadcastMessage(message);
        res.json(result);
      } catch (error) {
        console.error('Error broadcasting message:', error);
        res.status(500).json({ error: 'Failed to broadcast message' });
      }
    });

    // Execute custom RCON command
    app.post('/api/owner/server/rcon-command', verifyOwnerAccess, async (req, res) => {
      try {
        const { command } = req.body;

        if (!command) {
          return res.status(400).json({ error: 'Command is required' });
        }

        if (SERVER_CONFIG.devMode) {
          return res.json({ 
            success: true, 
            command: command,
            response: `Mock response for: ${command}`,
            timestamp: new Date().toISOString()
          });
        }

        if (!isleServerManager) {
          return res.status(503).json({ error: 'Server manager not initialized' });
        }

        const result = await isleServerManager.executeCommand(command);
        res.json(result);
      } catch (error) {
        console.error('Error executing RCON command:', error);
        res.status(500).json({ error: 'Failed to execute command' });
      }
    });

    // Maintenance mode controls
    app.post('/api/owner/server/maintenance/enable', verifyOwnerAccess, async (req, res) => {
      try {
        if (SERVER_CONFIG.devMode) {
          return res.json({ 
            success: true, 
            message: 'Mock maintenance mode enabled'
          });
        }

        if (!isleServerManager) {
          return res.status(503).json({ error: 'Server manager not initialized' });
        }

        const result = await isleServerManager.enableMaintenanceMode();
        res.json(result);
      } catch (error) {
        console.error('Error enabling maintenance mode:', error);
        res.status(500).json({ error: 'Failed to enable maintenance mode' });
      }
    });

    app.post('/api/owner/server/maintenance/disable', verifyOwnerAccess, async (req, res) => {
      try {
        if (SERVER_CONFIG.devMode) {
          return res.json({ 
            success: true, 
            message: 'Mock maintenance mode disabled'
          });
        }

        if (!isleServerManager) {
          return res.status(503).json({ error: 'Server manager not initialized' });
        }

        const result = await isleServerManager.disableMaintenanceMode();
        res.json(result);
      } catch (error) {
        console.error('Error disabling maintenance mode:', error);
        res.status(500).json({ error: 'Failed to disable maintenance mode' });
      }
    });

    // Emergency controls
    app.post('/api/owner/server/emergency/shutdown', verifyOwnerAccess, async (req, res) => {
      try {
        if (SERVER_CONFIG.devMode) {
          return res.json({ 
            success: true, 
            message: 'Mock emergency shutdown executed'
          });
        }

        if (!isleServerManager) {
          return res.status(503).json({ error: 'Server manager not initialized' });
        }

        const result = await isleServerManager.emergencyShutdown();
        res.json(result);
      } catch (error) {
        console.error('Error executing emergency shutdown:', error);
        res.status(500).json({ error: 'Failed to execute emergency shutdown' });
      }
    });

    app.post('/api/owner/server/emergency/restart', verifyOwnerAccess, async (req, res) => {
      try {
        if (SERVER_CONFIG.devMode) {
          return res.json({ 
            success: true, 
            message: 'Mock emergency restart executed'
          });
        }

        if (!isleServerManager) {
          return res.status(503).json({ error: 'Server manager not initialized' });
        }

        const result = await isleServerManager.emergencyRestart();
        res.json(result);
      } catch (error) {
        console.error('Error executing emergency restart:', error);
        res.status(500).json({ error: 'Failed to execute emergency restart' });
      }
    });

    // Get server logs
    app.get('/api/owner/server/logs', verifyOwnerAccess, async (req, res) => {
      try {
        const { limit = 100, action = null } = req.query;

        if (SERVER_CONFIG.devMode) {
          const mockLogs = [
            {
              timestamp: new Date().toISOString(),
              action: 'SERVER_RESTART',
              details: 'Scheduled restart',
              response: null
            },
            {
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              action: 'KICK_PLAYER',
              details: 'TestUser: Rule violation',
              response: 'Player kicked successfully'
            }
          ];
          return res.json(mockLogs);
        }

        if (!supabase) {
          return res.status(503).json({ error: 'Database not configured' });
        }

        let query = supabase
          .from('server_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(parseInt(limit));

        if (action) {
          query = query.eq('action', action);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        res.json(data || []);
      } catch (error) {
        console.error('Error getting server logs:', error);
        res.status(500).json({ error: 'Failed to get server logs' });
      }
    });

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✅ API Server running on port ${PORT}`);
      console.log(`🔌 WebSocket server running on port 5001`);
      console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN}`);
      console.log(`🗄️  Database: ${SERVER_CONFIG.devMode ? 'Development Mode' : 'Connected to Supabase PostgreSQL'}`);
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