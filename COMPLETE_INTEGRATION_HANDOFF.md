# 🎯 COMPLETE ASHVEIL INTEGRATION HANDOFF

## 📋 PROJECT OVERVIEW

**Live Website:** https://ashveil.live  
**Project Status:** Ready for complete server integration  
**Last Updated:** October 21, 2025

This document provides complete technical specifications for integrating the Ashveil gaming website with The Isle server, including Patreon membership system, Steam authentication, dinosaur shop, and RCON delivery system.

---

## 🎮 SYSTEM CONCEPT

**Core Flow:**
1. Users authenticate via Steam OAuth
2. Patreon members receive monthly Void Pearls via webhooks
3. Users purchase dinosaurs in the website shop using Void Pearls
4. RCON system automatically delivers dinosaurs to players in-game
5. Real-time player tracking and server status monitoring

---

## ✅ COMPLETED FEATURES

### Infrastructure
- ✅ **Website deployed** on Netlify Pro
- ✅ **Custom domain** (ashveil.live) configured
- ✅ **Node.js backend** with Express server
- ✅ **Supabase database** connected
- ✅ **Basic RCON connection** to Isle server (45.45.238.134:16007)
- ✅ **WebSocket system** for real-time updates

### Components & UI
- ✅ **Complete React frontend** with routing
- ✅ **Responsive design** for all devices
- ✅ **Enhanced dinosaur shop** with filtering and search
- ✅ **Currency system** with Void Pearls
- ✅ **Admin panels** for server management
- ✅ **Server status monitoring** dashboard

### 🎯 **CURRENT SERVER CONFIGURATION:**
```
Server IP: 45.45.238.134
Game Port: 7777 (The Isle server)
RCON Port: 16007  
RCON Password: CookieMonster420
Website: https://ashveil.live
Backend Ports: 5000 (API), 5001 (WebSocket)
```

---

## 🎯 READY FOR INTEGRATION

### 📄 KEY FILES CREATED

#### 1. **Database Schema** (`backend/database-schema.sql`)
Complete PostgreSQL schema with:
- **Users table** with Steam & Patreon integration
- **Dinosaur species catalog** with pricing and stats
- **Player dinosaur inventory** system
- **Shop transactions** with delivery tracking
- **RCON command logging** for debugging
- **Patreon membership tiers** and grants
- **Server player tracking** for real-time status
- **Analytics and statistics** tables

#### 2. **Enhanced RCON System** (`backend/ashveil-rcon.js`)
Production-ready RCON integration with:
- **Auto-reconnection** with exponential backoff
- **Command queue** system for reliability
- **Dinosaur delivery** methods with confirmation
- **Player management** utilities (kick, ban, teleport)
- **Health monitoring** and statistics
- **Database logging** for all commands
- **WebSocket integration** for real-time updates

#### 3. **Void Pearl Shop** (`src/components/VoidPearlShop.jsx`)
Complete shop interface with:
- **Advanced filtering** by category, rarity, search
- **Purchase confirmation** modals
- **Real-time currency** balance updates
- **Membership status** integration
- **Purchase history** tracking
- **Responsive design** for all devices
- **Error handling** and user feedback

---

## 🔑 ENVIRONMENT VARIABLES NEEDED

### Steam Authentication
```env
STEAM_API_KEY=your_steam_api_key_here
# Get from: https://steamcommunity.com/dev/apikey
```

### Patreon Integration
```env
PATREON_CLIENT_ID=your_patreon_client_id
PATREON_CLIENT_SECRET=your_patreon_client_secret
PATREON_WEBHOOK_SECRET=your_webhook_secret
# Get from: https://www.patreon.com/portal/registration/register-clients
```

### Database (Already configured)
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Server Configuration (Already configured)
```env
SERVER_IP=45.45.238.134
RCON_PORT=16007
RCON_PASSWORD=CookieMonster420
API_PORT=5000
```

---

## 🚀 MISSING API ENDPOINTS

### 1. Steam Authentication
```javascript
// POST /api/auth/steam/callback
// GET /api/auth/steam/return
// POST /api/auth/logout
```

### 2. User Profile Management
```javascript
// GET /api/user/profile
// PUT /api/user/profile
// GET /api/user/currencies
```

### 3. Shop & Purchases
```javascript
// POST /api/shop/purchase
// GET /api/shop/history
// GET /api/shop/dinosaurs
```

### 4. Patreon Integration
```javascript
// POST /api/patreon/webhook
// GET /api/patreon/status
// POST /api/patreon/link
```

