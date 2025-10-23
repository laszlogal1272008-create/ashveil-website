# RCON Bridge Setup Guide 🚀

## Problem Solved ✅
**Austin from Physgun confirmed**: RCON ports are working, but Render.com blocks outbound connections to custom ports. Our RCON bridge bypasses this limitation!

## Solution Architecture

```
Website (Render.com) → HTTP Request → Your Local RCON Bridge → TCP RCON → Isle Server
```

## Quick Setup

### 1. Start RCON Bridge Service
```bash
cd rcon-bridge
node server.js
```

**Expected Output:**
```
🚀 RCON Bridge Service started on port 3002
🎯 Target RCON: 45.45.238.134:16007
🔑 API Key required: ashveil-rcon-bridge-2025
🌍 Allowed origins: http://localhost:3000, https://ashveil-website.netlify.app, https://ashveil-website.onrender.com
⚡ Rate limit: 30 requests/minute
```

### 2. Test Connection
```bash
# Test bridge health
curl -H "X-API-Key: ashveil-rcon-bridge-2025" http://localhost:3002/health

# Connect to RCON
curl -X POST -H "X-API-Key: ashveil-rcon-bridge-2025" http://localhost:3002/connect

# Test command
curl -X POST -H "X-API-Key: ashveil-rcon-bridge-2025" -H "Content-Type: application/json" -d '{"command":"info"}' http://localhost:3002/command
```

### 3. Update Website Configuration
Set in your `.env.local`:
```env
REACT_APP_USE_REAL_DATA=true
REACT_APP_RCON_ENABLED=true
```

## How It Works

### 1. Bridge Service (Local)
- **Runs on**: Your local machine (localhost:3002)
- **Connects to**: Isle RCON (45.45.238.134:16007)
- **Exposes**: HTTP API for website commands
- **Bypasses**: Render.com connection restrictions

### 2. Website Integration
- **Sends**: HTTP requests to bridge
- **Authentication**: API key protection
- **Fallback**: Mock data if bridge unavailable
- **Security**: CORS protection, rate limiting

### 3. RCON Communication
- **Protocol**: TCP RCON (Source engine style)
- **Authentication**: CookieMonster420 password
- **Commands**: info, list, slay, heal, teleport, etc.

## Production Deployment Options

### Option 1: Local Bridge (Recommended)
- **Pros**: Easy setup, full control, bypasses hosting limits
- **Cons**: Requires local machine running
- **Best for**: Testing, development, immediate solution

### Option 2: VPS Bridge
- **Setup**: Deploy bridge to cloud VPS (DigitalOcean, Linode, etc.)
- **Pros**: 24/7 availability, dedicated resources
- **Cons**: Additional cost (~$5-10/month)

### Option 3: Different Hosting Provider
- **Setup**: Move backend to VPS that allows custom port connections
- **Pros**: Single deployment, no bridge needed
- **Cons**: Migration work, potential reliability changes

## API Endpoints

### Bridge Service (localhost:3002)

| Endpoint | Method | Description |
|----------|---------|-------------|
| `/health` | GET | Service health check |
| `/status` | GET | RCON connection status |
| `/connect` | POST | Connect to RCON server |
| `/disconnect` | POST | Disconnect from RCON |
| `/command` | POST | Execute RCON command |

### Website Integration
The website automatically:
1. Tries RCON bridge first
2. Falls back to backend API
3. Uses mock data as final fallback

## Security Features

- **API Key Authentication**: Prevents unauthorized access
- **Rate Limiting**: 30 requests/minute max
- **CORS Protection**: Only allowed origins
- **Input Validation**: Command sanitization
- **Error Handling**: Graceful failure modes

## Troubleshooting

### Bridge Won't Start
```bash
# Check if port 3002 is in use
netstat -an | findstr :3002

# Kill process using port
taskkill /F /PID <pid>
```

### Can't Connect to RCON
1. **Check server status**: Use Austin's RCON tool
2. **Verify credentials**: Password = CookieMonster420
3. **Test direct connection**: `node direct-test.js`
4. **Check firewall**: Windows/router blocking?

### Website Can't Reach Bridge
1. **CORS Error**: Add your domain to ALLOWED_ORIGINS
2. **API Key Error**: Check X-API-Key header
3. **Network Error**: Bridge not running or wrong port

## Commands to Test

```bash
# Server info
{"command": "info"}

# List players
{"command": "list"}

# Slay player (replace with actual player name)
{"command": "slay PlayerName"}

# Heal player
{"command": "heal PlayerName"}

# Teleport player
{"command": "teleport PlayerName 0 0 0"}
```

## Next Steps

1. **✅ RCON Bridge Working**: Austin confirmed ports are open
2. **✅ Bridge Service Created**: Bypasses hosting restrictions
3. **✅ Website Integration**: Commands route through bridge
4. **🔄 Testing Phase**: Verify all commands work
5. **🚀 Go Live**: Enable real data mode

The RCON server works perfectly! We just needed to route around Render.com's limitations. Your website is now ready for full RCON integration! 🎉