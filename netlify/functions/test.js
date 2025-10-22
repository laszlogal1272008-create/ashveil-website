const express = require('express');
const serverless = require('serverless-http');

const app = express();

// Test endpoint to verify Steam API key and domain
app.get('/test-steam', async (req, res) => {
  const steamApiKey = process.env.STEAM_API_KEY;
  const websiteUrl = process.env.WEBSITE_URL || 'https://ashveil.live';
  
  if (!steamApiKey) {
    return res.json({ 
      success: false, 
      error: 'Steam API key not found',
      env: process.env
    });
  }
  
  try {
    // Test Steam API call
    const axios = require('axios');
    const testSteamId = '76561197960435530'; // Test Steam ID
    const steamApiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${testSteamId}`;
    
    const response = await axios.get(steamApiUrl);
    
    res.json({
      success: true,
      steamApiWorking: response.status === 200,
      steamData: response.data,
      config: {
        apiKey: steamApiKey.substring(0, 8) + '...',
        websiteUrl: websiteUrl,
        steamRealm: websiteUrl,
        returnUrl: `${websiteUrl}/.netlify/functions/auth/steam/return`
      }
    });
    
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      config: {
        apiKey: steamApiKey ? steamApiKey.substring(0, 8) + '...' : 'MISSING',
        websiteUrl: websiteUrl
      }
    });
  }
});

// Simple OpenID test
app.get('/test-openid', (req, res) => {
  const websiteUrl = process.env.WEBSITE_URL || 'https://ashveil.live';
  
  // Create Steam OpenID URL manually to test
  const steamOpenIdUrl = 'https://steamcommunity.com/openid/login?' +
    'openid.ns=http://specs.openid.net/auth/2.0&' +
    'openid.mode=checkid_setup&' +
    'openid.return_to=' + encodeURIComponent(`${websiteUrl}/.netlify/functions/test/steam-callback`) + '&' +
    'openid.realm=' + encodeURIComponent(websiteUrl) + '&' +
    'openid.identity=http://specs.openid.net/auth/2.0/identifier_select&' +
    'openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select';
    
  res.json({
    steamOpenIdUrl: steamOpenIdUrl,
    realm: websiteUrl,
    returnUrl: `${websiteUrl}/.netlify/functions/test/steam-callback`
  });
});

exports.handler = serverless(app);