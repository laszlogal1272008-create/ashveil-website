# Backend Deployment Guide - Render.com

## 🚀 Quick Deployment to Render (FREE)

### Step 1: Prepare for Deployment
1. Your backend code is ready ✅
2. Environment variables configured ✅
3. Package.json exists ✅

### Step 2: Deploy to Render
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Click "New Web Service"
4. Connect your GitHub repository: `ashveil-website`
5. Configure deployment:

**Build Settings:**
```bash
Root Directory: backend
Build Command: npm install
Start Command: node server.js
```

**Environment Variables to Add:**
```bash
SERVER_IP=45.45.238.134
GAME_PORT=16006
RCON_PORT=16007
RCON_PASSWORD=CookieMonster420
QUEUE_PORT=16008
SERVER_NAME=Ashveil - 3X growth - low rules - website
MAX_PLAYERS=300
API_PORT=5000
CORS_ORIGIN=https://ashveil.live
STEAM_API_KEY=FA6CC87B466294D99D31962953039784
DISCORD_CLIENT_ID=1430513772732219534
DISCORD_CLIENT_SECRET=Fh7Ze3LwyYh7Fv47zu7f6O_eyB23zTwX
SESSION_SECRET=ashveil_session_secret_2025
WEBSITE_URL=https://ashveil.live
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
PATREON_WEBHOOK_SECRET=your-patreon-webhook-secret
```

### Step 3: Update Frontend
Once deployed, you'll get a URL like: `https://ashveil-backend.onrender.com`

Update your frontend to use this URL instead of localhost:5000

### Step 4: Test Authentication
Your Steam/Discord login will work from https://ashveil.live

---

## Alternative: Railway (Also Free)
If Render doesn't work, Railway is another excellent option:
1. Go to [railway.app](https://railway.app)
2. Same process - connect GitHub repo
3. Set environment variables
4. Deploy backend subfolder

## 📝 Why Not Local Testing?
- OAuth requires same domain (security)
- CORS issues with cross-origin requests
- Production environment needed for real testing

**NEXT STEP: Go to render.com and follow Step 2 above!** 🚀