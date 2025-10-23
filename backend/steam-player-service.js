/**
 * 🎮 STEAM-TO-PLAYER SERVICE
 * Maps Steam users to in-game player names for automatic command execution
 * Works with existing frontend - no changes needed!
 */

class SteamPlayerService {
    constructor() {
        this.playerMappings = new Map(); // steamId -> in-game name
        this.reverseMap = new Map(); // in-game name -> steamId
        this.onlinePlayersCache = [];
        this.lastPlayerListUpdate = 0;
    }

    /**
     * Register a Steam user with their in-game player name
     */
    registerPlayer(steamId, steamName, inGameName) {
        this.playerMappings.set(steamId, {
            steamName: steamName,
            inGameName: inGameName,
            lastSeen: Date.now(),
            isOnline: false
        });
        
        this.reverseMap.set(inGameName.toLowerCase(), steamId);
        
        console.log(`✅ Registered player: ${steamName} (${steamId}) as ${inGameName}`);
        return true;
    }

    /**
     * Get in-game player name from Steam ID
     */
    getInGameName(steamId) {
        const player = this.playerMappings.get(steamId);
        return player ? player.inGameName : null;
    }

    /**
     * Get Steam ID from in-game player name
     */
    getSteamId(inGameName) {
        return this.reverseMap.get(inGameName.toLowerCase());
    }

    /**
     * Auto-detect player name from Steam profile
     * Uses Steam name as fallback if no mapping exists
     */
    autoDetectPlayerName(steamId, steamName) {
        // First check if we have a registered mapping
        const existing = this.getInGameName(steamId);
        if (existing) {
            return existing;
        }

        // Use Steam name as default (most players use same name)
        const cleanName = this.cleanPlayerName(steamName);
        this.registerPlayer(steamId, steamName, cleanName);
        return cleanName;
    }

    /**
     * Clean Steam name to be compatible with The Isle
     */
    cleanPlayerName(steamName) {
        return steamName
            .replace(/[^a-zA-Z0-9_-]/g, '') // Remove special characters
            .substring(0, 20) // Max length
            .trim();
    }

    /**
     * Update online players list from server query
     */
    updateOnlinePlayers(playerList) {
        this.onlinePlayersCache = playerList;
        this.lastPlayerListUpdate = Date.now();

        // Update online status for known players
        for (const [steamId, playerData] of this.playerMappings) {
            const isOnline = playerList.some(p => 
                p.name && p.name.toLowerCase() === playerData.inGameName.toLowerCase()
            );
            playerData.isOnline = isOnline;
            if (isOnline) {
                playerData.lastSeen = Date.now();
            }
        }
    }

    /**
     * Find best matching player name from online list
     */
    findBestMatch(searchName) {
        const lowerSearch = searchName.toLowerCase();
        
        // Exact match first
        const exactMatch = this.onlinePlayersCache.find(p => 
            p.name && p.name.toLowerCase() === lowerSearch
        );
        if (exactMatch) return exactMatch.name;

        // Partial match
        const partialMatch = this.onlinePlayersCache.find(p => 
            p.name && p.name.toLowerCase().includes(lowerSearch)
        );
        if (partialMatch) return partialMatch.name;

        // Return original if no match
        return searchName;
    }

    /**
     * Smart player name resolution for commands
     * Works with existing PlayerShop.jsx and other components
     */
    resolvePlayerForCommand(input) {
        // If it's a Steam ID, get in-game name
        if (input.startsWith('765')) {
            const inGameName = this.getInGameName(input);
            if (inGameName) {
                return {
                    success: true,
                    playerName: inGameName,
                    steamId: input,
                    method: 'steam_mapping'
                };
            }
        }

        // If it's a player name, try to find exact match
        const bestMatch = this.findBestMatch(input);
        const steamId = this.getSteamId(bestMatch);

        return {
            success: true,
            playerName: bestMatch,
            steamId: steamId || null,
            method: steamId ? 'reverse_lookup' : 'name_match'
        };
    }

    /**
     * Integration with existing redeem system
     * Enhances PlayerShop.jsx without changing it
     */
    enhanceRedeemRequest(redeemData) {
        const { playerName, steamId } = redeemData;

        // If Steam ID provided, use it for better accuracy
        if (steamId) {
            const resolvedName = this.autoDetectPlayerName(steamId, playerName);
            return {
                ...redeemData,
                playerName: resolvedName,
                steamId: steamId,
                enhanced: true
            };
        }

        // If only player name, try to enhance
        const resolution = this.resolvePlayerForCommand(playerName);
        return {
            ...redeemData,
            playerName: resolution.playerName,
            steamId: resolution.steamId,
            enhanced: resolution.steamId !== null
        };
    }

    /**
     * Get player statistics
     */
    getPlayerStats() {
        const totalRegistered = this.playerMappings.size;
        const onlineCount = Array.from(this.playerMappings.values())
            .filter(p => p.isOnline).length;

        return {
            totalRegistered,
            onlineCount,
            lastUpdate: this.lastPlayerListUpdate,
            cacheSize: this.onlinePlayersCache.length
        };
    }

    /**
     * Export player mappings for persistence
     */
    exportMappings() {
        return {
            mappings: Array.from(this.playerMappings.entries()),
            timestamp: Date.now()
        };
    }

    /**
     * Import player mappings from persistence
     */
    importMappings(data) {
        if (data && data.mappings) {
            this.playerMappings.clear();
            this.reverseMap.clear();
            
            for (const [steamId, playerData] of data.mappings) {
                this.playerMappings.set(steamId, playerData);
                this.reverseMap.set(playerData.inGameName.toLowerCase(), steamId);
            }
            
            console.log(`✅ Imported ${data.mappings.length} player mappings`);
        }
    }
}

module.exports = SteamPlayerService;