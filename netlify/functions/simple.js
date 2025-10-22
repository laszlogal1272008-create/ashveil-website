// Simple Netlify Function to test basic functionality
exports.handler = async (event, context) => {
  console.log('Simple test function called');
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Netlify Functions are working!',
        timestamp: new Date().toISOString(),
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          hasSTEAM_API_KEY: !!process.env.STEAM_API_KEY,
          hasDISCORD_CLIENT_ID: !!process.env.DISCORD_CLIENT_ID,
          hasWEBSITE_URL: !!process.env.WEBSITE_URL,
          steamKeyPreview: process.env.STEAM_API_KEY ? process.env.STEAM_API_KEY.substring(0, 8) + '...' : 'MISSING'
        },
        path: event.path,
        httpMethod: event.httpMethod
      })
    };
  } catch (error) {
    console.error('Simple function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      })
    };
  }
};