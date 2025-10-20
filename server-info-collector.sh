#!/bin/bash
# Ashveil Server Information Collector
# Run this script to gather all technical details needed for website integration

echo "=================================================="
echo "🦕 ASHVEIL SERVER INFORMATION COLLECTOR"
echo "=================================================="
echo ""

echo "📅 Collection Date: $(date)"
echo "🖥️  Hostname: $(hostname)"
echo ""

echo "=================================================="
echo "🔧 SYSTEM INFORMATION"
echo "=================================================="
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "Kernel: $(uname -r)"
echo "Architecture: $(uname -m)"
echo "CPU Cores: $(nproc)"
echo "Total RAM: $(free -h | grep Mem | awk '{print $2}')"
echo "Available RAM: $(free -h | grep Mem | awk '{print $7}')"
echo "Disk Usage: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 " used)"}')"
echo ""

echo "=================================================="
echo "🌐 NETWORK CONFIGURATION"
echo "=================================================="
echo "Public IP: $(curl -s ifconfig.me || echo 'Unable to fetch')"
echo "Private IP: $(hostname -I | awk '{print $1}')"
echo ""
echo "Open Ports:"
netstat -tlnp | grep LISTEN | head -10
echo ""

echo "=================================================="
echo "🎮 THE ISLE SERVER STATUS"
echo "=================================================="
echo "Checking for The Isle processes..."
ps aux | grep -i isle | grep -v grep || echo "No Isle processes found"
echo ""

echo "Checking server directories..."
find /home -name "*isle*" -type d 2>/dev/null | head -5 || echo "No Isle directories found in /home"
find /opt -name "*isle*" -type d 2>/dev/null | head -5 || echo "No Isle directories found in /opt"
find /srv -name "*isle*" -type d 2>/dev/null | head -5 || echo "No Isle directories found in /srv"
echo ""

echo "Checking for server configuration files..."
find / -name "Game.ini" 2>/dev/null | head -3 || echo "Game.ini not found"
find / -name "Engine.ini" 2>/dev/null | head -3 || echo "Engine.ini not found"
find / -name "*.cfg" 2>/dev/null | grep -i isle | head -3 || echo "No Isle config files found"
echo ""

echo "=================================================="
echo "🐳 DOCKER/CONTAINER STATUS"
echo "=================================================="
if command -v docker &> /dev/null; then
    echo "Docker is installed"
    echo "Running containers:"
    docker ps
    echo ""
    echo "All containers:"
    docker ps -a
else
    echo "Docker not installed"
fi
echo ""

echo "=================================================="
echo "🗄️  DATABASE INFORMATION"
echo "=================================================="
if command -v mysql &> /dev/null; then
    echo "MySQL is installed"
    mysql --version
    echo "MySQL status:"
    systemctl status mysql --no-pager -l | head -10 2>/dev/null || service mysql status 2>/dev/null || echo "Cannot check MySQL status"
else
    echo "MySQL not installed"
fi
echo ""

if command -v mariadb &> /dev/null; then
    echo "MariaDB is installed"
    mariadb --version
fi
echo ""

echo "Database processes:"
ps aux | grep -E "(mysql|mariadb)" | grep -v grep || echo "No database processes found"
echo ""

echo "=================================================="
echo "📁 FILE SYSTEM STRUCTURE"
echo "=================================================="
echo "Home directory contents:"
ls -la /home/ 2>/dev/null || echo "Cannot access /home"
echo ""

echo "Server software locations:"
ls -la /opt/ 2>/dev/null | head -10 || echo "Cannot access /opt"
echo ""

echo "Games directory (if exists):"
ls -la /home/*/games/ 2>/dev/null || echo "No games directory found"
ls -la /srv/games/ 2>/dev/null || echo "No /srv/games directory found"
echo ""

echo "=================================================="
echo "🔑 SSH & ACCESS INFORMATION"
echo "=================================================="
echo "SSH service status:"
systemctl status ssh --no-pager -l | head -5 2>/dev/null || systemctl status sshd --no-pager -l | head -5 2>/dev/null || echo "Cannot check SSH status"
echo ""

echo "SSH configuration (listening ports):"
grep -E "^Port|^#Port" /etc/ssh/sshd_config 2>/dev/null || echo "Cannot read SSH config"
echo ""

echo "Current user: $(whoami)"
echo "User groups: $(groups)"
echo ""

echo "=================================================="
echo "📋 PROCESS LIST (Game Servers)"
echo "=================================================="
echo "All running processes (filtered for games/servers):"
ps aux | grep -E "(server|game|isle|unreal)" | grep -v grep | head -10 || echo "No game server processes found"
echo ""

echo "=================================================="
echo "🔥 FIREWALL STATUS"
echo "=================================================="
if command -v ufw &> /dev/null; then
    echo "UFW Firewall:"
    ufw status
elif command -v iptables &> /dev/null; then
    echo "IPTables rules:"
    iptables -L | head -20
else
    echo "No firewall tools detected"
fi
echo ""

echo "=================================================="
echo "📊 SYSTEM RESOURCES"
echo "=================================================="
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | head -1
echo ""

echo "Memory Usage:"
free -h
echo ""

echo "Disk I/O:"
iostat 2>/dev/null | head -10 || echo "iostat not available"
echo ""

echo "=================================================="
echo "🔍 LOG FILES"
echo "=================================================="
echo "Recent system logs (last 10 lines):"
tail -10 /var/log/syslog 2>/dev/null || tail -10 /var/log/messages 2>/dev/null || echo "Cannot access system logs"
echo ""

echo "Game server logs (if any):"
find /home -name "*.log" 2>/dev/null | grep -i isle | head -3 | while read logfile; do
    echo "=== $logfile ==="
    tail -5 "$logfile" 2>/dev/null
    echo ""
done
echo ""

echo "=================================================="
echo "✅ COLLECTION COMPLETE"
echo "=================================================="
echo "🦕 Please share this output with the Ashveil development team"
echo "📋 This information will help integrate your server with the website"
echo "🔒 Remove any sensitive information before sharing"
echo "=================================================="