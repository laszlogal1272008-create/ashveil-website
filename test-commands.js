// Test Isle RCON Commands - Check what's available
const IsleRCON = require('./IsleRCON');

async function testCommands() {
    const rcon = new IsleRCON('45.45.238.134', 16007, 'CookieMonster420');
    
    try {
        await rcon.connect();
        
        console.log('\n🧪 Testing Isle RCON commands...');
        
        // Let's try the exact commands from Austin's documentation
        const commandsToTest = [
            'ListPlayers',      // Different format?
            'GetPlayers',       // Alternative
            'AdminListPlayers', // Admin version
            'ShowPlayers',      // Another alternative
            'Players',          // Simple version
            'Status',           // Server status
            'List',             // Generic list
            'Help',             // Help command
            'Version',          // Server version
            '?',                // Help alternative
            'AdminHelp'         // Admin help
        ];

        for (const cmd of commandsToTest) {
            console.log(`\n📤 Testing: ${cmd}`);
            await rcon.sendCommand(cmd);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between commands
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        rcon.disconnect();
    }
}

testCommands();