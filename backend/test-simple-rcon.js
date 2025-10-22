const SimpleRCON = require('./simple-rcon');

async function testRCON() {
    const rcon = new SimpleRCON('45.45.238.134', 16007, 'CookieMonster420');
    
    try {
        console.log('🎮 Testing RCON connection...');
        await rcon.connect();
        
        console.log('✅ Connected! Testing commands...');
        
        // Test basic command
        try {
            const help = await rcon.executeCommand('help');
            console.log('📋 Help response:', help);
        } catch (e) {
            console.log('⚠️ Help command failed:', e.message);
        }
        
        // Test player list
        try {
            const players = await rcon.executeCommand('list');
            console.log('👥 Players:', players);
        } catch (e) {
            console.log('⚠️ List command failed:', e.message);
        }
        
        // Test slay command
        try {
            const slayResult = await rcon.executeCommand('KillCharacter Misplacedcursor');
            console.log('💀 Slay result:', slayResult);
        } catch (e) {
            console.log('⚠️ Slay command failed:', e.message);
        }
        
        rcon.disconnect();
        console.log('✅ Test completed');
        
    } catch (error) {
        console.error('❌ RCON test failed:', error.message);
        rcon.disconnect();
    }
}

testRCON();