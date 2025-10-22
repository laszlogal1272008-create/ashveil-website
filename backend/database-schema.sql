-- ================================================
-- ASHVEIL GAMING WEBSITE - COMPLETE DATABASE SCHEMA
-- ================================================
-- This schema supports:
-- - Steam authentication system
-- - Patreon membership management  
-- - Void Pearl economy
-- - Dinosaur shop & inventory
-- - RCON server integration
-- - Player tracking & statistics
-- - Transaction logging
-- ================================================

-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================
-- USERS & AUTHENTICATION TABLES
-- ================================================

-- Core user profiles with Steam & Patreon integration
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    steam_id VARCHAR(20) UNIQUE NOT NULL,
    steam_username VARCHAR(100) NOT NULL,
    steam_avatar_url TEXT,
    steam_profile_url TEXT,
    
    -- Patreon Integration
    patreon_user_id VARCHAR(50) UNIQUE,
    patreon_email VARCHAR(255),
    patreon_tier VARCHAR(50),
    patreon_status VARCHAR(20) DEFAULT 'inactive', -- active, inactive, cancelled
    
    -- Website Profile
    display_name VARCHAR(100),
    bio TEXT,
    is_admin BOOLEAN DEFAULT false,
    is_moderator BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Settings
    email_notifications BOOLEAN DEFAULT true,
    profile_public BOOLEAN DEFAULT true
);

-- User currency balances
CREATE TABLE IF NOT EXISTS user_currencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    currency_type VARCHAR(50) NOT NULL, -- 'void_pearls', 'ash_coins', etc.
    balance BIGINT DEFAULT 0,
    lifetime_earned BIGINT DEFAULT 0,
    lifetime_spent BIGINT DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, currency_type)
);

-- ================================================
-- DINOSAUR SYSTEM TABLES
-- ================================================

-- Master dinosaur species catalog
CREATE TABLE IF NOT EXISTS dinosaur_species (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    scientific_name VARCHAR(150),
    category VARCHAR(50) NOT NULL, -- carnivore, herbivore, aquatic, flyer, omnivore
    rarity VARCHAR(20) NOT NULL, -- Common, Uncommon, Rare, Legendary, Apex
    
    -- Physical Stats
    weight_kg INTEGER NOT NULL,
    length_meters DECIMAL(4,2),
    height_meters DECIMAL(4,2),
    speed_kmh INTEGER,
    
    -- Game Stats
    health_points INTEGER,
    damage INTEGER,
    armor INTEGER,
    stamina INTEGER,
    
    -- Shop Info
    void_pearl_price INTEGER NOT NULL DEFAULT 100,
    ash_coin_price INTEGER DEFAULT 0,
    description TEXT,
    abilities TEXT,
    
    -- Metadata
    is_available BOOLEAN DEFAULT true,
    is_premium_only BOOLEAN DEFAULT false,
    release_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User dinosaur inventory
CREATE TABLE IF NOT EXISTS player_dinosaurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    species_id UUID REFERENCES dinosaur_species(id) ON DELETE RESTRICT,
    
    -- Individual Dinosaur Data
    nickname VARCHAR(100),
    growth_percentage DECIMAL(5,2) DEFAULT 0.0,
    current_health INTEGER,
    is_alive BOOLEAN DEFAULT true,
    
    -- Game State
    server_location VARCHAR(100), -- Grid coordinates or area name
    last_seen_server VARCHAR(100),
    play_time_hours INTEGER DEFAULT 0,
    
    -- Acquisition Info
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acquisition_method VARCHAR(50) DEFAULT 'shop', -- shop, event, admin, migration
    purchase_price INTEGER,
    purchase_currency VARCHAR(50),
    
    -- Status
    is_favorite BOOLEAN DEFAULT false,
    notes TEXT
);

-- ================================================
-- PATREON INTEGRATION TABLES
-- ================================================

