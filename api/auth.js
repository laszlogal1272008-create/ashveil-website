const express = require('express');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;

const app = express();

// Configure Steam Strategy
passport.use(new SteamStrategy({
  returnURL: `${process.env.WEBSITE_URL || 'http://localhost:3000'}/api/auth/steam/return`,
  realm: process.env.WEBSITE_URL || 'http://localhost:3000',
  apiKey: process.env.STEAM_API_KEY
}, (identifier, profile, done) => {
  return done(null, profile);
}));

// Configure Discord Strategy  
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: `${process.env.WEBSITE_URL || 'http://localhost:3000'}/api/auth/discord/callback`,
  scope: ['identify', 'email']
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

app.use(passport.initialize());

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    steam_configured: !!process.env.STEAM_API_KEY,
    discord_configured: !!process.env.DISCORD_CLIENT_ID,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/steam', passport.authenticate('steam'));

app.get('/steam/return', 
  passport.authenticate('steam', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect(`${process.env.WEBSITE_URL || 'http://localhost:3000'}?steam_linked=true`);
  }
);

app.get('/discord', passport.authenticate('discord'));

app.get('/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect(`${process.env.WEBSITE_URL || 'http://localhost:3000'}?discord_linked=true`);
  }
);

module.exports = app;