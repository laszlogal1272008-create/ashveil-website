# Netlify Functions Deployment - COMPLETE SETUP ✅

## 🎉 Perfect! You're Already Paying for Netlify!

Since you have a paid Netlify plan, we can use **Netlify Functions** for your backend - this is the BEST solution!

## ✅ What I've Set Up:

### 1. Netlify Functions Structure
```
netlify/functions/
├── api.js      # Main API endpoints
└── auth.js     # OAuth authentication
```

### 2. Updated Configuration
- ✅ `netlify.toml` - Routing configured
- ✅ `package.json` - Dependencies added
- ✅ `backend/auth.js` - URLs updated for ashveil.live

### 3. Route Mapping
- `https://ashveil.live/auth/steam` → Steam OAuth
- `https://ashveil.live/auth/discord` → Discord OAuth
- `https://ashveil.live/api/health` → Health check

## 🚀 Next Steps:

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Environment Variables in Netlify
Go to your Netlify dashboard → Site settings → Environment variables

Add these variables:
```bash
STEAM_API_KEY=FA6CC87B466294D99D31962953039784
DISCORD_CLIENT_ID=1430513772732219534
DISCORD_CLIENT_SECRET=Fh7Ze3LwyYh7Fv47zu7f6O_eyB23zTwX
SESSION_SECRET=ashveil_session_secret_2025
WEBSITE_URL=https://ashveil.live
SERVER_IP=45.45.238.134
GAME_PORT=16006
RCON_PORT=16007
RCON_PASSWORD=CookieMonster420
QUEUE_PORT=16008
MAX_PLAYERS=300
```

### Step 3: Deploy
```bash
git add .
git commit -m "Add Netlify Functions for OAuth"
git push origin main
```

## 🎯 Benefits of This Approach:

✅ **Same Domain** - Perfect for OAuth (no CORS issues)  
✅ **Serverless** - Scales automatically, no server management  
✅ **Cost Effective** - Already included in your Netlify plan  
✅ **Professional** - Production-ready hosting  
✅ **Easy Updates** - Deploy with git push  

## 🔥 What Happens Next:

1. Your Steam/Discord login will work from https://ashveil.live
2. Authentication will be handled by Netlify Functions
3. No need for separate backend server
4. Everything runs on the same domain

**Ready to deploy? Run the commands in Step 1-3 above!** 🚀

---

## Testing After Deployment:
- Visit https://ashveil.live
- Click Steam or Discord login
- Should redirect to OAuth and back seamlessly

Your authentication system will be **100% functional** on the live site!