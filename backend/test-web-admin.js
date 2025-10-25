const http = require('http');
const https = require('https');

async function testWebAdmin() {
    console.log('🌐 Testing for web-based admin interfaces...');
    
    const testUrls = [
        'http://45.45.238.134:16007',
        'http://45.45.238.134:16007/admin',
        'http://45.45.238.134:16007/console',
        'http://45.45.238.134:16007/rcon',
        'http://45.45.238.134:8080',
        'http://45.45.238.134:8080/admin',
        'https://45.45.238.134:16007',
        'https://45.45.238.134:8080'
    ];
    
    for (const url of testUrls) {
        try {
            console.log(`📡 Testing: ${url}`);
            
            const client = url.startsWith('https') ? https : http;
            const response = await new Promise((resolve, reject) => {
                const req = client.get(url, { timeout: 5000 }, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
                });
                
                req.on('error', reject);
                req.on('timeout', () => {
                    req.destroy();
                    reject(new Error('Timeout'));
                });
            });
            
            console.log(`   ✅ Status ${response.status}`);
            console.log(`   📋 Content-Type: ${response.headers['content-type'] || 'unknown'}`);
            
            if (response.data.length > 0) {
                const preview = response.data.substring(0, 200).replace(/\s+/g, ' ');
                console.log(`   📄 Preview: ${preview}...`);
            }
            
        } catch (error) {
            console.log(`   ❌ ${error.message}`);
        }
        
        console.log('');
    }
}

testWebAdmin().catch(console.error);