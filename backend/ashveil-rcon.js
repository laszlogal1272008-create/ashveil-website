// ================================================
// ASHVEIL ENHANCED RCON INTEGRATION SYSTEM
// ================================================
// This module provides:
// - Auto-reconnecting RCON client with health monitoring
// - Dinosaur delivery system for shop purchases
// - Command logging and error tracking
// - Player management utilities
// - Queue system for reliable command execution
// - WebSocket integration for real-time updates
// ================================================

const Rcon = require('rcon');
const IsleRCONClient = require('./isle-rcon-client');
const EventEmitter = require('events');
const { createClient } = require('@supabase/supabase-js');

class AshveilRCON extends EventEmitter {
    constructor(config) {
        super();
        
        this.config = {
            ip: config.ip || process.env.SERVER_IP || '45.45.238.134',
            port: config.port || process.env.RCON_PORT || 16007,
            password: config.password || process.env.RCON_PASSWORD || 'CookieMonster420',
            timeout: config.timeout || 10000,
            autoReconnect: config.autoReconnect !== false,
            reconnectInterval: config.reconnectInterval || 5000,
            maxReconnectAttempts: config.maxReconnectAttempts || 10,
            commandQueue: config.commandQueue !== false,
            queueTimeout: config.queueTimeout || 30000
        };
        
        this.client = null;
        this.isConnected = false;
        this.isReconnecting = false;
        this.reconnectAttempts = 0;
        this.lastError = null;
        this.connectionStartTime = null;
        
        // Database connection (optional for development)
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co' && supabaseKey !== 'your-anon-key-here') {
            this.supabase = createClient(supabaseUrl, supabaseKey);
            console.log('✅ RCON Supabase client initialized');
        } else {
            this.supabase = null;
            console.log('⚠️  RCON running without database logging (dev mode)');
        }
        
        // Command queue system
        this.commandQueue = [];
        this.processingQueue = false;
        this.queueTimer = null;
        
        // Statistics tracking
        this.stats = {
            totalCommands: 0,
            successfulCommands: 0,
            failedCommands: 0,
            averageResponseTime: 0,
            uptime: 0,
            lastSuccessfulCommand: null,
            reconnectionCount: 0
        };
        
        // Event handlers
        this.setupEventHandlers();
        