---

## 🗄️ DATABASE SETUP INSTRUCTIONS

### 1. Create Database Tables
```bash
# Run the complete schema
psql -h your-supabase-host -U postgres -d postgres -f backend/database-schema.sql
```

### 2. Insert Initial Data
The schema includes:
- **Default Patreon tiers** (Supporter, Champion, Legend)
- **17 dinosaur species** with proper pricing
- **Utility functions** for currency management
- **Views** for common queries
- **Indexes** for performance

### 3. Test Database Connection
```bash
# Test from backend directory
node -e "
const { testDatabaseConnection } = require('./database-integration');
testDatabaseConnection().then(console.log);
"
```
  current_dinosaur VARCHAR(30),
  current_location VARCHAR(50),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Dinosaur species and pricing
CREATE TABLE dinosaur_species (
  id SERIAL PRIMARY KEY,
  name VARCHAR(30) UNIQUE NOT NULL,
  display_name VARCHAR(50),
  category VARCHAR(20), -- carnivore, herbivore, piscivore
  tier VARCHAR(10), -- juvenile, sub-adult, adult
  base_price INTEGER, -- VP cost
  razor_talon_price INTEGER,
  sylvan_shard_price INTEGER,
  growth_time INTEGER, -- minutes to full growth
  max_health INTEGER,
  max_stamina INTEGER,
  speed INTEGER,
  damage INTEGER,
  description TEXT,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Player dinosaur ownership
CREATE TABLE player_dinosaurs (
  id SERIAL PRIMARY KEY,
  steam_id VARCHAR(20) REFERENCES players(steam_id) ON DELETE CASCADE,
  species_id INTEGER REFERENCES dinosaur_species(id),
  custom_name VARCHAR(50),
  
  -- Growth and stats
  growth_percentage INTEGER DEFAULT 0,
  current_health INTEGER,
  current_stamina INTEGER,
  
  -- Mutations and customization
  mutations TEXT[], -- Array of mutation names
  skin_name VARCHAR(30),
  color_primary VARCHAR(7), -- Hex color
  color_secondary VARCHAR(7),
  
  -- Status
  is_active BOOLEAN DEFAULT FALSE, -- Currently playing as this dino
  location VARCHAR(50),
  last_played TIMESTAMP,
  
  -- Metadata
  acquired_at TIMESTAMP DEFAULT NOW(),
  total_playtime INTEGER DEFAULT 0
);

-- Real-time server data
CREATE TABLE server_sessions (
  id SERIAL PRIMARY KEY,
  steam_id VARCHAR(20) REFERENCES players(steam_id),
  dinosaur_id INTEGER REFERENCES player_dinosaurs(id),
  
  -- Session data
  session_start TIMESTAMP DEFAULT NOW(),
  session_end TIMESTAMP,
  location VARCHAR(50),
  coordinates_x FLOAT,
  coordinates_y FLOAT,
  coordinates_z FLOAT,
  
  -- Session stats
  kills_this_session INTEGER DEFAULT 0,
  damage_dealt INTEGER DEFAULT 0,
  damage_taken INTEGER DEFAULT 0,
  distance_traveled FLOAT DEFAULT 0,
  
  is_active BOOLEAN DEFAULT TRUE
);

-- Market system
CREATE TABLE market_listings (
  id SERIAL PRIMARY KEY,
  seller_steam_id VARCHAR(20) REFERENCES players(steam_id),
  dinosaur_id INTEGER REFERENCES player_dinosaurs(id),
  
  -- Pricing
  price INTEGER NOT NULL,
  currency VARCHAR(20) NOT NULL, -- 'razor_talons', 'sylvan_shards', 'void_pearls'
  
  -- Listing details
  title VARCHAR(100),
  description TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  buyer_steam_id VARCHAR(20) REFERENCES players(steam_id),
  
  -- Timestamps
  listed_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  sold_at TIMESTAMP
);

-- Friends and pack system
CREATE TABLE player_friends (
  id SERIAL PRIMARY KEY,
  player_steam_id VARCHAR(20) REFERENCES players(steam_id),
  friend_steam_id VARCHAR(20) REFERENCES players(steam_id),
  
  -- Relationship status
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
  pack_name VARCHAR(50),
  pack_role VARCHAR(20), -- leader, member
  
  -- Timestamps
  requested_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  
  UNIQUE(player_steam_id, friend_steam_id)
);

-- Transaction history
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  player_steam_id VARCHAR(20) REFERENCES players(steam_id),
  
  -- Transaction details
  type VARCHAR(30), -- purchase, sale, teleport, admin_service
  amount INTEGER,
  currency VARCHAR(20),
  
  -- Related items
  dinosaur_id INTEGER REFERENCES player_dinosaurs(id),
  market_listing_id INTEGER REFERENCES market_listings(id),
  
  -- Metadata
  description TEXT,
  admin_steam_id VARCHAR(20), -- If admin transaction
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admin logs
CREATE TABLE admin_logs (
  id SERIAL PRIMARY KEY,
  admin_steam_id VARCHAR(20) REFERENCES players(steam_id),
  target_steam_id VARCHAR(20) REFERENCES players(steam_id),
  
  -- Command details
  command VARCHAR(100),
  parameters TEXT,
  result TEXT,
  
  -- Service info (for revenue tracking)
  service_type VARCHAR(30), -- teleport, slay, give_dino, growth_boost
  price_charged INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Server events and notifications
CREATE TABLE server_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(30), -- player_join, player_leave, kill, death, purchase
  player_steam_id VARCHAR(20) REFERENCES players(steam_id),
  target_steam_id VARCHAR(20) REFERENCES players(steam_id),
  
  -- Event data
  location VARCHAR(50),
  dinosaur_species VARCHAR(30),
  details JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 **COMPLETE RCON COMMAND SYSTEM**

### **Essential RCON Commands for Revenue:**
```javascript
// File: backend/rcon-commands.js
class IsleRCONCommands {
  constructor(rconClient) {
    this.rcon = rconClient;
  }

  // Dinosaur management
  async giveDinosaur(steamId, species, mutations = []) {
    const mutationStr = mutations.length > 0 ? mutations.join(',') : '';
    const command = `give ${steamId} ${species} ${mutationStr}`;
    return await this.executeCommand(command);
  }

  async slayDinosaur(steamId) {
    return await this.executeCommand(`slay ${steamId}`);
  }

  async setGrowth(steamId, percentage) {
    return await this.executeCommand(`setgrowth ${steamId} ${percentage}`);
  }

  // Teleportation services
  async teleportPlayer(fromSteamId, toSteamId) {
    return await this.executeCommand(`teleport ${fromSteamId} ${toSteamId}`);
  }

  async teleportToLocation(steamId, x, y, z) {
    return await this.executeCommand(`teleportto ${steamId} ${x} ${y} ${z}`);
  }

  // Player management
  async kickPlayer(steamId, reason) {
    return await this.executeCommand(`kick ${steamId} "${reason}"`);
  }

  async banPlayer(steamId, duration, reason) {
    return await this.executeCommand(`ban ${steamId} ${duration} "${reason}"`);
  }

  // Information commands
  async getPlayerInfo(steamId) {
    return await this.executeCommand(`playerinfo ${steamId}`);
  }

  async listOnlinePlayers() {
    return await this.executeCommand(`list`);
  }

  async getServerInfo() {
    return await this.executeCommand(`info`);
  }

  // Currency management
  async addCurrency(steamId, currency, amount) {
    // Custom command - may need server mod
    return await this.executeCommand(`addcurrency ${steamId} ${currency} ${amount}`);
  }

  async deductCurrency(steamId, currency, amount) {
    return await this.executeCommand(`deductcurrency ${steamId} ${currency} ${amount}`);
  }

  // Utility
  async executeCommand(command) {
    try {
      console.log(`Executing RCON: ${command}`);
      return new Promise((resolve, reject) => {
        this.rcon.send(command);
        
        const timeout = setTimeout(() => {
          reject(new Error('RCON command timeout'));
        }, 10000);

        this.rcon.once('response', (response) => {
          clearTimeout(timeout);
          resolve({
            success: true,
            command: command,
            response: response,
            timestamp: new Date().toISOString()
          });
        });

        this.rcon.once('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
    } catch (error) {
      return {
        success: false,
        command: command,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = IsleRCONCommands;
```

---

## 🔐 **STEAM AUTHENTICATION SYSTEM**

### **Complete Steam Integration:**
```javascript
// File: backend/steam-auth.js
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

passport.use(new SteamStrategy({
  returnURL: `${process.env.WEBSITE_URL}/auth/steam/return`,
  realm: process.env.WEBSITE_URL,
  apiKey: process.env.STEAM_API_KEY
}, async (identifier, profile, done) => {
  try {
    const steamId = identifier.split('/').pop();
    
    // Update or create player in database
    const { data: player, error } = await supabase
      .from('players')
      .upsert({
        steam_id: steamId,
        username: profile.displayName,
        avatar_url: profile.photos[2].value, // Full size avatar
        last_seen: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return done(null, player);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.steam_id);
});

passport.deserializeUser(async (steamId, done) => {
  try {
    const { data: player, error } = await supabase
      .from('players')
      .select('*')
      .eq('steam_id', steamId)
      .single();

    if (error) throw error;
    done(null, player);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
```

---

## 💰 **REVENUE SYSTEM IMPLEMENTATION**

### **Payment Processing Integration:**
```javascript
// File: backend/payment-system.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentSystem {
  // Create payment intent for dinosaur purchase
  async createDinosaurPurchase(steamId, species, mutations, priceUSD) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: priceUSD * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        steamId: steamId,
        species: species,
        mutations: JSON.stringify(mutations),
        type: 'dinosaur_purchase'
      }
    });

    return paymentIntent;
  }

  // Process completed payment
  async processPayment(paymentIntent) {
    const { steamId, species, mutations } = paymentIntent.metadata;
    
    // Execute RCON command to give dinosaur
    const result = await rconCommands.giveDinosaur(
      steamId, 
      species, 
      JSON.parse(mutations)
    );

    // Record transaction in database
    await supabase.from('transactions').insert({
      player_steam_id: steamId,
      type: 'dinosaur_purchase',
      amount: paymentIntent.amount / 100,
      currency: 'USD',
      description: `Purchased ${species} with mutations: ${mutations}`
    });

    return result;
  }

  // Teleport service payment
  async createTeleportService(steamId, targetLocation, priceUSD = 5) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: priceUSD * 100,
      currency: 'usd',
      metadata: {
        steamId: steamId,
        targetLocation: targetLocation,
        type: 'teleport_service'
      }
    });

    return paymentIntent;
  }
}

module.exports = PaymentSystem;
```

---

## 🗺️ **REAL-TIME PLAYER TRACKING**

### **Live Map Integration:**
```javascript
// File: backend/player-tracking.js
class PlayerTracker {
  constructor(rconClient, supabase) {
    this.rcon = rconClient;
    this.db = supabase;
    this.trackingInterval = null;
  }

  startTracking() {
    // Track players every 30 seconds
    this.trackingInterval = setInterval(async () => {
      await this.updatePlayerPositions();
    }, 30000);
  }

  async updatePlayerPositions() {
    try {
      // Get online players from RCON
      const playersResponse = await this.rcon.executeCommand('list');
      const players = this.parsePlayerList(playersResponse.response);

      for (const player of players) {
        // Get detailed player info
        const infoResponse = await this.rcon.executeCommand(`playerinfo ${player.steamId}`);
        const playerData = this.parsePlayerInfo(infoResponse.response);

        // Update database
        await this.db.from('server_sessions').upsert({
          steam_id: player.steamId,
          location: playerData.location,
          coordinates_x: playerData.x,
          coordinates_y: playerData.y,
          coordinates_z: playerData.z,
          is_active: true
        });

        // Update player status
        await this.db.from('players').update({
          is_online: true,
          current_dinosaur: playerData.species,
          current_location: playerData.location,
          last_seen: new Date().toISOString()
        }).eq('steam_id', player.steamId);
      }

      // Mark offline players
      await this.markOfflinePlayers(players.map(p => p.steamId));

    } catch (error) {
      console.error('Player tracking error:', error);
    }
  }

  parsePlayerList(response) {
    // Parse RCON response to extract player data
    const players = [];
    const lines = response.split('\n');
    
    for (const line of lines) {
      const match = line.match(/(\d+)\.\s+(.+?)\s+\((\d+)\)/);
      if (match) {
        players.push({
          id: match[1],
          name: match[2],
          steamId: match[3]
        });
      }
    }
    
    return players;
  }

  parsePlayerInfo(response) {
    // Parse detailed player information
    const data = {};
    const lines = response.split('\n');
    
    for (const line of lines) {
      if (line.includes('Species:')) {
        data.species = line.split('Species:')[1].trim();
      }
      if (line.includes('Location:')) {
        data.location = line.split('Location:')[1].trim();
      }
      if (line.includes('Position:')) {
        const coords = line.split('Position:')[1].trim().split(',');
        data.x = parseFloat(coords[0]);
        data.y = parseFloat(coords[1]);
        data.z = parseFloat(coords[2]);
      }
    }
    
    return data;
  }

  async markOfflinePlayers(onlinePlayerIds) {
    await this.db.from('players')
      .update({ is_online: false })
      .not('steam_id', 'in', `(${onlinePlayerIds.join(',')})`);
  }
}

module.exports = PlayerTracker;
```

---

## 🎮 **FRONTEND COMPONENTS NEEDED**

### **Key React Components to Build/Enhance:**
1. **SteamLogin.jsx** - Steam OAuth login button
2. **PlayerProfile.jsx** - User profile with Steam data, stats, currencies
3. **DinosaurShop.jsx** - Purchase dinosaurs with real money/VP
4. **LiveMap.jsx** - Real-time player positions and interactions
5. **AdminPanel.jsx** - RCON command interface for admins
6. **MarketPlace.jsx** - Player-to-player trading system
7. **TeleportService.jsx** - Paid teleportation services
8. **FriendsSystem.jsx** - Add friends, see status, join packs
9. **PaymentModal.jsx** - Stripe payment processing
10. **NotificationSystem.jsx** - Real-time alerts and updates

---

## 🔧 **ENVIRONMENT VARIABLES NEEDED**

### **Complete .env Configuration:**
```env
# Server Configuration
SERVER_IP=45.45.238.134
GAME_PORT=7777
RCON_PORT=16007
RCON_PASSWORD=CookieMonster420
QUEUE_PORT=16008
SERVER_NAME=Ashveil - 3X growth - low rules - website
MAX_PLAYERS=300

# API Configuration
API_PORT=5000
WEBSOCKET_PORT=5001
CORS_ORIGIN=https://ashveil.live
WEBSITE_URL=https://ashveil.live

# Database
SUPABASE_URL=https://hvwrygdzgnasurtfofyv.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Steam Authentication
STEAM_API_KEY=your_steam_api_key_here

# Payment Processing
STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key

# Session Management
SESSION_SECRET=ashveil_session_secret_2025
JWT_SECRET=ashveil_jwt_secret_2025

# Discord Integration (Optional)
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# Update Intervals (milliseconds)
SERVER_QUERY_INTERVAL=30000
PLAYER_LIST_INTERVAL=60000
MARKET_UPDATE_INTERVAL=120000
```

---

## 📦 **REQUIRED NPM PACKAGES**

### **Backend Dependencies:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "ws": "^8.14.2",
    "rcon": "^1.0.3",
    "gamedig": "^4.1.0",
    "@supabase/supabase-js": "^2.38.0",
    "passport": "^0.6.0",
    "passport-steam": "^1.0.17",
    "express-session": "^1.17.3",
    "stripe": "^13.11.0",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "node-cron": "^3.0.3",
    "dotenv": "^16.3.1"
  }
}
```

### **Frontend Dependencies:**
```json
{
  "dependencies": {
    "@stripe/stripe-js": "^2.1.11",
    "@stripe/react-stripe-js": "^2.4.0",
    "axios": "^1.6.0",
    "socket.io-client": "^4.7.4",
    "react-router-dom": "^6.17.0",
    "react-query": "^3.39.3"
  }
}
```

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Pre-Launch Requirements:**
- [ ] Steam Web API Key obtained
- [ ] Stripe account configured  
- [ ] All database tables created
- [ ] Environment variables set
- [ ] RCON connection tested
- [ ] Payment system tested
- [ ] SSL certificate provisioned
- [ ] Domain DNS fully propagated

### **Launch Day Tasks:**
- [ ] Start backend server
- [ ] Enable player tracking
- [ ] Test all RCON commands
---

## 🎮 RCON INTEGRATION USAGE

### Initialize RCON System
```javascript
const { initializeRCON } = require('./ashveil-rcon');

