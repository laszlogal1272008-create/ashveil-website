/**
 * Test Your Existing Isle RCON Client
 * This tests the client you already have to see if it works with authentication
 */

const IsleRCONClient = require('./isle-rcon-client');

async function testIsleRconClient() {
    console.log('🧪 Testing your existing Isle RCON Client...');
    console.log('🎯 This is based on the same protocol Austin used successfully');
    console.log('');

    const client = new IsleRCONClient({
        host: '45.45.238.134',
        port: 16007,
        password: 'CookieMonster420',
        timeout: 15000
    });

    // Event handlers
    client.on('authenticated', () => {
        console.log('🎉 RCON authentication SUCCESS!');
        console.log('✅ Your client is working correctly');
    });

    client.on('disconnected', () => {
        console.log('🔌 Disconnected from server');
    });

    client.on('error', (error) => {
        console.error('❌ RCON Error:', error.message);
    });

    try {
        console.log('🔗 Attempting connection...');
        await client.connect();
        
        console.log('');
        console.log('🧪 Testing basic commands...');
        
        // Test server info
        try {
            const info = await client.getServerInfo();
            console.log('✅ Server info command successful');
            console.log('📋 Response:', info ? info.raw.substring(0, 100) + '...' : 'No response');
        } catch (error) {
            console.log('⚠️ Server info failed:', error.message);
        }

        // Test player list
        try {
            const players = await client.getPlayerList();
            console.log('✅ Player list command successful');
            console.log('👥 Players online:', players.length);
            if (players.length > 0) {
                console.log('📋 First player:', players[0]);
            }
        } catch (error) {
            console.log('⚠️ Player list failed:', error.message);
        }

        // Test a safe command (help)
        try {
            const help = await client.executeCommand('help');
            console.log('✅ Help command successful');
            console.log('📋 Response length:', help.length);
        } catch (error) {
            console.log('⚠️ Help command failed:', error.message);
        }

        console.log('');
        console.log('🎯 RCON CLIENT TESTS COMPLETE!');
        console.log('');
        console.log('If authentication succeeded, your RCON bridge can use this client!');

    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        console.log('');
        console.log('💡 Possible solutions:');
        console.log('   1. Server might be offline');
        console.log('   2. RCON password might be wrong');
        console.log('   3. Server RCON might not be enabled');
        console.log('   4. Network connectivity issue');
    } finally {
        client.disconnect();
        console.log('🛑 Test completed');
    }
}

// Run the test
testIsleRconClient().catch(console.error);