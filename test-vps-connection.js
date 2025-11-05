// Quick test to check VPS bridge connectivity and available endpoints
const fetch = require('node-fetch');

const VPS_BRIDGE_URL = 'http://104.131.111.229:3001';

async function testVPSConnection() {
    console.log('🔍 Testing VPS Bridge Connection...');
    console.log('VPS URL:', VPS_BRIDGE_URL);
    
    try {
        // Test basic connectivity
        console.log('\n1️⃣ Testing basic connectivity...');
        const response = await fetch(VPS_BRIDGE_URL, {
            method: 'GET',
            timeout: 5000
        });
        
        if (response.ok) {
            console.log('✅ VPS Bridge is responding');
            const text = await response.text();
            console.log('Response:', text);
        } else {
            console.log('❌ VPS Bridge returned error:', response.status);
        }
        
        // Test slay endpoint (known working)
        console.log('\n2️⃣ Testing /rcon/slay endpoint...');
        const slayResponse = await fetch(`${VPS_BRIDGE_URL}/rcon/slay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                playerName: 'TestPlayer'
            }),
            timeout: 5000
        });
        
        const slayData = await slayResponse.json();
        console.log('Slay endpoint response:', slayData);
        
        // Test playerlist endpoint
        console.log('\n3️⃣ Testing /rcon/playerlist endpoint...');
        const playerlistResponse = await fetch(`${VPS_BRIDGE_URL}/rcon/playerlist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
            timeout: 5000
        });
        
        if (playerlistResponse.ok) {
            const playerlistData = await playerlistResponse.json();
            console.log('✅ Playerlist endpoint response:', playerlistData);
        } else {
            console.log('❌ Playerlist endpoint not found or error:', playerlistResponse.status);
            console.log('This endpoint likely needs to be added to the VPS bridge');
        }
        
        // Test raw endpoint
        console.log('\n4️⃣ Testing /rcon/raw endpoint...');
        const rawResponse = await fetch(`${VPS_BRIDGE_URL}/rcon/raw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                command: 'listplayers'
            }),
            timeout: 5000
        });
        
        if (rawResponse.ok) {
            const rawData = await rawResponse.json();
            console.log('✅ Raw endpoint response:', rawData);
        } else {
            console.log('❌ Raw endpoint not found or error:', rawResponse.status);
        }
        
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        console.log('\nPossible issues:');
        console.log('- VPS bridge is down');
        console.log('- Network connectivity issue');
        console.log('- Endpoint does not exist');
    }
}

testVPSConnection();