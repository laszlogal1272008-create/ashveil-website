import React, { useState, useEffect } from 'react';
import './EventRegistration.css';

function EventRegistration({ scheduledEvents, onRegister, onUnregister }) {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrationPanel, setShowRegistrationPanel] = useState(false);

  // Filter upcoming events (not yet started)
  const upcomingEvents = scheduledEvents.filter(event => {
    const eventTime = new Date(event.scheduledTime);
    const now = new Date();
    return eventTime > now;
  });

  // Sort by closest first
  const sortedUpcomingEvents = upcomingEvents.sort((a, b) => 
    new Date(a.scheduledTime) - new Date(b.scheduledTime)
  );

  const handleRegister = (event) => {
    if (!registeredEvents.includes(event.id)) {
      const updatedRegistrations = [...registeredEvents, event.id];
      setRegisteredEvents(updatedRegistrations);
      
      if (onRegister) {
        onRegister(event);
      }
      
      // Store in localStorage
      localStorage.setItem('eventRegistrations', JSON.stringify(updatedRegistrations));
    }
  };

  const handleUnregister = (event) => {
    const updatedRegistrations = registeredEvents.filter(id => id !== event.id);
    setRegisteredEvents(updatedRegistrations);
    
    if (onUnregister) {
      onUnregister(event);
    }
    
    // Store in localStorage
    localStorage.setItem('eventRegistrations', JSON.stringify(updatedRegistrations));
  };

  const isRegistered = (eventId) => {
    return registeredEvents.includes(eventId);
  };

  const getTimeUntilEvent = (eventTime) => {
    const now = new Date();
    const event = new Date(eventTime);
    const timeDiff = event - now;
    
    if (timeDiff <= 0) return 'Event has started';
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'Moonlight Hunt': return '🌙';
      case 'Great Migration': return '🦕';
      case 'King of the Hill': return '👑';
      default: return '🎯';
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'Moonlight Hunt': return '#dc2626';
      case 'Great Migration': return '#22c55e';
      case 'King of the Hill': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  // Load registrations from localStorage on component mount
  useEffect(() => {
    const savedRegistrations = localStorage.getItem('eventRegistrations');
    if (savedRegistrations) {
      setRegisteredEvents(JSON.parse(savedRegistrations));
    }
  }, []);

  return (
    <div className="event-registration">
      {/* Registration Button */}
      <button 
        className="register-toggle-btn"
        onClick={() => setShowRegistrationPanel(!showRegistrationPanel)}
      >
        📅 Events ({sortedUpcomingEvents.length})
        {registeredEvents.length > 0 && (
          <span className="registration-badge">{registeredEvents.length}</span>
        )}
      </button>

      {/* Registration Panel */}
      {showRegistrationPanel && (
        <div className="registration-panel">
          <div className="panel-header">
            <h3>🎯 Community Events</h3>
            <button 
              className="close-panel-btn"
              onClick={() => setShowRegistrationPanel(false)}
            >
              ✕
            </button>
          </div>

          <div className="panel-content">
            {sortedUpcomingEvents.length === 0 ? (
              <div className="no-events">
                <p>No upcoming events scheduled</p>
                <span>Check back later for new community events!</span>
              </div>
            ) : (
              <>
                <div className="events-summary">
                  <p>
                    {sortedUpcomingEvents.length} upcoming event{sortedUpcomingEvents.length !== 1 ? 's' : ''}
                  </p>
                  <p>
                    You're registered for {registeredEvents.length} event{registeredEvents.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="events-list">
                  {sortedUpcomingEvents.map(event => (
                    <div 
                      key={event.id} 
                      className={`event-card ${event.type.toLowerCase().replace(/\s+/g, '-')} ${isRegistered(event.id) ? 'registered' : ''}`}
                    >
                      <div className="event-main-info">
                        <div className="event-header">
                          <div className="event-title">
                            <span className="event-icon">{getEventIcon(event.type)}</span>
                            <span className="event-name">{event.type}</span>
                          </div>
                          <div className="event-timing">
                            <span className="time-until">{getTimeUntilEvent(event.scheduledTime)}</span>
                            <span className="event-time">
                              {new Date(event.scheduledTime).toLocaleDateString()} at{' '}
                              {new Date(event.scheduledTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="event-quick-info">
                          {event.type === 'Moonlight Hunt' && (
                            <span className="event-scope">🌍 Global Event</span>
                          )}
                          {event.type === 'Great Migration' && (
                            <>
                              <span className="migration-info">🦕 {event.species}</span>
                              <span className="population-info">👥 {event.population} herd</span>
                            </>
                          )}
                          {event.type === 'King of the Hill' && (
                            <span className="location-info">📍 {event.locationName}</span>
                          )}
                        </div>

                        <div className="event-actions">
                          <button
                            className="info-btn"
                            onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                          >
                            {selectedEvent?.id === event.id ? 'Hide Details' : 'View Details'}
                          </button>
                          
                          {isRegistered(event.id) ? (
                            <button
                              className="unregister-btn"
                              onClick={() => handleUnregister(event)}
                            >
                              ✓ Registered
                            </button>
                          ) : (
                            <button
                              className="register-btn"
                              onClick={() => handleRegister(event)}
                            >
                              Register
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Detailed Event Information */}
                      {selectedEvent?.id === event.id && (
                        <div className="event-details-expanded">
                          <div className="details-header">
                            <h4>{event.type} Details</h4>
                          </div>
                          
                          {event.type === 'Moonlight Hunt' && (
                            <MoonlightHuntDetails event={event} />
                          )}
                          
                          {event.type === 'Great Migration' && (
                            <GreatMigrationDetails event={event} />
                          )}
                          
                          {event.type === 'King of the Hill' && (
                            <KingOfTheHillDetails event={event} />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Registered Events Quick View */}
      {registeredEvents.length > 0 && !showRegistrationPanel && (
        <div className="registered-events-quick">
          <h4>📋 Your Registered Events</h4>
          <div className="quick-events-list">
            {sortedUpcomingEvents
              .filter(event => isRegistered(event.id))
              .slice(0, 3)
              .map(event => (
                <div key={event.id} className="quick-event-item">
                  <span className="quick-event-icon">{getEventIcon(event.type)}</span>
                  <div className="quick-event-info">
                    <span className="quick-event-name">{event.type}</span>
                    <span className="quick-event-time">{getTimeUntilEvent(event.scheduledTime)}</span>
                  </div>
                </div>
              ))
            }
            {registeredEvents.length > 3 && (
              <div className="more-events" onClick={() => setShowRegistrationPanel(true)}>
                +{registeredEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Event Detail Components
function MoonlightHuntDetails({ event }) {
  return (
    <div className="moonlight-details">
      <div className="event-description">
        <p>
          <strong>🌙 Moonlight Hunt</strong> is a global survival event where apex predators 
          become extremely aggressive and hunt actively across the entire island.
        </p>
      </div>
      
      <div className="event-mechanics">
        <h5>Event Mechanics:</h5>
        <ul>
          <li>🩸 Increased predator aggression globally</li>
          <li>🌙 Enhanced night vision for predators</li>
          <li>🔊 Heightened predator audio detection</li>
          <li>⚡ Electrical disturbances across communication systems</li>
        </ul>
      </div>
      
      <div className="survival-tips">
        <h5>Survival Tips:</h5>
        <ul>
          <li>🏃‍♂️ Find secure hiding spots immediately</li>
          <li>🤫 Avoid making any noise</li>
          <li>👥 Group up with other players for safety</li>
          <li>🚫 Avoid open areas and water sources</li>
        </ul>
      </div>
      
      <div className="event-timeline">
        <h5>Event Timeline:</h5>
        <div className="timeline-item">
          <span className="timeline-time">T-60min:</span>
          <span>Event announcement & countdown begins</span>
        </div>
        <div className="timeline-item">
          <span className="timeline-time">T-0:</span>
          <span>Moonlight Hunt begins (30 seconds duration)</span>
        </div>
        <div className="timeline-item">
          <span className="timeline-time">T+30s:</span>
          <span>Event ends, normal behavior resumes</span>
        </div>
      </div>
    </div>
  );
}

function GreatMigrationDetails({ event }) {
  const populationLabels = {
    'small': 'Small Group (5-15 individuals)',
    'medium': 'Medium Herd (20-50 individuals)',
    'large': 'Large Migration (60-100 individuals)',
    'massive': 'Massive Exodus (100+ individuals)'
  };

  return (
    <div className="migration-details">
      <div className="event-description">
        <p>
          <strong>🦕 Great Migration</strong> features massive herds moving across the island, 
          causing ground tremors and reshaping the ecosystem temporarily.
        </p>
      </div>
      
      <div className="migration-info">
        <h5>Migration Details:</h5>
        <div className="info-grid">
          <div className="info-item">
            <strong>Species:</strong> {event.species}
          </div>
          <div className="info-item">
            <strong>Population:</strong> {populationLabels[event.population] || event.population}
          </div>
          <div className="info-item">
            <strong>Path Waypoints:</strong> {event.migrationPath?.length || 0} locations
          </div>
        </div>
      </div>
      
      <div className="migration-path">
        <h5>Migration Route:</h5>
        {event.migrationPath && event.migrationPath.length > 0 ? (
          <div className="path-waypoints">
            {event.migrationPath.map((waypoint, index) => (
              <div key={index} className="waypoint-info">
                <span className="waypoint-number">{index + 1}</span>
                <span className="waypoint-coords">({waypoint.x}, {waypoint.y})</span>
              </div>
            ))}
          </div>
        ) : (
          <p>Path details will be revealed closer to the event</p>
        )}
      </div>
      
      <div className="event-effects">
        <h5>Expected Effects:</h5>
        <ul>
          <li>🌍 Ground trembling along migration path</li>
          <li>🦕 Temporary ecosystem disruption</li>
          <li>🌿 Vegetation trampling in path areas</li>
          <li>🔊 Loud rumbling sounds and calls</li>
        </ul>
      </div>
      
      <div className="participation-tips">
        <h5>How to Participate:</h5>
        <ul>
          <li>📍 Position yourself along the migration route</li>
          <li>📸 Document the migration for research points</li>
          <li>🤝 Coordinate with other players for safety</li>
          <li>⚠️ Stay at safe distance from the herd</li>
        </ul>
      </div>
    </div>
  );
}

function KingOfTheHillDetails({ event }) {
  return (
    <div className="territorial-details">
      <div className="event-description">
        <p>
          <strong>👑 King of the Hill</strong> creates an intense territorial dominance event 
          where apex predators converge on a specific location to establish supremacy.
        </p>
      </div>
      
      <div className="location-info">
        <h5>Event Location:</h5>
        <div className="location-details">
          <div className="location-item">
            <strong>Area:</strong> {event.locationName}
          </div>
          <div className="location-item">
            <strong>Coordinates:</strong> ({event.location?.x}, {event.location?.y})
          </div>
        </div>
      </div>
      
      <div className="territorial-mechanics">
        <h5>Event Mechanics:</h5>
        <ul>
          <li>👑 Multiple apex predators converge on the location</li>
          <li>🥊 Intense territorial battles between alphas</li>
          <li>🔊 Loud roaring and dominance calls</li>
          <li>⚡ High tension and aggressive behavior</li>
          <li>🏃‍♂️ Other creatures flee the area</li>
        </ul>
      </div>
      
      <div className="danger-zones">
        <h5>Danger Assessment:</h5>
        <div className="danger-level high">
          <span className="danger-indicator">🔴 EXTREME DANGER</span>
          <p>Direct vicinity of the hill (200m radius)</p>
        </div>
        <div className="danger-level medium">
          <span className="danger-indicator">🟡 HIGH RISK</span>
          <p>Surrounding area (200-500m radius)</p>
        </div>
        <div className="danger-level low">
          <span className="danger-indicator">🟢 OBSERVATION SAFE</span>
          <p>Distant observation points (500m+ radius)</p>
        </div>
      </div>
      
      <div className="strategy-tips">
        <h5>Strategy & Safety:</h5>
        <ul>
          <li>🔭 Observe from elevated, distant positions</li>
          <li>👥 Travel in groups for mutual protection</li>
          <li>🏃‍♂️ Have multiple escape routes planned</li>
          <li>📸 Document the territorial displays safely</li>
          <li>🚫 NEVER enter the central conflict zone</li>
        </ul>
      </div>
    </div>
  );
}

export default EventRegistration;