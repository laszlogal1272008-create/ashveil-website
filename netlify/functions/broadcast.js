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

    // In production, you would call your backend server or RCON directly
    // For now, we'll simulate the broadcast command
    
    console.log(`🎭 NETLIFY: Simulating broadcast: ${message}`);
    
    // Simulate successful broadcast
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Broadcast sent successfully: ${message}`,
        broadcastId: Date.now().toString(),
        priority: priority || 'normal',
        timestamp: new Date().toISOString(),
        note: 'Simulated in production - connect to your backend server for real RCON functionality'
      }),
    };

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