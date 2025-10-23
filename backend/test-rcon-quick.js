const SimpleRCON = require('./simple-rcon');

async function quickTest() {
    console.log('🚀 Quick RCON Test...');
    
    const rcon = new SimpleRCON('45.45.238.134', 16007, 'CookieMonster420');
    
    try {
        await rcon.connect();
        console.log('✅ RCON CONNECTED!');
        
        // Test commands
        const help = await rcon.executeCommand('help');
        console.log('📋 Help:', help.substring(0, 100) + '...');
        
        const players = await rcon.executeCommand('list');
        console.log('👥 Players:', players);
        
        rcon.disconnect();
        console.log('🎉 RCON IS WORKING PERFECTLY!');
        
    } catch (error) {
        console.error('❌ RCON failed:', error.message);
        console.log('💡 Make sure to restart your Isle server after adding RCON config');
    }
}

quickTest();