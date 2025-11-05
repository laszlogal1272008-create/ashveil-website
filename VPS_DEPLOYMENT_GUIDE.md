# 🚀 VPS BOT DEPLOYMENT - SIMPLE COMMANDS

## 🔑 Step 0: Setup SSH Key (FIRST TIME ONLY)
```powershell
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -f "$env:USERPROFILE\.ssh\vps_key" -N '""'

# Copy public key to VPS (ENTER YOUR VPS ROOT PASSWORD WHEN PROMPTED)
Get-Content "$env:USERPROFILE\.ssh\vps_key.pub" | ssh root@104.131.111.229 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# Test SSH connection (should work without password now)
ssh -i "$env:USERPROFILE\.ssh\vps_key" root@104.131.111.229 "echo 'SSH key setup successful!'"
```

##  Step 1: Upload bot to VPS
```powershell
scp -i "$env:USERPROFILE\.ssh\vps_key" -r vps-deployment\isle-bot root@104.131.111.229:/root/
```

## 🔧 Step 2: Connect to VPS and setup
```bash
ssh -i "$env:USERPROFILE\.ssh\vps_key" root@104.131.111.229
```

## 🛠️ Step 3: Install dependencies (run on VPS)
```bash
cd /root/isle-bot
apt update -y
apt install -y python3 python3-pip xvfb nodejs npm
pip3 install flask flask-cors pyautogui psutil requests pillow
npm install -g pm2
```

## 🖥️ Step 4: Start virtual display (run on VPS)
```bash
export DISPLAY=:99
Xvfb :99 -screen 0 1024x768x24 &
```

## 🤖 Step 5: Start bot (run on VPS)
```bash
chmod +x start_bot.sh
pm2 start ecosystem.config.js
pm2 save
```

## ✅ Step 6: Check bot status
```bash
pm2 list
curl http://localhost:5000/health
```

## 🧪 Step 7: Test from website
- Go to your website slay feature
- Enter your player name
- Bot should kill you in-game!

## 📊 Monitor bot
```bash
pm2 monit         # Real-time monitoring
pm2 logs isle-bot # View logs
```

---

**Bot will run on port 5000 (isolated from RCON bridge on 3001/3002)**

**Ready to start? Copy the first command and run it!** 🚀