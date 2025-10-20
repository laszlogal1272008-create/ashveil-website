// Map Server Integration - This will connect to your Isle server
class MapServerAPI {
  constructor() {
    this.serverUrl = process.env.REACT_APP_ISLE_SERVER_URL || 'ws://localhost:8080';
    this.socket = null;
    this.isConnected = false;
    this.callbacks = {
      onConnect: [],
      onDisconnect: [],
      onPlayerUpdate: [],
      onGroupUpdate: [],
      onGroupInvite: []
    };
  }

  // Connect to Isle server WebSocket
  connect(playerSteamId) {
    try {
      this.socket = new WebSocket(`${this.serverUrl}/map`);
      
      this.socket.onopen = () => {
        this.isConnected = true;
        console.log('Connected to Isle server map system');
        
        // Authenticate with server
        this.send({
          type: 'authenticate',
          steamId: playerSteamId,
          timestamp: Date.now()
        });
        
        this.callbacks.onConnect.forEach(callback => callback());
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleServerMessage(data);
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        console.log('Disconnected from Isle server');
        this.callbacks.onDisconnect.forEach(callback => callback());
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (!this.isConnected) {
            this.connect(playerSteamId);
          }
        }, 5000);
      };

      this.socket.onerror = (error) => {
        console.error('Map server connection error:', error);
      };

    } catch (error) {
      console.error('Failed to connect to map server:', error);
    }
  }

  // Handle incoming server messages
  handleServerMessage(data) {
    switch (data.type) {
      case 'playerUpdate':
        // Server sends current player position and direction
        this.callbacks.onPlayerUpdate.forEach(callback => 
          callback({
            x: data.position.x,
            y: data.position.y,
            z: data.position.z,
            direction: data.direction,
            dinosaur: data.dinosaur,
            health: data.health,
            stamina: data.stamina,
            hunger: data.hunger,
            thirst: data.thirst
          })
        );
        break;

      case 'groupUpdate':
        // Server sends group member positions
        this.callbacks.onGroupUpdate.forEach(callback => 
          callback(data.members.map(member => ({
            id: member.steamId,
            name: member.characterName,
            x: member.position.x,
            y: member.position.y,
            z: member.position.z,
            direction: member.direction,
            dinosaur: member.dinosaur,
            health: member.health,
            isLeader: member.isGroupLeader,
            lastSeen: member.lastUpdateTime,
            distance: this.calculateDistance(data.yourPosition, member.position)
          })))
        );
        break;

      case 'groupInvite':
        // Someone invited you to their group
        this.callbacks.onGroupInvite.forEach(callback => 
          callback({
            inviterName: data.inviterName,
            groupCode: data.groupCode,
            memberCount: data.memberCount
          })
        );
        break;

      case 'groupJoined':
        console.log(`Joined group: ${data.groupCode}`);
        break;

      case 'groupLeft':
        console.log('Left the group');
        break;

      case 'error':
        console.error('Server error:', data.message);
        break;
    }
  }

  // Send message to server
  send(message) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify(message));
    }
  }

  // Create a new group
  createGroup() {
    this.send({
      type: 'createGroup',
      timestamp: Date.now()
    });
  }

  // Join existing group
  joinGroup(groupCode) {
    this.send({
      type: 'joinGroup',
      groupCode: groupCode,
      timestamp: Date.now()
    });
  }

  // Leave current group
  leaveGroup() {
    this.send({
      type: 'leaveGroup',
      timestamp: Date.now()
    });
  }

  // Invite player to group
  invitePlayer(playerSteamId) {
    this.send({
      type: 'invitePlayer',
      targetSteamId: playerSteamId,
      timestamp: Date.now()
    });
  }

  // Send ping to group members
  pingGroup() {
    this.send({
      type: 'pingGroup',
      timestamp: Date.now()
    });
  }

  // Request current group status
  requestGroupStatus() {
    this.send({
      type: 'getGroupStatus',
      timestamp: Date.now()
    });
  }

  // Calculate distance between two positions
  calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // Register event callbacks
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  // Remove event callbacks
  off(event, callback) {
    if (this.callbacks[event]) {
      const index = this.callbacks[event].indexOf(callback);
      if (index > -1) {
        this.callbacks[event].splice(index, 1);
      }
    }
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Get server connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      serverUrl: this.serverUrl
    };
  }
}

