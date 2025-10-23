const IsleRCON = require('./isle-proper-rcon');

async function testIsleRCON() {
    console.log('🚀 Testing Isle-specific RCON implementation...');
    
    const rcon = new IsleRCON('45.45.238.134', 16007, 'CookieMonster420');
    
    try {
        // Connect and authenticate
        await rcon.connect();
        console.log('🎉 RCON connection successful!');
        
        // Test basic commands
        console.log('\n📋 Testing commands...');
        
        try {
            const help = await rcon.executeCommand('help');
            console.log('✅ Help command:', help.substring(0, 100) + '...');
        } catch (e) {
            console.log('⚠️ Help command failed:', e.message);
        }
        
        try {
            const list = await rcon.executeCommand('list');
            console.log('✅ List command:', list);
        } catch (e) {
            console.log('⚠️ List command failed:', e.message);
        }
        
        try {
            const players = await rcon.executeCommand('listplayers');
            console.log('✅ ListPlayers command:', players);
        } catch (e) {
            console.log('⚠️ ListPlayers command failed:', e.message);
        }
        
        // Test slay command (with a fake player to be safe)
        try {
            const slay = await rcon.executeCommand('KillCharacter TestPlayer');
            console.log('✅ Slay test:', slay);
        } catch (e) {
            console.log('⚠️ Slay command failed:', e.message);
        }
        
        console.log('\n🎉 All tests completed!');
        
    } catch (error) {
        console.error('❌ RCON test failed:', error.message);
    } finally {
        rcon.disconnect();
        console.log('🔌 Disconnected');
    }
}

testIsleRCON();