        console.log('🎮 Ashveil RCON System initialized');
        console.log(`📡 Target Server: ${this.config.ip}:${this.config.port}`);
    }
    
    // ================================================
    // CONNECTION MANAGEMENT
    // ================================================
    
    async connect() {
        if (this.isConnected || this.isReconnecting) {
            console.log('⚠️  RCON already connected or reconnecting');
            return false;
        }
        
        try {
            console.log(`🔌 Connecting to RCON server ${this.config.ip}:${this.config.port}...`);
            
            // Use specialized Isle RCON client for better handshake handling
            this.client = new IsleRCONClient({
                host: this.config.ip,
                port: this.config.port,
                password: this.config.password,
                timeout: this.config.timeout,
                reconnectDelay: this.config.reconnectInterval,
                maxReconnectAttempts: this.config.maxReconnectAttempts
            });
            
            this.connectionStartTime = Date.now();
            
            // Set up client event handlers
            this.client.on('authenticated', () => {
                this.handleConnection();
            });
            
            this.client.on('disconnected', () => {
                this.handleDisconnection();
            });
            
            this.client.on('error', (err) => {
                this.handleError(err);
            });
            
            // Connect with the specialized client
            await this.client.connect();
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize RCON connection:', error.message);
            this.handleError(error);
            return false;
        }
    }
    
    // Removed connectWithTimeout as the Isle client handles this internally

    
    handleConnection() {
        this.isConnected = true;
        this.isReconnecting = false;
        this.reconnectAttempts = 0;
        this.lastError = null;
        this.pendingCommand = null;
        
        const connectionTime = Date.now() - this.connectionStartTime;
        console.log(`✅ RCON authenticated successfully (${connectionTime}ms)`);
        
        this.emit('connected');
        
        // Start processing queued commands
        if (this.config.commandQueue && this.commandQueue.length > 0) {
            console.log(`📤 Processing ${this.commandQueue.length} queued commands...`);
            this.processCommandQueue();
        }
        
        // Start uptime tracking
        this.startUptimeTracking();
    }
    
    // Response handling is now managed by the Isle client
    
    handleDisconnection() {
        const wasConnected = this.isConnected;
        this.isConnected = false;
        
        console.log('🔌 RCON connection closed');
        this.emit('disconnected');
        
        if (wasConnected && this.config.autoReconnect) {
            this.attemptReconnection();
        }
    }
    
    handleError(error) {
        this.lastError = {
            message: error.message,
            timestamp: new Date().toISOString(),
            code: error.code || 'UNKNOWN'
        };
        
        console.error('❌ RCON Error:', error.message);
        this.emit('error', error);
        
        // Update failure statistics
        this.stats.failedCommands++;
        
        if (!this.isConnected && this.config.autoReconnect) {
            this.attemptReconnection();
        }
    }
    
    async attemptReconnection() {
        if (this.isReconnecting) {
            return;
        }
        
        if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
            console.error(`❌ Max reconnection attempts (${this.config.maxReconnectAttempts}) reached`);
            this.emit('maxReconnectAttemptsReached');
            return;
        }
        
        this.isReconnecting = true;
        this.reconnectAttempts++;
        this.stats.reconnectionCount++;
        
        console.log(`� Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})...`);
        
        setTimeout(async () => {
            try {
                await this.connect();
            } catch (error) {
                console.error('Reconnection failed:', error.message);
                this.isReconnecting = false;
                
                if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
                    this.attemptReconnection();
                }
            }
        }, this.config.reconnectInterval);
    }
    
    disconnect() {
        console.log('🛑 Disconnecting RCON...');
        
        this.config.autoReconnect = false; // Prevent auto-reconnection
        
        if (this.client) {
            this.client.disconnect();
        }
        
        this.isConnected = false;
        this.isReconnecting = false;
        
        // Clear timers
        if (this.queueTimer) {
            clearInterval(this.queueTimer);
        }
    }
    
    // ================================================
    // COMMAND EXECUTION SYSTEM
    // ================================================
    
    async executeCommand(command, options = {}) {
        const commandId = this.generateCommandId();
        const startTime = Date.now();
        
        const commandData = {
            id: commandId,
            command: command,
            timestamp: new Date().toISOString(),
            priority: options.priority || 'normal',
            retry: options.retry !== false,
            timeout: options.timeout || this.config.timeout,
            context: options.context || {},
            startTime: startTime,
            steamId: options.steamId || null
        };
        
        console.log(`📤 Executing RCON command [${commandId}]: ${command}`);
        
        if (!this.isConnected) {
            if (this.config.commandQueue && commandData.retry) {
                console.log(`📋 Queueing command for later execution: ${command}`);
                this.commandQueue.push(commandData);
                return { queued: true, commandId: commandId };
            } else {
                throw new Error('RCON not connected and queueing disabled');
            }
        }
        
        try {
            const response = await this.sendCommand(command, commandData.timeout);
            const responseTime = Date.now() - startTime;
            
            // Update statistics
            this.stats.totalCommands++;
            this.stats.successfulCommands++;
            this.stats.lastSuccessfulCommand = new Date().toISOString();
            this.updateAverageResponseTime(responseTime);
            
            const result = {
                success: true,
                commandId: commandId,
                command: command,
                response: response,
                responseTime: responseTime,
                timestamp: new Date().toISOString()
            };
            
            console.log(`✅ Command completed [${commandId}] (${responseTime}ms)`);
            this.emit('commandExecuted', result);
            
            // Log to database
            await this.logCommand(command, response, true, commandData.steamId);
            
            return result;
            
        } catch (error) {
            const responseTime = Date.now() - startTime;
            
            // Update statistics
            this.stats.totalCommands++;
            this.stats.failedCommands++;
            
            const result = {
                success: false,
                commandId: commandId,
                command: command,
                error: error.message,
                responseTime: responseTime,
                timestamp: new Date().toISOString()
            };
            
            console.error(`❌ Command failed [${commandId}]: ${error.message}`);
            this.emit('commandFailed', result);
            
            // Log error to database
            await this.logCommand(command, error.message, false, commandData.steamId);
            
            throw error;
        }
    }
    
    sendCommand(command, timeout) {
        // Use the specialized Isle client's command execution
        return this.client.executeCommand(command, timeout);
    }
    
    // Log RCON commands to database
    async logCommand(command, response, success, steamId = null) {
        try {
            // Skip logging if no database connection
            if (!this.supabase) {
                console.log(`📝 RCON Command [${success ? 'SUCCESS' : 'FAILED'}]: ${command} -> ${response}`);
                return;
            }
            
            // Get user ID from steam ID if provided
            let userId = null;
            if (steamId) {
                const { data } = await this.supabase
                    .from('users')
                    .select('id')
                    .eq('steam_id', steamId)
                    .single();
                userId = data?.id || null;
            }
            
            await this.supabase.from('rcon_logs').insert({
                user_id: userId,
                server_ip: this.config.ip,
                command_type: this.getCommandType(command),
                command_text: command,
                status: success ? 'success' : 'failed',
                response_text: response,
                error_message: success ? null : response,
                reason: this.getCommandReason(command),
                executed_by: 'system'
            });
        } catch (error) {
            console.error('Failed to log RCON command:', error);
        }
    }
    
    getCommandType(command) {
        const cmd = command.toLowerCase().split(' ')[0];
        const typeMap = {
            'give': 'give_dinosaur',
            'spawn': 'spawn_dinosaur',
            'teleport': 'teleport',
            'kick': 'kick',
            'ban': 'ban',
            'list': 'list_players',
            'info': 'server_info',
            'kill': 'kill_dinosaur',
            'slay': 'slay_dinosaur',
            'killcharacter': 'kill_dinosaur'
        };
        return typeMap[cmd] || 'custom';
    }
    
    getCommandReason(command) {
        if (command.includes('give') || command.includes('spawn')) {
            return 'Shop purchase delivery';
        }
        if (command.includes('kill') || command.includes('slay')) {
            return 'Website dinosaur slay request';
        }
        return 'Administrative command';
    }

    
    // ================================================
    // DINOSAUR SLAY SYSTEM
    // ================================================
    
    async slayDinosaur(playerName, options = {}) {
        const slayId = this.generateCommandId();
        console.log(`💀 Starting dinosaur slay [${slayId}]: Player ${playerName}`);
        
        try {
            // Step 1: Check if player is online
            const playerOnline = await this.isPlayerOnline(playerName);
            if (!playerOnline) {
                throw new Error('Player is not currently online - cannot slay dinosaur');
            }
            
            // Step 2: Build slay command (The Isle uses 'KillCharacter' command)
            const slayCommand = `KillCharacter ${playerName}`;
            
            // Step 3: Execute slay command
            const slayResult = await this.executeCommand(slayCommand, {
                context: { 
                    type: 'dinosaur_slay',
                    playerName: playerName,
                    slayId: slayId
                },
                steamId: options.steamId || null,
                timeout: options.timeout || 10000
            });
            
            // Log the slay action
            if (this.supabase) {
                try {
                    await this.supabase.from('rcon_logs').insert({
                        command_type: 'slay_dinosaur',
                        command_text: slayCommand,
                        status: 'success',
                        response_text: slayResult,
                        reason: 'Website dinosaur slay request',
                        executed_by: 'website',
                        metadata: {
                            slayId: slayId,
                            playerName: playerName,
                            timestamp: new Date().toISOString()
                        }
                    });
                } catch (dbError) {
                    console.error('Failed to log slay action:', dbError);
                }
            }
            
            console.log(`✅ Dinosaur slain successfully [${slayId}]: ${playerName}`);
            
            return {
                success: true,
                slayId: slayId,
                playerName: playerName,
                response: slayResult,
                message: `Successfully slayed ${playerName}'s dinosaur`
            };
            
        } catch (error) {
            console.error(`❌ Dinosaur slay failed [${slayId}]:`, error.message);
            
            // Log the failed slay attempt
            if (this.supabase) {
                try {
                    await this.supabase.from('rcon_logs').insert({
                        command_type: 'slay_dinosaur',
                        command_text: `KillCharacter ${playerName}`,
                        status: 'failed',
                        error_message: error.message,
                        reason: 'Website dinosaur slay request',
                        executed_by: 'website',
                        metadata: {
                            slayId: slayId,
                            playerName: playerName,
                            error: error.message,
                            timestamp: new Date().toISOString()
                        }
                    });
                } catch (dbError) {
                    console.error('Failed to log slay error:', dbError);
                }
            }
            
            return {
                success: false,
                slayId: slayId,
                playerName: playerName,
                error: error.message,
                message: `Failed to slay ${playerName}'s dinosaur: ${error.message}`
            };
        }
    }

    
    // ================================================
    // DINOSAUR DELIVERY SYSTEM
    // ================================================
    
    async deliverDinosaur(steamId, dinosaurName, options = {}) {
        const deliveryId = this.generateCommandId();
        console.log(`🦕 Starting dinosaur delivery [${deliveryId}]: ${dinosaurName} to ${steamId}`);
        
        try {
            // Step 1: Check if player is online
            const playerOnline = await this.isPlayerOnline(steamId);
            if (!playerOnline && !options.forceDelivery) {
                throw new Error('Player is not currently online');
            }
            
            // Step 2: Get player's current location (if online)
            let playerLocation = null;
            if (playerOnline) {
                playerLocation = await this.getPlayerLocation(steamId);
            }
            
            // Step 3: Execute dinosaur spawn command
            const spawnCommand = this.buildDinosaurSpawnCommand(steamId, dinosaurName, options);
            const spawnResult = await this.executeCommand(spawnCommand, {
                context: { 
                    type: 'dinosaur_delivery',
                    steamId: steamId,
                    dinosaurName: dinosaurName,
                    deliveryId: deliveryId
                },
                steamId: steamId
            });
            
            // Step 4: Send notification to player
            if (playerOnline) {
                await this.notifyPlayer(steamId, `Your ${dinosaurName} has been delivered! Check your spawn menu.`);
            }
            
            // Step 5: Update database - mark dinosaur as delivered
            await this.updateDinosaurDeliveryStatus(steamId, dinosaurName, true);
            
            // Step 6: Log successful delivery
            const deliveryResult = {
                success: true,
                deliveryId: deliveryId,
                steamId: steamId,
                dinosaurName: dinosaurName,
                spawnLocation: playerLocation,
                spawnCommand: spawnCommand,
                rconResponse: spawnResult.response,
                deliveredAt: new Date().toISOString()
            };
            
            console.log(`✅ Dinosaur delivery completed [${deliveryId}]: ${dinosaurName}`);
            this.emit('dinosaurDelivered', deliveryResult);
            
            return deliveryResult;
            
        } catch (error) {
            const deliveryResult = {
                success: false,
                deliveryId: deliveryId,
                steamId: steamId,
                dinosaurName: dinosaurName,
                error: error.message,
                failedAt: new Date().toISOString()
            };
            
            console.error(`❌ Dinosaur delivery failed [${deliveryId}]: ${error.message}`);
            this.emit('dinosaurDeliveryFailed', deliveryResult);
            
            throw error;
        }
    }
    
    buildDinosaurSpawnCommand(steamId, dinosaurName, options = {}) {
        // The Isle RCON commands for spawning dinosaurs
        // Note: These commands may need adjustment based on your server's RCON implementation
        
        const growthStage = options.growthStage || 'Adult';
        const mutations = options.mutations || [];
        const customName = options.customName || '';
        
        // Base command format for The Isle servers
        let command = `give ${steamId} ${dinosaurName}`;
        
        // Add growth stage if specified
        if (growthStage !== 'Adult') {
            command += ` ${growthStage}`;
        }
        
        // Add mutations if any
        if (mutations.length > 0) {
            command += ` ${mutations.join(',')}`;
        }
        
        // Add custom name if specified
        if (customName) {
            command += ` "${customName}"`;
        }
        
        return command;
    }
    
    async updateDinosaurDeliveryStatus(steamId, dinosaurName, delivered) {
        try {
            // Get user ID from steam ID
            const { data: userData } = await this.supabase
                .from('users')
                .select('id')
                .eq('steam_id', steamId)
                .single();
                
            if (!userData) {
                console.warn(`User not found for Steam ID: ${steamId}`);
                return;
            }
            
            // Get species ID
            const { data: speciesData } = await this.supabase
                .from('dinosaur_species')
                .select('id')
                .eq('name', dinosaurName)
                .single();
                
            if (!speciesData) {
                console.warn(`Species not found: ${dinosaurName}`);
                return;
            }
            
            // Update player dinosaur record
            await this.supabase
                .from('player_dinosaurs')
                .update({ 
                    is_alive: delivered,
                    last_seen_server: this.config.ip,
                    notes: delivered ? 'Delivered via shop purchase' : 'Delivery failed'
                })
                .eq('user_id', userData.id)
                .eq('species_id', speciesData.id);
                
        } catch (error) {
            console.error('Failed to update dinosaur delivery status:', error);
        }
    }

    
    // ================================================
    // PLAYER MANAGEMENT UTILITIES
    // ================================================
    
    async isPlayerOnline(steamId) {
        try {
            const playersResponse = await this.executeCommand('list');
            return this.parsePlayerOnlineStatus(playersResponse.response, steamId);
        } catch (error) {
            console.warn(`⚠️  Could not check player online status: ${error.message}`);
            return false;
        }
    }
    
    async getPlayerLocation(steamId) {
        try {
            const locationResponse = await this.executeCommand(`location ${steamId}`);
            return this.parsePlayerLocation(locationResponse.response);
        } catch (error) {
            console.warn(`⚠️  Could not get player location: ${error.message}`);
            return null;
        }
    }
    
    async getPlayerList() {
        try {
            const response = await this.executeCommand('list');
            return this.parsePlayerList(response.response);
        } catch (error) {
            console.error('Failed to get player list:', error);
            return [];
        }
    }
    
    async kickPlayer(steamId, reason = 'Kicked by admin') {
        const command = `kick ${steamId} "${reason}"`;
        return await this.executeCommand(command, {
            context: { type: 'moderation', action: 'kick' },
            steamId: steamId
        });
    }
    
    async banPlayer(steamId, reason = 'Banned by admin', duration = 0) {
        const command = duration > 0 
            ? `ban ${steamId} ${duration} "${reason}"`
            : `ban ${steamId} "${reason}"`;
            
        return await this.executeCommand(command, {
            context: { type: 'moderation', action: 'ban' },
            steamId: steamId
        });
    }
    
    async notifyPlayer(steamId, message) {
        const command = `msg ${steamId} "${message}"`;
        return await this.executeCommand(command, {
            context: { type: 'notification', steamId: steamId },
            steamId: steamId
        });
    }
    
    async broadcastMessage(message) {
        const command = `broadcast "${message}"`;
        return await this.executeCommand(command, {
            context: { type: 'broadcast' }
        });
    }
    
    // ================================================
    // RESPONSE PARSING UTILITIES
    // ================================================
    
    parsePlayerOnlineStatus(response, steamId) {
        // Parse the list response to check if a specific player is online
        if (!response || typeof response !== 'string') {
            return false;
        }
        
        return response.toLowerCase().includes(steamId.toLowerCase());
    }
    
    parsePlayerLocation(response) {
        // Parse location response - format may vary by server
        if (!response || typeof response !== 'string') {
            return null;
        }
        
        // Example parsing for coordinates: "Location: X=1234.5 Y=5678.9 Z=90.1"
        const coordMatch = response.match(/X=([\\d.-]+).*Y=([\\d.-]+).*Z=([\\d.-]+)/);
        if (coordMatch) {
            return {
                x: parseFloat(coordMatch[1]),
                y: parseFloat(coordMatch[2]),
                z: parseFloat(coordMatch[3]),
                raw: response
            };
        }
        
        return { raw: response };
    }
    
    parsePlayerList(response) {
        // Parse list response into structured data
        if (!response || typeof response !== 'string') {
            return [];
        }
        
        const players = [];
        const lines = response.split('\\n').filter(line => line.trim());
        
        for (const line of lines) {
            // Parse different possible formats
            const steamIdMatch = line.match(/(\\d{17})/); // Steam ID format
            const nameMatch = line.match(/Name:\\s*(.+?)(?:\\s|$)/);
            const speciesMatch = line.match(/Species:\\s*(\\w+)/);
            
            if (steamIdMatch) {
                players.push({
                    steamId: steamIdMatch[1],
                    name: nameMatch ? nameMatch[1] : 'Unknown',
                    species: speciesMatch ? speciesMatch[1] : 'Unknown',
                    online: true,
                    raw: line
                });
            }
        }
        
        return players;
    }

    
    // ================================================
    // COMMAND QUEUE SYSTEM
    // ================================================
    
    async processCommandQueue() {
        if (this.processingQueue || this.commandQueue.length === 0) {
            return;
        }
        
        this.processingQueue = true;
        console.log(`📋 Processing ${this.commandQueue.length} queued commands...`);
        
        while (this.commandQueue.length > 0 && this.isConnected) {
            const commandData = this.commandQueue.shift();
            
            try {
                await this.executeCommand(commandData.command, {
                    timeout: commandData.timeout,
                    context: commandData.context,
                    steamId: commandData.steamId
                });
                
                console.log(`✅ Queued command executed: ${commandData.command}`);
                
            } catch (error) {
                console.error(`❌ Queued command failed: ${commandData.command} - ${error.message}`);
                
                // Re-queue if retry is enabled and within limits
                if (commandData.retry && (commandData.retryCount || 0) < 3) {
                    commandData.retryCount = (commandData.retryCount || 0) + 1;
                    this.commandQueue.push(commandData);
                    console.log(`🔄 Re-queuing failed command (attempt ${commandData.retryCount}/3)`);
                }
            }
            
            // Small delay between commands to prevent spam
            await this.sleep(500);
        }
        
        this.processingQueue = false;
        console.log('� Command queue processing completed');
    }
    
    // ================================================
    // PLAYER STATUS TRACKING
    // ================================================
    
    async updatePlayerStatus() {
        try {
            const onlinePlayers = await this.getPlayerList();
            const steamIds = onlinePlayers.map(p => p.steamId);
            
            // Update online players in database
            for (const player of onlinePlayers) {
                await this.supabase
                    .from('server_players')
                    .upsert({
                        user_id: await this.getUserIdFromSteamId(player.steamId),
                        server_ip: this.config.ip,
                        steam_name: player.name,
                        current_species: player.species,
                        last_seen: new Date().toISOString(),
                        is_currently_online: true
                    }, {
                        onConflict: 'user_id,server_ip'
                    });
            }
            
            // Mark offline players
            if (steamIds.length > 0) {
                const { data: allPlayers } = await this.supabase
                    .from('server_players')
                    .select('user_id')
                    .eq('server_ip', this.config.ip)
                    .eq('is_currently_online', true);
                
                if (allPlayers) {
                    for (const dbPlayer of allPlayers) {
                        const isOnline = await this.isUserOnline(dbPlayer.user_id, steamIds);
                        if (!isOnline) {
                            await this.supabase
                                .from('server_players')
                                .update({ is_currently_online: false })
                                .eq('user_id', dbPlayer.user_id)
                                .eq('server_ip', this.config.ip);
                        }
                    }
                }
            }
            
            console.log(`📊 Updated status for ${steamIds.length} online players`);
            return onlinePlayers;
        } catch (error) {
            console.error('Failed to update player status:', error);
            return [];
        }
    }
    
    async getUserIdFromSteamId(steamId) {
        try {
            const { data } = await this.supabase
                .from('users')
                .select('id')
                .eq('steam_id', steamId)
                .single();
            return data?.id || null;
        } catch (error) {
            return null;
        }
    }
    
    async isUserOnline(userId, onlineSteamIds) {
        try {
            const { data } = await this.supabase
                .from('users')
                .select('steam_id')
                .eq('id', userId)
                .single();
            return data && onlineSteamIds.includes(data.steam_id);
        } catch (error) {
            return false;
        }
    }
    
    // ================================================
    // UTILITY METHODS
    // ================================================
    
    generateCommandId() {
        return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    updateAverageResponseTime(responseTime) {
        const successCount = this.stats.successfulCommands;
        const currentAvg = this.stats.averageResponseTime;
        
        this.stats.averageResponseTime = ((currentAvg * (successCount - 1)) + responseTime) / successCount;
    }
    
    startUptimeTracking() {
        this.uptimeStartTime = Date.now();
        
        // Update uptime every minute
        this.uptimeTimer = setInterval(() => {
            if (this.isConnected && this.uptimeStartTime) {
                this.stats.uptime = Math.floor((Date.now() - this.uptimeStartTime) / 1000);
            }
        }, 60000);
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    setupEventHandlers() {
        // Set up internal event handlers for logging and monitoring
        this.on('connected', () => {
            console.log('🎮 RCON connection established - Ready for commands');
        });
        
        this.on('disconnected', () => {
            console.log('🔌 RCON connection lost');
        });
        
        this.on('dinosaurDelivered', (result) => {
            console.log(`🦕 Delivery successful: ${result.dinosaurName} → ${result.steamId}`);
        });
        
        this.on('dinosaurDeliveryFailed', (result) => {
            console.error(`🦕 Delivery failed: ${result.dinosaurName} → ${result.steamId}: ${result.error}`);
        });
    }
    
    // ================================================
    // STATUS & MONITORING
    // ================================================
    
    getStatus() {
        return {
            connected: this.isConnected,
            reconnecting: this.isReconnecting,
            reconnectAttempts: this.reconnectAttempts,
            lastError: this.lastError,
            queuedCommands: this.commandQueue.length,
            stats: { ...this.stats },
            config: {
                server: `${this.config.ip}:${this.config.port}`,
                autoReconnect: this.config.autoReconnect,
                commandQueue: this.config.commandQueue
            }
        };
    }
    
    getHealthCheck() {
        const now = Date.now();
        const isHealthy = this.isConnected && 
                         (this.stats.lastSuccessfulCommand === null || 
                          (now - new Date(this.stats.lastSuccessfulCommand).getTime()) < 300000); // 5 minutes
        
        return {
            healthy: isHealthy,
            connected: this.isConnected,
            uptime: this.stats.uptime,
            successRate: this.stats.totalCommands > 0 ? 
                        (this.stats.successfulCommands / this.stats.totalCommands * 100).toFixed(2) : 0,
            averageResponseTime: Math.round(this.stats.averageResponseTime),
            lastError: this.lastError,
            timestamp: new Date().toISOString()
        };
    }
}

// ================================================
// RCON MANAGER - SINGLETON INSTANCE
// ================================================

class RCONManager {
    constructor() {
        this.rconClient = null;
        this.isInitialized = false;
    }
    
    initialize(config) {
        if (this.isInitialized) {
            console.log('⚠️  RCON Manager already initialized');
            return this.rconClient;
        }
        
        console.log('🎮 Initializing Ashveil RCON Manager...');
        
        this.rconClient = new AshveilRCON(config);
        this.isInitialized = true;
        
        return this.rconClient;
    }
    
    getClient() {
        if (!this.isInitialized) {
            throw new Error('RCON Manager not initialized. Call initialize() first.');
        }
        
        return this.rconClient;
    }
    
    async shutdown() {
        if (this.rconClient) {
            console.log('🛑 Shutting down RCON Manager...');
            this.rconClient.disconnect();
            this.rconClient = null;
            this.isInitialized = false;
        }
    }
}

// Create singleton instance
const rconManager = new RCONManager();

// ================================================
// EXPORTS
// ================================================

module.exports = {
    AshveilRCON,
    RCONManager,
    rconManager,
    
    // Convenience functions
    initializeRCON: (config) => rconManager.initialize(config),
    getRCONClient: () => rconManager.getClient(),
    shutdownRCON: () => rconManager.shutdown()
};

// ================================================
// USAGE EXAMPLES
// ================================================

/*

// Basic initialization
const { initializeRCON, getRCONClient } = require('./ashveil-rcon');

const rcon = initializeRCON({
    ip: '45.45.238.134',
    port: 16007,
    password: 'CookieMonster420',
    autoReconnect: true,
    commandQueue: true
});

// Connect and start
await rcon.connect();

// Deliver a dinosaur to a player
try {
    const result = await rcon.deliverDinosaur('76561198123456789', 'Triceratops', {
        growthStage: 'Adult',
        customName: 'Chomper',
        mutations: ['Albino', 'Hyperodontosaurus']
    });
    
    console.log('Delivery successful:', result);
} catch (error) {
    console.error('Delivery failed:', error.message);
}

// Execute custom commands
const playerList = await rcon.executeCommand('list');
console.log('Current players:', playerList.response);

// Get status and health information
const status = rcon.getStatus();
const health = rcon.getHealthCheck();

console.log('RCON Status:', status);
console.log('RCON Health:', health);

*/