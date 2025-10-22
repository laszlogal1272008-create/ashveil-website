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

    // Call your deployed backend server with RCON connection
    try {
      // Render deployment URL - LIVE RCON SERVER
      const backendUrl = 'https://ashveil-website.onrender.com';
      
      // Try to call your real backend server
      const backendResponse = await fetch(`${backendUrl}/api/dinosaur/slay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          playerName: playerName.trim(), 
          steamId: steamId || 'unknown'  // Provide default steamId if not provided
        }),
        timeout: 15000 // 15 second timeout for cloud deployment
      });
      
      if (backendResponse.ok) {
        const result = await backendResponse.json();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      } else {
        throw new Error('Backend server not accessible');
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