# 🚀 QUICK SETUP - Ready for Tomorrow (Oct 24)

## Step 1: Start RCON Bridge (5 minutes)
```bash
cd c:\Users\laszl\my-website\rcon-bridge
node server.js
```
**Keep this running!** You should see:
```
🚀 RCON Bridge Service started on port 3002
🎯 Target RCON: 45.45.238.134:16007
```

## Step 2: Enable Real Data (2 minutes)
Create `.env.local` in your main website folder:
```env
REACT_APP_USE_REAL_DATA=true
REACT_APP_RCON_ENABLED=true
```

## Step 3: Deploy Website (5 minutes)
```bash
cd c:\Users\laszl\my-website
npm run build
```
Then upload the `build` folder to your hosting (Netlify/Render).

## Step 4: Test It Works (2 minutes)
1. Visit your website
2. Login with Steam
3. Try a slay command
4. Check if dinosaur dies on server

## That's It! ✅

**Total setup time: ~15 minutes**

Your website will:
- ✅ Connect to real Isle server
- ✅ Execute real RCON commands
- ✅ Work for all beta testers tomorrow
- ✅ Show live server status

Just keep the RCON bridge running on your computer and everything works!