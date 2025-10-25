# Manual VPS Deployment Steps

## Step 1: Copy the Enhanced Bridge File
1. Right-click on `rcon-bridge-enhanced-24x7.js` 
2. Select "Copy"
3. Open your VPS terminal/console
4. Navigate to `/root/` directory
5. Create new file: `nano rcon-bridge-enhanced.js`
6. Paste the content and save (Ctrl+X, Y, Enter)

## Step 2: Install Dependencies
```bash
cd /root
npm install express cors
```

## Step 3: Stop Old Bridge (if running)
```bash
pm2 stop rcon-bridge
```

## Step 4: Start Enhanced Bridge
```bash
pm2 start rcon-bridge-enhanced.js --name rcon-bridge-enhanced
pm2 save
```

## Step 5: Check Status
```bash
pm2 status
pm2 logs rcon-bridge-enhanced
```

## Quick Commands for VPS Console:
```bash
# View live logs
pm2 logs rcon-bridge-enhanced --lines 50

# Restart if needed
pm2 restart rcon-bridge-enhanced

# Check if it's working
curl http://localhost:3001/health
```

## If You Need to Access VPS via Web Browser:
1. Go to your DigitalOcean dashboard
2. Click on your droplet (ashveil-isle-rcon)
3. Click "Console" to open web terminal
4. Login as root with your password
5. Run the commands above