const rcon = initializeRCON({
    ip: '45.45.238.134',
    port: 16007,
    password: 'CookieMonster420',
    autoReconnect: true,
    commandQueue: true
});

await rcon.connect();
```

### Deliver Dinosaur to Player
```javascript
// When user purchases dinosaur
const result = await rcon.deliverDinosaur('76561198123456789', 'Triceratops', {
    growthStage: 'Adult',
    customName: 'Chomper',
    mutations: ['Albino']
});

console.log('Delivery result:', result);
```

### Monitor RCON Health
```javascript
// Get real-time status
const status = rcon.getStatus();
const health = rcon.getHealthCheck();

console.log('RCON Status:', status);
console.log('RCON Health:', health);
```

---

## � PATREON INTEGRATION FLOW

### 1. Webhook Setup
Create webhook in Patreon Creator Portal:
- **URL:** `https://ashveil.live/api/patreon/webhook`
- **Events:** `pledges:create`, `pledges:update`, `pledges:delete`
- **Secret:** Store in `PATREON_WEBHOOK_SECRET`

### 2. Membership Tiers
```javascript
// Configured in database
const tiers = {
    'Supporter': { price: 500, voidPearls: 500 },    // $5/month
    'Champion': { price: 1000, voidPearls: 1200 },   // $10/month
    'Legend': { price: 2000, voidPearls: 2500 }      // $20/month
};
```