// Map utilities for Isle coordinates
export class IsleMapUtils {
  // Convert Isle world coordinates to map coordinates
  static worldToMap(worldX, worldY, mapSize = 4096) {
    // Isle map is typically 4096x4096 units
    // Convert to 0-1 range for display
    const mapX = (worldX + mapSize / 2) / mapSize;
    const mapY = (worldY + mapSize / 2) / mapSize;
    
    return {
      x: Math.max(0, Math.min(1, mapX)) * mapSize,
      y: Math.max(0, Math.min(1, mapY)) * mapSize
    };
  }

  // Convert map coordinates back to world coordinates
  static mapToWorld(mapX, mapY, mapSize = 4096) {
    const worldX = (mapX / mapSize) * mapSize - mapSize / 2;
    const worldY = (mapY / mapSize) * mapSize - mapSize / 2;
    
    return { x: worldX, y: worldY };
  }

  // Get direction angle from two positions
  static getDirectionAngle(fromX, fromY, toX, toY) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }

  // Check if position is within map bounds
  static isValidPosition(x, y, mapSize = 4096) {
    return x >= 0 && x <= mapSize && y >= 0 && y <= mapSize;
  }

  // Get landmark name for position (if near known locations) - Real Isle map locations
  static getLandmarkName(x, y) {
    const landmarks = [
      { name: 'North Lake', x: 2200, y: 1400, radius: 180 },
      { name: 'Northern Jungle', x: 2300, y: 1200, radius: 250 },
      { name: 'Northwest Ridge', x: 1000, y: 1300, radius: 200 },
      { name: 'West Access', x: 600, y: 2200, radius: 150 },
      { name: 'Jungle Sector', x: 2400, y: 2000, radius: 200 },
      { name: 'East Swamp', x: 3200, y: 2100, radius: 220 },
      { name: 'South Plains', x: 2400, y: 2800, radius: 300 },
      { name: 'Swamps', x: 2300, y: 3000, radius: 280 },
      { name: 'Highlands Sector', x: 1500, y: 2400, radius: 180 },
      { name: 'Water Access', x: 1800, y: 1800, radius: 120 },
      { name: 'Central River', x: 2200, y: 2400, radius: 100 },
      { name: 'Eastern Islands', x: 3500, y: 1500, radius: 150 },
      { name: 'Western Islands', x: 500, y: 800, radius: 120 }
    ];

    for (const landmark of landmarks) {
      const distance = Math.sqrt(
        Math.pow(x - landmark.x, 2) + Math.pow(y - landmark.y, 2)
      );
      
      if (distance <= landmark.radius) {
        return landmark.name;
      }
    }

    return null;
  }
}

// Group management utilities
export class GroupManager {
  constructor(mapAPI) {
    this.mapAPI = mapAPI;
    this.currentGroup = null;
    this.groupSettings = {
      autoAcceptInvites: false,
      pingInterval: 10000,
      maxGroupSize: 8,
      allowLocationSharing: true
    };
  }

  // Create new group with settings
  async createGroup(settings = {}) {
    this.groupSettings = { ...this.groupSettings, ...settings };
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Group creation timeout'));
      }, 10000);

      const onGroupCreated = (groupData) => {
        clearTimeout(timeout);
        this.currentGroup = groupData;
        this.mapAPI.off('groupJoined', onGroupCreated);
        resolve(groupData);
      };

      this.mapAPI.on('groupJoined', onGroupCreated);
      this.mapAPI.createGroup();
    });
  }

  // Join group with code
  async joinGroup(groupCode) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Group join timeout'));
      }, 10000);

      const onGroupJoined = (groupData) => {
        clearTimeout(timeout);
        this.currentGroup = groupData;
        this.mapAPI.off('groupJoined', onGroupJoined);
        resolve(groupData);
      };

      this.mapAPI.on('groupJoined', onGroupJoined);
      this.mapAPI.joinGroup(groupCode);
    });
  }

  // Leave current group
  leaveGroup() {
    if (this.currentGroup) {
      this.mapAPI.leaveGroup();
      this.currentGroup = null;
    }
  }

  // Get current group info
  getCurrentGroup() {
    return this.currentGroup;
  }

  // Update group settings
  updateSettings(newSettings) {
    this.groupSettings = { ...this.groupSettings, ...newSettings };
  }

  // Get group settings
  getSettings() {
    return this.groupSettings;
  }
}

export default MapServerAPI;