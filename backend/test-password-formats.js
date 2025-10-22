const Rcon = require('rcon');

async function testPasswordFormats() {
    console.log('🔍 Testing different RCON password formats...');
    console.log('Server: 45.45.238.134:16007');
    console.log('');
    
    const passwordTests = [
        {
            name: 'Original Password',
            password: 'CookieMonster420'
        },
        {
            name: 'Quoted Password',
            password: '"CookieMonster420"'
        },
        {
            name: 'No Special Characters Test',
            password: 'CookieMonster420'
        },
        {
            name: 'Case Sensitive Test',
            password: 'cookiemonster420'
        }
    ];
    
    for (const test of passwordTests) {
        console.log(`📋 Testing: ${test.name}`);
        console.log(`   Password: "${test.password}"`);
        
        const success = await testSinglePassword(test.password);
        
        if (success) {
            console.log('✅ SUCCESS! This password format works!');
            console.log(`✅ Correct password: "${test.password}"`);
            return;
        }
        
        console.log('   ❌ Failed');
        console.log('');
        await sleep(2000);
    }
    
    console.log('❌ All password formats failed');
    console.log('');
    console.log('💡 Possible issues:');
    console.log('1. Isle server RCON password is different');
    console.log('2. Isle server is still starting up');
    console.log('3. RCON is enabled but not fully loaded');
    console.log('4. Network/firewall blocking connection');
    console.log('');
    console.log('🔧 Check your Isle server config file for the exact RCON password');
}

function testSinglePassword(password) {
    return new Promise((resolve) => {
        const rcon = new Rcon('45.45.238.134', 16007, password);
        let resolved = false;
        
        const timeout = setTimeout(() => {
            if (!resolved) {
                console.log('   ⏰ Timeout (10s)');
                resolved = true;
                resolve(false);
            }
        }, 10000);
        
        rcon.on('auth', () => {
            if (!resolved) {
                console.log('   ✅ Authentication successful!');
                
                // Try a command
                rcon.send('help');
            }
        });
        
        rcon.on('response', (str) => {
            if (!resolved) {
                console.log('   📡 Response received!');
                console.log('   Response: ' + str.substring(0, 50) + '...');
                
                clearTimeout(timeout);
                resolved = true;
                rcon.disconnect();
                resolve(true);
            }
        });
        
        rcon.on('error', (err) => {
            if (!resolved) {
                console.log('   ❌ Error: ' + err.message);
                
                if (err.message.includes('ECONNREFUSED')) {
                    console.log('   💡 Connection refused - RCON may not be listening');
                } else if (err.message.includes('Auth')) {
                    console.log('   💡 Authentication failed - wrong password');
                } else if (err.message.includes('timeout')) {
                    console.log('   💡 Connection timeout - server not responding');
                }
                
                clearTimeout(timeout);
                resolved = true;
                resolve(false);
            }
        });
        
        rcon.on('end', () => {
            if (!resolved) {
                console.log('   🔌 Connection ended unexpectedly');
                clearTimeout(timeout);
                resolved = true;
                resolve(false);
            }
        });
        
        try {
            console.log('   🔌 Connecting...');
            rcon.connect();
        } catch (error) {
            console.log('   ❌ Connection failed: ' + error.message);
            clearTimeout(timeout);
            resolved = true;
            resolve(false);
        }
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

testPasswordFormats();