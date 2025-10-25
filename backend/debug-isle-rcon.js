const net = require('net');

function debugIsleRCON() {
    console.log('🔍 Debugging Isle RCON connection...');
    console.log('Server: 45.45.238.134:16007');
    console.log('Password: CookieMonster420');
    console.log('');
    
    const socket = new net.Socket();
    socket.setTimeout(10000);
    
    let dataReceived = false;
    
    socket.on('connect', () => {
        console.log('✅ TCP connection established');
        console.log('📤 Waiting for server greeting...');
        
        // Wait for any initial server message
        setTimeout(() => {
            if (!dataReceived) {
                console.log('⚠️ No server greeting received');
                console.log('📤 Trying telnet-style authentication...');
                socket.write('CookieMonster420\r\n');
            }
        }, 2000);
        
        // Try different formats after waiting
        setTimeout(() => {
            if (!dataReceived) {
                console.log('📤 Trying simple password...');
                socket.write('CookieMonster420\n');
            }
        }, 4000);
        
        setTimeout(() => {
            if (!dataReceived) {
                console.log('📤 Trying RCON protocol...');
                // Standard Source RCON auth packet
                const authPacket = Buffer.alloc(14 + 16); // Size for "CookieMonster420"
                authPacket.writeInt32LE(24, 0); // Size
                authPacket.writeInt32LE(1, 4); // Request ID
                authPacket.writeInt32LE(3, 8); // Auth type
                Buffer.from('CookieMonster420').copy(authPacket, 12);
                authPacket.writeInt16LE(0, 28); // Null terminators
                
                socket.write(authPacket);
            }
        }, 6000);
        
        setTimeout(() => {
            console.log('🔌 Closing connection');
            socket.destroy();
        }, 8000);
    });
    
    socket.on('data', (data) => {
        dataReceived = true;
        console.log('📨 Server response:');
        console.log('   Raw bytes:', Array.from(data).map(b => b.toString(16).padStart(2, '0')).join(' '));
        console.log('   As string:', JSON.stringify(data.toString()));
        console.log('   Readable:', data.toString().replace(/[\r\n]/g, '\\n'));
        console.log('');
        
        // Try to send a command after getting a response
        setTimeout(() => {
            console.log('📤 Sending test command: help');
            socket.write('help\r\n');
        }, 1000);
    });
    
    socket.on('error', (err) => {
        console.log('❌ Socket error:', err.message);
    });
    
    socket.on('close', () => {
        console.log('🔌 Connection closed');
        if (!dataReceived) {
            console.log('⚠️ No data received from server - this could indicate:');
            console.log('   - RCON is not enabled on the server');
            console.log('   - Wrong port (16007)');
            console.log('   - Server expects a different protocol');
            console.log('   - Firewall/network issue');
        }
    });
    
    socket.on('timeout', () => {
        console.log('⏰ Connection timeout');
        socket.destroy();
    });
    
    console.log('🔌 Connecting...');
    socket.connect(16007, '45.45.238.134');
}

debugIsleRCON();