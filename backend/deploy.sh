#!/bin/bash

# Ashveil Backend Auto-Deploy Script
echo "🚀 Setting up Railway deployment..."

# Create Railway project
echo "📦 Creating Railway project..."
railway login --browserless
railway new ashveil-backend --template blank

# Set environment variables
echo "🔧 Setting environment variables..."
railway variables set PORT=5000
railway variables set NODE_ENV=production  
railway variables set ISLE_SERVER_IP=45.45.238.134
railway variables set ISLE_RCON_PORT=16007
railway variables set ISLE_RCON_PASSWORD=CookieMonster420

# Deploy the backend
echo "🚢 Deploying backend..."
railway up

echo "✅ Backend deployed! Check Railway dashboard for URL."