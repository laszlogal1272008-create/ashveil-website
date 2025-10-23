# 🚀 DEPLOY RCON BRIDGE TO PUBLIC URL

## Quick Railway Deployment (5 minutes)

### Step 1: Go to Railway.app
1. Visit https://railway.app
2. Sign up/login with GitHub
3. Click "New Project"
4. Connect your GitHub repo

### Step 2: Deploy RCON Bridge
1. Select "Deploy from GitHub repo"
2. Choose your `ashveil-website` repo
3. **Root Directory**: Set to `rcon-bridge`
4. **Build Command**: `npm install`
5. **Start Command**: `node server.js`

### Step 3: Set Environment Variables
In Railway dashboard, add these variables:
```
RCON_HOST=45.45.238.134
RCON_PORT=16007
RCON_PASSWORD=CookieMonster420
BRIDGE_API_KEY=ashveil-rcon-bridge-2025
ALLOWED_ORIGINS=https://ashveil-website.netlify.app,https://ashveil-website.onrender.com
```

### Step 4: Get Public URL
Railway will give you a URL like:
`https://your-app-name.railway.app`

### Step 5: Update Website Config
Add this to your `.env.local`:
```
REACT_APP_RCON_BRIDGE_URL=https://your-app-name.railway.app
```

### Step 6: Rebuild & Deploy
```bash
npm run build
# Upload build folder to your live website
```

## Then Test:
1. Go to live website
2. Login with Steam  
3. Click slay button
4. **BOOM!** Dinosaur dies in-game! 🎯

**This gives you a public RCON bridge that your live website can reach!**