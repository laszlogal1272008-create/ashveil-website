const Rcon = require('modern-rcon');

async function testModernRCON() {
    console.log('🧪 Testing Modern RCON...');
    
    try {
        const rcon = new Rcon('45.45.238.134', 16007, 'CookieMonster420');
        
        console.log('🔌 Connecting...');
        await rcon.connect();
        console.log('✅ Connected and authenticated!');
        
        // Test help command
        try {
            const helpResponse = await rcon.send('help');
            console.log('✅ Help response:', helpResponse);
        } catch (helpError) {
            console.log('⚠️  Help failed:', helpError.message);
        }
        
        // Test slay command with your player name
        try {
            const slayResponse = await rcon.send('slay Misplacedcursor');
            console.log('✅ Slay response:', slayResponse);
        } catch (slayError) {
            console.log('⚠️  Slay failed:', slayError.message);
            
            // Try alternative commands
            const alternatives = ['killcharacter Misplacedcursor', 'kill Misplacedcursor', 'KillCharacter Misplacedcursor'];
            
            for (const cmd of alternatives) {
                try {
                    console.log(`🔄 Trying: ${cmd}`);
                    const altResponse = await rcon.send(cmd);
                    console.log(`✅ ${cmd} response:`, altResponse);
                    break;
                } catch (altError) {
                    console.log(`❌ ${cmd} failed:`, altError.message);
                }
            }
        }
        
        await rcon.disconnect();
        console.log('✅ Test completed!');
        
    } catch (error) {
        console.error('❌ Modern RCON test failed:', error.message);
    }
}

testModernRCON();