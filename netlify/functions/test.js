// Zero dependencies test function
exports.handler = async (event, context) => {
  console.log('Test function called successfully');
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      success: true,
      message: 'Netlify Functions are working!',
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        steamKeyExists: !!process.env.STEAM_API_KEY,
        discordIdExists: !!process.env.DISCORD_CLIENT_ID,
        discordSecretExists: !!process.env.DISCORD_CLIENT_SECRET
      }
    }, null, 2)
  };
};