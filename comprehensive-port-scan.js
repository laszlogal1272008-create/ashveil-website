// Comprehensive port scanner to find all open services on Isle server
const net = require('net');

const SERVER_IP = '45.45.238.134';
const COMMON_PORTS = [
    16006, 16007, 16008, // Known Isle ports
    22, 23, 25, 53, 80, 110, 143, 443, 993, 995, // Standard services
    1433, 3389, 5432, 3306, 6379, // Database/Remote
    8080, 8443, 9000, 9001, 9002, 9090, // Web services
    27015, 27016, 27017, 27018, 27019, // Steam/Source ports
    7777, 7778, 7779, // Common game ports
    25575, 25565, // Minecraft RCON/Server
    28015, 28016, // RustAdmin
    2302, 2303, 2304, 2305, // Arma/DayZ
    10666, 10667, // Conan Exiles
    15777, 15778, // Ark
    19132, // Bedrock
    26900, 26901, 26902 // Steam Master Server
];

console.log('🔍 Scanning Isle server for all open ports...');
console.log('📡 Target:', SERVER_IP);

let openPorts = [];
let completed = 0;

function scanPort(port) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(3000);
        
        socket.connect(port, SERVER_IP, () => {
            openPorts.push(port);
            console.log(`✅ Port ${port} is OPEN`);
            socket.destroy();
            resolve();
        });
        
        socket.on('error', () => {
            resolve(); // Port closed, no output
        });
        
        socket.on('timeout', () => {
            socket.destroy();
            resolve();
        });
    });
}

async function scanAllPorts() {
    console.log(`🎯 Scanning ${COMMON_PORTS.length} common ports...`);
    
    for (const port of COMMON_PORTS) {
        await scanPort(port);
        completed++;
        
        if (completed % 10 === 0) {
            console.log(`📊 Progress: ${completed}/${COMMON_PORTS.length} ports scanned`);
        }
    }
    
    console.log('\n🎉 Scan complete!');
    console.log('📋 Open ports found:', openPorts.sort((a, b) => a - b));
    
    if (openPorts.length > 0) {
        console.log('\n🔍 Port Analysis:');
        openPorts.forEach(port => {
            const service = getServiceName(port);
            console.log(`  ${port}: ${service}`);
        });
    } else {
        console.log('❌ No open ports found (server might be firewalled)');
    }
}

function getServiceName(port) {
    const services = {
        16006: 'Isle Game Port',
        16007: 'Isle RCON Port (supposed)',
        16008: 'Isle Queue Port',
        22: 'SSH',
        23: 'Telnet',
        80: 'HTTP',
        443: 'HTTPS',
        3389: 'RDP',
        25575: 'Minecraft RCON',
        27015: 'Source RCON',
        7777: 'Common Game Port',
        8080: 'HTTP Alt',
        9000: 'Web Admin'
    };
    
    return services[port] || 'Unknown Service';
}

scanAllPorts().catch(console.error);