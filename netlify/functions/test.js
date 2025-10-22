exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      success: true,
      message: 'Functions are working!',
      environment: {
        steam: !!process.env.STEAM_API_KEY,
        discord_id: !!process.env.DISCORD_CLIENT_ID,
        discord_secret: !!process.env.DISCORD_CLIENT_SECRET
      },
      timestamp: new Date().toISOString()
    })
  };
};