// Try different approaches to connect to potential admin interfaces
const http = require('http');
const https = require('https');

const SERVER_IP = '45.45.238.134';

console.log('🔍 Trying different admin interface approaches...');

// Common admin paths
const ADMIN_PATHS = [
    '/',
    '/admin',
    '/console',
    '/rcon',
    '/server',
    '/api',
    '/management',
    '/control'
];

// Try different user agents that game admin tools might use
const USER_AGENTS = [
    'TheIsleEvrimaRcon/1.0',
    'RCON-Client/1.0',
    'Game-Admin-Tool/1.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
];

async function tryAdminInterface(port, path, userAgent) {
    return new Promise((resolve) => {
        const options = {
            hostname: SERVER_IP,
            port: port,
            path: path,
            method: 'GET',
            headers: {
                'User-Agent': userAgent,
                'Accept': 'application/json, text/html, */*'
            },
            timeout: 5000
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200 && (data.includes('admin') || data.includes('rcon') || data.includes('console'))) {
                    console.log(`🎉 FOUND POTENTIAL ADMIN: http://${SERVER_IP}:${port}${path}`);
                    console.log(`Status: ${res.statusCode}, User-Agent: ${userAgent}`);
                    console.log(`Response preview:`, data.substring(0, 200));
                }
                resolve();
            });
        });
        
        req.on('error', () => resolve());
        req.on('timeout', () => { req.destroy(); resolve(); });
        req.end();
    });
}

async function scanForAdminInterfaces() {
    console.log('🌐 Scanning for admin interfaces...');
    
    for (const port of [80, 8080]) {
        for (const path of ADMIN_PATHS) {
            for (const userAgent of USER_AGENTS) {
                await tryAdminInterface(port, path, userAgent);
                await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
            }
        }
    }
    
    console.log('\n💡 If no admin interface found, Austin might be using:');
    console.log('   - Direct game console commands');
    console.log('   - Custom protocol on port 16007');
    console.log('   - In-game admin commands');
    console.log('   - Different authentication method');
}

scanForAdminInterfaces().catch(console.error);