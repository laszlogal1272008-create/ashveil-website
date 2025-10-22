// Use native fetch in Node.js 18+
const fetch = globalThis.fetch;

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    const { message, priority } = JSON.parse(event.body);

    if (!message || !message.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Broadcast message is required' 
        }),
      };
    }

    // Try to call your deployed backend server with RCON connection
    try {
      const backendUrl = 'https://ashveil-backend-production.up.railway.app'; // Deployed backend server
      
      // Try to call your real backend server
      const backendResponse = await fetch(`${backendUrl}/api/owner/server/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, priority })
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
      // If backend is not accessible, return simulation
      console.log(`⚠️ Cannot reach backend server: ${backendError.message}`);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: `[SIMULATION] Broadcast: ${message}`,
          broadcastId: Date.now().toString(),
          priority: priority || 'normal',
          timestamp: new Date().toISOString(),
          note: 'Simulated - backend server not accessible. Deploy your backend server for real RCON functionality.'
        }),
      };
    }

  } catch (error) {
    console.error('Broadcast function error:', error);
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