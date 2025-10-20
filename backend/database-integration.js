// Database Integration Setup for Ashveil Backend
// Supabase PostgreSQL Integration

const { Pool } = require('pg');

// Database configuration - Supabase PostgreSQL
const dbConfig = {
  connectionString: 'postgresql://postgres:CookieMonster420@db.hvwrygdzgnasurtfofyv.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false  // Required for Supabase
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
let dbPool;

try {
  dbPool = new Pool(dbConfig);
  console.log('✅ Supabase PostgreSQL connection pool created');
} catch (error) {
  console.error('❌ Database connection failed:', error);
}

// Test database connection
async function testDatabaseConnection() {
  try {
    const client = await dbPool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Supabase database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

// Initialize database tables
async function initializeDatabaseTables() {
  try {
    // Create players table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS players (
        steam_id VARCHAR(20) PRIMARY KEY,
        player_name VARCHAR(50) NOT NULL,
        first_join TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_playtime INTEGER DEFAULT 0,
        current_dinosaur VARCHAR(30),
        favorite_dinosaur VARCHAR(30),
        growth_points INTEGER DEFAULT 0,
        is_admin BOOLEAN DEFAULT FALSE,
        is_banned BOOLEAN DEFAULT FALSE
      )
    `);

    // Create player statistics table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS player_stats (
        steam_id VARCHAR(20) PRIMARY KEY,
        kills_as_carnivore INTEGER DEFAULT 0,
        kills_as_herbivore INTEGER DEFAULT 0,
        deaths INTEGER DEFAULT 0,
        successful_hunts INTEGER DEFAULT 0,
        distance_traveled REAL DEFAULT 0,
        time_as_adult INTEGER DEFAULT 0,
        nests_created INTEGER DEFAULT 0,
        eggs_hatched INTEGER DEFAULT 0,
        FOREIGN KEY (steam_id) REFERENCES players(steam_id)
      )
    `);

    // Create server events table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS server_events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(20) CHECK (event_type IN ('join', 'leave', 'death', 'kill', 'growth', 'nest', 'chat')) NOT NULL,
        steam_id VARCHAR(20),
        target_steam_id VARCHAR(20),
        dinosaur_species VARCHAR(30),
        location_x REAL,
        location_y REAL,
        location_z REAL,
        description TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (steam_id) REFERENCES players(steam_id)
      )
    `);
    
    // Create indexes separately for PostgreSQL
    await dbPool.query(`CREATE INDEX IF NOT EXISTS idx_timestamp ON server_events(timestamp)`);
    await dbPool.query(`CREATE INDEX IF NOT EXISTS idx_event_type ON server_events(event_type)`);

    // Create currency table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS player_currency (
        steam_id VARCHAR(20) PRIMARY KEY,
        void_pearls INTEGER DEFAULT 0,
        razor_talons INTEGER DEFAULT 0,
        leaf_tokens INTEGER DEFAULT 0,
        last_daily_bonus DATE,
        total_earned INTEGER DEFAULT 0,
        total_spent INTEGER DEFAULT 0,
        FOREIGN KEY (steam_id) REFERENCES players(steam_id)
      )
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database table initialization failed:', error);
  }
}

// API Routes for database integration

// Get player statistics  
async function getTopPlayers(req, res) {
  try {
    const result = await dbPool.query(`
      SELECT 
        p.player_name,
        p.total_playtime,
        p.favorite_dinosaur,
        p.last_seen,
        ps.kills_as_carnivore,
        ps.deaths,
        pc.void_pearls
      FROM players p
      LEFT JOIN player_stats ps ON p.steam_id = ps.steam_id
      LEFT JOIN player_currency pc ON p.steam_id = pc.steam_id
      ORDER BY p.total_playtime DESC
      LIMIT 10
    `);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Database query failed:', error);
    res.json({ success: false, error: error.message });
  }
}

// Get recent server events
async function getRecentEvents(req, res) {
  try {
    const result = await dbPool.query(`
      SELECT 
        se.event_type,
        p.player_name,
        se.dinosaur_species,
        se.description,
        se.timestamp
      FROM server_events se
      LEFT JOIN players p ON se.steam_id = p.steam_id
      ORDER BY se.timestamp DESC
      LIMIT 20
    `);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Database query failed:', error);
    res.json({ success: false, error: error.message });
  }
}

// Add player data (called when player joins)
async function updatePlayerData(req, res) {
  try {
    const { steamId, playerName, dinosaur, playtime } = req.body;
    
    await dbPool.query(`
      INSERT INTO players (steam_id, player_name, current_dinosaur, total_playtime)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (steam_id) DO UPDATE SET
      player_name = EXCLUDED.player_name,
      current_dinosaur = EXCLUDED.current_dinosaur,
      total_playtime = players.total_playtime + EXCLUDED.total_playtime,
      last_seen = CURRENT_TIMESTAMP
    `, [steamId, playerName, dinosaur, playtime]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Database update failed:', error);
    res.json({ success: false, error: error.message });
  }
}

// Record server event
async function addServerEvent(req, res) {
  try {
    const { eventType, steamId, targetSteamId, dinosaur, location, description } = req.body;
    
    await dbPool.query(`
      INSERT INTO server_events (event_type, steam_id, target_steam_id, dinosaur_species, location_x, location_y, location_z, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [eventType, steamId, targetSteamId, dinosaur, location?.x, location?.y, location?.z, description]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Database insert failed:', error);
    res.json({ success: false, error: error.message });
  }
}

// Initialize database on server start
async function initializeDatabase() {
  const isConnected = await testDatabaseConnection();
  if (isConnected) {
    await initializeDatabaseTables();
  }
}

// Call this when your server starts
initializeDatabase();

// Export for use in other files
module.exports = { 
  dbPool, 
  testDatabaseConnection, 
  initializeDatabaseTables,
  getTopPlayers,
  getRecentEvents,
  updatePlayerData,
  addServerEvent
};