import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

function AdminPanel({ onEventScheduled }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEventType, setSelectedEventType] = useState('');
  const [schedulingData, setSchedulingData] = useState({});
  const [scheduledEvents, setScheduledEvents] = useState([]);

  // Admin authentication
  const handleLogin = () => {
    // In a real app, this would be a secure authentication system
    if (adminPassword === 'ashveil2025') {
      setIsAuthenticated(true);
      setAdminPassword('');
    } else {
      alert('Invalid admin password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentStep(1);
    setSelectedEventType('');
    setSchedulingData({});
  };

  // Event scheduling functions
  const startEventScheduling = (eventType) => {
    setSelectedEventType(eventType);
    setCurrentStep(2);
    setSchedulingData({});
  };

  const scheduleEvent = () => {
    const newEvent = {
      id: Date.now(),
      type: selectedEventType,
      scheduledTime: schedulingData.scheduledTime,
      ...schedulingData,
      createdAt: new Date().toISOString(),
      status: 'scheduled'
    };

    setScheduledEvents(prev => [...prev, newEvent]);
    
    // Call parent callback if provided
    if (onEventScheduled) {
      onEventScheduled(newEvent);
    }

    // Reset form
    setCurrentStep(1);
    setSelectedEventType('');
    setSchedulingData({});
    
    alert(`${selectedEventType} scheduled successfully!`);
  };

  const cancelEvent = (eventId) => {
    setScheduledEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const formatEventTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-panel">
        <div className="admin-login">
          <h2>🔐 Admin Access</h2>
          <div className="login-form">
            <input
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="password-input"
            />
            <button onClick={handleLogin} className="login-btn">
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>🛡️ Event Administration</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      {currentStep === 1 && (
        <div className="event-selection">
          <h3>Select Event Type to Schedule</h3>
          <div className="event-types">
            <div 
              className="event-type-card moonlight"
              onClick={() => startEventScheduling('Moonlight Hunt')}
            >
              <div className="event-icon">🌙</div>
              <h4>Moonlight Hunt</h4>
              <p>Global event - Select time only</p>
              <span className="schedule-info">⏰ Time-based</span>
            </div>

            <div 
              className="event-type-card migration"
              onClick={() => startEventScheduling('Great Migration')}
            >
              <div className="event-icon">🦕</div>
              <h4>Great Migration</h4>
              <p>Path, species & population</p>
              <span className="schedule-info">🗺️ Path-based</span>
            </div>

            <div 
              className="event-type-card territorial"
              onClick={() => startEventScheduling('King of the Hill')}
            >
              <div className="event-icon">👑</div>
              <h4>King of the Hill</h4>
              <p>Location and time selection</p>
              <span className="schedule-info">📍 Location-based</span>
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && selectedEventType === 'Moonlight Hunt' && (
        <MoonlightHuntScheduler 
          schedulingData={schedulingData}
          setSchedulingData={setSchedulingData}
          onSchedule={scheduleEvent}
          onCancel={() => setCurrentStep(1)}
        />
      )}

      {currentStep === 2 && selectedEventType === 'Great Migration' && (
        <GreatMigrationScheduler 
          schedulingData={schedulingData}
          setSchedulingData={setSchedulingData}
          onSchedule={scheduleEvent}
          onCancel={() => setCurrentStep(1)}
        />
      )}

      {currentStep === 2 && selectedEventType === 'King of the Hill' && (
        <KingOfTheHillScheduler 
          schedulingData={schedulingData}
          setSchedulingData={setSchedulingData}
          onSchedule={scheduleEvent}
          onCancel={() => setCurrentStep(1)}
        />
      )}

      {/* Scheduled Events List */}
      <div className="scheduled-events">
        <h3>📅 Scheduled Events ({scheduledEvents.length})</h3>
        {scheduledEvents.length === 0 ? (
          <p className="no-events">No events scheduled</p>
        ) : (
          <div className="events-list">
            {scheduledEvents.map(event => (
              <div key={event.id} className={`scheduled-event ${event.type.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="event-info">
                  <div className="event-header">
                    <span className="event-type">{event.type}</span>
                    <span className="event-time">{formatEventTime(event.scheduledTime)}</span>
                  </div>
                  <div className="event-details">
                    {event.type === 'Great Migration' && (
                      <>
                        <span>Species: {event.species}</span>
                        <span>Population: {event.population}</span>
                        <span>Path: {event.migrationPath?.length || 0} waypoints</span>
                      </>
                    )}
                    {event.type === 'King of the Hill' && (
                      <>
                        <span>Location: ({event.location?.x}, {event.location?.y})</span>
                        <span>Area: {event.locationName}</span>
                      </>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => cancelEvent(event.id)}
                  className="cancel-event-btn"
                  title="Cancel Event"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Moonlight Hunt Scheduler Component
function MoonlightHuntScheduler({ schedulingData, setSchedulingData, onSchedule, onCancel }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    if (selectedDate && selectedTime) {
      const scheduledTime = new Date(`${selectedDate}T${selectedTime}`).getTime();
      setSchedulingData({ scheduledTime });
    }
  }, [selectedDate, selectedTime, setSchedulingData]);

  const isValidSchedule = selectedDate && selectedTime && 
    new Date(`${selectedDate}T${selectedTime}`) > new Date();

  return (
    <div className="event-scheduler moonlight-scheduler">
      <h3>🌙 Schedule Moonlight Hunt</h3>
      
      <div className="scheduler-content">
        <div className="event-description">
          <p>Moonlight Hunt is a global event affecting all players simultaneously. 
             Apex predators become more aggressive and hunt actively during this time.</p>
        </div>

        <div className="time-selection">
          <div className="input-group">
            <label>Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="date-input"
            />
          </div>

          <div className="input-group">
            <label>Select Time:</label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="time-input"
            />
          </div>
        </div>

        {isValidSchedule && (
          <div className="schedule-preview">
            <h4>Event Preview:</h4>
            <div className="preview-details">
              <p><strong>Event:</strong> Moonlight Hunt</p>
              <p><strong>Scheduled for:</strong> {new Date(`${selectedDate}T${selectedTime}`).toLocaleString()}</p>
              <p><strong>Scope:</strong> Global (all players)</p>
              <p><strong>Duration:</strong> 30 seconds</p>
            </div>
          </div>
        )}

        <div className="scheduler-actions">
          <button onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
          <button 
            onClick={onSchedule} 
            className="schedule-btn"
            disabled={!isValidSchedule}
          >
            Schedule Moonlight Hunt
          </button>
        </div>
      </div>
    </div>
  );
}

// Great Migration Scheduler Component
function GreatMigrationScheduler({ schedulingData, setSchedulingData, onSchedule, onCancel }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [species, setSpecies] = useState('');
  const [population, setPopulation] = useState('');
  const [migrationPath, setMigrationPath] = useState([]);
  const [isSelectingPath, setIsSelectingPath] = useState(false);

  const dinosaurSpecies = [
    'Triceratops', 'Stegosaurus', 'Gallimimus',
    'Dryosaurus', 'Pachycephalosaurus', 'Maiasaura', 'Tenontosaurus',
    'Hypsilophodon'
  ];

  const populationSizes = [
    { value: 'small', label: 'Small Group (5-15)' },
    { value: 'medium', label: 'Medium Herd (20-50)' },
    { value: 'large', label: 'Large Migration (60-100)' },
    { value: 'massive', label: 'Massive Exodus (100+)' }
  ];

  useEffect(() => {
    if (selectedDate && selectedTime && species && population) {
      const scheduledTime = new Date(`${selectedDate}T${selectedTime}`).getTime();
      setSchedulingData({ 
        scheduledTime, 
        species, 
        population,
        migrationPath 
      });
    }
  }, [selectedDate, selectedTime, species, population, migrationPath, setSchedulingData]);

  const addWaypoint = (x, y) => {
    setMigrationPath(prev => [...prev, { x, y }]);
  };

  const clearPath = () => {
    setMigrationPath([]);
  };

  const isValidSchedule = selectedDate && selectedTime && species && population &&
    new Date(`${selectedDate}T${selectedTime}`) > new Date();

  return (
    <div className="event-scheduler migration-scheduler">
      <h3>🦕 Schedule Great Migration</h3>
      
      <div className="scheduler-content">
        <div className="event-description">
          <p>Great Migration involves massive herds moving across the island. 
             Configure the species, population size, and migration path.</p>
        </div>

        <div className="migration-config">
          <div className="config-row">
            <div className="input-group">
              <label>Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="date-input"
              />
            </div>

            <div className="input-group">
              <label>Select Time:</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="time-input"
              />
            </div>
          </div>

          <div className="config-row">
            <div className="input-group">
              <label>Migrating Species:</label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="species-select"
              >
                <option value="">Select Species</option>
                {dinosaurSpecies.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Population Size:</label>
              <select
                value={population}
                onChange={(e) => setPopulation(e.target.value)}
                className="population-select"
              >
                <option value="">Select Size</option>
                {populationSizes.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="path-selection">
            <div className="path-header">
              <label>Migration Path ({migrationPath.length} waypoints):</label>
              <div className="path-actions">
                <button 
                  onClick={() => setIsSelectingPath(!isSelectingPath)}
                  className={`path-btn ${isSelectingPath ? 'active' : ''}`}
                >
                  {isSelectingPath ? 'Stop Selecting' : 'Select Path'}
                </button>
                <button onClick={clearPath} className="clear-path-btn">
                  Clear Path
                </button>
              </div>
            </div>
            
            {isSelectingPath && (
              <div className="path-instructions">
                <p>Click on the map below to add waypoints for the migration path</p>
              </div>
            )}

            {migrationPath.length > 0 && (
              <div className="path-preview">
                <h5>Path Waypoints:</h5>
                <div className="waypoints-list">
                  {migrationPath.map((point, index) => (
                    <span key={index} className="waypoint">
                      {index + 1}: ({point.x}, {point.y})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mini Map for Path Selection */}
        <div className="path-selector-map">
          <MiniMapPathSelector 
            onWaypointAdd={addWaypoint}
            waypoints={migrationPath}
            isSelecting={isSelectingPath}
          />
        </div>

        {isValidSchedule && (
          <div className="schedule-preview">
            <h4>Event Preview:</h4>
            <div className="preview-details">
              <p><strong>Event:</strong> Great Migration</p>
              <p><strong>Scheduled for:</strong> {new Date(`${selectedDate}T${selectedTime}`).toLocaleString()}</p>
              <p><strong>Species:</strong> {species}</p>
              <p><strong>Population:</strong> {populationSizes.find(p => p.value === population)?.label}</p>
              <p><strong>Path:</strong> {migrationPath.length} waypoints</p>
              <p><strong>Duration:</strong> 35 seconds</p>
            </div>
          </div>
        )}

        <div className="scheduler-actions">
          <button onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
          <button 
            onClick={onSchedule} 
            className="schedule-btn"
            disabled={!isValidSchedule}
          >
            Schedule Migration
          </button>
        </div>
      </div>
    </div>
  );
}

// King of the Hill Scheduler Component
function KingOfTheHillScheduler({ schedulingData, setSchedulingData, onSchedule, onCancel }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);

  useEffect(() => {
    if (selectedDate && selectedTime && location) {
      const scheduledTime = new Date(`${selectedDate}T${selectedTime}`).getTime();
      setSchedulingData({ 
        scheduledTime, 
        location,
        locationName
      });
    }
  }, [selectedDate, selectedTime, location, locationName, setSchedulingData]);

  const handleLocationSelect = (x, y, areaName) => {
    setLocation({ x, y });
    setLocationName(areaName || `Custom Location (${x}, ${y})`);
    setIsSelectingLocation(false);
  };

  const isValidSchedule = selectedDate && selectedTime && location &&
    new Date(`${selectedDate}T${selectedTime}`) > new Date();

  return (
    <div className="event-scheduler territorial-scheduler">
      <h3>👑 Schedule King of the Hill</h3>
      
      <div className="scheduler-content">
        <div className="event-description">
          <p>King of the Hill creates a territorial dominance event at a specific location. 
             Alpha predators will converge on this area to establish dominance.</p>
        </div>

        <div className="territorial-config">
          <div className="config-row">
            <div className="input-group">
              <label>Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="date-input"
              />
            </div>

            <div className="input-group">
              <label>Select Time:</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="time-input"
              />
            </div>
          </div>

          <div className="location-selection">
            <div className="location-header">
              <label>Event Location:</label>
              <button 
                onClick={() => setIsSelectingLocation(!isSelectingLocation)}
                className={`location-btn ${isSelectingLocation ? 'active' : ''}`}
              >
                {isSelectingLocation ? 'Stop Selecting' : 'Select Location'}
              </button>
            </div>
            
            {isSelectingLocation && (
              <div className="location-instructions">
                <p>Click on the map below to select the King of the Hill location</p>
              </div>
            )}

            {location && (
              <div className="location-preview">
                <p><strong>Selected Location:</strong> {locationName}</p>
                <p><strong>Coordinates:</strong> ({location.x}, {location.y})</p>
              </div>
            )}
          </div>
        </div>

        {/* Mini Map for Location Selection */}
        <div className="location-selector-map">
          <MiniMapLocationSelector 
            onLocationSelect={handleLocationSelect}
            selectedLocation={location}
            isSelecting={isSelectingLocation}
          />
        </div>

        {isValidSchedule && (
          <div className="schedule-preview">
            <h4>Event Preview:</h4>
            <div className="preview-details">
              <p><strong>Event:</strong> King of the Hill</p>
              <p><strong>Scheduled for:</strong> {new Date(`${selectedDate}T${selectedTime}`).toLocaleString()}</p>
              <p><strong>Location:</strong> {locationName}</p>
              <p><strong>Coordinates:</strong> ({location.x}, {location.y})</p>
              <p><strong>Duration:</strong> 40 seconds</p>
            </div>
          </div>
        )}

        <div className="scheduler-actions">
          <button onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
          <button 
            onClick={onSchedule} 
            className="schedule-btn"
            disabled={!isValidSchedule}
          >
            Schedule King of the Hill
          </button>
        </div>
      </div>
    </div>
  );
}

// Mini Map Components for location/path selection
function MiniMapPathSelector({ onWaypointAdd, waypoints, isSelecting }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [migrationMode, setMigrationMode] = useState('start'); // 'start', 'waypoint', 'end'
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);

  const handleMapClick = (e) => {
    if (isDragging) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left - panX) / zoomLevel) / rect.width * 4096);
    const y = Math.round(((e.clientY - rect.top - panY) / zoomLevel) / rect.height * 4096);
    
    if (migrationMode === 'start') {
      setStartPoint({ x, y });
    } else if (migrationMode === 'end') {
      setEndPoint({ x, y });
    } else if (migrationMode === 'waypoint') {
      onWaypointAdd(x, y);
    }
  };

  const handleWaypointDelete = (indexToDelete) => {
    // Remove waypoint at specific index
    const newWaypoints = waypoints.filter((_, index) => index !== indexToDelete);
    // Clear all waypoints and re-add the remaining ones
    clearPath();
    newWaypoints.forEach(point => onWaypointAdd(point.x, point.y));
  };

  const clearPath = () => {
    setStartPoint(null);
    setEndPoint(null);
    setMigrationMode('start');
    // This will be handled by parent component
  };

  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      // Only allow panning with middle mouse or shift+click
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    setPanX(prev => prev + deltaX);
    setPanY(prev => prev + deltaY);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    const newZoomLevel = e.deltaY > 0 
      ? Math.max(0.5, zoomLevel - zoomFactor)
      : Math.min(3.0, zoomLevel + zoomFactor);
    
    setZoomLevel(newZoomLevel);
  };

  const resetPathZoom = () => {
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  };

  return (
    <div className="mini-map-container">
      <h5>Migration Path Selector</h5>
      
      {/* Migration Mode Controls */}
      <div className="migration-controls">
        <button 
          onClick={() => setMigrationMode('start')}
          className={`mode-btn ${migrationMode === 'start' ? 'active' : ''}`}
        >
          📍 Set Start Point
        </button>
        <button 
          onClick={() => setMigrationMode('waypoint')}
          className={`mode-btn ${migrationMode === 'waypoint' ? 'active' : ''}`}
        >
          🛣️ Add Waypoints
        </button>
        <button 
          onClick={() => setMigrationMode('end')}
          className={`mode-btn ${migrationMode === 'end' ? 'active' : ''}`}
        >
          🏁 Set End Point
        </button>
      </div>

      {/* Path Status */}
      <div className="path-status">
        <span className={startPoint ? 'status-complete' : 'status-pending'}>
          Start: {startPoint ? `(${startPoint.x}, ${startPoint.y})` : 'Not set'}
        </span>
        <span className="waypoint-count">
          Waypoints: {waypoints.length}
        </span>
        <span className={endPoint ? 'status-complete' : 'status-pending'}>
          End: {endPoint ? `(${endPoint.x}, ${endPoint.y})` : 'Not set'}
        </span>
      </div>

      {/* Zoom Controls */}
      <div className="map-zoom-controls">
        <button 
          onClick={() => setZoomLevel(Math.min(3.0, zoomLevel + 0.2))}
          className="zoom-btn"
        >
          🔍+
        </button>
        <span className="zoom-level">Zoom: {(zoomLevel * 100).toFixed(0)}%</span>
        <button 
          onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.2))}
          className="zoom-btn"
        >
          🔍-
        </button>
        <button 
          onClick={resetPathZoom}
          className="zoom-btn reset-btn"
        >
          🎯 Reset
        </button>
      </div>

      <div 
        className={`mini-map ${isSelecting ? 'selecting' : ''}`}
        onClick={handleMapClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{
          backgroundImage: 'url(/isle-map.png)',
          backgroundSize: `${100 * zoomLevel}%`,
          backgroundPosition: `${panX}px ${panY}px`,
          backgroundRepeat: 'no-repeat',
          width: '750px',
          height: '750px',
          border: '2px solid #555',
          position: 'relative',
          cursor: isSelecting ? 'crosshair' : (isDragging ? 'grabbing' : 'grab'),
          overflow: 'hidden'
        }}
      >
        {waypoints.map((point, index) => (
          <div
            key={index}
            className="waypoint-marker"
            onClick={(e) => {
              e.stopPropagation();
              handleWaypointDelete(index);
            }}
            style={{
              position: 'absolute',
              left: `${(point.x / 4096) * 100}%`,
              top: `${(point.y / 4096) * 100}%`,
              width: `${8 * zoomLevel}px`,
              height: `${8 * zoomLevel}px`,
              backgroundColor: '#22c55e',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              cursor: 'pointer',
              border: `2px solid #fff`
            }}
            title={`Click to delete waypoint ${index + 1}`}
          >
            <span className="waypoint-number" style={{
              position: 'absolute',
              top: `${-20 * zoomLevel}px`,
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#22c55e',
              fontSize: `${10 * Math.min(zoomLevel, 2)}px`,
              fontWeight: 'bold',
              pointerEvents: 'none'
            }}>
              {index + 1}
            </span>
          </div>
        ))}

        {/* Start Point Marker */}
        {startPoint && (
          <div
            className="start-point-marker"
            style={{
              position: 'absolute',
              left: `${(startPoint.x / 4096) * 100}%`,
              top: `${(startPoint.y / 4096) * 100}%`,
              width: `${12 * zoomLevel}px`,
              height: `${12 * zoomLevel}px`,
              backgroundColor: '#10b981',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 15,
              border: `3px solid #fff`,
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
            }}
            title="Migration Start Point"
          >
            <span style={{
              position: 'absolute',
              top: `${-25 * zoomLevel}px`,
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#10b981',
              fontSize: `${12 * Math.min(zoomLevel, 2)}px`,
              fontWeight: 'bold',
              pointerEvents: 'none'
            }}>
              📍
            </span>
          </div>
        )}

        {/* End Point Marker */}
        {endPoint && (
          <div
            className="end-point-marker"
            style={{
              position: 'absolute',
              left: `${(endPoint.x / 4096) * 100}%`,
              top: `${(endPoint.y / 4096) * 100}%`,
              width: `${12 * zoomLevel}px`,
              height: `${12 * zoomLevel}px`,
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 15,
              border: `3px solid #fff`,
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
            }}
            title="Migration End Point"
          >
            <span style={{
              position: 'absolute',
              top: `${-25 * zoomLevel}px`,
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#ef4444',
              fontSize: `${12 * Math.min(zoomLevel, 2)}px`,
              fontWeight: 'bold',
              pointerEvents: 'none'
            }}>
              🏁
            </span>
          </div>
        )}
        
        {/* Draw path lines */}
        {waypoints.length > 1 && (
          <svg 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          >
            {waypoints.slice(0, -1).map((point, index) => {
              const nextPoint = waypoints[index + 1];
              return (
                <line
                  key={index}
                  x1={`${(point.x / 4096) * 100}%`}
                  y1={`${(point.y / 4096) * 100}%`}
                  x2={`${(nextPoint.x / 4096) * 100}%`}
                  y2={`${(nextPoint.y / 4096) * 100}%`}
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}

function MiniMapLocationSelector({ onLocationSelect, selectedLocation, isSelecting }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

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

  const getLandmarkForPosition = (x, y) => {
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

  const handleMapClick = (e) => {
    if (!isSelecting || isDragging) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left - panX) / zoomLevel) / rect.width * 4096);
    const y = Math.round(((e.clientY - rect.top - panY) / zoomLevel) / rect.height * 4096);
    
    const areaName = getLandmarkForPosition(x, y);
    onLocationSelect(x, y, areaName);
  };

  const handleLocationMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      // Only allow panning with middle mouse or shift+click
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handleLocationMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    setPanX(prev => prev + deltaX);
    setPanY(prev => prev + deltaY);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleLocationMouseUp = () => {
    setIsDragging(false);
  };

  const handleLocationWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    const newZoomLevel = e.deltaY > 0 
      ? Math.max(0.5, zoomLevel - zoomFactor)
      : Math.min(3.0, zoomLevel + zoomFactor);
    
    setZoomLevel(newZoomLevel);
  };

  const resetLocationZoom = () => {
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  };

  return (
    <div className="mini-map-container">
      <h5>King of the Hill Location Selector</h5>
      
      {/* Zoom Controls */}
      <div className="map-zoom-controls">
        <button 
          onClick={() => setZoomLevel(Math.min(3.0, zoomLevel + 0.2))}
          className="zoom-btn"
        >
          🔍+
        </button>
        <span className="zoom-level">Zoom: {(zoomLevel * 100).toFixed(0)}%</span>
        <button 
          onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.2))}
          className="zoom-btn"
        >
          🔍-
        </button>
        <button 
          onClick={resetLocationZoom}
          className="zoom-btn reset-btn"
        >
          🎯 Reset
        </button>
      </div>

      <div 
        className={`mini-map ${isSelecting ? 'selecting' : ''}`}
        onClick={handleMapClick}
        onMouseDown={handleLocationMouseDown}
        onMouseMove={handleLocationMouseMove}
        onMouseUp={handleLocationMouseUp}
        onWheel={handleLocationWheel}
        style={{
          backgroundImage: 'url(/isle-map.png)',
          backgroundSize: `${100 * zoomLevel}%`,
          backgroundPosition: `${panX}px ${panY}px`,
          backgroundRepeat: 'no-repeat',
          width: '750px',
          height: '750px',
          border: '2px solid #555',
          position: 'relative',
          cursor: isSelecting ? 'crosshair' : (isDragging ? 'grabbing' : 'grab'),
          overflow: 'hidden'
        }}
      >
        {selectedLocation && (
          <div
            className="location-marker"
            style={{
              position: 'absolute',
              left: `${(selectedLocation.x / 4096) * 100}%`,
              top: `${(selectedLocation.y / 4096) * 100}%`,
              width: `${12 * zoomLevel}px`,
              height: `${12 * zoomLevel}px`,
              backgroundColor: '#f59e0b',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              border: `${2 * zoomLevel}px solid #fff`
            }}
          >
            <span style={{
              position: 'absolute',
              top: `${-25 * zoomLevel}px`,
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#f59e0b',
              fontSize: `${16 * Math.min(zoomLevel, 2)}px`
            }}>
              👑
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;