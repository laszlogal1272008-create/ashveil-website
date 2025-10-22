# 🔐 Steam & Discord OAuth Setup - Quick Instructions

## 🎮 STEP 1: Get Steam API Key

**URL**: https://steamcommunity.com/dev/apikey

**Steps**:
1. Go to Steam Web API Key page
2. Sign in with your Steam account
3. Enter domain: `ashveil.live` (your production domain)
4. Agree to terms and get your API key
5. **Copy the key** - you'll need it for the .env file

---

## 💬 STEP 2: Create Discord Application  

**URL**: https://discord.com/developers/applications

**Steps**:
1. Go to Discord Developer Portal
2. Click **"New Application"**
3. Name: `Ashveil Website`
4. Go to **"OAuth2"** tab in left sidebar

### Configure OAuth2:
- **Redirects**: Add these URLs:
  - `https://ashveil.live/auth/discord/callback` (production)
  - `http://localhost:5000/auth/discord/callback` (development)
- **Scopes**: Select:
  - ✅ `identify` (get user info)
  - ✅ `guilds` (see Discord servers)

5. **Copy Client ID and Client Secret** from OAuth2 page

---

## 🔧 STEP 3: Update Environment Variables

In `backend/.env`, replace these lines:

```properties
# Replace with your actual Steam API key
STEAM_API_KEY=your_steam_api_key_here

# Replace with your Discord OAuth credentials  
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here

# Update website URL for production
WEBSITE_URL=https://ashveil.live
CORS_ORIGIN=https://ashveil.live
```

---

## 🚀 STEP 4: Restart & Test

1. **Restart backend server**: `node backend/server.js`
2. **Test on live site**: https://ashveil.live
3. **Try authentication**: Click Steam/Discord login buttons

---

## ✅ What This Enables

**Real Steam Authentication**:
- Users connect their actual Steam accounts
- Shows real Steam profile data (username, avatar, Steam ID)
- Verifies ownership of Isle Evrima game
- Links Steam account to website profile

**Real Discord Authentication**:
- Users connect their Discord accounts  
- Shows Discord profile (username, avatar, discriminator)
- Can check if user is in your Discord server
- Links Discord account for exclusive features

**Enhanced Features**:
- Persistent login sessions (users stay logged in)
- Real profile verification (no fake accounts)
- Server admin privileges based on Steam/Discord roles
- Exclusive content for authenticated users

---

## 🔒 Security Notes

- OAuth is industry standard (very secure)
- No passwords stored on your server
- Steam/Discord handle all authentication
- Sessions expire after 24 hours
- CORS protection prevents unauthorized access

**Once set up, your website will have professional-grade authentication! 🎉**