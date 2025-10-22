# 🚨 ISLE SERVER NOT VISIBLE IN GAME - TROUBLESHOOTING GUIDE

## 🔍 CURRENT STATUS (October 22, 2025)

### ✅ What's Working:
- **RCON Port 16007**: ✅ Accessible (server is running)
- **Server IP**: 45.45.238.134 responding to ping
- **Website**: https://ashveil.live fully operational

### ❌ What's NOT Working:
- **Game Port 7777**: ❌ Connection failed
- **Game Port 16006**: ❌ Connection failed  
- **Server not visible in Isle server browser**

## 🎯 ROOT CAUSE

**The Isle Evrima server process is not running or not listening on the game ports.**

## 🔧 IMMEDIATE ACTION REQUIRED

### 1. Check Isle Server Process
```bash
# On the server (45.45.238.134), check if Isle is running:
ps aux | grep Isle
netstat -tulpn | grep :7777
netstat -tulpn | grep :16006
```

### 2. Restart Isle Evrima Server
The Isle server process needs to be restarted on the hosting machine.

### 3. Verify Port Configuration
The server should be configured to listen on:
- **Game Port**: 7777 (standard Isle port) OR 16006 (custom)
- **Query Port**: Usually Game Port + 1
- **RCON Port**: 16007 ✅ (already working)

## 📞 CONTACT HOSTING PROVIDER

**Austin (DevOps) needs to:**

1. **Restart the Isle Evrima server process**
2. **Verify game port is binding correctly**
3. **Check firewall rules for ports 7777/16006**
4. **Confirm server startup parameters**

## 🔍 DIAGNOSTIC COMMANDS

### For Server Admin:
```bash
# Check if Isle process is running
systemctl status isle-evrima  # or equivalent service name

# Check port bindings
netstat -tulpn | grep isle

# Check firewall
ufw status | grep 7777
ufw status | grep 16006

# Restart Isle server
systemctl restart isle-evrima  # or equivalent
```

## 📋 SERVER CONFIGURATION CHECK

### Current Settings (.env):
- **Server IP**: 45.45.238.134 ✅
- **Game Port**: 16006 (not responding ❌)
- **RCON Port**: 16007 ✅
- **Server Name**: "Ashveil - 3X growth - low rules - website"

### Standard Isle Ports:
- **Game**: 7777
- **Query**: 7778  
- **RCON**: Custom (16007) ✅

## 🚨 URGENT STEPS

1. **Contact Austin immediately** - Server process is down
2. **Restart Isle Evrima server** on hosting machine
3. **Verify port 7777 or 16006 is listening** after restart
4. **Test server visibility** in Isle server browser

## 📞 SUPPORT MESSAGE FOR AUSTIN:

```
Hi Austin,

The Isle Evrima server (45.45.238.134) is not showing up in the game server browser.

RCON port 16007 is working, but game ports 7777 and 16006 are not responding.

The Isle server process appears to be down or not binding to the game port correctly.

Can you please:
1. Check if the Isle server process is running
2. Restart the Isle Evrima server
3. Verify it's listening on port 7777 (or 16006)
4. Ensure firewall allows game port traffic

Website and authentication are working perfectly - this is just the game server process.

Thanks!
```

---

## 🔄 NEXT STEPS AFTER FIX

Once Austin restarts the server, players should be able to:
- See "Ashveil - 3X growth - low rules - website" in server browser  
- Connect to play on the server
- Use the website for authentication and features

**This is a hosting/server administration issue, not a website problem.**