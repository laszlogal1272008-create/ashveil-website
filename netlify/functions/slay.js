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

    // Call your actual backend server with RCON connection
    try {
      // You'll need to replace this with your actual backend server URL
      // For now, we'll check if we can connect to your local backend
      const backendUrl = 'http://localhost:5000'; // Your backend server
      
      // Try to call your real backend server
      const backendResponse = await fetch(`${backendUrl}/api/dinosaur/slay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerName.trim(), steamId })
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
      console.log(`⚠️ Cannot reach backend server: ${backendError.message}`);
      
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Server temporarily unavailable',
          message: 'The RCON server is not currently accessible. This feature requires your backend server to be running and accessible from the internet.',
          details: 'To use real RCON features on the live website, you need to deploy your backend server to a cloud service or configure remote access.',
          simulatedMessage: `[SIMULATION] Would slay ${playerName}'s dinosaur`
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