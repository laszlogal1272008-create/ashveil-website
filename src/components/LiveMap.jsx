import React, { useState, useEffect, useRef } from 'react';
import './LiveMap.css';

function LiveMap() {
  const canvasRef = useRef(null);
  const fullscreenCanvasRef = useRef(null);
  const mapImageRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playerLocation, setPlayerLocation] = useState({ x: 2200, y: 2400, direction: 0 });
  const [groupMembers, setGroupMembers] = useState([]);
  const [mapImageLoaded, setMapImageLoaded] = useState(false);
  const [mapSettings, setMapSettings] = useState({
    playerColor: '#00ff00',
    teammateColor: '#0099ff',
    pingColor: '#ffff00',
    showPlayerNames: true,
    showDirectionArrows: true,
    mapOpacity: 0.8,
    pingInterval: 10000, // 10 seconds
    zoomLevel: 1.0
  });
  const [showSettings, setShowSettings] = useState(false);
  
  // Zoom and pan state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [lastPingTime, setLastPingTime] = useState(Date.now());

  // Mock data for demonstration - will be replaced with real server data
  const mockGroupMembers = [
    {
      id: 'player1',
      name: 'AlphaRex',
      x: 2300,
      y: 2200, // Near Jungle Sector
      direction: 45,
      dinosaur: 'Tyrannosaurus',
      isLeader: true,
      lastSeen: Date.now() - 5000
    },
    {
      id: 'player2', 
      name: 'PackHunter',
      x: 2400,
      y: 2800, // Near South Plains
      direction: 180,
      dinosaur: 'Allosaurus',
      isLeader: false,
      lastSeen: Date.now() - 15000
    },
    {
      id: 'player3',
      name: 'StegoDefender',
      x: 2200,
      y: 1400, // Near North Lake
      direction: 270,
      dinosaur: 'Stegosaurus',
      isLeader: false,
      lastSeen: Date.now() - 8000
    }
  ];

  // Isle map coordinates (4096x4096 map)
  const MAP_SIZE = 4096;
  const CANVAS_SIZE = 600;
  const SCALE = CANVAS_SIZE / MAP_SIZE;

  // Simulate server connection and data updates
  useEffect(() => {
    const connectToServer = () => {
      setTimeout(() => {
        setIsConnected(true);
        setGroupMembers(mockGroupMembers);
      }, 2000);
    };

    connectToServer();

    // Simulate location updates every 2 seconds
    const locationUpdate = setInterval(() => {
      if (isConnected) {
        // Simulate slight movement
        setPlayerLocation(prev => ({
          x: prev.x + (Math.random() - 0.5) * 20,
          y: prev.y + (Math.random() - 0.5) * 20,
          direction: (prev.direction + (Math.random() - 0.5) * 30) % 360
        }));

        // Update group members with slight movement
        setGroupMembers(prev => prev.map(member => ({
          ...member,
          x: member.x + (Math.random() - 0.5) * 15,
          y: member.y + (Math.random() - 0.5) * 15,
          direction: (member.direction + (Math.random() - 0.5) * 20) % 360,
          lastSeen: Date.now() - Math.random() * 20000
        })));
      }
    }, 2000);

    return () => clearInterval(locationUpdate);
  }, [isConnected]);

  // Ping system - updates every 10 seconds
  useEffect(() => {
    const pingInterval = setInterval(() => {
      setLastPingTime(Date.now());
    }, mapSettings.pingInterval);

    return () => clearInterval(pingInterval);
  }, [mapSettings.pingInterval]);

  // Load your actual Isle map image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      console.log('Actual Isle map image loaded successfully!');
      mapImageRef.current = img;
      setMapImageLoaded(true);
    };
    
    img.onerror = (error) => {
      console.error('Failed to load actual Isle map, using fallback:', error);
      // Fallback SVG if image fails to load
      const fallbackSrc = 'data:image/svg+xml;base64,' + btoa(`
        <svg width="600" height="600" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="ocean" cx="50%" cy="50%" r="70%">
              <stop offset="0%" style="stop-color:#1e40af"/>
              <stop offset="70%" style="stop-color:#1e3a8a"/>
              <stop offset="100%" style="stop-color:#0f172a"/>
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#ocean)"/>
          <text x="300" y="300" text-anchor="middle" fill="#ffffff" font-size="16">
            Loading Isle Map...
          </text>
        </svg>
      `);
      
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        mapImageRef.current = fallbackImg;
        setMapImageLoaded(true);
      };
      fallbackImg.src = fallbackSrc;
    };
    
    // Load your actual Isle map image from the public folder
    img.src = '/isle-map.png';
  }, []);

  // Draw map
  useEffect(() => {
    const drawOnCanvas = (canvas, size) => {
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, size, size);

      // Save the context state
      ctx.save();
      
      // Apply zoom and pan transformations
      ctx.translate(panX, panY);
      ctx.scale(zoomLevel, zoomLevel);
      ctx.translate(size / 2, size / 2);
      ctx.translate(-size / 2, -size / 2);

      // Draw the actual map image if loaded, otherwise draw CSS background
      if (mapImageLoaded && mapImageRef.current) {
        ctx.drawImage(mapImageRef.current, 0, 0, size, size);
      } else {
        // Fallback: draw map background
        drawMapBackground(ctx, size);
      }

      if (isConnected) {
        // Draw group members
        groupMembers.forEach(member => {
          drawPlayer(ctx, member, mapSettings.teammateColor, false, size);
        });

        // Draw current player (always on top)
        drawPlayer(ctx, {
          name: 'You',
          x: playerLocation.x,
          y: playerLocation.y,
          direction: playerLocation.direction,
          dinosaur: 'Your Dinosaur',
          isLeader: false
        }, mapSettings.playerColor, true, size);

        // Draw ping effects
        if (Date.now() - lastPingTime < 2000) {
          drawPingEffects(ctx, size);
        }
      }
      
      // Restore the context state
      ctx.restore();
    };

    // Draw on both canvases
    drawOnCanvas(canvasRef.current, CANVAS_SIZE);
    if (isFullscreen) {
      drawOnCanvas(fullscreenCanvasRef.current, CANVAS_SIZE);
    }
  }, [playerLocation, groupMembers, mapSettings, lastPingTime, isConnected, mapImageLoaded, zoomLevel, panX, panY, isFullscreen]);

  // Mouse event handlers for zoom and pan
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setLastMousePos({ x, y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const deltaX = x - lastMousePos.x;
    const deltaY = y - lastMousePos.y;
    
    setPanX(prev => prev + deltaX);
    setPanY(prev => prev + deltaY);
    setLastMousePos({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    // Only prevent default if mouse is over the canvas
    e.preventDefault();
    e.stopPropagation();
    
    const zoomFactor = 0.1;
    const newZoomLevel = e.deltaY > 0 
      ? Math.max(0.5, zoomLevel - zoomFactor)
      : Math.min(3.0, zoomLevel + zoomFactor);
    
    setZoomLevel(newZoomLevel);
  };

  // Add mouse enter/leave handlers to manage scroll behavior
  const handleMouseEnter = () => {
    // Disable page scroll when mouse enters the map
    document.body.style.overflow = 'hidden';
  };

  const handleMouseLeave = () => {
    // Re-enable page scroll when mouse leaves the map
    document.body.style.overflow = 'auto';
    setIsDragging(false);
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Reset zoom when entering/exiting fullscreen
    if (!isFullscreen) {
      resetZoom();
    }
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
    resetZoom();
  };

  // Cleanup effect to restore page scroll on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const drawMapBackground = (ctx, size) => {
    // First, draw a dark background
    ctx.fillStyle = '#0a1929';
    ctx.fillRect(0, 0, size, size);

    // For now, we'll use the styled background image from CSS
    // The actual map will be loaded as a background image
    // This function will only draw the overlay elements

    // Draw coordinate grid (subtle overlay)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= size; i += 60) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }

    // Add coordinate markers
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 9px Arial';
    ctx.textAlign = 'left';
    for (let i = 60; i < CANVAS_SIZE; i += 60) {
      const coord = Math.round((i / CANVAS_SIZE) * 4096);
      ctx.fillText(coord.toString(), i - 15, 15);
      ctx.fillText(coord.toString(), 8, i + 5);
    }
  };

  const drawPlayer = (ctx, player, color, isCurrentPlayer, size) => {
    const scale = size / MAP_SIZE;
    const x = player.x * scale;
    const y = player.y * scale;
    
    // Scale player elements based on zoom level (inverse scaling for better visibility)
    const iconScale = Math.max(0.3, 1 / zoomLevel);
    const baseRadius = isCurrentPlayer ? 8 : 6;
    const scaledRadius = baseRadius * iconScale;
    
    // Draw player dot
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, scaledRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw direction arrow if enabled
    if (mapSettings.showDirectionArrows) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 * iconScale;
      const baseArrowLength = isCurrentPlayer ? 20 : 15;
      const arrowLength = baseArrowLength * iconScale;
      const angle = (player.direction * Math.PI) / 180;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + Math.cos(angle) * arrowLength,
        y + Math.sin(angle) * arrowLength
      );
      ctx.stroke();
      
      // Arrow head
      ctx.beginPath();
      ctx.moveTo(
        x + Math.cos(angle) * arrowLength,
        y + Math.sin(angle) * arrowLength
      );
      ctx.lineTo(
        x + Math.cos(angle - 0.5) * (arrowLength - 5 * iconScale),
        y + Math.sin(angle - 0.5) * (arrowLength - 5 * iconScale)
      );
      ctx.moveTo(
        x + Math.cos(angle) * arrowLength,
        y + Math.sin(angle) * arrowLength
      );
      ctx.lineTo(
        x + Math.cos(angle + 0.5) * (arrowLength - 5 * iconScale),
        y + Math.sin(angle + 0.5) * (arrowLength - 5 * iconScale)
      );
      ctx.stroke();
    }
    
    // Draw player name if enabled
    if (mapSettings.showPlayerNames) {
      ctx.fillStyle = '#ffffff';
      const baseFontSize = 12;
      const scaledFontSize = Math.max(8, baseFontSize * iconScale);
      ctx.font = `${scaledFontSize}px Arial`;
      ctx.textAlign = 'center';
      
      const nameOffset = (isCurrentPlayer ? 12 : 10) * iconScale;
      const nameY = y - nameOffset;
      ctx.fillText(player.name, x, nameY);
      
      // Show time since last seen for group members
      if (!isCurrentPlayer && player.lastSeen) {
        const timeSince = Math.floor((Date.now() - player.lastSeen) / 1000);
        const smallFontSize = Math.max(6, 10 * iconScale);
        ctx.font = `${smallFontSize}px Arial`;
        ctx.fillStyle = timeSince > 30 ? '#ff6b6b' : '#ffffff';
        ctx.fillText(`${timeSince}s ago`, x, nameY + 12 * iconScale);
      }
    }
    
    // Draw leader crown
    if (player.isLeader) {
      ctx.fillStyle = '#ffd700';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('♛', x, y - 20);
    }
  };

  const drawPingEffects = (ctx, size) => {
    const iconScale = Math.max(0.3, 1 / zoomLevel);
    const scale = size / MAP_SIZE;
    
    groupMembers.forEach(member => {
      const x = member.x * scale;
      const y = member.y * scale;
      
      // Pulsing ring effect - scaled with zoom
      ctx.strokeStyle = mapSettings.pingColor;
      ctx.lineWidth = 3 * iconScale;
      ctx.beginPath();
      const baseRadius = 15 + Math.sin(Date.now() * 0.01) * 5;
      const scaledRadius = baseRadius * iconScale;
      ctx.arc(x, y, scaledRadius, 0, 2 * Math.PI);
      ctx.stroke();
    });
  };

  const createGroup = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGroupCode(code);
    alert(`Group created! Share code: ${code}`);
  };

  const joinGroup = () => {
    if (inviteCode.trim()) {
      setGroupCode(inviteCode.trim());
      alert(`Joined group: ${inviteCode.trim()}`);
      setInviteCode('');
    }
  };

  const leaveGroup = () => {
    setGroupCode('');
    setGroupMembers([]);
    alert('Left the group');
  };

  const getDistanceToMember = (member) => {
    const dx = member.x - playerLocation.x;
    const dy = member.y - playerLocation.y;
    return Math.sqrt(dx * dx + dy * dy).toFixed(0);
  };

  const getLandmarkForPosition = (x, y) => {
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
      { name: 'Central River', x: 2200, y: 2400, radius: 100 }
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
  };

  return (
    <>
      <div className="live-map">
        <div className="map-header">
          <h2>🗺️ Live Isle Map</h2>
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? 'Connected to Server' : 'Disconnected from Server'}
            </span>
          </div>
        </div>

      <div className="map-container">
        <div className="map-canvas-wrapper">
          <canvas 
            ref={canvasRef} 
            width={CANVAS_SIZE} 
            height={CANVAS_SIZE}
            className="map-canvas"
            style={{ opacity: mapSettings.mapOpacity }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
          />
          
          <div className="map-coordinates">
            <div className="coord-info">
              <strong>Your Position:</strong> ({playerLocation.x.toFixed(0)}, {playerLocation.y.toFixed(0)})
            </div>
            <div className="coord-info">
              <strong>Direction:</strong> {playerLocation.direction.toFixed(0)}°
            </div>
            <div className="coord-info landmark-info">
              <strong>Area:</strong> {getLandmarkForPosition(playerLocation.x, playerLocation.y) || 'Unknown Region'}
            </div>
          </div>
          
          {/* Zoom Controls */}
          <div className="zoom-controls">
            <div className="zoom-info">
              <strong>Zoom:</strong> {(zoomLevel * 100).toFixed(0)}%
            </div>
            <div className="zoom-buttons">
              <button 
                onClick={() => setZoomLevel(Math.min(3.0, zoomLevel + 0.2))}
                className="zoom-btn"
                title="Zoom In"
              >
                🔍+
              </button>
              <button 
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.2))}
                className="zoom-btn"
                title="Zoom Out"
              >
                🔍-
              </button>
              <button 
                onClick={resetZoom}
                className="zoom-btn reset-btn"
                title="Reset Zoom"
              >
                🎯
              </button>
              <button 
                onClick={toggleFullscreen}
                className="zoom-btn fullscreen-btn"
                title="Fullscreen Map"
              >
                🔳
              </button>
            </div>
          </div>
        </div>

        <div className="map-sidebar">
          <div className="group-management">
            <h3>🦖 Pack Management</h3>
            
            {!groupCode ? (
              <div className="group-actions">
                <button onClick={createGroup} className="create-group-btn">
                  Create Pack
                </button>
                
                <div className="join-group">
                  <input
                    type="text" 
                    placeholder="Enter pack code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="group-code-input"
                  />
                  <button onClick={joinGroup} className="join-group-btn">
                    Join Pack
                  </button>
                </div>
              </div>
            ) : (
              <div className="active-group">
                <div className="group-code-display">
                  <strong>Pack Code:</strong> <span className="code">{groupCode}</span>
                </div>
                <button onClick={leaveGroup} className="leave-group-btn">
                  Leave Pack
                </button>
              </div>
            )}
          </div>

          {groupMembers.length > 0 && (
            <div className="group-members">
              <h3>👥 Pack Members ({groupMembers.length})</h3>
              
              <div className="members-list">
                {groupMembers.map(member => (
                  <div key={member.id} className="member-card">
                    <div className="member-info">
                      <div className="member-name">
                        {member.isLeader && <span className="leader-crown">♛</span>}
                        {member.name}
                      </div>
                      <div className="member-details">
                        <span className="dinosaur">{member.dinosaur}</span>
                        <span className="distance">{getDistanceToMember(member)}m away</span>
                      </div>
                      <div className="last-seen">
                        Last seen: {Math.floor((Date.now() - member.lastSeen) / 1000)}s ago
                      </div>
                    </div>
                    <div 
                      className="member-color-indicator"
                      style={{ backgroundColor: mapSettings.teammateColor }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="map-controls">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="settings-toggle-btn"
            >
              ⚙️ Map Settings
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <div className="settings-content">
            <h3>🎨 Map Customization</h3>
            
            <div className="setting-group">
              <label>Your Color:</label>
              <input
                type="color"
                value={mapSettings.playerColor}
                onChange={(e) => setMapSettings(prev => ({
                  ...prev,
                  playerColor: e.target.value
                }))}
              />
            </div>

            <div className="setting-group">
              <label>Teammate Color:</label>
              <input
                type="color"
                value={mapSettings.teammateColor}
                onChange={(e) => setMapSettings(prev => ({
                  ...prev,
                  teammateColor: e.target.value
                }))}
              />
            </div>

            <div className="setting-group">
              <label>Ping Color:</label>
              <input
                type="color"
                value={mapSettings.pingColor}
                onChange={(e) => setMapSettings(prev => ({
                  ...prev,
                  pingColor: e.target.value
                }))}
              />
            </div>

            <div className="setting-group">
              <label>
                <input
                  type="checkbox"
                  checked={mapSettings.showPlayerNames}
                  onChange={(e) => setMapSettings(prev => ({
                    ...prev,
                    showPlayerNames: e.target.checked
                  }))}
                />
                Show Player Names
              </label>
            </div>

            <div className="setting-group">
              <label>
                <input
                  type="checkbox"
                  checked={mapSettings.showDirectionArrows}
                  onChange={(e) => setMapSettings(prev => ({
                    ...prev,
                    showDirectionArrows: e.target.checked
                  }))}
                />
                Show Direction Arrows
              </label>
            </div>

            <div className="setting-group">
              <label>Map Opacity: {Math.round(mapSettings.mapOpacity * 100)}%</label>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.1"
                value={mapSettings.mapOpacity}
                onChange={(e) => setMapSettings(prev => ({
                  ...prev,
                  mapOpacity: parseFloat(e.target.value)
                }))}
              />
            </div>

            <div className="setting-group">
              <label>Ping Interval: {mapSettings.pingInterval / 1000}s</label>
              <input
                type="range"
                min="5000"
                max="30000"
                step="5000"
                value={mapSettings.pingInterval}
                onChange={(e) => setMapSettings(prev => ({
                  ...prev,
                  pingInterval: parseInt(e.target.value)
                }))}
              />
            </div>

            <button 
              onClick={() => setShowSettings(false)}
              className="close-settings-btn"
            >
              Close Settings
            </button>
          </div>
        </div>
      )}

      <div className="map-info">
        <div className="info-card">
          <h4>🎯 How It Works</h4>
          <ul>
            <li>Create or join a pack using group codes</li>
            <li>See real-time locations of pack members</li>
            <li>Direction arrows show which way players are facing</li>
            <li>Automatic pings every 10 seconds (customizable)</li>
            <li>Distance and last-seen information for each member</li>
            <li>Fully customizable colors and settings</li>
          </ul>
        </div>

        <div className="info-card">
          <h4>⚠️ Important Notes</h4>
          <ul>
            <li>Players must be in the same in-game group (call 2)</li>
            <li>Real-time updates depend on server connection</li>
            <li>Location accuracy: ±5 meters</li>
            <li>Pack leader can manage group settings</li>
          </ul>
        </div>
      </div>
    </div>

      {/* Fullscreen Map Overlay */}
      {isFullscreen && (
        <div className="fullscreen-overlay">
          <div className="fullscreen-header">
            <h2>🗺️ Isle Map - Fullscreen</h2>
            <button onClick={exitFullscreen} className="exit-fullscreen-btn" title="Exit Fullscreen">
              ✕
            </button>
          </div>
          
          <div className="fullscreen-map-container">
            <canvas 
              ref={fullscreenCanvasRef} 
              width={CANVAS_SIZE} 
              height={CANVAS_SIZE}
              className="fullscreen-canvas"
              style={{ 
                opacity: mapSettings.mapOpacity,
                width: '800px',
                height: '800px'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onWheel={handleWheel}
            />
            
            <div className="fullscreen-controls">
              <div className="fullscreen-zoom-controls">
                <button onClick={() => setZoomLevel(Math.min(3.0, zoomLevel + 0.2))} className="zoom-btn">🔍+</button>
                <button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.2))} className="zoom-btn">🔍-</button>
                <button onClick={resetZoom} className="zoom-btn reset-btn">🎯</button>
                <span className="zoom-level">Zoom: {(zoomLevel * 100).toFixed(0)}%</span>
              </div>
              
              <div className="fullscreen-coordinates">
                <div><strong>Position:</strong> ({playerLocation.x.toFixed(0)}, {playerLocation.y.toFixed(0)})</div>
                <div><strong>Direction:</strong> {playerLocation.direction.toFixed(0)}°</div>
                <div><strong>Area:</strong> {getLandmarkForPosition(playerLocation.x, playerLocation.y) || 'Unknown Region'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LiveMap;