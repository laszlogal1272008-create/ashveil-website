// WORKING: Simple Netlify Function to test basic functionality
exports.handler = async (event, context) => {
  console.log('✅ SIMPLE FUNCTION CALLED - Functions are deploying!');
  console.log('Event path:', event.path);
  console.log('HTTP method:', event.httpMethod);
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    },
    body: JSON.stringify({
      success: true,
      message: '🎉 Netlify Functions are WORKING!',
      timestamp: new Date().toISOString(),
      deployment_test: 'PASSED',
      environment_check: {
        NODE_ENV: process.env.NODE_ENV || 'undefined',
        hasSTEAM_API_KEY: !!process.env.STEAM_API_KEY,
        hasDISCORD_CLIENT_ID: !!process.env.DISCORD_CLIENT_ID,
        hasWEBSITE_URL: !!process.env.WEBSITE_URL,
        steamKeyPreview: process.env.STEAM_API_KEY ? 
          process.env.STEAM_API_KEY.substring(0, 8) + '...' : 'MISSING',
        totalEnvVars: Object.keys(process.env).length
      },
      request_info: {
        path: event.path,
        method: event.httpMethod,
        headers: event.headers ? Object.keys(event.headers).length : 0
      }
    }, null, 2)
  };
};