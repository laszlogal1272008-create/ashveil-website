const https = require('https');

console.log('🎯 TESTING COMPLETE WEBSITE SLAY INTEGRATION');
console.log('============================================');
console.log('Testing: Website → Netlify Function → VPS Bridge → Isle Server');
console.log('');

// Test the complete website flow
function testWebsiteSlay() {
  const postData = JSON.stringify({
    playerName: 'Misplacedcursor',
    steamId: '76561199520399511'
  });

  const options = {
    hostname: 'ashveil.live',
    path: '/.netlify/functions/slay',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('🚀 Sending slay request to website...');
  
  const req = https.request(options, (res) => {
    console.log(`📡 Response Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📥 Website Response:');
        console.log(JSON.stringify(response, null, 2));
        
        if (response.success) {
          console.log('');
          console.log('✅ SUCCESS! The complete chain is working:');
          console.log('   1. Website received request ✅');
          console.log('   2. Netlify function processed it ✅');
          console.log('   3. VPS bridge executed command ✅');
          console.log('   4. Isle server responded ✅');
          console.log('');
          console.log('🎯 Check if Misplacedcursor died in-game!');
        } else {
          console.log('⚠️ Command sent but may need troubleshooting');
        }
      } catch (error) {
        console.error('❌ Error parsing response:', error);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error);
  });

  req.write(postData);
  req.end();
}

testWebsiteSlay();