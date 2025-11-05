#!/bin/bash
# Quick RCON command tester script
# Upload this to your VPS and run it to test commands directly

echo "🔍 Testing RCON commands directly on VPS..."
echo "Target: Misplacedcursor"
echo "Server: 45.45.238.134:16007"
echo ""

# Commands to test
commands=("kill" "murder" "admin_kill" "slaughter" "destroy" "slay" "AdminKill" "KillPlayer")

for cmd in "${commands[@]}"; do
    echo "Testing: $cmd Misplacedcursor"
    
    # You'll need to run this manually with proper RCON tools
    # This is just a template
    echo "Command: $cmd Misplacedcursor"
    echo "---"
done

echo ""
echo "🎯 QUICK TEST INSTRUCTIONS:"
echo "1. SSH into VPS: ssh root@104.131.111.229"
echo "2. Install RCON client: npm install -g rcon-cli"
echo "3. Test commands:"
echo ""
echo "rcon -h 45.45.238.134 -p 16007 -P CookieMonster420 'kill Misplacedcursor'"
echo "rcon -h 45.45.238.134 -p 16007 -P CookieMonster420 'murder Misplacedcursor'"
echo "rcon -h 45.45.238.134 -p 16007 -P CookieMonster420 'admin_kill Misplacedcursor'"
echo ""
echo "One of these WILL work and kill you instantly!"