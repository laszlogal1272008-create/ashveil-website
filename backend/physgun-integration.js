const fs = require('fs').promises;
const path = require('path');

/**
 * Physgun Integration System
 * Handles console commands, player management, and redemption system
 * for The Isle server through Physgun's control panel
 */

class PhysgunIntegration {
    constructor() {
        this.logFile = path.join(__dirname, 'physgun-commands.log');
        this.playerDatabase = new Map(); // In-memory store for now
        this.redemptionQueue = [];
        
        // The Isle console commands
        this.commands = {
            slay: (playerName) => `AdminKill ${playerName}`,
            ban: (playerName, reason) => `AdminBan ${playerName} "${reason}"`,
            kick: (playerName, reason) => `AdminKick ${playerName} "${reason}"`,
            teleport: (playerName, targetPlayer) => `AdminTeleport ${playerName} ${targetPlayer}`,
            giveItem: (playerName, itemId) => `AdminGiveItem ${playerName} ${itemId}`,
            setDinosaur: (playerName, dinoType) => `AdminSetDinosaur ${playerName} ${dinoType}`,
            heal: (playerName) => `AdminHeal ${playerName}`,
            message: (playerName, message) => `AdminMessage ${playerName} "${message}"`,
            broadcast: (message) => `AdminBroadcast "${message}"`,
            setGrowth: (playerName, growth) => `AdminSetGrowth ${playerName} ${growth}`,
            weather: (type) => `AdminWeather ${type}`,
            timeOfDay: (time) => `AdminTimeOfDay ${time}`
        };

        // Redemption items with costs
        this.shopItems = {
            dinosaurs: {
                'Carnotaurus': { cost: 500, command: 'setDinosaur', value: 'Carnotaurus' },
                'Tyrannosaurus': { cost: 1000, command: 'setDinosaur', value: 'Tyrannosaurus' },
                'Triceratops': { cost: 300, command: 'setDinosaur', value: 'Triceratops' },
                'Allosaurus': { cost: 400, command: 'setDinosaur', value: 'Allosaurus' },
                'Dilophosaurus': { cost: 200, command: 'setDinosaur', value: 'Dilophosaurus' }
            },
            perks: {
                'Full Heal': { cost: 50, command: 'heal', value: null },
                'Adult Growth': { cost: 200, command: 'setGrowth', value: '1.0' },
                'Half Growth': { cost: 100, command: 'setGrowth', value: '0.5' },
                'Custom Message': { cost: 25, command: 'message', value: 'custom' }
            },
            weather: {
                'Clear Skies': { cost: 75, command: 'weather', value: 'Clear' },
                'Rain Storm': { cost: 100, command: 'weather', value: 'Rain' },
                'Fog': { cost: 50, command: 'weather', value: 'Fog' }
            }
        };
    }

    /**
     * Execute admin command for any player
     */
    async executeAdminCommand(commandType, targetPlayer, options = {}) {
        try {
            let command;
            
            switch (commandType) {
                case 'slay':
                    command = this.commands.slay(targetPlayer);
                    break;
                case 'ban':
                    command = this.commands.ban(targetPlayer, options.reason || 'Admin ban');
                    break;
                case 'kick':
                    command = this.commands.kick(targetPlayer, options.reason || 'Admin kick');
                    break;
                case 'teleport':
                    command = this.commands.teleport(targetPlayer, options.destination);
                    break;
                case 'heal':
                    command = this.commands.heal(targetPlayer);
                    break;
                case 'setDinosaur':
                    command = this.commands.setDinosaur(targetPlayer, options.dinosaur);
                    break;
                case 'setGrowth':
                    command = this.commands.setGrowth(targetPlayer, options.growth);
                    break;
                case 'message':
                    command = this.commands.message(targetPlayer, options.message);
                    break;
                case 'broadcast':
                    command = this.commands.broadcast(options.message);
                    break;
                default:
                    throw new Error(`Unknown command type: ${commandType}`);
            }

            // Log the command for manual execution in Physgun console
            await this.logCommand(command, targetPlayer, commandType, options);
            
            // Return success response
            return {
                success: true,
                command,
                targetPlayer,
                commandType,
                message: `Command queued for execution: ${command}`,
                executionMethod: 'physgun_console'
            };

        } catch (error) {
            console.error('Error executing admin command:', error);
            return {
                success: false,
                error: error.message,
                targetPlayer,
                commandType
            };
        }
    }

