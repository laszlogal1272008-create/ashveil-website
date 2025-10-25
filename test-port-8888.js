// Test RCON on port 8888 based on documentation findings
const net = require('net');

const SERVER_IP = '45.45.238.134';
const RCON_PORT = 8888; // Documentation shows 8888, not 16007!
const RCON_PASSWORD = 'CookieMonster420';

console.log('🔍 Testing RCON on port 8888 (from documentation)...');

const client = new net.Socket();

client.connect(RCON_PORT, SERVER_IP, () => {
    console.log('✅ Connected to port 8888!');
    console.log('🔐 Trying plain text authentication...');
    
    // Try different plain text authentication approaches
    const authAttempts = [
        RCON_PASSWORD + '\n',
        'auth ' + RCON_PASSWORD + '\n',
        'login ' + RCON_PASSWORD + '\n',
        'password ' + RCON_PASSWORD + '\n',
        JSON.stringify({auth: RCON_PASSWORD}) + '\n'
    ];
    
    let attemptIndex = 0;
    
    function tryNextAuth() {
        if (attemptIndex < authAttempts.length) {
            const attempt = authAttempts[attemptIndex];
            console.log(`📤 Attempt ${attemptIndex + 1}: "${attempt.trim()}"`);
            client.write(attempt);
            attemptIndex++;
            
            setTimeout(tryNextAuth, 2000); // Wait 2 seconds between attempts
        }
    }
    
    tryNextAuth();
});

client.on('data', (data) => {
    console.log('📨 RESPONSE RECEIVED!');
    console.log('📊 Length:', data.length);
    console.log('📝 Data:', data.toString());
    console.log('🔍 Hex:', data.toString('hex'));
    
    // If we get a response, try a test command
    if (data.toString().includes('auth') || data.toString().includes('success') || data.toString().includes('ready')) {
        console.log('🎉 Authentication might have worked! Trying test command...');
        setTimeout(() => {
            client.write('listplayers\n');
        }, 1000);
    }
});

client.on('error', (err) => {
    console.log('❌ Connection error:', err.message);
    if (err.code === 'ECONNREFUSED') {
        console.log('💡 Port 8888 is closed - server might not have RCON on this port');
    }
});

client.on('close', () => {
    console.log('🔌 Connection closed');
});

// Timeout after 30 seconds
setTimeout(() => {
    console.log('⏰ Test timeout - closing connection');
    client.destroy();
    process.exit(0);
}, 30000);