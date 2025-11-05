// Backend API Router for Player Commands
// Add this to your Node.js backend to route commands to the bot

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Bot API configuration
const BOT_API_URL = 'http://104.131.111.229:5000'; // Bot will run on port 5000

// Player self-service endpoints
router.post('/api/player/slay', async (req, res) => {
    try {
        const { steamId, playerName } = req.body;
        
        if (!steamId || !playerName) {
            return res.status(400).json({
                success: false,
                error: 'Steam ID and player name required'
            });
        }

        // Forward to bot API
        const response = await axios.post(`${BOT_API_URL}/api/player/slay`, {
            steamId,
            playerName
        }, { timeout: 10000 });

        res.json(response.data);
        
    } catch (error) {
        console.error('Slay command error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to execute slay command'
        });
    }
});

router.post('/api/player/park', async (req, res) => {
    try {
        const { steamId, playerName } = req.body;
        
        if (!steamId || !playerName) {
            return res.status(400).json({
                success: false,
                error: 'Steam ID and player name required'
            });
        }

        const response = await axios.post(`${BOT_API_URL}/api/player/park`, {
            steamId,
            playerName
        }, { timeout: 10000 });

        res.json(response.data);
        
    } catch (error) {
        console.error('Park command error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to execute park command'
        });
    }
});

router.post('/api/player/redeem', async (req, res) => {
    try {
        const { steamId, playerName, code } = req.body;
        
        if (!steamId || !playerName || !code) {
            return res.status(400).json({
                success: false,
                error: 'Steam ID, player name, and code required'
            });
        }

        const response = await axios.post(`${BOT_API_URL}/api/player/redeem`, {
            steamId,
            playerName,
            code
        }, { timeout: 10000 });

        res.json(response.data);
        
    } catch (error) {
        console.error('Redeem command error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to execute redeem command'
        });
    }
});

router.post('/api/player/teleport', async (req, res) => {
    try {
        const { steamId, playerName, targetPlayer } = req.body;
        
        if (!steamId || !playerName || !targetPlayer) {
            return res.status(400).json({
                success: false,
                error: 'Steam ID, player name, and target player required'
            });
        }

        const response = await axios.post(`${BOT_API_URL}/api/player/teleport`, {
            steamId,
            playerName,
            targetPlayer
        }, { timeout: 10000 });

        res.json(response.data);
        
    } catch (error) {
        console.error('Teleport command error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to execute teleport command'
        });
    }
});

// Bot health check
router.get('/api/bot/status', async (req, res) => {
    try {
        const response = await axios.get(`${BOT_API_URL}/health`, { timeout: 5000 });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Bot service unavailable'
        });
    }
});

module.exports = router;