// Minimal auth function without external dependencies for testing
exports.handler = async (event, context) => {
  console.log('Auth function called:', event.path);
  
  const path = event.path;
  
  if (path === '/health') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Auth function is working',
        environment: {
          steamConfigured: !!process.env.STEAM_API_KEY,
          discordConfigured: !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET)
        }
      })
    };
  }
  
  if (path === '/steam') {
    // Redirect to Steam OpenID
    const realm = 'https://ashveil.live';
    const returnUrl = 'https://ashveil.live/.netlify/functions/auth/steam/return';
    const steamUrl = `https://steamcommunity.com/openid/login?openid.ns=http://specs.openid.net/auth/2.0&openid.mode=checkid_setup&openid.return_to=${encodeURIComponent(returnUrl)}&openid.realm=${encodeURIComponent(realm)}&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select`;
    
    return {
      statusCode: 302,
      headers: {
        'Location': steamUrl
      }
    };
  }
  
  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Not found' })
  };
};