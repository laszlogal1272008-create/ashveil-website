# Steam Web API Key Domain Registration Fix

## The Problem
When you created the new Steam Web API Key `E6C1E7C5D471DD57A0ED4226EF9A1E6C`, the domain `ashveil.live` may not have been properly registered for OpenID authentication.

## Steam API Key Registration Requirements

### 1. Domain Must Be Exactly Registered
- **Correct**: `ashveil.live`
- **Incorrect**: `https://ashveil.live`, `www.ashveil.live`, `ashveil.live/`

### 2. Verify Domain Registration
Go to: https://steamcommunity.com/dev/apikey

**Check that your key shows:**
- **Key**: `E6C1E7C5D471DD57A0ED4226EF9A1E6C`
- **Domain**: `ashveil.live` (exactly this, no protocol, no www, no trailing slash)

## How to Fix Domain Registration

### Option 1: Update Existing Key
1. Go to https://steamcommunity.com/dev/apikey
2. Find your key: `E6C1E7C5D471DD57A0ED4226EF9A1E6C`
3. Edit the domain name to be exactly: `ashveil.live`
4. Save changes

### Option 2: Create New Key (if needed)
1. Go to https://steamcommunity.com/dev/apikey
2. Revoke the current key if domain can't be changed
3. Create new key with domain: `ashveil.live`
4. Update the key in Netlify environment variables

## Testing After Fix

Once the domain is properly registered, test these endpoints:

### 1. Test Steam API Key
Visit: `https://ashveil.live/.netlify/functions/test/test-steam`

**Expected Response:**
```json
{
  "success": true,
  "steamApiWorking": true,
  "config": {
    "apiKey": "E6C1E7C5...",
    "websiteUrl": "https://ashveil.live",
    "steamRealm": "https://ashveil.live",
    "returnUrl": "https://ashveil.live/.netlify/functions/auth/steam/return"
  }
}
```

### 2. Test Steam Authentication
Visit: `https://ashveil.live/.netlify/functions/auth/steam`

**Expected Behavior:**
- Should redirect to Steam login page
- Steam should show "ashveil.live wants to authenticate you"
- After login, should redirect back to your site

## Common Issues & Solutions

### Issue 1: "Invalid API Key"
- **Cause**: Domain not registered correctly
- **Solution**: Update domain registration to exactly `ashveil.live`

### Issue 2: "OpenID Authentication Failed"
- **Cause**: Realm doesn't match registered domain
- **Solution**: Ensure Steam key is registered for `ashveil.live` (no https://)

### Issue 3: "Callback URL Not Found"
- **Cause**: Return URL not accessible
- **Solution**: Ensure `/.netlify/functions/auth/steam/return` works

## Current Configuration Status

### ✅ Fixed in Latest Deployment
- Steam API calls now use HTTPS
- Realm configured as `ashveil.live` (removed trailing slash)
- Added detailed logging for debugging
- Created diagnostic endpoints

### ⏳ Needs Manual Fix
- **Steam Web API Key Domain Registration**
  - Go to https://steamcommunity.com/dev/apikey
  - Ensure domain is exactly: `ashveil.live`

## Next Steps

1. **Check Domain Registration**: Visit Steam API key page and verify domain
2. **Wait for Deployment**: Current fixes should deploy in 2-3 minutes
3. **Test API**: Use diagnostic endpoint to verify everything works
4. **Test Authentication**: Try Steam login on the website

---

**Key**: `E6C1E7C5D471DD57A0ED4226EF9A1E6C`  
**Domain**: `ashveil.live` (must be exact match)  
**Status**: API key works, domain registration needs verification