# 🗄️ The Isle Server Database Setup Guide

## Overview
This guide explains how to set up and manage databases for your Isle server using the Pterodactyl panel. Databases are essential for storing player data, server statistics, and mod configurations.

---

## 🔧 **Step-by-Step Database Creation**

### 1. **Access the Database Section**
- Navigate to your server panel at Pterodactyl/Physgun
- In the left sidebar, go to **Management** → **Databases**
- You should see "Using 0 / 3 databases" (you can create up to 3)

### 2. **Create New Database**
Click the **"Create"** button to open the database creation form:

#### **Required Fields:**

**HOST:**
- This field may auto-populate or show available database hosts
- If empty, contact your hosting provider for the correct database host
- Usually looks like: `mysql.yourhost.com` or an IP address

**NAME:**
- Choose a descriptive name for your database
- Examples: `isle_playerdata`, `ashveil_stats`, `server_logs`
- Use lowercase letters, numbers, and underscores only
- **Recommendation:** `ashveil_main`

**CONNECTIONS FROM:**
- Leave as `%` (recommended)
- This allows connections from any IP address
- Only change if you have specific security requirements

### 3. **Database Credentials**
After creation, the system will generate:
- **Username:** Automatically generated (usually starts with your server prefix)
- **Password:** Randomly generated secure password
- **Database Name:** What you specified above
- **Host:** The database server address

---

## 🎮 **Common Isle Server Database Uses**

### **Player Data Storage**
```sql
-- Example table for player statistics
CREATE TABLE player_stats (
    steam_id VARCHAR(20) PRIMARY KEY,
    player_name VARCHAR(50),
    total_playtime INT DEFAULT 0,
    favorite_dinosaur VARCHAR(30),
    kills_as_carnivore INT DEFAULT 0,
    deaths INT DEFAULT 0,
    growth_points INT DEFAULT 0,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Server Events & Logs**
```sql
-- Example table for server events
CREATE TABLE server_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(30),
    player_steam_id VARCHAR(20),
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    server_location VARCHAR(50)
);
```

### **Economy & Progression**
```sql
-- Example table for currency/progression
CREATE TABLE player_currency (
    steam_id VARCHAR(20) PRIMARY KEY,
    void_pearls INT DEFAULT 0,
    razor_talons INT DEFAULT 0,
    leaf_tokens INT DEFAULT 0,
    last_daily_bonus DATE,
    total_earned INT DEFAULT 0
);
```

---

## 🔗 **Connecting Your Database to The Isle**

### **Method 1: Direct Server Integration**
Most Isle servers use SQLite by default, but you can configure MySQL:

1. **Locate your server configuration file** (usually `Game.ini` or similar)
2. **Add database connection settings:**
```ini
[Database]
UseMySQL=true
Host=your_database_host
Port=3306
Database=ashveil_main
Username=generated_username
Password=generated_password
```

### **Method 2: Using Mods/Plugins**
Popular Isle server mods that support MySQL:
- **Advanced Realism Mod (ARM)**
- **Custom server statistics mods**
- **Player progression systems**

### **Method 3: External Tools**
Connect via your backend API (like the one we built):
```javascript
// In your backend server.js
const mysql = require('mysql2');

const dbConnection = mysql.createConnection({
  host: 'your_database_host',
  user: 'generated_username',
  password: 'generated_password',
  database: 'ashveil_main'
});
```

---

## 🛠️ **Database Management Tools**

### **phpMyAdmin** (if provided by host)
- Web-based database management
- Create tables, run queries, manage data
- Usually accessible through hosting panel

### **MySQL Workbench** (desktop application)
- Download from Oracle/MySQL website
- Connect using your database credentials
- Advanced query editor and design tools

### **Command Line Access**
```bash
mysql -h your_database_host -u username -p database_name
```

---

## 📊 **Integration with Your Ashveil Website**

### **Update Backend Configuration**
Add database connection to your `backend/server.js`:

```javascript
// Add to your existing backend
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'your_database_host',
  user: 'your_db_username',
  password: 'your_db_password',
  database: 'ashveil_main'
};

// Create connection pool
const dbPool = mysql.createPool(dbConfig);

// Example: Get player statistics
app.get('/api/players/stats', async (req, res) => {
  try {
    const [rows] = await dbPool.execute(
      'SELECT player_name, total_playtime, favorite_dinosaur FROM player_stats ORDER BY total_playtime DESC LIMIT 10'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});
```

### **Display on Website**
Create a new component to show database statistics:

```jsx
// New component: PlayerStats.jsx
import React, { useState, useEffect } from 'react';

function PlayerStats() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetch('/api/players/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data.data);
      });
  }, []);

  return (
    <div className="player-stats">
      <h3>🏆 Top Players</h3>
      {stats.map((player, index) => (
        <div key={index} className="player-stat">
          <span>{player.player_name}</span>
          <span>{player.total_playtime}h</span>
          <span>{player.favorite_dinosaur}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## 🚨 **Important Security Notes**

### **Database Security Best Practices:**

1. **Never share database credentials publicly**
2. **Use strong, unique passwords**
3. **Limit connections to necessary IPs only** (if possible)
4. **Regularly backup your database**
5. **Monitor for unusual activity**

### **Backup Strategy:**
```bash
# Create database backup
mysqldump -h your_host -u username -p database_name > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -h your_host -u username -p database_name < backup_20251020.sql
```

---

## 🎯 **Recommended Database Structure for Isle Server**

### **Core Tables:**
1. **players** - Basic player information
2. **player_sessions** - Login/logout tracking
3. **dinosaur_data** - Current dinosaur stats
4. **server_events** - Game events and logs
5. **player_achievements** - Progression tracking

### **Extended Tables:**
1. **market_transactions** - Player trading
2. **clan_data** - Group/pack information
3. **server_statistics** - Performance metrics
4. **mod_configurations** - Custom settings

---

## 📞 **Getting Help**

### **If Database Creation Fails:**
1. **Contact your hosting provider** - They may need to enable database access
2. **Check server limits** - You might be at your database limit
3. **Verify account permissions** - Your account may need database privileges

### **Common Issues:**
- **"No results found" in HOST field** → Contact hosting support
- **Connection refused** → Check firewall settings
- **Access denied** → Verify credentials are correct

### **Testing Database Connection:**
```bash
# Test connection from command line
telnet your_database_host 3306
```

---

## 🎮 **Next Steps After Database Creation**

1. **Install MySQL client tools**
2. **Create your first tables**
3. **Configure your Isle server to use the database**
4. **Set up automated backups**
5. **Monitor database performance**
6. **Integrate with your Ashveil website**

---

**Need help with any of these steps? Your database credentials will be displayed after creation - save them securely!**

*This guide is specifically for your Ashveil Isle server setup. Keep this documentation for your friend's reference.*