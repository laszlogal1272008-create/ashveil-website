# 🎯 Quick Reference: Database Setup for Your Friend

## 📋 **Step-by-Step Checklist**

### **1. Access Database Panel**
- [ ] Go to your Pterodactyl panel
- [ ] Navigate: **Management** → **Databases**
- [ ] Click **"Create"** button

### **2. Fill Database Form**
- [ ] **HOST**: Leave as is or contact hosting provider
- [ ] **NAME**: Use `ashveil_main` (recommended)
- [ ] **CONNECTIONS FROM**: Leave as `%`
- [ ] Click **Submit**

### **3. Save Credentials** (IMPORTANT!)
After creation, copy and save these securely:
```
Host: ___________________________
Database Name: ashveil_main
Username: ________________________
Password: ________________________
```

### **4. Install Database Dependencies**
Run this in your backend folder:
```bash
npm install mysql2
```

### **5. Update Backend Configuration**
1. Open `backend/database-integration.js`
2. Replace these lines with your actual credentials:
```javascript
const dbConfig = {
  host: 'YOUR_DATABASE_HOST',     // ← Put your host here
  user: 'YOUR_DB_USERNAME',       // ← Put your username here
  password: 'YOUR_DB_PASSWORD',   // ← Put your password here
  database: 'ashveil_main',
  // ... rest stays the same
};
```

### **6. Add to Your Backend**
Add this line to the top of your `backend/server.js`:
```javascript
require('./database-integration.js');
```

### **7. Test Connection**
1. Restart your backend server
2. Check console for: `✅ Database connection successful`
3. Visit: `http://localhost:5000/api/database/players/top`

---

## 🚨 **Common Issues & Solutions**

| Problem | Solution |
|---------|----------|
| "No results found" in HOST | Contact your hosting provider |
| Connection refused | Check if database service is running |
| Access denied | Double-check username/password |
| Tables not created | Check console for error messages |

---

## 🎮 **What This Enables**

✅ **Player Statistics Tracking**
- Playtime, favorite dinosaurs, kills/deaths
- Progression tracking across sessions

✅ **Server Event Logging**
- Player joins/leaves, deaths, growth events
- Complete server activity history

✅ **Currency System**
- Track Void Pearls, Razor Talons, etc.
- Daily bonuses and spending history

✅ **Website Integration**
- Display live player stats on your website
- Leaderboards and achievement tracking

---

## 📞 **Need Help?**

1. **Can't create database?** → Contact hosting support
2. **Connection issues?** → Check the full guide: `ISLE_DATABASE_SETUP_GUIDE.md`
3. **Integration problems?** → Review `database-integration.js` comments

**Remember: Save your database credentials securely - you'll need them!**