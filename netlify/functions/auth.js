const express = require('express');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;
const session = require('express-session');
const serverless = require('serverless-http');

const app = express();

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'ashveil-secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Steam Strategy
passport.use(new SteamStrategy({
  returnURL: 'https://ashveil.live/.netlify/functions/auth/steam/return',
  realm: 'https://ashveil.live',
  apiKey: process.env.STEAM_API_KEY
}, (identifier, profile, done) => {
  const steamId = identifier.split('/').pop();
  const user = {
    provider: 'steam',
    steamId: steamId,
    displayName: profile.displayName,
    avatar: profile.photos?.[2]?.value
  };
  return done(null, user);
}));

// Discord Strategy  
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: 'https://ashveil.live/.netlify/functions/auth/discord/callback',
  scope: ['identify']
}, (accessToken, refreshToken, profile, done) => {
  const user = {
    provider: 'discord',
    discordId: profile.id,
    username: profile.username,
    avatar: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null
  };
  return done(null, user);
}));

// Routes
app.get('/steam', passport.authenticate('steam'));
app.get('/steam/return', passport.authenticate('steam', { failureRedirect: '/?auth=failed' }), (req, res) => {
  res.redirect('/?auth=success&provider=steam');
});

app.get('/discord', passport.authenticate('discord'));
app.get('/discord/callback', passport.authenticate('discord', { failureRedirect: '/?auth=failed' }), (req, res) => {
  res.redirect('/?auth=success&provider=discord');
});

app.get('/user', (req, res) => {
  res.json({ success: !!req.user, user: req.user || null });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    steam: !!process.env.STEAM_API_KEY,
    discord: !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET)
  });
});

module.exports.handler = serverless(app);