### 3. Webhook Processing
```javascript
// Webhook handler automatically:
// 1. Validates webhook signature
// 2. Updates user membership status
// 3. Grants monthly Void Pearls
// 4. Logs transaction for debugging
// 5. Sends notification to user
```

---

## 🎯 INTEGRATION PRIORITY

### Phase 1: Core Authentication (Week 1)
1. **Steam OAuth setup** - Enable user login
2. **Database integration** - Run schema migration
3. **User profile API** - Basic user data endpoints

### Phase 2: Shop System (Week 2)
1. **Purchase API** - Enable dinosaur buying
2. **RCON delivery** - Automatic in-game delivery
3. **Transaction logging** - Track all purchases

### Phase 3: Patreon Integration (Week 3)
1. **Webhook setup** - Receive membership updates
2. **Void Pearl grants** - Monthly currency distribution
3. **Membership status** - Real-time tier updates

### Phase 4: Polish & Monitoring (Week 4)
1. **Real-time tracking** - Live player status
2. **Admin tools** - Management interfaces
3. **Analytics** - Usage statistics and reporting

---

## 🎮 ISLE SERVER CONFIGURATION

### Current Server Details
- **IP:** 45.45.238.134
- **Game Port:** 7777
- **RCON Port:** 16007
- **RCON Password:** CookieMonster420
- **Max Players:** 300
- **Server Name:** Ashveil - 3X growth - low rules - website

