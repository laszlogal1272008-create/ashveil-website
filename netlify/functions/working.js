const { schedule } = require('@netlify/functions')

exports.handler = async (event, context) => {
  console.log('💫 Function successfully called!')
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    },
    body: JSON.stringify({
      success: true,
      message: '🚀 NETLIFY FUNCTIONS ARE WORKING!',
      timestamp: new Date().toISOString(),
      environment: {
        node_version: process.version,
        steam_key_exists: !!process.env.STEAM_API_KEY,
        discord_id_exists: !!process.env.DISCORD_CLIENT_ID,
        website_url: process.env.WEBSITE_URL || 'NOT_SET'
      },
      request: {
        method: event.httpMethod,
        path: event.path,
        headers: Object.keys(event.headers || {}).length
      }
    }, null, 2)
  }
}