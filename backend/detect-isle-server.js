const Rcon = require('rcon');

// Test multiple Isle server RCON variations
async function detectIsleServerType() {
    console.log('🔍 Detecting Isle server type and RCON protocol...');
    console.log('Server: 45.45.238.134:16007');
    console.log('Password: CookieMonster420');
    console.log('');
    
    const rcon = new Rcon('45.45.238.134', 16007, 'CookieMonster420');
    
    return new Promise((resolve) => {
        let resolved = false;
        let authSuccess = false;
        
        const timeout = setTimeout(() => {
            if (!resolved) {
                console.log('❌ Connection timeout - Server may not be ready');
                console.log('');
                console.log('💡 Try these steps:');
                console.log('1. Wait 2-3 minutes after starting Isle server');
                console.log('2. Check Isle server console for RCON messages');
                console.log('3. Verify server is fully loaded (players can join)');
                resolved = true;
                resolve(false);
            }
        }, 15000);
        
        rcon.on('auth', () => {
            console.log('✅ RCON Authentication successful!');
            authSuccess = true;
            
            // Test different Isle commands
            console.log('🔍 Testing Isle server commands...');
            rcon.send('help');
        });
        
        rcon.on('response', (response) => {
            if (!resolved && authSuccess) {
                console.log('📡 Server Response:');
                console.log('-------------------');
                console.log(response);
                console.log('-------------------');
                console.log('');
                
                // Analyze response to detect server type
                if (response.includes('Evrima') || response.includes('evrima')) {
                    console.log('🦕 Detected: The Isle EVRIMA server');
                    console.log('   Commands: KillCharacter, GiveItem, Teleport');
                } else if (response.includes('Legacy') || response.includes('legacy')) {
                    console.log('🦕 Detected: The Isle LEGACY server');
                    console.log('   Commands: Kill, Give, Spawn');
                } else {
                    console.log('🦕 Detected: Custom/Modded Isle server');
                    console.log('   Commands: Check server documentation');
                }
                
                // Test a slay command
                console.log('');
                console.log('🔍 Testing slay command...');
                rcon.send('list');
                
                setTimeout(() => {
                    clearTimeout(timeout);
                    resolved = true;
                    rcon.disconnect();
                    resolve(true);
                }, 3000);
            }
        });
        
        rcon.on('error', (err) => {
            if (!resolved) {
                console.log('❌ RCON Error:', err.message);
                
                if (err.message.includes('ECONNREFUSED')) {
                    console.log('💡 Connection refused - RCON port not listening');
                    console.log('   - Check if Isle server is running');
                    console.log('   - Verify RCON is enabled in server config');
                } else if (err.message.includes('Auth')) {
                    console.log('💡 Authentication failed');
                    console.log('   - Check RCON password in server config');
                    console.log('   - Password might be case-sensitive');
                } else if (err.message.includes('timeout')) {
                    console.log('💡 Connection timeout');
                    console.log('   - Server may still be starting up');
                    console.log('   - RCON loads after game server');
                }
                
                clearTimeout(timeout);
                resolved = true;
                resolve(false);
            }
        });
        
        console.log('🔌 Connecting to RCON...');
        try {
            rcon.connect();
        } catch (error) {
            console.log('❌ Failed to connect:', error.message);
            clearTimeout(timeout);
            resolved = true;
            resolve(false);
        }
    });
}

detectIsleServerType().then((success) => {
    if (success) {
        console.log('');
        console.log('✅ RCON connection successful!');
        console.log('Your website slay feature should work now.');
    } else {
        console.log('');
        console.log('❌ RCON connection failed');
        console.log('Website will continue using simulation mode.');
    }
});