### RCON Commands Reference
```bash
# Player management
list                          # List online players
kick <steamid> <reason>       # Kick player
ban <steamid> <reason>        # Ban player
msg <steamid> <message>       # Message player
broadcast <message>           # Server announcement

# Dinosaur delivery
give <steamid> <species>      # Give dinosaur to player
spawn <steamid> <species>     # Spawn dinosaur at player location
teleport <steamid> <target>   # Teleport player

# Server info
info                          # Server information
status                        # Server status
restart                       # Restart server (admin only)
```

---

## 🚀 SUCCESS METRICS

### Key Performance Indicators
- **User Registrations:** Track Steam OAuth completions
- **Membership Conversions:** Patreon signup rate
- **Purchase Volume:** Void Pearl transactions per month
- **Delivery Success Rate:** RCON command success percentage
- **Server Uptime:** Real-time monitoring
- **User Retention:** Active player tracking

### Expected Results
- **100+ active members** within first month
- **95% delivery success rate** for purchases
- **<5 second response time** for shop transactions
- **99.9% uptime** for core services

---

## 🔥 NEXT STEPS FOR NEW CHAT

Copy and paste this information to continue development:

**"I have a live gaming website at https://ashveil.live that needs complete server integration. Here's the status:**

**✅ COMPLETED:**
- Website deployed on Netlify Pro  
- Custom domain (ashveil.live) configured
- Node.js backend with Supabase database
- Basic RCON connection to Isle server (45.45.238.134:16007)

**🎯 NEED TO COMPLETE:**
- Steam login integration
- Patreon webhook for Void Pearl grants  
- Database setup with new schema
- Purchase API endpoints
- Real-time player tracking
- RCON dinosaur delivery system

**📁 KEY FILES READY:**
- `database-schema.sql` - Complete database structure
- `ashveil-rcon.js` - Enhanced RCON system  
- `VoidPearlShop.jsx` - Shop component
- `COMPLETE_INTEGRATION_HANDOFF.md` - Full specifications

**💡 SYSTEM CONCEPT:**
Patreon members get monthly Void Pearls → Spend VP in website shop → RCON delivers dinosaur to Isle server → Player gets dinosaur in-game

**🎮 CURRENT SERVER:**
- Server IP: 45.45.238.134:16007
- RCON Password: CookieMonster420  
- Backend running on ports 5000-5001
- Supabase database connected

**Ready to build the complete integration system!"**

---

*End of Complete Integration Handoff Documentation*