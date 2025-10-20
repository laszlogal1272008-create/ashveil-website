@echo off
REM Database Setup Script for Ashveil Backend (Windows)

echo 🗄️ Setting up database integration for Ashveil backend...

REM Navigate to backend directory
cd backend

echo 📦 Installing MySQL dependencies...
npm install mysql2

echo ✅ Database dependencies installed!

echo.
echo 🔧 Next Steps:
echo 1. Create your database in the Pterodactyl panel
echo 2. Update the database credentials in database-integration.js
echo 3. Add require('./database-integration.js'); to your server.js
echo 4. Restart your backend server

echo.
echo 📚 Documentation: Check ISLE_DATABASE_SETUP_GUIDE.md for full instructions

pause