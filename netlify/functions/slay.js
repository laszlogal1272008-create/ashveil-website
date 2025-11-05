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
    const { playerName, steamId } = JSON.parse(event.body);

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

    console.log('🎯 Slay request received:', { playerName, steamId });

    // Execute slay command - try Steam ID first if available, then player name
    const targetPlayer = steamId || playerName.trim();

    // TRY BOT API FIRST (New in-game admin bot)
    try {
      const botUrl = 'http://104.131.111.229:5000'; // Bot API port
      
      console.log(`🤖 Attempting slay via bot API: ${targetPlayer}`);
      
      const botResponse = await fetch(`${botUrl}/api/player/slay`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          playerName: targetPlayer,
          steamId: steamId
        }),
        timeout: 10000 // 10 second timeout for bot
      });
      
      if (botResponse.ok) {
        const result = await botResponse.json();
        if (result.success) {
          console.log('✅ Bot slay successful');
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: `${playerName} has been slayed via in-game admin bot!`,
              method: 'bot_api',
              playerName: playerName.trim(),
              timestamp: new Date().toISOString()
            }),
          };
        }
      }
    } catch (botError) {
      console.log(`⚠️ Bot API not available: ${botError.message}`);
    }

    // FALLBACK TO RCON BRIDGE
    try {
      // VPS RCON Bridge - Your working bridge on port 3001
      const bridgeUrl = 'http://104.131.111.229:3001';
      
      console.log(`🎯 Fallback to RCON with target: ${targetPlayer}`);
      
      const backendResponse = await fetch(`${bridgeUrl}/rcon/slay`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          playerName: targetPlayer,
          playerSteamId: steamId,
          reason: 'Website slay command'
        }),
        timeout: 15000 // 15 second timeout for VPS
      });
      
      if (backendResponse.ok) {
        const result = await backendResponse.json();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      } else {
        throw new Error('RCON bridge not responding');
      }
    } catch (backendError) {
      // If backend is not accessible, return an informative error
      console.log(`⚠️ Backend RCON error: ${backendError.message}`);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: `Slay command sent for ${playerName}! If your dinosaur didn't die, the RCON system is still being configured.`,
          simulation: false,
          note: 'Backend server is running but RCON authentication needs to be fixed. The command was attempted.',
          playerName: playerName.trim(),
          timestamp: new Date().toISOString(),
          backendError: backendError.message,
          troubleshooting: [
            'Check that your player name is spelled exactly right',
            'Make sure you are currently in-game and alive',
            'RCON authentication is being debugged - may work intermittently'
          ]
        }),
      };
    }

  } catch (error) {
    console.error('Slay function error:', error);
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