    /**
     * Process currency redemption for players
     */
    async processRedemption(playerName, category, itemName, customOptions = {}) {
        try {
            // Check if item exists
            if (!this.shopItems[category] || !this.shopItems[category][itemName]) {
                throw new Error(`Item not found: ${category}/${itemName}`);
            }

            const item = this.shopItems[category][itemName];
            
            // Check player currency (in real implementation, check database)
            const playerData = this.getPlayerData(playerName);
            if (playerData.currency < item.cost) {
                return {
                    success: false,
                    error: 'Insufficient currency',
                    required: item.cost,
                    current: playerData.currency
                };
            }

            // Deduct currency
            playerData.currency -= item.cost;
            this.updatePlayerData(playerName, playerData);

            // Execute the command
            let commandOptions = {};
            
            switch (item.command) {
                case 'setDinosaur':
                    commandOptions.dinosaur = item.value;
                    break;
                case 'setGrowth':
                    commandOptions.growth = item.value;
                    break;
                case 'message':
                    commandOptions.message = customOptions.message || 'Thank you for your purchase!';
                    break;
                case 'weather':
                    commandOptions = { message: `Weather changed to ${item.value}` };
                    return await this.executeAdminCommand('broadcast', null, commandOptions);
            }

            const result = await this.executeAdminCommand(item.command, playerName, commandOptions);
            
            // Log redemption
            await this.logRedemption(playerName, category, itemName, item.cost);

            return {
                success: true,
                item: itemName,
                cost: item.cost,
                remainingCurrency: playerData.currency,
                command: result.command,
                message: `Successfully redeemed ${itemName}!`
            };

        } catch (error) {
            console.error('Error processing redemption:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get all available shop items
     */
    getShopItems() {
        return this.shopItems;
    }

    /**
     * Add currency to player
     */
    addCurrency(playerName, amount, reason = 'Admin grant') {
        const playerData = this.getPlayerData(playerName);
        playerData.currency += amount;
        this.updatePlayerData(playerName, playerData);
        
        this.logTransaction(playerName, amount, reason);
        
        return {
            success: true,
            newBalance: playerData.currency,
            added: amount,
            reason
        };
    }

    /**
     * Get player data (currency, purchases, etc.)
     */
    getPlayerData(playerName) {
        if (!this.playerDatabase.has(playerName)) {
            this.playerDatabase.set(playerName, {
                currency: 0,
                purchases: [],
                joinDate: new Date(),
                totalSpent: 0
            });
        }
        return this.playerDatabase.get(playerName);
    }

    /**
     * Update player data
     */
    updatePlayerData(playerName, data) {
        this.playerDatabase.set(playerName, data);
    }

    /**
     * Log command for manual execution in Physgun console
     */
    async logCommand(command, targetPlayer, commandType, options) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            command,
            targetPlayer,
            commandType,
            options,
            status: 'pending_execution'
        };

        const logLine = `[${logEntry.timestamp}] COMMAND: ${command} | TARGET: ${targetPlayer} | TYPE: ${commandType}\n`;
        
        try {
            await fs.appendFile(this.logFile, logLine);
        } catch (error) {
            console.error('Error writing to log file:', error);
        }
    }

    /**
     * Log redemption transaction
     */
    async logRedemption(playerName, category, itemName, cost) {
        const logEntry = `[${new Date().toISOString()}] REDEMPTION: ${playerName} purchased ${category}/${itemName} for ${cost} currency\n`;
        
        try {
            await fs.appendFile(this.logFile, logEntry);
        } catch (error) {
            console.error('Error writing redemption log:', error);
        }
    }

    /**
     * Log currency transaction
     */
    async logTransaction(playerName, amount, reason) {
        const logEntry = `[${new Date().toISOString()}] CURRENCY: ${playerName} received ${amount} currency - ${reason}\n`;
        
        try {
            await fs.appendFile(this.logFile, logEntry);
        } catch (error) {
            console.error('Error writing transaction log:', error);
        }
    }

    /**
     * Get pending commands for manual execution
     */
    async getPendingCommands() {
        try {
            const logContent = await fs.readFile(this.logFile, 'utf8');
            const lines = logContent.split('\n').filter(line => line.includes('COMMAND:'));
            
            return lines.map(line => {
                const match = line.match(/\[(.*?)\] COMMAND: (.*?) \| TARGET: (.*?) \| TYPE: (.*?)$/);
                if (match) {
                    return {
                        timestamp: match[1],
                        command: match[2],
                        targetPlayer: match[3],
                        commandType: match[4]
                    };
                }
                return null;
            }).filter(Boolean);
        } catch (error) {
            console.error('Error reading pending commands:', error);
            return [];
        }
    }

    /**
     * Bulk admin operations for multiple players
     */
    async bulkAdminOperation(commandType, playerList, options = {}) {
        const results = [];
        
        for (const playerName of playerList) {
            const result = await this.executeAdminCommand(commandType, playerName, options);
            results.push({
                player: playerName,
                ...result
            });
        }
        
        return {
            success: true,
            processed: results.length,
            results
        };
    }
}

module.exports = PhysgunIntegration;