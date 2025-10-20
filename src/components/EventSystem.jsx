import React, { useState, useEffect, useRef } from 'react';
import { useEvents } from '../contexts/EventContext';
import './EventSystem.css';

function EventSystem() {
  const { 
    activeEvent: scheduledActiveEvent, 
    triggerImmediateEvent, 
    dismissActiveEvent,
    getDurationForEventType 
  } = useEvents();
  
  const [activeEvent, setActiveEvent] = useState(null);
  const [isEventActive, setIsEventActive] = useState(false);
  const [isFlickering, setIsFlickering] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const musicGainRef = useRef(null);
  const isPlayingRef = useRef(false);

  // Handle scheduled events from context
  useEffect(() => {
    if (scheduledActiveEvent) {
      const eventKey = getEventKey(scheduledActiveEvent.type);
      if (eventKey && events[eventKey]) {
        const eventConfig = {
          ...events[eventKey],
          ...scheduledActiveEvent // Merge with scheduled event data
        };
        
        setActiveEvent(eventConfig);
        setIsEventActive(true);

        // Play appropriate audio based on event type
        switch (eventConfig.type) {
          case 'electrical':
            playScaryAmbience();
            setIsFlickering(true);
            break;
          case 'trembling':
            playMigrationRumble();
            setIsShaking(true);
            break;
          case 'dominance':
            playTerritorialRoar();
            break;
          default:
            break;
        }

        // Handle visual effects
        if (eventConfig.type === 'electrical') {
          document.body.classList.add('event-flickering');
        }
        if (eventConfig.type === 'trembling') {
          document.body.classList.add('event-shaking');
        }

        // Auto-dismiss after duration
        const duration = getDurationForEventType(scheduledActiveEvent.type);
        setTimeout(() => {
          dismissEvent();
        }, duration);
      }
    } else {
      // If no scheduled event is active, clear the local state
      if (isEventActive && !activeEvent?.immediate) {
        dismissEvent();
      }
    }
  }, [scheduledActiveEvent]);

  // Helper function to map event names to keys
  const getEventKey = (eventName) => {
    switch (eventName) {
      case 'Moonlight Hunt': return 'moonlightHunt';
      case 'Great Migration': return 'greatMigration';
      case 'King of the Hill': return 'kingOfTheHill';
      default: return null;
    }
  };

  // Initialize audio context
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      musicGainRef.current = audioContextRef.current.createGain();
      
      gainNodeRef.current.connect(audioContextRef.current.destination);
      musicGainRef.current.connect(audioContextRef.current.destination);
      
      gainNodeRef.current.gain.value = 0.15; // Lower volume for effects
      musicGainRef.current.gain.value = 0.1; // Very low volume for ambient music
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }, []);

  // Generate scary ambient music with low-frequency sounds only
  const playScaryAmbience = () => {
    if (!audioContextRef.current || !musicGainRef.current || isPlayingRef.current) return;

    try {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      isPlayingRef.current = true;

      // Create main low-frequency drone
      const droneOsc = audioContextRef.current.createOscillator();
      const droneGain = audioContextRef.current.createGain();
      const droneFilter = audioContextRef.current.createBiquadFilter();
      
      droneOsc.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(musicGainRef.current);

      droneOsc.frequency.setValueAtTime(55, audioContextRef.current.currentTime); // Very low A
      droneOsc.type = 'sawtooth';
      droneFilter.type = 'lowpass';
      droneFilter.frequency.value = 150; // Even lower cutoff
      
      droneGain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      droneGain.gain.linearRampToValueAtTime(0.4, audioContextRef.current.currentTime + 3);

      droneOsc.start();

      // Add subtle low-frequency modulation for uneasiness
      const lfo = audioContextRef.current.createOscillator();
      const lfoGain = audioContextRef.current.createGain();
      lfo.connect(lfoGain);
      lfoGain.connect(droneOsc.frequency);
      lfo.frequency.value = 0.08; // Very slow modulation
      lfoGain.gain.value = 8; // Subtle frequency variation
      lfo.start();

      // Add second low drone for thickness
      const drone2Osc = audioContextRef.current.createOscillator();
      const drone2Gain = audioContextRef.current.createGain();
      const drone2Filter = audioContextRef.current.createBiquadFilter();
      
      drone2Osc.connect(drone2Filter);
      drone2Filter.connect(drone2Gain);
      drone2Gain.connect(musicGainRef.current);

      drone2Osc.frequency.setValueAtTime(41, audioContextRef.current.currentTime); // Even lower E
      drone2Osc.type = 'sine';
      drone2Filter.type = 'lowpass';
      drone2Filter.frequency.value = 120;
      
      drone2Gain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      drone2Gain.gain.linearRampToValueAtTime(0.3, audioContextRef.current.currentTime + 5);

      drone2Osc.start();

      // Add low rumbling effect
      const rumbleOsc = audioContextRef.current.createOscillator();
      const rumbleGain = audioContextRef.current.createGain();
      const rumbleFilter = audioContextRef.current.createBiquadFilter();
      
      rumbleOsc.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(musicGainRef.current);

      rumbleOsc.frequency.setValueAtTime(30, audioContextRef.current.currentTime); // Sub-bass rumble
      rumbleOsc.type = 'triangle';
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.value = 80;
      
      rumbleGain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      rumbleGain.gain.linearRampToValueAtTime(0.2, audioContextRef.current.currentTime + 8);

      rumbleOsc.start();

      // Add electrical buzzing/struggling light bulb sounds
      const createElectricalBuzz = (delay, duration) => {
        setTimeout(() => {
          if (!isPlayingRef.current) return;

          // Start text flickering when electrical sound begins
          setIsFlickering(true);

          const buzzOsc = audioContextRef.current.createOscillator();
          const buzzGain = audioContextRef.current.createGain();
          const buzzFilter = audioContextRef.current.createBiquadFilter();
          const noiseGain = audioContextRef.current.createGain();
          
          buzzOsc.connect(buzzFilter);
          buzzFilter.connect(buzzGain);
          buzzGain.connect(noiseGain);
          noiseGain.connect(musicGainRef.current);

          // Create electrical buzz frequency
          buzzOsc.frequency.setValueAtTime(120, audioContextRef.current.currentTime); // Low electrical hum
          buzzOsc.type = 'sawtooth';
          buzzFilter.type = 'highpass';
          buzzFilter.frequency.value = 100; // Filter out too much low end
          
          // Irregular flickering pattern for struggling bulb
          buzzGain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
          
          // Simulate struggling electrical connection
          for (let i = 0; i < duration * 10; i++) {
            const time = audioContextRef.current.currentTime + (i * 0.1);
            const intensity = Math.random() > 0.7 ? 0.3 : 0.05; // Random electrical contact
            buzzGain.gain.setValueAtTime(intensity, time);
          }
          
          buzzOsc.start();
          buzzOsc.stop(audioContextRef.current.currentTime + duration);

          // Stop text flickering when electrical sound ends
          setTimeout(() => {
            setIsFlickering(false);
          }, duration * 1000);
        }, delay);
      };

      // Add crackling/sparking sounds
      const createElectricalCrackle = (delay) => {
        setTimeout(() => {
          if (!isPlayingRef.current) return;

          // Brief text flicker for electrical crackle
          setIsFlickering(true);

          const crackleOsc = audioContextRef.current.createOscillator();
          const crackleGain = audioContextRef.current.createGain();
          const crackleFilter = audioContextRef.current.createBiquadFilter();
          
          crackleOsc.connect(crackleFilter);
          crackleFilter.connect(crackleGain);
          crackleGain.connect(musicGainRef.current);

          crackleOsc.frequency.setValueAtTime(200, audioContextRef.current.currentTime);
          crackleOsc.type = 'square'; // Harsh electrical sound
          crackleFilter.type = 'bandpass';
          crackleFilter.frequency.value = 300;
          crackleFilter.Q.value = 15; // Narrow band for crackling effect
          
          // Quick electrical pop/crackle
          crackleGain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
          crackleGain.gain.linearRampToValueAtTime(0.2, audioContextRef.current.currentTime + 0.01);
          crackleGain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1);

          crackleOsc.start();
          crackleOsc.stop(audioContextRef.current.currentTime + 0.1);

          // Stop text flickering after crackle
          setTimeout(() => {
            setIsFlickering(false);
          }, 200); // 200ms flicker for crackle
        }, delay);
      };

      // Schedule electrical struggling sounds throughout the event
      createElectricalBuzz(2000, 3); // 2 seconds in, buzz for 3 seconds
      createElectricalBuzz(8000, 2); // 8 seconds in, buzz for 2 seconds
      createElectricalBuzz(15000, 4); // 15 seconds in, buzz for 4 seconds
      createElectricalBuzz(24000, 2); // 24 seconds in, buzz for 2 seconds

      // Schedule electrical crackles/pops
      createElectricalCrackle(5000);
      createElectricalCrackle(7500);
      createElectricalCrackle(12000);
      createElectricalCrackle(18000);
      createElectricalCrackle(22000);
      createElectricalCrackle(26000);

      // Stop after 30 seconds with gradual fade
      setTimeout(() => {
        if (droneOsc && drone2Osc && rumbleOsc) {
          droneGain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 3);
          drone2Gain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 3);
          rumbleGain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 3);
          
          setTimeout(() => {
            droneOsc.stop();
            drone2Osc.stop();
            rumbleOsc.stop();
            lfo.stop();
            isPlayingRef.current = false;
          }, 3000);
        }
      }, 27000);

    } catch (error) {
      console.warn('Could not play scary ambience:', error);
      isPlayingRef.current = false;
    }
  };

  // Generate trembling/rumbling sounds for Great Migration
  const playMigrationRumble = () => {
    if (!audioContextRef.current || !musicGainRef.current || isPlayingRef.current) return;

    try {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      isPlayingRef.current = true;
      setIsShaking(true);

      // Create deep rumbling bass
      const rumbleOsc = audioContextRef.current.createOscillator();
      const rumbleGain = audioContextRef.current.createGain();
      const rumbleFilter = audioContextRef.current.createBiquadFilter();
      
      rumbleOsc.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(musicGainRef.current);

      rumbleOsc.frequency.setValueAtTime(25, audioContextRef.current.currentTime); // Very low rumble
      rumbleOsc.type = 'sine';
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.value = 60;
      
      rumbleGain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      rumbleGain.gain.linearRampToValueAtTime(0.5, audioContextRef.current.currentTime + 4);

      // Add rhythmic stomping pattern
      for (let i = 0; i < 35; i++) {
        const time = audioContextRef.current.currentTime + (i * 1);
        const intensity = 0.3 + (Math.random() * 0.4); // Varying stomp intensity
        rumbleGain.gain.setValueAtTime(intensity, time);
        rumbleGain.gain.setValueAtTime(0.1, time + 0.3);
      }

      rumbleOsc.start();

      // Stop after 35 seconds
      setTimeout(() => {
        rumbleGain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 3);
        setTimeout(() => {
          rumbleOsc.stop();
          setIsShaking(false);
          isPlayingRef.current = false;
        }, 3000);
      }, 32000);

    } catch (error) {
      console.warn('Could not play migration rumble:', error);
      isPlayingRef.current = false;
      setIsShaking(false);
    }
  };

  // Generate territorial roaring sounds for King of the Hill
  const playTerritorialRoar = () => {
    if (!audioContextRef.current || !musicGainRef.current || isPlayingRef.current) return;

    try {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      isPlayingRef.current = true;

      // Create deep territorial drone
      const territorialOsc = audioContextRef.current.createOscillator();
      const territorialGain = audioContextRef.current.createGain();
      const territorialFilter = audioContextRef.current.createBiquadFilter();
      
      territorialOsc.connect(territorialFilter);
      territorialFilter.connect(territorialGain);
      territorialGain.connect(musicGainRef.current);

      territorialOsc.frequency.setValueAtTime(35, audioContextRef.current.currentTime); // Deep territorial frequency
      territorialOsc.type = 'triangle';
      territorialFilter.type = 'lowpass';
      territorialFilter.frequency.value = 100;
      
      territorialGain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      territorialGain.gain.linearRampToValueAtTime(0.4, audioContextRef.current.currentTime + 3);

      territorialOsc.start();

      // Add periodic roaring sounds
      const createRoar = (delay) => {
        setTimeout(() => {
          if (!isPlayingRef.current) return;
          
          const roarOsc = audioContextRef.current.createOscillator();
          const roarGain = audioContextRef.current.createGain();
          
          roarOsc.connect(roarGain);
          roarGain.connect(musicGainRef.current);

          roarOsc.frequency.setValueAtTime(80, audioContextRef.current.currentTime);
          roarOsc.frequency.exponentialRampToValueAtTime(40, audioContextRef.current.currentTime + 2);
          roarOsc.type = 'sawtooth';
          
          roarGain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
          roarGain.gain.linearRampToValueAtTime(0.6, audioContextRef.current.currentTime + 0.2);
          roarGain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 2.5);

          roarOsc.start();
          roarOsc.stop(audioContextRef.current.currentTime + 2.5);
        }, delay);
      };

      // Schedule roars throughout the event
      createRoar(5000);
      createRoar(12000);
      createRoar(20000);
      createRoar(28000);
      createRoar(35000);

      // Stop after 40 seconds
      setTimeout(() => {
        territorialGain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 3);
        setTimeout(() => {
          territorialOsc.stop();
          isPlayingRef.current = false;
        }, 3000);
      }, 37000);

    } catch (error) {
      console.warn('Could not play territorial roar:', error);
      isPlayingRef.current = false;
    }
  };

  // Event configurations
  const events = {
    moonlightHunt: {
      name: "Moonlight Hunt",
      threatLevel: "EXTREME",
      message: "PREDATOR NIGHT HUNT DETECTED",
      description: "Apex predators are actively hunting. Survival probability: LOW",
      color: "#dc2626",
      pulseColor: "#ef4444",
      sound: "/danger-alert.mp3",
      duration: 30000, // 30 seconds
      type: "electrical"
    },
    greatMigration: {
      name: "Great Migration",
      threatLevel: "MASSIVE",
      message: "🦕 GREAT MIGRATION IN PROGRESS",
      description: "Massive herds on the move. Ground trembling detected across all sectors",
      color: "#15803d",
      pulseColor: "#22c55e",
      sound: "/migration-rumble.mp3",
      duration: 35000, // 35 seconds
      type: "trembling"
    },
    kingOfTheHill: {
      name: "King of the Hill",
      threatLevel: "TERRITORIAL",
      message: "👑 APEX TERRITORY DISPUTE",
      description: "Alpha predator establishing dominance. All creatures fleeing the area",
      color: "#b45309",
      pulseColor: "#f59e0b",
      sound: "/territorial-roar.mp3",
      duration: 40000, // 40 seconds
      type: "dominance"
    }
  };

  // Trigger event function (for manual/test triggers)
  const triggerEvent = (eventType) => {
    const event = events[eventType];
    if (!event) return;

    // Set the event directly for testing
    setActiveEvent(event);
    setIsEventActive(true);

    // Play appropriate audio based on event type
    switch (event.type) {
      case 'electrical':
        playScaryAmbience();
        setIsFlickering(true);
        break;
      case 'trembling':
        playMigrationRumble();
        setIsShaking(true);
        break;
      case 'dominance':
        playTerritorialRoar();
        break;
      default:
        break;
    }

    // Handle visual effects
    if (event.type === 'electrical') {
      document.body.classList.add('event-flickering');
    }
    if (event.type === 'trembling') {
      document.body.classList.add('event-shaking');
    }

    // Auto-dismiss after duration
    setTimeout(() => {
      dismissEvent();
    }, event.duration);
  };

  // Dismiss event function
  const dismissEvent = () => {
    setActiveEvent(null);
    setIsEventActive(false);
    setIsFlickering(false);
    setIsShaking(false);
    isPlayingRef.current = false;
    
    // Stop any ongoing audio
    if (audioContextRef.current) {
      try {
        // Stop all oscillators by creating a new audio context
        const oldContext = audioContextRef.current;
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        gainNodeRef.current = audioContextRef.current.createGain();
        musicGainRef.current = audioContextRef.current.createGain();
        
        gainNodeRef.current.connect(audioContextRef.current.destination);
        musicGainRef.current.connect(audioContextRef.current.destination);
        
        gainNodeRef.current.gain.value = 0.15;
        musicGainRef.current.gain.value = 0.1;
        
        // Close old context
        if (oldContext.state !== 'closed') {
          oldContext.close();
        }
      } catch (error) {
        console.warn('Error stopping audio:', error);
      }
    }

    // Remove body effects
    document.body.classList.remove('event-flickering', 'event-shaking');
    
    // Dismiss from context if it's a scheduled event
    if (scheduledActiveEvent) {
      dismissActiveEvent();
    }
  };

  return (
    <>
      {/* Global Text Glitch Effect - Applied to entire website */}
      {isEventActive && (
        <style jsx global>{`
          body {
            animation: ${isShaking ? 'websiteShake 1.5s infinite' : 'none'} !important;
          }
          
          h1, h2, h3, .challenge-title {
            animation: ${isFlickering ? 'brokenLightFlicker 0.5s infinite' : 'none'} !important;
          }
          
          .nav-item {
            animation: ${isFlickering ? 'brokenLightFlicker 0.6s infinite' : 'none'} !important;
          }
          
          .currency-item {
            animation: ${isFlickering ? 'brokenLightFlicker 0.4s infinite' : 'none'} !important;
          }
          
          .reward-text, button {
            animation: ${isFlickering ? 'brokenLightFlicker 0.7s infinite' : 'none'} !important;
          }
          
          p, span, div {
            animation: ${isFlickering ? 'brokenLightFlicker 0.8s infinite' : 'none'} !important;
          }
        `}</style>
      )}

      {/* Event Warning Overlay */}
      {activeEvent && (
        <div className={`event-overlay ${isEventActive ? 'active' : 'inactive'}`}>
          {/* Warning Borders */}
          <div className="warning-border warning-border-top"></div>
          <div className="warning-border warning-border-bottom"></div>
          <div className="warning-border warning-border-left"></div>
          <div className="warning-border warning-border-right"></div>

          {/* Corner Warning Indicators */}
          <div className="warning-corner warning-corner-tl">⚠️</div>
          <div className="warning-corner warning-corner-tr">⚠️</div>
          <div className="warning-corner warning-corner-bl">⚠️</div>
          <div className="warning-corner warning-corner-br">⚠️</div>

          {/* Main Warning Banner */}
          <div className="warning-banner">
            <div className="threat-indicator">
              <div className="threat-level">{activeEvent.threatLevel}</div>
              <div className="threat-pulse"></div>
            </div>
            
            <div className="warning-content">
              <div className="warning-title">⚠️ {activeEvent.message} ⚠️</div>
              <div className="warning-subtitle">{activeEvent.name}</div>
              <div className="warning-description">{activeEvent.description}</div>
            </div>

            <button onClick={dismissEvent} className="dismiss-btn" title="Acknowledge Warning">
              ✕
            </button>
          </div>

          {/* Scanning Lines Effect */}
          <div className="scan-line scan-line-1"></div>
          <div className="scan-line scan-line-2"></div>
          <div className="scan-line scan-line-3"></div>
        </div>
      )}

      {/* Test Controls (for development) */}
      <div className="event-test-controls">
        <h3>🚨 Event System Test</h3>
        <div className="test-buttons">
          <button 
            onClick={() => triggerEvent('moonlightHunt')}
            className="test-btn moonlight-btn"
          >
            🌙 Trigger Moonlight Hunt
          </button>
          <button 
            onClick={() => triggerEvent('greatMigration')}
            className="test-btn migration-btn"
          >
            🦕 Trigger Great Migration
          </button>
          <button 
            onClick={() => triggerEvent('kingOfTheHill')}
            className="test-btn territorial-btn"
          >
            👑 Trigger King of the Hill
          </button>
          <button 
            onClick={dismissEvent}
            className="test-btn dismiss-test-btn"
          >
            ❌ Dismiss Event
          </button>
        </div>
        <p className="test-note">
          Test the dramatic event system with unique effects: Moonlight Hunt (electrical), Great Migration (trembling), King of the Hill (territorial dominance)!
        </p>
      </div>
    </>
  );
}

export default EventSystem;