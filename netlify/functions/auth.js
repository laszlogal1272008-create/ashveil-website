// Direct handler without express - more reliable for Netlify Functions
exports.handler = async (event, context) => {
  const { path, httpMethod, queryStringParameters } = event;
  
  // Extract the route from path or event parameters
  let route = '';
  
  // The path might be just the function path or include the full path
  if (path.includes('/auth/')) {
    const pathSegments = path.split('/').filter(Boolean);
    const authIndex = pathSegments.indexOf('auth');
    if (authIndex !== -1 && authIndex < pathSegments.length - 1) {
      route = pathSegments.slice(authIndex + 1).join('/');
    }
  } else {
    // Fallback: check if this is the splat parameter
    route = path.replace('/', '').replace('.netlify/functions/auth/', '');
  }
  
  console.log('Auth function called:', { path, httpMethod, route, query: queryStringParameters });
  
  try {
    // Health check
    if (route === 'health') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          steam: !!process.env.STEAM_API_KEY,
          discord: !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
          route: route,
          path: path
        })
      };
    }
    
    // Steam OAuth initiation
    if (route === 'steam' && httpMethod === 'GET') {
      const steamOpenIdUrl = 'https://steamcommunity.com/openid/login?' + 
        new URLSearchParams({
          'openid.ns': 'http://specs.openid.net/auth/2.0',
          'openid.mode': 'checkid_setup',
          'openid.return_to': 'https://ashveil.live/auth/steam/callback',
          'openid.realm': 'https://ashveil.live',
          'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
          'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
        });
      
      return {
        statusCode: 302,
        headers: {
          'Location': steamOpenIdUrl
        }
      };
    }
    
    // Steam OAuth callback
    if (route === 'steam/callback' && httpMethod === 'GET') {
      // Verify Steam OpenID response
      if (queryStringParameters && queryStringParameters['openid.mode'] === 'id_res') {
        const identity = queryStringParameters['openid.identity'];
        const steamId = identity ? identity.split('/').pop() : null;
        
        if (steamId) {
          // Get Steam user info
          const steamApiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`;
          
          try {
            const response = await fetch(steamApiUrl);
            const data = await response.json();
            const player = data.response?.players?.[0];
            
            if (player) {
              // Enhanced Steam data with avatar and profile info
              const steamData = {
                steamid: steamId,
                username: player.personaname,
                avatar: player.avatarfull || player.avatarmedium || player.avatar,
                profileurl: player.profileurl,
                realname: player.realname || '',
                country: player.loccountrycode || '',
                timecreated: player.timecreated || 0
              };
              
              // Create URL parameters for enhanced data
              const params = new URLSearchParams({
                auth: 'success',
                provider: 'steam',
                steamid: steamData.steamid,
                username: encodeURIComponent(steamData.username),
                avatar: encodeURIComponent(steamData.avatar || ''),
                profileurl: encodeURIComponent(steamData.profileurl || ''),
                realname: encodeURIComponent(steamData.realname || ''),
                country: steamData.country || '',
                timecreated: steamData.timecreated || ''
              });
              
              return {
                statusCode: 302,
                headers: {
                  'Location': `https://ashveil.live/?${params.toString()}`
                }
              };
            }
          } catch (error) {
            console.error('Steam API error:', error);
          }
        }
      }
      
      return {
        statusCode: 302,
        headers: {
          'Location': 'https://ashveil.live/?auth=failed&provider=steam'
        }
      };
    }
    
    // Discord OAuth initiation
    if (route === 'discord' && httpMethod === 'GET') {
      const discordAuthUrl = 'https://discord.com/api/oauth2/authorize?' + 
        new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID,
          redirect_uri: 'https://ashveil.live/auth/discord/callback',
          response_type: 'code',
          scope: 'identify'
        });
      
      return {
        statusCode: 302,
        headers: {
          'Location': discordAuthUrl
        }
      };
    }
    
    // Discord OAuth callback
    if (route === 'discord/callback' && httpMethod === 'GET') {
      const { code } = queryStringParameters || {};
      
      if (!code) {
        return {
          statusCode: 302,
          headers: {
            'Location': 'https://ashveil.live/?auth=failed&provider=discord'
          }
        };
      }
      
      try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: 'https://ashveil.live/auth/discord/callback'
          })
        });
        
        const tokenData = await tokenResponse.json();
        
        if (tokenData.access_token) {
          // Get user info
          const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`
            }
          });
          
          const userData = await userResponse.json();
          
          // Enhanced Discord data
          const discordData = {
            userid: userData.id,
            username: userData.username,
            discriminator: userData.discriminator || '0000',
            avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=256` : null,
            global_name: userData.global_name || userData.username,
            email: userData.email || '',
            verified: userData.verified || false,
            locale: userData.locale || 'en-US',
            flags: userData.flags || 0,
            premium_type: userData.premium_type || 0
          };
          
          // Create URL parameters for enhanced Discord data
          const params = new URLSearchParams({
            auth: 'success',
            provider: 'discord',
            userid: discordData.userid,
            username: encodeURIComponent(discordData.username),
            discriminator: discordData.discriminator,
            avatar: encodeURIComponent(discordData.avatar || ''),
            global_name: encodeURIComponent(discordData.global_name),
            verified: discordData.verified.toString(),
            locale: discordData.locale,
            premium_type: discordData.premium_type.toString()
          });
          
          return {
            statusCode: 302,
            headers: {
              'Location': `https://ashveil.live/?${params.toString()}`
            }
          };
        }
      } catch (error) {
        console.error('Discord OAuth error:', error);
      }
      
      return {
        statusCode: 302,
        headers: {
          'Location': 'https://ashveil.live/?auth=failed&provider=discord'
        }
      };
    }
    
    // Default response
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Route not found',
        route: route,
        path: path,
        availableRoutes: ['health', 'steam', 'steam/callback', 'discord', 'discord/callback']
      })
    };
    
  } catch (error) {
    console.error('Auth function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};