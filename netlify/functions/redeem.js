// Use native fetch in Node.js 18+
const fetch = globalThis.fetch;

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { playerName, steamId, code } = JSON.parse(event.body);

    if (!playerName || !playerName.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Player name is required' 
        }),
      };
    }

    if (!code || !code.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Redeem code is required' 
        }),
      };
    }

    console.log('🎁 Redeem request received:', { playerName, steamId, code });

    // Execute redeem command - try Steam ID first if available, then player name
    const targetPlayer = steamId || playerName.trim();

    // TRY BOT API FIRST (New in-game admin bot)
    try {
      const botUrl = 'http://104.131.111.229:5000'; // Bot API port
      
      console.log(`🤖 Attempting redeem via bot API: ${targetPlayer} - ${code}`);
      
      const botResponse = await fetch(`${botUrl}/api/player/redeem`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          playerName: targetPlayer,
          steamId: steamId,
          code: code.trim()
        }),
        timeout: 10000 // 10 second timeout for bot
      });
      
      if (botResponse.ok) {
        const result = await botResponse.json();
        if (result.success) {
          console.log('✅ Bot redeem successful');
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: `Code '${code}' redeemed for ${playerName} via in-game admin bot!`,
              method: 'bot_api',
              playerName: playerName.trim(),
              code: code.trim(),
              timestamp: new Date().toISOString()
            }),
          };
        }
      }
    } catch (botError) {
      console.log(`⚠️ Bot API not available: ${botError.message}`);
    }

    // FALLBACK MESSAGE (RCON doesn't support redeem)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        message: `Redeem command requires the in-game admin bot. Bot is currently offline.`,
        note: 'Redeem codes can only be processed through the in-game admin bot system.',
        playerName: playerName.trim(),
        code: code.trim(),
        timestamp: new Date().toISOString(),
        troubleshooting: [
          'The admin bot needs to be running and connected to the server',
          'Redeem codes cannot be processed through RCON - requires in-game admin',
          'Please try again in a few minutes when the bot reconnects'
        ]
      }),
    };

  } catch (error) {
    console.error('Redeem function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }),
    };
  }
};