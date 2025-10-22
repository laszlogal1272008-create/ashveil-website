const express = require('express');
const serverless = require('serverless-http');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;
const session = require('express-session');
const axios = require('axios');

const app = express();

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'ashveil_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

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
      const steamId = identifier.split('/').pop();
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
        email: profile.email,
        verified: profile.verified,
        guilds: profile.guilds || []
      };
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

// Routes
app.get('/steam', passport.authenticate('steam'));

app.get('/steam/return', 
  passport.authenticate('steam', { failureRedirect: '/?auth=failed' }),
  (req, res) => {
    res.redirect('/?auth=success&provider=steam');
  }
);

app.get('/discord', passport.authenticate('discord'));

app.get('/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/?auth=failed' }),
  (req, res) => {
    res.redirect('/?auth=success&provider=discord');
  }
);

app.get('/user', (req, res) => {
  if (req.user) {
    res.json({ success: true, user: req.user });
  } else {
    res.json({ success: false, message: 'Not authenticated' });
  }
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.json({ success: false, error: err.message });
    }
    res.redirect('/');
  });
});

exports.handler = serverless(app);