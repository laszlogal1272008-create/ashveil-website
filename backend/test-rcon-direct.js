const Rcon = require('rcon');

async function testRconConnection() {
    console.log('🔍 Testing RCON connection to Isle server...');
    console.log('Server: 45.45.238.134:16007');
    console.log('Password: CookieMonster420');
    console.log('');
    
    const rcon = new Rcon('45.45.238.134', 16007, 'CookieMonster420');
    
    rcon.on('auth', () => {
        console.log('✅ RCON Authentication successful!');
        
        // Try a simple command
        rcon.send('help');
    });
    
    rcon.on('response', (str) => {
        console.log('📡 RCON Response:');
        console.log(str);
        
        // Test another command
        console.log('');
        console.log('🔍 Testing list command...');
        rcon.send('list');
    });
    
    rcon.on('error', (err) => {
        console.log('❌ RCON Error:', err.message);
        
        if (err.message.includes('ECONNREFUSED')) {
            console.log('');
            console.log('💡 Connection refused - possible causes:');
            console.log('   1. Isle server RCON is disabled');
            console.log('   2. Wrong RCON port (should be 16007)');
            console.log('   3. Firewall blocking connection');
        } else if (err.message.includes('timeout')) {
            console.log('');
            console.log('💡 Connection timeout - possible causes:');
            console.log('   1. Isle server is not responding');
            console.log('   2. Network connectivity issues');
            console.log('   3. Server is overloaded');
        } else if (err.message.includes('Auth')) {
            console.log('');
            console.log('💡 Authentication failed - possible causes:');
            console.log('   1. Wrong RCON password');
            console.log('   2. RCON password contains special characters');
        }
        
        process.exit(1);
    });
    
    rcon.on('end', () => {
        console.log('🔌 RCON connection closed');
        process.exit(0);
    });
    
    try {
        console.log('🔌 Attempting to connect...');
        rcon.connect();
        
        // Set a timeout
        setTimeout(() => {
            console.log('⏰ Connection test timeout (30 seconds)');
            console.log('');
            console.log('💡 This suggests the Isle server may not be responding to RCON');
            process.exit(1);
        }, 30000);
        
    } catch (error) {
        console.log('❌ Failed to initiate connection:', error.message);
        process.exit(1);
    }
}

testRconConnection();