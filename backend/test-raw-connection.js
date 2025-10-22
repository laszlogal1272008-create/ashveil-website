const net = require('net');

console.log('🔍 Testing RCON connection directly...');

const client = new net.Socket();
client.setTimeout(10000);

client.connect(16007, '45.45.238.134', () => {
    console.log('✅ TCP Connected!');
    
    // Send raw data to see what happens
    const testData = Buffer.from('CookieMonster420\n');
    client.write(testData);
    console.log('📤 Sent password');
});

client.on('data', (data) => {
    console.log('📨 Received data:', data.toString());
    console.log('📨 Raw bytes:', data);
    
    // Try sending a command
    setTimeout(() => {
        const cmd = Buffer.from('help\n');
        client.write(cmd);
        console.log('📤 Sent help command');
    }, 1000);
});

client.on('error', (err) => {
    console.error('❌ Error:', err.message);
});

client.on('timeout', () => {
    console.log('⏰ Timeout');
    client.destroy();
});

client.on('close', () => {
    console.log('🔌 Connection closed');
});

setTimeout(() => {
    console.log('🛑 Forcing close');
    client.destroy();
}, 15000);