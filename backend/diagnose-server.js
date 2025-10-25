#!/usr/bin/env node

/**
 * 🔧 Server Configuration Diagnosis
 * Check if the issue is server-side configuration
 */

const net = require('net');

const SERVER_HOST = '45.45.238.134';
const GAME_PORT = 16007;  // Main game port
const ALT_PORT = 16008;   // Alternative port that responds

console.log('🔧 Server Configuration Diagnosis');
console.log('==================================');

// First, let's verify the server is actually running by checking game port
async function checkGameServer() {
    return new Promise((resolve) => {
        console.log(`\n🎮 Checking game server on ${SERVER_HOST}:${GAME_PORT}...`);
        
        const socket = new net.Socket();
        socket.setTimeout(3000);
        
        socket.on('connect', () => {
            console.log('✅ Game server is accepting connections');
            socket.end();
            resolve(true);
        });
        
        socket.on('timeout', () => {
            console.log('⏰ Game server connection timeout');
            socket.destroy();
            resolve(false);
        });
        
        socket.on('error', (err) => {
            console.log(`❌ Game server error: ${err.message}`);
            resolve(false);
        });
        
        socket.connect(GAME_PORT, SERVER_HOST);
    });
}

// Check what's on the alternative port
async function checkAlternativePort() {
    return new Promise((resolve) => {
        console.log(`\n🔍 Investigating port ${ALT_PORT}...`);
        
        const socket = new net.Socket();
        socket.setTimeout(5000);
        
        let dataReceived = '';
        
        socket.on('connect', () => {
            console.log(`✅ Port ${ALT_PORT} accepting connections`);
            
            // Try sending different types of data to see what responds
            console.log('📤 Sending test data...');
            
            // Try HTTP request
            socket.write('GET / HTTP/1.1\r\nHost: ' + SERVER_HOST + '\r\n\r\n');
            
            setTimeout(() => {
                // Try telnet-style command
                socket.write('help\r\n');
            }, 1000);
            
            setTimeout(() => {
                // Try RCON command
                socket.write('status\r\n');
            }, 2000);
        });
        
        socket.on('data', (data) => {
            const text = data.toString('utf8');
            console.log(`📥 Received from port ${ALT_PORT}:`);
            console.log(`    Raw: ${data.toString('hex')}`);
            console.log(`    Text: "${text}"`);
            dataReceived += text;
        });
        
        socket.on('timeout', () => {
            console.log(`⏰ Port ${ALT_PORT} timeout`);
            if (dataReceived) {
                console.log(`📝 Total data received: "${dataReceived}"`);
            }
            socket.destroy();
            resolve(dataReceived);
        });
        
        socket.on('error', (err) => {
            console.log(`❌ Port ${ALT_PORT} error: ${err.message}`);
            resolve(null);
        });
        
        socket.on('close', () => {
            console.log(`🔌 Port ${ALT_PORT} connection closed`);
            resolve(dataReceived);
        });
        
        socket.connect(ALT_PORT, SERVER_HOST);
    });
}

// Check if there might be a web interface or admin panel
async function checkWebInterface() {
    const webPorts = [80, 8080, 8888, 9090, 3000, 5000];
    
    console.log('\n🌐 Checking for web interfaces...');
    
    for (const port of webPorts) {
        await new Promise((resolve) => {
            const socket = new net.Socket();
            socket.setTimeout(2000);
            
            socket.on('connect', () => {
                console.log(`✅ Web service found on port ${port}`);
                socket.write('GET / HTTP/1.1\r\nHost: ' + SERVER_HOST + '\r\n\r\n');
                
                setTimeout(() => {
                    socket.destroy();
                    resolve();
                }, 1000);
            });
            
            socket.on('data', (data) => {
                const text = data.toString('utf8');
                if (text.includes('HTTP') || text.includes('html') || text.includes('Server:')) {
                    console.log(`📱 Port ${port} returned HTTP-like response`);
                    console.log(`    Sample: "${text.substring(0, 100)}..."`);
                }
            });
            
            socket.on('error', () => {
                // Silently fail for web port checks
                resolve();
            });
            
            socket.on('timeout', () => {
                socket.destroy();
                resolve();
            });
            
            socket.connect(port, SERVER_HOST);
        });
    }
}

async function main() {
    const gameServerUp = await checkGameServer();
    
    if (!gameServerUp) {
        console.log('\n❌ CRITICAL: Game server is not responding');
        console.log('   This might be why RCON is not working');
        console.log('   Austin might have tested when the server was running');
        return;
    }
    
    await checkAlternativePort();
    await checkWebInterface();
    
    console.log('\n💡 DIAGNOSIS SUMMARY:');
    console.log('=====================');
    console.log('• Game server is responding ✅');
    console.log('• Multiple ports accept TCP connections');
    console.log('• But none respond to RCON authentication');
    console.log('');
    console.log('🔧 POSSIBLE SOLUTIONS:');
    console.log('1. RCON might not be enabled in Game.ini');
    console.log('2. Server might need restart after RCON config');
    console.log('3. Different RCON protocol implementation needed');
    console.log('4. Austin\'s tool uses different authentication method');
    console.log('');
    console.log('💬 NEXT STEPS:');
    console.log('• Contact server admin to verify RCON is enabled');
    console.log('• Check if server needs restart');
    console.log('• Try connecting when Austin is available for real-time test');
}

main().catch(console.error);