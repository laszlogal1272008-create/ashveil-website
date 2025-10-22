const { RCON } = require('rcon-srcds');

async function testRCONSrcds() {
    console.log('🎮 Testing with rcon-srcds library...');
    
    const rcon = new RCON({
        host: '45.45.238.134',
        port: 16007,
        password: 'CookieMonster420',
        timeout: 10000
    });

    try {
        console.log('🔌 Connecting...');
        await rcon.connect();
        console.log('✅ Connected successfully!');

        // Test commands
        try {
            console.log('📋 Testing help command...');
            const help = await rcon.execute('help');
            console.log('Help response:', help.slice(0, 200) + '...');
        } catch (e) {
            console.log('⚠️ Help failed:', e.message);
        }

        try {
            console.log('👥 Testing player list...');
            const players = await rcon.execute('list');
            console.log('Players response:', players);
        } catch (e) {
            console.log('⚠️ List failed:', e.message);
        }

        try {
            console.log('💀 Testing slay command...');
            const slayResult = await rcon.execute('KillCharacter Misplacedcursor');
            console.log('Slay response:', slayResult);
        } catch (e) {
            console.log('⚠️ Slay failed:', e.message);
        }

        await rcon.disconnect();
        console.log('✅ Test completed successfully');

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        try {
            await rcon.disconnect();
        } catch (e) {}
    }
}

testRCONSrcds();