const net = require('net');

function testMultiplePorts() {
    const ports = [16005, 16007, 16009];
    
    ports.forEach(port => {
        console.log(`\n🔍 Testing port ${port}...`);
        
        const socket = new net.Socket();
        socket.setTimeout(3000);
        
        socket.on('connect', () => {
            console.log(`✅ Port ${port}: Connected!`);
            
            // Send password
            socket.write('CookieMonster420\n');
            console.log(`📤 Port ${port}: Sent password`);
            
            // Send test command
            setTimeout(() => {
                socket.write('help\n');
                console.log(`📤 Port ${port}: Sent help command`);
            }, 1000);
            
            // Close after testing
            setTimeout(() => {
                socket.destroy();
            }, 3000);
        });
        
        socket.on('data', (data) => {
            console.log(`📨 Port ${port} response: "${data.toString().trim()}"`);
        });
        
        socket.on('error', (err) => {
            console.log(`❌ Port ${port}: ${err.message}`);
        });
        
        socket.on('close', () => {
            console.log(`🔌 Port ${port}: Connection closed`);
        });
        
        socket.on('timeout', () => {
            console.log(`⏰ Port ${port}: Timeout`);
            socket.destroy();
        });
        
        socket.connect(port, '45.45.238.134');
    });
}

testMultiplePorts();