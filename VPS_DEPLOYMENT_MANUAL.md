# VPS BOT DEPLOYMENT - MANUAL STEPS
# Use this if SSH password prompts don't work in VS Code terminal

## OPTION 1: Use External Terminal
1. Open Windows PowerShell (outside VS Code)
2. Run: ssh root@104.131.111.229
3. Enter password: 420CookieMonster
4. Follow deployment steps below

## OPTION 2: Fix VS Code Terminal
1. Press Ctrl+, (Settings)
2. Search: "Terminal Integrated Commands To Skip Shell"
3. Remove entries that block password input
4. Restart VS Code terminal

## OPTION 3: Test Bot Locally First (RECOMMENDED)
Test the bot system on your local machine before VPS deployment

---

# MANUAL VPS DEPLOYMENT STEPS

## Step 1: Connect to VPS
```bash
ssh root@104.131.111.229
# Password: 420CookieMonster
```

## Step 2: Create Bot Environment
```bash
# Create isolated directory
mkdir -p /root/isle-bot
cd /root/isle-bot

# Install Python and dependencies
apt update -y
apt install -y python3 python3-pip python3-venv

# Create virtual environment
python3 -m venv bot-env
source bot-env/bin/activate

# Install bot dependencies
pip install flask flask-cors pyautogui psutil requests pillow
```

## Step 3: Upload Bot File
From your Windows machine:
```powershell
# Use WinSCP, FileZilla, or command line
scp professional_isle_bot.py root@104.131.111.229:/root/isle-bot/
```

## Step 4: Start Bot Service
On VPS:
```bash
cd /root/isle-bot
source bot-env/bin/activate

# Start with PM2
pm2 start professional_isle_bot.py --name ashveil-isle-bot --interpreter python3
pm2 save
pm2 list
```

## Step 5: Test Bot
```bash
# Health check
curl http://localhost:5000/health

# Check logs
pm2 logs ashveil-isle-bot
```

---

# ALTERNATIVE: TEST LOCALLY FIRST

Instead of deploying to VPS immediately, let's test the bot on your local machine:

1. Start Steam with bot account (ashveil_bot123)
2. Launch The Isle and connect to your server
3. Run: python professional_isle_bot.py
4. Test website commands locally
5. Once working, deploy to VPS