-- Patreon membership tiers configuration
CREATE TABLE IF NOT EXISTS patreon_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier_name VARCHAR(100) NOT NULL UNIQUE,
    tier_id VARCHAR(50) UNIQUE, -- Patreon's tier ID
    monthly_void_pearls INTEGER NOT NULL DEFAULT 0,
    price_cents INTEGER NOT NULL, -- Price in cents USD
    description TEXT,
    benefits JSONB, -- JSON array of benefits
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patreon membership transactions & grants
CREATE TABLE IF NOT EXISTS membership_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    patreon_pledge_id VARCHAR(100),
    
    -- Transaction Details
    tier_name VARCHAR(100),
    amount_cents INTEGER,
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Void Pearl Grants
    void_pearls_granted INTEGER DEFAULT 0,
    grant_reason VARCHAR(100) DEFAULT 'monthly_membership',
    
    -- Status & Timing
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
    processed_at TIMESTAMP WITH TIME ZONE,
    patreon_created_at TIMESTAMP WITH TIME ZONE,
    
    -- Webhook Data
    webhook_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- ISLE SERVER INTEGRATION TABLES  
-- ================================================

-- Server connection status tracking
CREATE TABLE IF NOT EXISTS server_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_name VARCHAR(100) NOT NULL,
    server_ip VARCHAR(45) NOT NULL,
    server_port INTEGER NOT NULL,
    
    -- Status Info
    is_online BOOLEAN DEFAULT false,
    current_players INTEGER DEFAULT 0,
    max_players INTEGER DEFAULT 300,
    
    -- Performance Metrics
    cpu_usage DECIMAL(5,2),
    memory_usage_gb DECIMAL(6,2),
    uptime_seconds BIGINT,
    ping_ms INTEGER,
    
    -- Game State
    current_time_phase VARCHAR(20), -- dawn, day, dusk, night
    weather_condition VARCHAR(50),
    
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(server_ip, server_port)
);

-- Live player tracking on Isle servers
CREATE TABLE IF NOT EXISTS server_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    server_ip VARCHAR(45) NOT NULL,
    
    -- Player Game State
    steam_name VARCHAR(100),
    current_species VARCHAR(100),
    growth_percentage DECIMAL(5,2) DEFAULT 0.0,
    location VARCHAR(100), -- Grid coordinates
    
    -- Session Info
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_duration_minutes INTEGER DEFAULT 0,
    is_currently_online BOOLEAN DEFAULT true,
    
    -- Performance Tracking
    kills INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    distance_traveled_km DECIMAL(8,2) DEFAULT 0.0
);

-- RCON command execution log
CREATE TABLE IF NOT EXISTS rcon_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    server_ip VARCHAR(45) NOT NULL,
    
    -- Command Details
    command_type VARCHAR(50) NOT NULL, -- give_dinosaur, teleport, kick, ban, etc.
    command_text TEXT NOT NULL,
    parameters JSONB,
    
    -- Execution Results
    status VARCHAR(20) NOT NULL, -- success, failed, timeout
    response_text TEXT,
    error_message TEXT,
    
    -- Context
    reason VARCHAR(200), -- e.g., "Shop purchase: Triceratops for user123"
    executed_by VARCHAR(100), -- admin username or 'system'
    
    -- Timing
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_time_ms INTEGER
);

-- ================================================
-- SHOP & TRANSACTION TABLES
-- ================================================

-- Purchase transaction log
CREATE TABLE IF NOT EXISTS shop_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    species_id UUID REFERENCES dinosaur_species(id) ON DELETE RESTRICT,
    
    -- Transaction Details
    item_name VARCHAR(100) NOT NULL,
    item_type VARCHAR(50) DEFAULT 'dinosaur', -- dinosaur, skin, ability, etc.
    quantity INTEGER DEFAULT 1,
    
    -- Pricing
    unit_price INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    currency_type VARCHAR(50) NOT NULL,
    
    -- Delivery Status
    delivery_status VARCHAR(20) DEFAULT 'pending', -- pending, delivered, failed
    rcon_delivery_attempted BOOLEAN DEFAULT false,
    rcon_command_id UUID REFERENCES rcon_logs(id),
    delivery_attempted_at TIMESTAMP WITH TIME ZONE,
    
    -- Transaction Status
    status VARCHAR(20) DEFAULT 'completed', -- pending, completed, refunded, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ================================================
