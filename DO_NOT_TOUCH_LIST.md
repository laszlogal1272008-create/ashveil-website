# ⚠️ CRITICAL FILES - DO NOT MODIFY ⚠️
*For friend working on Ashveil website*

## 🚨 **ABSOLUTELY DO NOT TOUCH THESE FILES:**

### **1. CORE SYSTEM FILES**
```
❌ src/contexts/CurrencyContext.js
❌ src/contexts/EventContext.js
❌ src/data/dinosaurDatabase.js
❌ src/data/mutationDatabase.js
❌ src/data/challengeGenerator.js
❌ src/data/ChallengeHistoryManager.js
```
**Why**: These control the entire game economy, data, and challenge systems. Breaking these breaks everything.

### **2. MAIN APP STRUCTURE**
```
❌ src/App.js (routing configuration)
❌ src/index.js (React entry point)
❌ public/index.html (main HTML)
❌ package.json (dependencies)
❌ package-lock.json (dependency versions)
```
**Why**: These are the foundation. Touching them can crash the entire website.

### **3. RECENTLY FIXED COMPONENTS** 
```
❌ src/components/Shop.jsx
❌ src/components/Shop.css
❌ src/components/GameManager.jsx
❌ src/components/GameManager.css
❌ src/components/DinosaurSelection.jsx
❌ src/components/DinosaurSelection.css
❌ src/components/CurrencyDisplay.jsx
❌ src/components/CurrencyDisplay.css
```
**Why**: These were just fixed after major issues. Any changes could break critical functionality.

### **4. BACKEND SERVER FILES**
```
❌ backend/server.js
❌ backend/auth.js
❌ backend/package.json
❌ backend/.env
```
**Why**: Server configuration is complex and breaks easily.

### **5. BUILD & DEPLOYMENT**
```
❌ build/ (entire folder)
❌ node_modules/ (entire folder)
❌ .git/ (entire folder)
❌ .gitignore
❌ vercel.json
❌ public/_redirects
```
**Why**: These handle deployment and version control. Breaking them prevents the site from working online.

### **6. BACKUP & DOCUMENTATION**
```
❌ COPILOT_BACKUP_SYSTEM.md
❌ PROJECT_HANDOFF_DOCUMENTATION.md
❌ DEPLOYMENT_COMPLETE.md
❌ All *.md files in root
```
**Why**: These contain recovery information and project history.

---

## ✅ **SAFE TO MODIFY (with caution):**

### **Visual/Style Files Only:**
```
✅ src/App.css (global styles only)
✅ src/index.css (base styles only)
✅ Component CSS files (EXCEPT the ones listed above)
```

### **Content/Text Components:**
```
✅ src/components/Home.jsx (home page content)
✅ src/components/Information.jsx (info page content)
```

### **Assets:**
```
✅ src/assets/ (images only - don't delete existing files)
✅ public/favicon.ico (website icon)
```

---

## 🛡️ **SAFETY RULES:**

### **BEFORE MAKING ANY CHANGES:**
1. ✅ **Always backup the file first**
2. ✅ **Make small changes, test immediately**  
3. ✅ **If something breaks, STOP and restore**
4. ✅ **Never delete files - only modify content**

### **TESTING REQUIRED:**
After any change, MUST test:
- ✅ `npm start` still works
- ✅ Website loads without errors
- ✅ Navigation still works
- ✅ No console errors in browser

### **IF SOMETHING BREAKS:**
1. 🚨 **STOP immediately**
2. 🔄 **Restore from backup**: `C:\Users\laszl\my-website-BACKUP-2025-10-20_19-31-19\`
3. 📞 **Contact owner for help**

---

## 📋 **RECOMMENDED FOCUS AREAS:**

### **SAFE IMPROVEMENTS:**
- 🎨 **Visual styling** (colors, fonts, spacing)
- 📝 **Text content** (descriptions, labels)
- 🖼️ **Images and graphics** (adding new assets)
- 📱 **Responsive design** (mobile optimization)

### **WHAT TO AVOID:**
- ❌ **Functionality changes** (buttons, forms, logic)
- ❌ **Database modifications** (dino data, mutations)
- ❌ **Routing changes** (navigation, URLs)
- ❌ **Context/state management** (currency, events)

---

## 🚨 **EMERGENCY CONTACTS:**

**If website breaks:**
1. **Full restore available**: Use backup folder
2. **Copilot can fix**: Reference `COPILOT_BACKUP_SYSTEM.md`
3. **All fixes documented**: Every working solution saved

**Remember: The website is currently 100% working and production-ready. The goal is to enhance, not fix!**

---

*This list protects all critical functionality while allowing safe improvements to visual and content elements.*