# 🚀 24/7 RCON Bridge Solutions

## Option 1: Windows Service (Recommended) ⭐

### Setup Auto-Start on Boot
```powershell
# Create Windows Task Scheduler entry
schtasks /create /tn "Ashveil RCON Bridge" /tr "node C:\Users\laszl\my-website\rcon-bridge\server.js" /sc onstart /ru SYSTEM /rl HIGHEST
```

### Or Use PM2 (Process Manager)
```bash
# Install PM2 globally
npm install -g pm2

# Start bridge with PM2
cd C:\Users\laszl\my-website\rcon-bridge
pm2 start server.js --name "ashveil-rcon-bridge"

# Setup PM2 to start on boot
pm2 startup
pm2 save
```

**Benefits**: Runs automatically, restarts on crashes, logs everything

## Option 2: Deploy to VPS (Best for Production) 🌟

### Cheap VPS Options ($5-10/month):
- **DigitalOcean Droplet**: $6/month
- **Linode Nanode**: $5/month  
- **Vultr**: $6/month
- **AWS EC2 t3.micro**: ~$8/month

### Quick VPS Setup:
```bash
# On VPS - Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Upload your rcon-bridge folder
# Install dependencies
npm install

# Install PM2
npm install -g pm2

# Start bridge
pm2 start server.js --name ashveil-rcon-bridge

# Setup auto-restart
pm2 startup
pm2 save
```

**Benefits**: 24/7 uptime, dedicated resources, no dependence on your PC

## Option 3: Railway/Render Deployment (Easiest) 🚀

### Railway.app (Free tier available)
1. Connect GitHub repo
2. Deploy `rcon-bridge` folder
3. Set environment variables
4. Automatic 24/7 hosting

### Render.com (Your current host)
1. Create new service
2. Connect to your repo
3. Set build command: `cd rcon-bridge && npm install`
4. Set start command: `node server.js`

**Benefits**: Zero maintenance, automatic updates, professional hosting

## Option 4: Docker Container 🐳

### Create Dockerfile:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY rcon-bridge/package*.json ./
RUN npm install
COPY rcon-bridge/ ./
EXPOSE 3002
CMD ["node", "server.js"]
```

### Run with Docker:
```bash
# Build image
docker build -t ashveil-rcon-bridge .

# Run container (restarts automatically)
docker run -d --restart unless-stopped -p 3002:3002 ashveil-rcon-bridge
```

## Quick Setup for Tomorrow + Long Term

### For Tomorrow (Quick):
```bash
# Install PM2
npm install -g pm2

# Start bridge with PM2
cd rcon-bridge
pm2 start server.js --name ashveil-rcon

# Setup auto-start (runs on boot)
pm2 startup
pm2 save
```

### For Production (Best):
**Deploy to Railway.app** (5 minutes setup):
1. Sign up at railway.app
2. Connect your GitHub repo
3. Deploy the `rcon-bridge` folder
4. Set environment variables
5. Get permanent URL: `https://your-app.railway.app`

### Update Website Config:
```env
# Change from localhost to your permanent URL
REACT_APP_RCON_BRIDGE_URL=https://your-app.railway.app
```

## Recommended Path:

### Phase 1 (Today): PM2 Local
```bash
npm install -g pm2
cd rcon-bridge
pm2 start server.js --name ashveil-rcon
pm2 startup
pm2 save
```

### Phase 2 (After Beta): Deploy to Railway
- Move bridge to cloud hosting
- Get permanent URL
- Update website config
- No more dependence on your PC

## PM2 Commands (Most Useful):
```bash
pm2 list                    # See running processes
pm2 restart ashveil-rcon   # Restart bridge
pm2 logs ashveil-rcon      # View logs
pm2 stop ashveil-rcon      # Stop bridge
pm2 delete ashveil-rcon    # Remove from PM2
```

**For tomorrow: Use PM2 locally. For production: Deploy to Railway/Render.** 

This gives you 24/7 operation without manual restarts! 🎉