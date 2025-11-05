#!/usr/bin/env python3
"""
ULTRA-AGGRESSIVE BOT KILLER - FORTRESS GUARDIAN
Kills ANY process that tries to touch VS Code or Steam
NO EXCEPTIONS - ZERO TOLERANCE POLICY
"""

import psutil
import time
import subprocess
import os
import sys
import logging
import re
import threading
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class FortressGuardian:
    def __init__(self):
        self.setup_logging()
        
        # PROTECTED PROCESSES - NEVER ALLOW AUTOMATION ACCESS
        self.protected_processes = {
            'Code.exe': 'Visual Studio Code',
            'steam.exe': 'Steam Client', 
            'steamwebhelper.exe': 'Steam Web Helper',
            'Discord.exe': 'Discord Chat'
        }
        
        # BANNED AUTOMATION KEYWORDS - INSTANT KILL
        self.banned_keywords = [
            'pyautogui', 'automation', 'bot', 'isle', 'slay', 'rcon', 
            'ashveil_bot', 'CookieMonster', 'remote.SSH', 'steam_auth',
            'click()', 'typewrite', 'screenshot', 'locateOnScreen'
        ]
        
        # BANNED PYTHON MODULES - AUTOMATION LIBRARIES
        self.banned_modules = [
            'pyautogui', 'pynput', 'keyboard', 'mouse', 'pygetwindow',
            'selenium', 'playwright', 'requests_html'
        ]
        
        self.kill_count = 0
        self.threat_log = []
        
    def setup_logging(self):
        logging.basicConfig(
            level=logging.WARNING,
            format='%(asctime)s - 🛡️ FORTRESS - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('fortress_guardian.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger('FortressGuardian')
    
    def is_automation_threat(self, proc_info):
        """Determine if process is an automation threat"""
        try:
            name = proc_info['name'].lower()
            cmdline = ' '.join(proc_info['cmdline'] or []).lower()
            
            # Check if Python process with automation keywords
            if 'python' in name:
                for keyword in self.banned_keywords:
                    if keyword.lower() in cmdline:
                        return f"Python automation detected: {keyword}"
                        
                # Check for banned modules
                for module in self.banned_modules:
                    if f"import {module}" in cmdline or f"from {module}" in cmdline:
                        return f"Banned automation module: {module}"
            
            # Check if process is trying to control protected apps
            for protected_name in self.protected_processes:
                if protected_name.lower() in name:
                    if any(keyword in cmdline for keyword in self.banned_keywords):
                        return f"Automation targeting {self.protected_processes[protected_name]}"
            
            return None
            
        except Exception:
            return None
    
    def kill_threat_aggressively(self, proc_info, reason):
        """Kill threat with maximum force"""
        pid = proc_info['pid']
        name = proc_info['name']
        
        try:
            # Method 1: Graceful terminate
            proc = psutil.Process(pid)
            proc.terminate()
            proc.wait(timeout=1)
            
        except Exception:
            try:
                # Method 2: Force kill via taskkill
                subprocess.run(['taskkill', '/f', '/pid', str(pid), '/t'], 
                             capture_output=True, check=False, timeout=5)
                
            except Exception:
                try:
                    # Method 3: Nuclear option - kill process tree
                    subprocess.run(['wmic', 'process', 'where', f'ParentProcessId={pid}', 'delete'],
                                 capture_output=True, check=False, timeout=5)
                    subprocess.run(['wmic', 'process', 'where', f'ProcessId={pid}', 'delete'],
                                 capture_output=True, check=False, timeout=5)
                except Exception:
                    pass
        
        self.kill_count += 1
        threat_info = {
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'pid': pid,
            'name': name,
            'reason': reason,
            'kill_method': 'AGGRESSIVE_KILL'
        }
        self.threat_log.append(threat_info)
        
        self.logger.warning(f"🚨 THREAT ELIMINATED: PID {pid} - {name} - {reason}")
        
        # Alert user if too many threats
        if self.kill_count % 5 == 0:
            self.logger.error(f"⚠️ WARNING: {self.kill_count} AUTOMATION THREATS KILLED!")
    
    def fortress_scan(self):
        """Ultra-aggressive scan for ANY automation threats"""
        threats_found = 0
        
        for proc in psutil.process_iter(['pid', 'name', 'cmdline', 'exe']):
            try:
                threat_reason = self.is_automation_threat(proc.info)
                if threat_reason:
                    self.kill_threat_aggressively(proc.info, threat_reason)
                    threats_found += 1
                    
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass
        
        return threats_found
    
    def protect_vs_code(self):
        """Special protection for VS Code"""
        try:
            vs_code_procs = [p for p in psutil.process_iter(['pid', 'name']) 
                           if 'code' in p.info['name'].lower()]
            
            for proc in vs_code_procs:
                # Check if any Python process is trying to interact with VS Code
                connections = proc.connections() if hasattr(proc, 'connections') else []
                for conn in connections:
                    if conn.status == 'ESTABLISHED':
                        # Kill any Python process connected to VS Code
                        try:
                            remote_proc = psutil.Process(conn.raddr[0] if conn.raddr else 0)
                            if 'python' in remote_proc.name().lower():
                                self.kill_threat_aggressively(
                                    {'pid': remote_proc.pid, 'name': remote_proc.name()},
                                    "Python process connected to VS Code"
                                )
                        except Exception:
                            pass
        except Exception:
            pass
    
    def fortress_mode(self):
        """MAXIMUM PROTECTION MODE"""
        self.logger.warning("🏰 FORTRESS MODE ACTIVATED - ULTRA-AGGRESSIVE PROTECTION")
        self.logger.warning("🛡️ Protecting: VS Code, Steam, Discord from ALL automation")
        self.logger.warning("⚔️ Zero tolerance for Python automation processes")
        
        scan_count = 0
        
        while True:
            try:
                # Aggressive scan every 2 seconds
                threats = self.fortress_scan()
                
                # Extra VS Code protection every 5 scans
                if scan_count % 5 == 0:
                    self.protect_vs_code()
                
                if threats > 0:
                    self.logger.warning(f"🔥 {threats} AUTOMATION THREATS ELIMINATED")
                
                scan_count += 1
                time.sleep(2)  # Very frequent scanning
                
            except KeyboardInterrupt:
                self.logger.warning("🛑 FORTRESS MODE DEACTIVATED")
                self.logger.warning(f"📊 TOTAL THREATS KILLED: {self.kill_count}")
                break
            except Exception as e:
                self.logger.error(f"Fortress error: {e}")
                time.sleep(5)

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--scan':
        # Single aggressive scan
        guardian = FortressGuardian()
        threats = guardian.fortress_scan()
        if threats > 0:
            print(f"🚨 {threats} AUTOMATION THREATS ELIMINATED")
        else:
            print("🏰 FORTRESS SECURE - NO THREATS DETECTED")
    else:
        # Continuous fortress protection
        guardian = FortressGuardian()
        guardian.fortress_mode()