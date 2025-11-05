# 🎮 MANUAL SETUP REQUIRED FOR BOT SYSTEM

## WHAT YOU MUST DO MANUALLY:

### 1. Steam Account Setup (5 minutes)
- Log into Steam with your bot account (ashveil_bot123)
- Add The Isle to library if not already done
- Set Steam to "Remember Password" ✅
- Enable Steam Guard if required (save backup codes)

### 2. The Isle Game Setup (10 minutes)
- Launch The Isle manually from Steam
- Create a character (any dinosaur)
- Connect to your server (45.45.238.134:16007)
- Make sure you can see the admin console (backtick ` key)
- Test typing `/help` in console to confirm admin access
- **IMPORTANT**: Leave the game running and connected!

### 3. Screen Position Setup (5 minutes)
The bot needs to know where to click/type. You'll help calibrate:
- Where is the console input area?
- What are the screen coordinates for typing?
- Test the backtick (`) key opens console

### 4. Keep Steam/Game Running
- Bot takes over once game is connected
- You manually start Steam + Game
- Bot handles the console commands after that

## WHAT THE BOT CAN DO AUTOMATICALLY:

### ✅ Bot Capabilities:
- Open/close game console
- Type admin commands (/slay, /redeem, /park, /teleport)
- Respond to website API requests
- Queue multiple commands
- Monitor if game crashes (alert you to restart)

### ❌ Bot CANNOT Do:
- Initial Steam login (needs your interaction)
- Install/launch The Isle first time
- Handle Steam Guard authentication
- Reconnect if server kicks the bot
- Fix network/game issues

## REALISTIC WORKFLOW:

### Your Part (Daily):
1. **Morning**: Start Steam, launch The Isle, connect to server
2. **Verify**: Admin console works, bot account is connected
3. **Start**: Run the bot Python script
4. **Monitor**: Check if game crashes (restart manually)

### Bot Part (Automatic):
1. **API Server**: Always running, accepting website commands
2. **Console Control**: Executing /slay, /redeem, etc. commands
3. **Queue Management**: Handling multiple requests
4. **Error Handling**: Reporting success/failure to website

## HYBRID SOLUTION (RECOMMENDED):

Instead of full automation, we create a **semi-automated system**:

1. **You manually start**: Steam + The Isle + Connect to server
2. **Bot takes over**: All console commands from website
3. **Monitoring script**: Alerts you if game disconnects
4. **Fallback system**: Website uses RCON when bot offline

This is actually MORE RELIABLE than trying to fully automate Steam!