-- EVENT & NOTIFICATION TABLES
-- ================================================

-- Server events (player joins, kills, achievements, etc.)
CREATE TABLE IF NOT EXISTS server_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_ip VARCHAR(45) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- player_join, player_death, kill, growth, etc.
    
    -- Event Participants
    primary_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    secondary_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Event Data
    event_data JSONB, -- Flexible event information
    location VARCHAR(100),
    species_involved VARCHAR(100),
    
    -- Metadata
    severity VARCHAR(20) DEFAULT 'info', -- info, warning, critical
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User notifications system
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Content
    type VARCHAR(50) NOT NULL, -- purchase_complete, membership_renewed, dinosaur_delivered, etc.
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    is_important BOOLEAN DEFAULT false,
    
    -- Action Links
    action_url VARCHAR(500),
    action_text VARCHAR(100),
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- ================================================
-- ANALYTICS & STATISTICS TABLES
-- ================================================

-- Daily statistics aggregation
CREATE TABLE IF NOT EXISTS daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    server_ip VARCHAR(45),
    
    -- Player Metrics
    unique_players INTEGER DEFAULT 0,
    new_registrations INTEGER DEFAULT 0,
    active_members INTEGER DEFAULT 0,
    
    -- Economic Metrics  
    void_pearls_earned BIGINT DEFAULT 0,
    void_pearls_spent BIGINT DEFAULT 0,
    dinosaurs_purchased INTEGER DEFAULT 0,
    revenue_usd_cents BIGINT DEFAULT 0,
    
    -- Server Metrics
    average_online_players DECIMAL(5,2) DEFAULT 0,
    peak_online_players INTEGER DEFAULT 0,
    total_playtime_hours INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(date, server_ip)
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_steam_id ON users(steam_id);
CREATE INDEX IF NOT EXISTS idx_users_patreon_id ON users(patreon_user_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Currency indexes
CREATE INDEX IF NOT EXISTS idx_user_currencies_user_id ON user_currencies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_currencies_type ON user_currencies(currency_type);

-- Dinosaur indexes
CREATE INDEX IF NOT EXISTS idx_dinosaur_species_category ON dinosaur_species(category);
CREATE INDEX IF NOT EXISTS idx_dinosaur_species_rarity ON dinosaur_species(rarity);
CREATE INDEX IF NOT EXISTS idx_player_dinosaurs_user_id ON player_dinosaurs(user_id);
CREATE INDEX IF NOT EXISTS idx_player_dinosaurs_species_id ON player_dinosaurs(species_id);

-- Server indexes
CREATE INDEX IF NOT EXISTS idx_server_players_user_id ON server_players(user_id);
CREATE INDEX IF NOT EXISTS idx_server_players_online ON server_players(is_currently_online);
CREATE INDEX IF NOT EXISTS idx_server_players_last_seen ON server_players(last_seen);

-- Transaction indexes
CREATE INDEX IF NOT EXISTS idx_shop_transactions_user_id ON shop_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_transactions_status ON shop_transactions(status);
CREATE INDEX IF NOT EXISTS idx_shop_transactions_created_at ON shop_transactions(created_at);

-- RCON indexes
CREATE INDEX IF NOT EXISTS idx_rcon_logs_user_id ON rcon_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_rcon_logs_executed_at ON rcon_logs(executed_at);
CREATE INDEX IF NOT EXISTS idx_rcon_logs_status ON rcon_logs(status);

-- Event indexes
CREATE INDEX IF NOT EXISTS idx_server_events_type ON server_events(event_type);
CREATE INDEX IF NOT EXISTS idx_server_events_created_at ON server_events(created_at);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_unread ON user_notifications(user_id, is_read);

-- ================================================
-- DEFAULT DATA INSERTION
-- ================================================

-- Insert default Patreon tiers
INSERT INTO patreon_tiers (tier_name, monthly_void_pearls, price_cents, description, benefits) VALUES
('Supporter', 500, 500, 'Basic membership tier', '["Monthly Void Pearls", "Discord Access", "Member Badge"]'),
('Champion', 1200, 1000, 'Premium membership tier', '["Monthly Void Pearls", "Discord Access", "Priority Support", "Exclusive Dinosaurs"]'),
('Legend', 2500, 2000, 'Elite membership tier', '["Monthly Void Pearls", "Discord Access", "Priority Support", "All Dinosaurs", "Early Access"]')
ON CONFLICT (tier_name) DO NOTHING;

-- Insert sample dinosaur species (The Isle dinosaurs)
INSERT INTO dinosaur_species (name, category, rarity, weight_kg, void_pearl_price, description, abilities) VALUES
-- Apex Predators
('Tyrannosaurus Rex', 'carnivore', 'Apex', 8000, 5000, 'The ultimate apex predator of The Isle', 'Bone-crushing bite, intimidating roar, pack leader'),
('Giganotosaurus', 'carnivore', 'Apex', 8500, 5200, 'Massive South American predator', 'Devastating bite, territorial dominance'),
('Spinosaurus', 'carnivore', 'Apex', 7000, 4800, 'Semi-aquatic super predator', 'Swimming ability, fish hunting, amphibious combat'),

-- Legendary Carnivores  
('Allosaurus', 'carnivore', 'Legendary', 2000, 3000, 'Agile pack hunter', 'Pack coordination, quick strikes'),
('Ceratosaurus', 'carnivore', 'Legendary', 1500, 2800, 'Horned predator', 'Head-butting attacks, solo hunting'),
('Carnotaurus', 'carnivore', 'Legendary', 1200, 2600, 'The meat-eating bull', 'Incredible speed, ramming attacks'),

-- Rare Carnivores
('Dilophosaurus', 'carnivore', 'Rare', 400, 1500, 'Crested poison spitter', 'Venom spit, pack hunting'),
('Utahraptor', 'carnivore', 'Rare', 700, 1800, 'Giant pack raptor', 'Coordinated pack attacks, climbing'),

-- Legendary Herbivores
('Triceratops', 'herbivore', 'Legendary', 6000, 3200, 'Three-horned tank', 'Charging attacks, herd protection'),
('Ankylosaurus', 'herbivore', 'Legendary', 4000, 2900, 'Living fortress', 'Armored defense, tail club attacks'),
('Stegosaurus', 'herbivore', 'Legendary', 3000, 2700, 'Spiked defender', 'Tail spike attacks, defensive positioning'),

-- Rare Herbivores  
('Parasaurolophus', 'herbivore', 'Rare', 2500, 1200, 'Musical hadrosaur', 'Communication calls, herd coordination'),
('Maiasaura', 'herbivore', 'Rare', 2000, 1000, 'Good mother lizard', 'Nesting behaviors, juvenile care'),

-- Common Species
('Tenontosaurus', 'herbivore', 'Common', 600, 500, 'Common prey species', 'Speed, herd behavior'),
('Dryosaurus', 'herbivore', 'Common', 100, 300, 'Small agile herbivore', 'High speed, evasion'),

-- Aquatic Species
('Deinos', 'aquatic', 'Legendary', 1500, 3500, 'Aquatic crocodilian', 'Amphibious hunting, death roll'),

-- Flyers
('Pteranodon', 'flyer', 'Rare', 25, 2000, 'Large pterosaur', 'Flight, aerial hunting, diving attacks')

ON CONFLICT (name) DO NOTHING;

-- ================================================
-- UTILITY FUNCTIONS
-- ================================================

-- Function to update user currency balance
CREATE OR REPLACE FUNCTION update_user_currency(
    p_user_id UUID,
    p_currency_type VARCHAR(50),
    p_amount BIGINT,
    p_operation VARCHAR(10) -- 'add' or 'subtract'
)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance BIGINT;
BEGIN
    -- Get current balance
    SELECT balance INTO current_balance 
    FROM user_currencies 
    WHERE user_id = p_user_id AND currency_type = p_currency_type;
    
    -- Create currency record if it doesn't exist
    IF current_balance IS NULL THEN
        INSERT INTO user_currencies (user_id, currency_type, balance)
        VALUES (p_user_id, p_currency_type, 0);
        current_balance := 0;
    END IF;
    
    -- Update balance based on operation
    IF p_operation = 'add' THEN
        UPDATE user_currencies 
        SET balance = balance + p_amount,
            lifetime_earned = lifetime_earned + p_amount,
            last_updated = NOW()
        WHERE user_id = p_user_id AND currency_type = p_currency_type;
    ELSIF p_operation = 'subtract' THEN
        -- Check if user has enough balance
        IF current_balance >= p_amount THEN
            UPDATE user_currencies 
            SET balance = balance - p_amount,
                lifetime_spent = lifetime_spent + p_amount,
                last_updated = NOW()
            WHERE user_id = p_user_id AND currency_type = p_currency_type;
        ELSE
            RETURN FALSE; -- Insufficient balance
        END IF;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to log RCON command execution
CREATE OR REPLACE FUNCTION log_rcon_command(
    p_user_id UUID,
    p_server_ip VARCHAR(45),
    p_command_type VARCHAR(50),
    p_command_text TEXT,
    p_status VARCHAR(20),
    p_response_text TEXT DEFAULT NULL,
    p_reason VARCHAR(200) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO rcon_logs (
        user_id, server_ip, command_type, command_text, 
        status, response_text, reason, executed_at
    ) VALUES (
        p_user_id, p_server_ip, p_command_type, p_command_text,
        p_status, p_response_text, p_reason, NOW()
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ================================================

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dinosaur_species_updated_at BEFORE UPDATE ON dinosaur_species
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- VIEWS FOR COMMON QUERIES
-- ================================================

-- View for user profile with currency info
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    u.id,
    u.steam_id,
    u.steam_username,
    u.steam_avatar_url,
    u.display_name,
    u.patreon_tier,
    u.patreon_status,
    u.is_admin,
    u.is_moderator,
    u.created_at,
    u.last_login,
    COALESCE(uc_vp.balance, 0) as void_pearls,
    COALESCE(uc_ac.balance, 0) as ash_coins
FROM users u
LEFT JOIN user_currencies uc_vp ON u.id = uc_vp.user_id AND uc_vp.currency_type = 'void_pearls'
LEFT JOIN user_currencies uc_ac ON u.id = uc_ac.user_id AND uc_ac.currency_type = 'ash_coins';

-- View for shop items with pricing
CREATE OR REPLACE VIEW shop_items AS
SELECT 
    ds.id,
    ds.name,
    ds.category,
    ds.rarity,
    ds.weight_kg,
    ds.void_pearl_price,
    ds.description,
    ds.abilities,
    ds.is_available,
    ds.is_premium_only
FROM dinosaur_species ds
WHERE ds.is_available = true
ORDER BY ds.rarity, ds.name;

-- ================================================
-- SCHEMA COMPLETION CONFIRMATION
-- ================================================

-- Insert a schema version record for tracking
CREATE TABLE IF NOT EXISTS schema_versions (
    version VARCHAR(20) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT
);

INSERT INTO schema_versions (version, description) 
VALUES ('1.0.0', 'Complete Ashveil gaming website database schema with Steam auth, Patreon integration, dinosaur shop, and RCON system')
ON CONFLICT (version) DO NOTHING;

-- ================================================
-- END OF SCHEMA
-- ================================================