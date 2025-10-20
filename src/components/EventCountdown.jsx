import React, { useState, useEffect } from 'react';
import './EventCountdown.css';

function EventCountdown({ scheduledEvents, onEventStart, registeredEvents = [] }) {
  const [activeCountdowns, setActiveCountdowns] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Check for events that should show countdown (1 hour before)
  useEffect(() => {
    const now = currentTime.getTime();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    const countdownEvents = scheduledEvents.filter(event => {
      const eventTime = new Date(event.scheduledTime).getTime();
      const timeUntilEvent = eventTime - now;
      
      // Show countdown if event is within 1 hour and hasn't started yet
      return timeUntilEvent > 0 && timeUntilEvent <= oneHour;
    });

    setActiveCountdowns(countdownEvents);

    // Check if any events should start now
    scheduledEvents.forEach(event => {
      const eventTime = new Date(event.scheduledTime).getTime();
      if (now >= eventTime && !event.started) {
        if (onEventStart) {
          onEventStart(event);
        }
      }
    });
  }, [currentTime, scheduledEvents, onEventStart]);

  const getTimeUntilEvent = (eventTime) => {
    const now = currentTime.getTime();
    const event = new Date(eventTime).getTime();
    const timeDiff = event - now;
    
    if (timeDiff <= 0) return { expired: true };
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds, expired: false };
  };

  const isUserRegistered = (eventId) => {
    return registeredEvents.includes(eventId);
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

  const getCountdownIntensity = (timeData) => {
    const totalMinutes = (timeData.hours * 60) + timeData.minutes;
    
    if (totalMinutes <= 5) return 'critical';
    if (totalMinutes <= 15) return 'urgent';
    if (totalMinutes <= 30) return 'warning';
    return 'normal';
  };

  if (activeCountdowns.length === 0) {
    return null;
  }

  return (
    <div className="event-countdown-container">
      {activeCountdowns.map(event => {
        const timeData = getTimeUntilEvent(event.scheduledTime);
        const isRegistered = isUserRegistered(event.id);
        const intensity = getCountdownIntensity(timeData);
        
        if (timeData.expired) return null;

        return (
          <div 
            key={event.id} 
            className={`countdown-card ${event.type.toLowerCase().replace(/\s+/g, '-')} ${intensity} ${isRegistered ? 'registered' : ''}`}
            style={{ '--event-color': getEventColor(event.type) }}
          >
            <div className="countdown-header">
              <div className="event-info">
                <span className="event-icon">{getEventIcon(event.type)}</span>
                <div className="event-details">
                  <h4 className="event-title">{event.type}</h4>
                  {isRegistered && <span className="registered-badge">✓ Registered</span>}
                </div>
              </div>
              <div className="countdown-timer">
                <div className="time-display">
                  {timeData.hours > 0 && (
                    <div className="time-unit">
                      <span className="time-value">{timeData.hours.toString().padStart(2, '0')}</span>
                      <span className="time-label">hr</span>
                    </div>
                  )}
                  <div className="time-unit">
                    <span className="time-value">{timeData.minutes.toString().padStart(2, '0')}</span>
                    <span className="time-label">min</span>
                  </div>
                  <div className="time-unit">
                    <span className="time-value">{timeData.seconds.toString().padStart(2, '0')}</span>
                    <span className="time-label">sec</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="countdown-content">
              {event.type === 'Moonlight Hunt' && (
                <MoonlightHuntCountdown event={event} timeData={timeData} />
              )}
              
              {event.type === 'Great Migration' && (
                <GreatMigrationCountdown event={event} timeData={timeData} />
              )}
              
              {event.type === 'King of the Hill' && (
                <KingOfTheHillCountdown event={event} timeData={timeData} />
              )}
            </div>

            <div className="countdown-progress">
              <div 
                className="progress-bar"
                style={{
                  width: `${100 - ((timeData.hours * 60 + timeData.minutes) / 60 * 100)}%`
                }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Event-specific countdown components
function MoonlightHuntCountdown({ event, timeData }) {
  const getWarningLevel = () => {
    const totalMinutes = (timeData.hours * 60) + timeData.minutes;
    
    if (totalMinutes <= 5) {
      return {
        level: 'IMMEDIATE THREAT',
        message: 'SEEK SHELTER NOW! Predators are beginning to stir.',
        icon: '🚨',
        actions: ['Find secure hiding spot', 'Disable all lights', 'Stay absolutely quiet']
      };
    } else if (totalMinutes <= 15) {
      return {
        level: 'HIGH ALERT',
        message: 'Final preparations! Predator activity increasing.',
        icon: '⚠️',
        actions: ['Secure your location', 'Check escape routes', 'Gather essential supplies']
      };
    } else if (totalMinutes <= 30) {
      return {
        level: 'WARNING',
        message: 'Moonlight Hunt approaching. Prepare for survival.',
        icon: '🌙',
        actions: ['Plan your survival strategy', 'Coordinate with team', 'Stock up on supplies']
      };
    } else {
      return {
        level: 'ADVISORY',
        message: 'Moonlight Hunt scheduled. Begin preparations.',
        icon: '📢',
        actions: ['Review survival tips', 'Plan hiding locations', 'Alert your team']
      };
    }
  };

  const warning = getWarningLevel();

  return (
    <div className="moonlight-countdown">
      <div className="warning-banner">
        <span className="warning-icon">{warning.icon}</span>
        <div className="warning-text">
          <div className="warning-level">{warning.level}</div>
          <div className="warning-message">{warning.message}</div>
        </div>
      </div>
      
      <div className="survival-actions">
        <h5>🎯 Immediate Actions:</h5>
        <ul>
          {warning.actions.map((action, index) => (
            <li key={index}>{action}</li>
          ))}
        </ul>
      </div>

      <div className="event-scope">
        <span className="scope-indicator">🌍 GLOBAL EVENT</span>
        <span className="duration-info">Duration: 30 seconds</span>
      </div>
    </div>
  );
}

function GreatMigrationCountdown({ event, timeData }) {
  const populationLabels = {
    'small': 'Small Group',
    'medium': 'Medium Herd',
    'large': 'Large Migration',
    'massive': 'Massive Exodus'
  };

  const getMigrationPhase = () => {
    const totalMinutes = (timeData.hours * 60) + timeData.minutes;
    
    if (totalMinutes <= 5) {
      return {
        phase: 'MIGRATION IMMINENT',
        message: 'Herds are gathering at starting points!',
        icon: '🏃‍♂️',
        advice: 'Get to observation points or clear the migration path NOW!'
      };
    } else if (totalMinutes <= 15) {
      return {
        phase: 'HERD MOBILIZATION',
        message: 'Animals are moving toward migration route.',
        icon: '🦕',
        advice: 'Final chance to position yourself along the path.'
      };
    } else if (totalMinutes <= 30) {
      return {
        phase: 'PRE-MIGRATION',
        message: 'Herds are becoming restless and grouping.',
        icon: '📍',
        advice: 'Study the migration path and choose your viewing position.'
      };
    } else {
      return {
        phase: 'MIGRATION ANNOUNCED',
        message: 'Great Migration has been scheduled.',
        icon: '📢',
        advice: 'Plan your participation and coordinate with others.'
      };
    }
  };

  const phase = getMigrationPhase();

  return (
    <div className="migration-countdown">
      <div className="migration-banner">
        <span className="migration-icon">{phase.icon}</span>
        <div className="migration-text">
          <div className="migration-phase">{phase.phase}</div>
          <div className="migration-message">{phase.message}</div>
        </div>
      </div>

      <div className="migration-details">
        <div className="detail-item">
          <strong>Species:</strong> {event.species}
        </div>
        <div className="detail-item">
          <strong>Population:</strong> {populationLabels[event.population]} ({event.population})
        </div>
        <div className="detail-item">
          <strong>Route:</strong> {event.migrationPath?.length || 0} waypoints
        </div>
      </div>

      <div className="migration-advice">
        <div className="advice-text">💡 {phase.advice}</div>
      </div>

      <div className="migration-effects">
        <h5>🌍 Expected Effects:</h5>
        <div className="effects-list">
          <span className="effect">Ground Trembling</span>
          <span className="effect">Loud Calls</span>
          <span className="effect">Dust Clouds</span>
        </div>
      </div>
    </div>
  );
}

function KingOfTheHillCountdown({ event, timeData }) {
  const getDominancePhase = () => {
    const totalMinutes = (timeData.hours * 60) + timeData.minutes;
    
    if (totalMinutes <= 5) {
      return {
        phase: 'ALPHAS CONVERGING',
        message: 'Apex predators are arriving at the location!',
        icon: '👑',
        danger: 'EXTREME',
        advice: 'EVACUATE THE AREA IMMEDIATELY! Move to safe observation distance.'
      };
    } else if (totalMinutes <= 15) {
      return {
        phase: 'TERRITORIAL TENSION',
        message: 'Predators are sensing the upcoming confrontation.',
        icon: '⚡',
        danger: 'HIGH',
        advice: 'Clear the immediate area. Position at safe viewing distance.'
      };
    } else if (totalMinutes <= 30) {
      return {
        phase: 'DOMINANCE BREWING',
        message: 'Apex predators are becoming increasingly aggressive.',
        icon: '🥊',
        danger: 'MODERATE',
        advice: 'Avoid the target location. Plan your observation strategy.'
      };
    } else {
      return {
        phase: 'CHALLENGE ANNOUNCED',
        message: 'King of the Hill territorial event scheduled.',
        icon: '📢',
        danger: 'LOW',
        advice: 'Study the location and plan safe observation points.'
      };
    }
  };

  const phase = getDominancePhase();

  return (
    <div className="territorial-countdown">
      <div className="territorial-banner">
        <span className="territorial-icon">{phase.icon}</span>
        <div className="territorial-text">
          <div className="territorial-phase">{phase.phase}</div>
          <div className="territorial-message">{phase.message}</div>
        </div>
      </div>

      <div className="location-info">
        <div className="location-detail">
          <strong>📍 Location:</strong> {event.locationName}
        </div>
        <div className="coordinates-detail">
          <strong>🗺️ Coordinates:</strong> ({event.location?.x}, {event.location?.y})
        </div>
      </div>

      <div className={`danger-assessment ${phase.danger.toLowerCase()}`}>
        <div className="danger-header">
          <span className="danger-icon">⚠️</span>
          <span className="danger-level">DANGER: {phase.danger}</span>
        </div>
        <div className="danger-advice">{phase.advice}</div>
      </div>

      <div className="safe-distances">
        <h5>📏 Safe Distances:</h5>
        <div className="distance-zones">
          <div className="zone danger-zone">🔴 0-200m: LETHAL</div>
          <div className="zone warning-zone">🟡 200-500m: HIGH RISK</div>
          <div className="zone safe-zone">🟢 500m+: OBSERVATION SAFE</div>
        </div>
      </div>
    </div>
  );
}

export default EventCountdown;