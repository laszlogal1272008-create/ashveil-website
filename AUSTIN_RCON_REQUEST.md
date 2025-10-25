## RCON Support Request - Need Austin's Assistance

Hi Austin,

We're working on implementing RCON functionality for the AshVeil Isle server to enable website integration (specifically the slay feature), and we've run into a technical challenge that we believe you can help us solve.

**Current Situation:**
We have successfully connected to your Isle server (45.45.238.134:16007) and confirmed that port 16007 is open and accepting TCP connections. We've also made the following server configuration changes:

**Server Files Modified:**
- Created/Updated `Game.ini` with RCON settings:
  ```
  [/Script/TheIsle.TIGameSession]
  bRconEnabled=true
  RconPassword=CookieMonster420
  RconPort=16007
  ```
- Created `Engine.ini` (was missing) with required Unreal Engine RCON support
- Restarted the server multiple times to ensure changes took effect

However, when we attempt to authenticate using standard Source RCON protocol, the server accepts the connection but doesn't respond to the authentication packets.

**Your Previous Success:**
According to our support ticket records, your TheIsleEvrimaRcon tool successfully connected to the server on October 23rd, 2025, showing "Connected to 45.45.238.134:16007" and "Ready to execute commands." This proves that RCON functionality is indeed possible with this server.

**What We Need:**
Could you please help us understand exactly how your TheIsleEvrimaRcon tool communicates with The Isle server? Specifically:

1. **Protocol Details**: Does The Isle use a custom RCON protocol instead of the standard Source RCON protocol?
2. **Authentication Method**: What specific packet format or authentication sequence does your tool use?
3. **Command Structure**: How are commands formatted and sent to the server?
4. **Tool Information**: Is your TheIsleEvrimaRcon tool available for reference, or could you share the communication method it uses?

**Our Goal:**
We want to build a bridge system that allows our website to send commands (like slay, kick, etc.) to the Isle server for automated moderation. Understanding the correct protocol will allow us to complete this integration.

Any guidance or technical details you can provide would be extremely helpful. We've spent considerable time researching this and your successful connection proves it's achievable - we just need to understand the correct approach.

Thank you for your time and assistance!

Best regards,
The AshVeil Development Team