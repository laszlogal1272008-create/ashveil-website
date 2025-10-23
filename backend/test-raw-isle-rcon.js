const net = require('net');

function testRawConnection() {
    console.log('🔍 Testing raw connection to Isle RCON...');
    
    const socket = new net.Socket();
    socket.setTimeout(5000);
    
    socket.on('connect', () => {
        console.log('✅ Connected! Server is listening on 16007');
        
        // Just send the password as plain text
        console.log('📤 Sending password...');
        socket.write('CookieMonster420\n');
        
        // Try a simple command after a delay
        setTimeout(() => {
            console.log('📤 Sending help command...');
            socket.write('help\n');
        }, 2000);
        
        // Try list command
        setTimeout(() => {
            console.log('📤 Sending list command...');
            socket.write('list\n');
        }, 4000);
        
        // Close after testing
        setTimeout(() => {
            socket.destroy();
        }, 6000);
    });
    
    socket.on('data', (data) => {
        console.log('📨 Server says:', data.toString().trim());
    });
    
    socket.on('error', (err) => {
        console.log('❌ Error:', err.message);
    });
    
    socket.on('close', () => {
        console.log('🔌 Connection closed');
    });
    
    socket.on('timeout', () => {
        console.log('⏰ Connection timeout');
        socket.destroy();
    });
    
    socket.connect(16007, '45.45.238.134');
}

testRawConnection();