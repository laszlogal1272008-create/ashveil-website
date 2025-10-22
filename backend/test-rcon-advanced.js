const Rcon = require('rcon');

async function testMultipleRconScenarios() {
    console.log('🔍 Testing multiple RCON scenarios...');
    console.log('');
    
    const scenarios = [
        {
            name: 'Standard Connection',
            ip: '45.45.238.134',
            port: 16007,
            password: 'CookieMonster420',
            timeout: 15000
        },
        {
            name: 'Longer Timeout',
            ip: '45.45.238.134', 
            port: 16007,
            password: 'CookieMonster420',
            timeout: 30000
        },
        {
            name: 'Alternative Password (no special chars)',
            ip: '45.45.238.134',
            port: 16007, 
            password: 'CookieMonster420',
            timeout: 10000
        }
    ];
    
    for (const scenario of scenarios) {
        console.log(`📋 Testing: ${scenario.name}`);
        console.log(`   Server: ${scenario.ip}:${scenario.port}`);
        console.log(`   Password: ${scenario.password}`);
        console.log(`   Timeout: ${scenario.timeout}ms`);
        
        const success = await testSingleConnection(scenario);
        
        if (success) {
            console.log('✅ SUCCESS! RCON is working with this configuration');
            return;
        }
        
        console.log('');
        console.log('⏳ Waiting 3 seconds before next test...');
        await sleep(3000);
        console.log('');
    }
    
    console.log('❌ All RCON connection attempts failed');
    console.log('');
    console.log('🔧 Troubleshooting suggestions:');
    console.log('1. Verify your Isle server is fully loaded (not just started)');
    console.log('2. Check if RCON is enabled in server settings');
    console.log('3. Confirm RCON password matches exactly');
    console.log('4. Try restarting the Isle server');
    console.log('5. Check server console for RCON error messages');
}

function testSingleConnection(config) {
    return new Promise((resolve) => {
        const rcon = new Rcon(config.ip, config.port, config.password);
        let resolved = false;
        
        const timeout = setTimeout(() => {
            if (!resolved) {
                console.log(`   ⏰ Timeout after ${config.timeout}ms`);
                resolved = true;
                resolve(false);
            }
        }, config.timeout);
        
        rcon.on('auth', () => {
            if (!resolved) {
                console.log('   ✅ Authentication successful!');
                
                // Try a simple command
                rcon.send('help');
            }
        });
        
        rcon.on('response', (str) => {
            if (!resolved) {
                console.log('   📡 Server response received:');
                console.log('   ' + str.substring(0, 100) + (str.length > 100 ? '...' : ''));
                
                clearTimeout(timeout);
                resolved = true;
                rcon.disconnect();
                resolve(true);
            }
        });
        
        rcon.on('error', (err) => {
            if (!resolved) {
                console.log('   ❌ Error:', err.message);
                
                clearTimeout(timeout);
                resolved = true;
                resolve(false);
            }
        });
        
        rcon.on('end', () => {
            if (!resolved) {
                console.log('   🔌 Connection ended');
                clearTimeout(timeout);
                resolved = true;
                resolve(false);
            }
        });
        
        try {
            console.log('   🔌 Connecting...');
            rcon.connect();
        } catch (error) {
            console.log('   ❌ Connection failed:', error.message);
            clearTimeout(timeout);
            resolved = true;
            resolve(false);
        }
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

testMultipleRconScenarios();