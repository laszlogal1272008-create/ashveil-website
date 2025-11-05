# 🔥 VPS RCON Bridge Update Instructions

## STEP 1: Connect to your VPS
```bash
ssh root@104.131.111.229
```

## STEP 2: Download and run the update script
```bash
# Download the script
curl -o update-bridge.sh https://raw.githubusercontent.com/your-repo/main/update-vps-bridge.sh

# Make it executable
chmod +x update-bridge.sh

# Run the update
./update-bridge.sh
```

## OR - Manual Update (if script doesn't work):

### Stop existing bridge:
```bash
pkill -f rcon-bridge
pkill -f "node.*rcon"
```

### Create enhanced bridge:
```bash
nano /root/enhanced-rcon-bridge.js
```

### Copy/paste the enhanced bridge code and save

### Start the enhanced bridge:
```bash
nohup node /root/enhanced-rcon-bridge.js > /root/rcon-bridge.log 2>&1 &
```

### Test it's working:
```bash
curl http://localhost:3001/health
```

## STEP 3: Test from Windows
After updating the bridge, test these commands:

```powershell
# Test kill command
Invoke-WebRequest -Uri "http://104.131.111.229:3001/rcon/slay" -Method POST -ContentType "application/json" -Body '{"playerName":"Misplacedcursor","commandOverride":"kill"}'

# Test murder command
Invoke-WebRequest -Uri "http://104.131.111.229:3001/rcon/slay" -Method POST -ContentType "application/json" -Body '{"playerName":"Misplacedcursor","commandOverride":"murder"}'

# Test raw endpoint
Invoke-WebRequest -Uri "http://104.131.111.229:3001/rcon/raw" -Method POST -ContentType "application/json" -Body '{"command":"admin_kill Misplacedcursor"}'
```

## STEP 4: Test from website
Go to https://ashveil.live/owner-admin and try the rapid testing!

🎯 **This enhanced bridge supports:**
- Command overrides (kill, murder, admin_kill, etc.)
- Raw command execution
- Direct command testing endpoints
- Full logging for debugging

🔥 **One of these commands WILL work and solve your RCON system!**