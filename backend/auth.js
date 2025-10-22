// OAuth Authentication Routes for Ashveil Website
const express = require('express');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;
const session = require('express-session');
const axios = require('axios');

const router = express.Router();

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'ashveil_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Steam Strategy
if (process.env.STEAM_API_KEY) {
  const baseUrl = process.env.WEBSITE_URL || 'https://ashveil.live';
  passport.use(new SteamStrategy({
    returnURL: `${baseUrl}/auth/steam/return`,
    realm: `${baseUrl}/`,
    apiKey: process.env.STEAM_API_KEY
  },
  async (identifier, profile, done) => {
    try {
      // Extract Steam ID from identifier
      const steamId = identifier.split('/').pop();
      
      // Fetch additional Steam data
      const steamApiUrl = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`;
      const response = await axios.get(steamApiUrl);
      
      const steamData = response.data.response.players[0];
      
      const user = {
        provider: 'steam',
        steamId: steamId,
        displayName: steamData.personaname,
        avatar: steamData.avatarfull,
        profileUrl: steamData.profileurl,
        realName: steamData.realname || null,
        country: steamData.loccountrycode || null,
        lastLogoff: steamData.lastlogoff || null
      };
      
      return done(null, user);
    } catch (error) {
      console.error('Steam auth error:', error);
      return done(error, null);
    }
  }));
}

// Discord Strategy
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  const baseUrl = process.env.WEBSITE_URL || 'https://ashveil.live';
  passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: `${baseUrl}/auth/discord/callback`,
    scope: ['identify', 'guilds']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = {
        provider: 'discord',
        discordId: profile.id,
        username: profile.username,
        discriminator: profile.discriminator,
        avatar: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
        email: profile.email || null,
        verified: profile.verified || false,
        guilds: profile.guilds || []
      };
      
      return done(null, user);
    } catch (error) {
      console.error('Discord auth error:', error);
      return done(error, null);
    }
  }));
}

// Serialize/Deserialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Middleware setup function
const setupAuth = (app) => {
  app.use(session(sessionConfig));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/auth', router);
};

// Steam Authentication Routes
router.get('/steam', passport.authenticate('steam', { failureRedirect: '/auth/failure' }));

router.get('/steam/return', 
  passport.authenticate('steam', { failureRedirect: '/auth/failure' }),
  (req, res) => {
    // Successful authentication
    res.redirect(`${process.env.WEBSITE_URL}?steam_auth=success`);
  }
);

// Discord Authentication Routes
router.get('/discord', passport.authenticate('discord'));

router.get('/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/auth/failure' }),
  (req, res) => {
    // Successful authentication
    res.redirect(`${process.env.WEBSITE_URL}?discord_auth=success`);
  }
);

// Get current user
router.get('/user', (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      user: req.user
    });
  } else {
    res.json({
      success: false,
      message: 'Not authenticated'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.json({ success: false, error: err.message });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Authentication failure
router.get('/failure', (req, res) => {
  res.redirect(`${process.env.WEBSITE_URL}?auth_error=true`);
});

module.exports = { setupAuth, router };