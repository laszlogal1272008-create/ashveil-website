const net = require('net');

async function tryIsleConsoleMethod() {
    console.log('🔍 Trying The Isle console-style RCON...');
    
    const socket = new net.Socket();
    socket.setTimeout(10000);
    
    return new Promise((resolve) => {
        let receivedData = '';
        
        socket.on('connect', () => {
            console.log('✅ Connected! Trying console-style commands...');
            
            // Method 1: Direct admin login
            setTimeout(() => {
                console.log('📤 Trying: admin login');
                socket.write('admin login CookieMonster420\n');
            }, 500);
            
            // Method 2: Console password format
            setTimeout(() => {
                console.log('📤 Trying: console password');
                socket.write('password CookieMonster420\n');
            }, 1000);
            
            // Method 3: Auth with quotes
            setTimeout(() => {
                console.log('📤 Trying: quoted password');
                socket.write('"CookieMonster420"\n');
            }, 1500);
            
            // Method 4: Direct command execution format
            setTimeout(() => {
                console.log('📤 Trying: rcon command format');
                socket.write('rcon CookieMonster420 help\n');
            }, 2000);
            
            // Method 5: Your friend's exact method (common working format)
            setTimeout(() => {
                console.log('📤 Trying: friend method');
                socket.write('CookieMonster420\r\nhelp\r\n');
            }, 2500);
            
            // Test command after auth attempts
            setTimeout(() => {
                console.log('📤 Sending test command: list');
                socket.write('list\n');
            }, 3000);
            
            setTimeout(() => {
                console.log('📤 Sending slay test: KillCharacter TestPlayer');
                socket.write('KillCharacter TestPlayer\n');
            }, 4000);
            
            // Close connection
            setTimeout(() => {
                socket.destroy();
                resolve(receivedData);
            }, 6000);
        });
        
        socket.on('data', (data) => {
            const response = data.toString();
            receivedData += response;
            console.log('📨 Server response:', response.trim());
            
            // Check for successful authentication indicators
            if (response.toLowerCase().includes('authenticated') ||
                response.toLowerCase().includes('logged in') ||
                response.toLowerCase().includes('welcome') ||
                response.toLowerCase().includes('admin') ||
                response.includes('Command executed') ||
                response.includes('Player killed') ||
                response.includes('Available commands')) {
                console.log('🎉 SUCCESS! Got server response!');
            }
        });
        
        socket.on('error', (err) => {
            console.log('❌ Socket error:', err.message);
            resolve('');
        });
        
        socket.on('close', () => {
            console.log('🔌 Connection closed');
            resolve(receivedData);
        });
        
        socket.on('timeout', () => {
            console.log('⏰ Connection timeout');
            socket.destroy();
            resolve(receivedData);
        });
        
        console.log('🔌 Connecting to 45.45.238.134:16007...');
        socket.connect(16007, '45.45.238.134');
    });
}

tryIsleConsoleMethod().then((data) => {
    if (data.trim()) {
        console.log('\n🎉 RCON IS WORKING! Server responded with:', data);
    } else {
        console.log('\n❌ Still no response from server');
    }
    process.exit(0);
});