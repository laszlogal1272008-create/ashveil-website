# Render Deployment Configuration

## Environment Variables to Add in Render:
```
PORT=5000
ISLE_SERVER_IP=45.45.238.134
ISLE_RCON_PORT=16007
ISLE_RCON_PASSWORD=CookieMonster420
DEV_MODE=false
NODE_ENV=production
```

## Render Settings:
- **Repository:** ashveil-website
- **Root Directory:** backend
- **Build Command:** npm install
- **Start Command:** node server.js
- **Environment:** Node.js
- **Plan:** Free (for testing)

## After Deployment:
1. Get your Render URL (will be like: https://your-app-name.onrender.com)
2. Update these files with your Render URL:
   - netlify/functions/slay.js (line 33)
   - netlify/functions/broadcast.js (line 33)
3. Commit and push changes
4. Test on ashveil.live

Your backend will then have real RCON connection to your Isle server!