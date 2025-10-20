import React, { useEffect, useState } from 'react';
import ThemeSelector from './ThemeSelector';

// Dynamic Theme Controller - Changes website theme based on in-game time or manual selection
const DynamicTheme = () => {
  const [currentPhase, setCurrentPhase] = useState('day');
  const [timeData, setTimeData] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [starsEnabled, setStarsEnabled] = useState(true); // Toggle for stars vs scratches
  const [isLoading, setIsLoading] = useState(false); // Loading state for theme transitions

  // Theme configurations for different time phases
  const themes = {
    dawn: {
      primaryColor: '#FF6B6B', // Soft red
      backgroundColor: 'linear-gradient(90deg, #2a2a3a 0%, #3a3a4a 30%, #4a4a5a 70%, #5a5a6a 100%)',
      scratchColor: 'rgba(255, 107, 107, 0.1)',
      textColor: '#f0f0f0',
      containerBg: 'linear-gradient(90deg, #3a3a4a, #4a4a5a)'
    },
    day: {
      primaryColor: '#CC0000', // Blood red
      backgroundColor: 'linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 30%, #4a4a4a 70%, #6a6a6a 100%)',
      scratchColor: 'rgba(204, 0, 0, 0.12)',
      textColor: '#f0f0f0', 
      containerBg: 'linear-gradient(90deg, #3a3a3a, #4a4a4a)'
    },
    dusk: {
      primaryColor: '#8B4B8B', // Purple-red
      backgroundColor: 'linear-gradient(90deg, #1a1a2a 0%, #2a2a3a 30%, #3a3a4a 70%, #4a4a5a 100%)',
      scratchColor: 'rgba(139, 75, 139, 0.1)',
      textColor: '#f0f0f0',
      containerBg: 'linear-gradient(90deg, #2a2a3a, #3a3a4a)'
    },
    night: {
      primaryColor: '#4169E1', // Royal blue
      backgroundColor: 'linear-gradient(90deg, #000000 0%, #050508 30%, #0a0a10 70%, #0f0f18 100%)', // Much darker - almost black night sky
      scratchColor: 'rgba(65, 105, 225, 0.15)',
      textColor: '#e0e0ff',
      containerBg: 'linear-gradient(90deg, #1a1a2a, #2a2a3a)'
    }
  };

  // Generate individual ash particles for day theme
  const generateAshParticles = () => {
    const particles = [];
    
    // Create 300 individual ash particles
    for (let i = 0; i < 300; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100, // Random X position
        y: Math.random() * 100, // Random Y position
        size: Math.random() * 4 + 2, // Size between 2-6px (slightly bigger)
        opacity: Math.random() * 0.8 + 0.5, // Opacity 0.5-1.3 (more visible)
        speedX: (Math.random() - 0.5) * 6, // Horizontal drift -3 to 3 (varied directions)
        speedY: (Math.random() - 0.5) * 4, // Vertical movement -2 to 2 (up and down)
        color: `rgba(${Math.floor(Math.random() * 90) + 110}, ${Math.floor(Math.random() * 50) + 25}, ${Math.floor(Math.random() * 35) + 15}, ${Math.random() * 0.7 + 0.6})` // Slightly brighter colors
      });
    }
    
    return particles;
  };

  const [ashParticles] = useState(generateAshParticles);

  // Create individual ash particles overlay
  const createAshParticlesOverlay = () => {
    if (currentPhase !== 'day') return;

    console.log('🔥 Creating individual ash particles...');

    // Remove existing ash
    const existingAsh = document.getElementById('ash-overlay');
    if (existingAsh) existingAsh.remove();

    // Create ash container
    const ashContainer = document.createElement('div');
    ashContainer.id = 'ash-overlay';
    ashContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
      overflow: hidden;
      background: transparent;
    `;

    console.log(`🔥 Creating ${ashParticles.length} individual ash particles...`);

    // Add individual ash particles
    ashParticles.forEach(particle => {
      const ashElement = document.createElement('div');
      
      ashElement.style.cssText = `
        position: absolute;
        left: ${particle.x}%;
        top: ${particle.y}%;
        width: ${particle.size}px;
        height: ${particle.size}px;
        background: radial-gradient(circle, ${particle.color} 0%, transparent 70%);
        border-radius: 50%;
        opacity: ${particle.opacity};
        filter: contrast(1.4);
        box-shadow: 0 0 ${particle.size * 1.5}px ${particle.color};
        pointer-events: none;
        will-change: transform, opacity;
      `;
      
      // Add individual movement animation
      const animationDuration = 8 + Math.random() * 12; // 8-20 seconds (faster, more visible)
      const startDelay = Math.random() * 3; // 0-3 second delay
      
      ashElement.style.animation = `ashFloat${particle.id} ${animationDuration}s ease-in-out infinite`;
      ashElement.style.animationDelay = `${startDelay}s`;
      
      ashContainer.appendChild(ashElement);
    });

    // Create individual keyframe animations for each particle
    let keyframeCSS = '';
    ashParticles.forEach(particle => {
      const endX = particle.x + (particle.speedX * 80); // More horizontal drift
      const endY = particle.y + (particle.speedY * 150); // Can move up or down
      
      keyframeCSS += `
        @keyframes ashFloat${particle.id} {
          0% {
            transform: translateX(0) translateY(0);
            opacity: ${particle.opacity};
          }
          50% {
            opacity: ${particle.opacity * 0.8};
            transform: translateX(${particle.speedX * 40}px) translateY(${particle.speedY * 80}px);
          }
          100% {
            transform: translateX(${particle.speedX * 80}px) translateY(${particle.speedY * 150}px);
            opacity: 0;
          }
        }
      `;
    });
    
    // Add the keyframes to document
    if (!document.getElementById('ash-styles')) {
      const style = document.createElement('style');
      style.id = 'ash-styles';
      style.textContent = keyframeCSS;
      document.head.appendChild(style);
    } else {
      document.getElementById('ash-styles').textContent = keyframeCSS;
    }

    document.body.appendChild(ashContainer);
  };

  // Remove ash particles overlay
  const removeAshParticlesOverlay = () => {
    const existingAsh = document.getElementById('ash-overlay');
    if (existingAsh) existingAsh.remove();
    
    const existingStyles = document.getElementById('ash-styles');
    if (existingStyles) existingStyles.remove();
  };
  const generateStars = () => {
    const stars = [];
    
    // Main bright stars (like before)
    for (let i = 0; i < 200; i++) {
      stars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleDelay: Math.random() * 4,
        type: 'main'
      });
    }
    
    // Small distant stars (galaxy background)
    for (let i = 200; i < 800; i++) {
      stars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        twinkleDelay: Math.random() * 8,
        type: 'distant'
      });
    }
    
    // Tiny sparkle stars (stardust)
    for (let i = 800; i < 1500; i++) {
      stars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 0.8 + 0.2,
        opacity: Math.random() * 0.3 + 0.05,
        twinkleDelay: Math.random() * 12,
        type: 'sparkle'
      });
    }
    
    return stars;
  };

  const [stars] = useState(generateStars);

  // Create stars overlay for night theme
  const createStarsOverlay = () => {
    if (currentPhase !== 'night' || !starsEnabled) return;

    console.log('🌟 Creating bright stars overlay...');

    // Add stars-active class to body to hide scratches
    document.body.classList.add('stars-active');

    // Remove existing stars
    const existingStars = document.getElementById('stars-overlay');
    if (existingStars) existingStars.remove();

    // Create new stars container
    const starsContainer = document.createElement('div');
    starsContainer.id = 'stars-overlay';
    starsContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
      overflow: hidden;
      background: transparent;
    `;

    console.log(`� Creating galaxy with ${stars.length} stars...`);

    // Add individual stars - different styles based on type
    stars.forEach(star => {
      const starElement = document.createElement('div');
      
      // Different styles for different star types
      let starStyle = '';
      
      if (star.type === 'main') {
        // Main bright stars
        starStyle = `
          position: absolute;
          left: ${star.x}%;
          top: ${star.y}%;
          width: ${star.size}px;
          height: ${star.size}px;
          background: #ffffff;
          border-radius: 50%;
          opacity: ${star.opacity + 0.3};
          box-shadow: 0 0 ${star.size * 4}px rgba(255, 255, 255, 1),
                      0 0 ${star.size * 8}px rgba(255, 255, 255, 0.8),
                      0 0 ${star.size * 16}px rgba(255, 255, 255, 0.6),
                      0 0 ${star.size * 24}px rgba(135, 206, 235, 0.4);
          animation: twinkle-main ${2 + Math.random() * 3}s ease-in-out infinite alternate;
          animation-delay: ${star.twinkleDelay}s;
          cursor: pointer;
          transition: all 0.3s ease;
          pointer-events: auto;
          filter: brightness(1.5) saturate(1.2);
        `;
      } else if (star.type === 'distant') {
        // Distant galaxy stars
        starStyle = `
          position: absolute;
          left: ${star.x}%;
          top: ${star.y}%;
          width: ${star.size}px;
          height: ${star.size}px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          opacity: ${star.opacity};
          box-shadow: 0 0 ${star.size * 2}px rgba(255, 255, 255, 0.6),
                      0 0 ${star.size * 4}px rgba(200, 220, 255, 0.3);
          animation: twinkle-distant ${4 + Math.random() * 4}s ease-in-out infinite alternate;
          animation-delay: ${star.twinkleDelay}s;
          pointer-events: none;
          filter: brightness(1.2);
        `;
      } else {
        // Sparkle stardust
        starStyle = `
          position: absolute;
          left: ${star.x}%;
          top: ${star.y}%;
          width: ${star.size}px;
          height: ${star.size}px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          opacity: ${star.opacity};
          box-shadow: 0 0 ${star.size}px rgba(255, 255, 255, 0.4);
          animation: twinkle-sparkle ${6 + Math.random() * 6}s ease-in-out infinite alternate;
          animation-delay: ${star.twinkleDelay}s;
          pointer-events: none;
          filter: brightness(1.1);
        `;
      }
      
      starElement.style.cssText = starStyle;

      // Add hover effect only for main stars
      if (star.type === 'main') {
        starElement.addEventListener('mouseenter', () => {
          starElement.style.transform = 'scale(3)';
          starElement.style.boxShadow = `
            0 0 ${star.size * 12}px rgba(255, 255, 255, 1),
            0 0 ${star.size * 24}px rgba(255, 255, 255, 1),
            0 0 ${star.size * 48}px rgba(255, 255, 255, 0.8),
            0 0 ${star.size * 72}px rgba(135, 206, 235, 0.6),
            0 0 ${star.size * 96}px rgba(255, 255, 255, 0.3)
          `;
          starElement.style.filter = 'brightness(2.5) saturate(1.5)';
        });

        starElement.addEventListener('mouseleave', () => {
          starElement.style.transform = 'scale(1)';
          starElement.style.boxShadow = `
            0 0 ${star.size * 4}px rgba(255, 255, 255, 1),
            0 0 ${star.size * 8}px rgba(255, 255, 255, 0.8),
            0 0 ${star.size * 16}px rgba(255, 255, 255, 0.6),
            0 0 ${star.size * 24}px rgba(135, 206, 235, 0.4)
          `;
          starElement.style.filter = 'brightness(1.5) saturate(1.2)';
        });
      }

      starsContainer.appendChild(starElement);
    });

    // Add CSS animation for twinkling
    if (!document.getElementById('star-styles')) {
      const style = document.createElement('style');
      style.id = 'star-styles';
      style.textContent = `
        @keyframes twinkle {
          0% { opacity: ${0.4}; transform: scale(1); filter: brightness(1.2); }
          50% { opacity: ${1}; transform: scale(1.3); filter: brightness(2); }
          100% { opacity: ${0.4}; transform: scale(1); filter: brightness(1.2); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(starsContainer);
  };

  // Remove stars overlay
  const removeStarsOverlay = () => {
    // Remove stars-active class from body to show scratches
    document.body.classList.remove('stars-active');
    
    const existingStars = document.getElementById('stars-overlay');
    if (existingStars) existingStars.remove();
  };

  // Create dawn asymmetric overlay - brightness left, stars right
  const createDawnAsymmetricOverlay = () => {
    removeDawnOverlay(); // Remove existing first
    
    const overlay = document.createElement('div');
    overlay.id = 'dawn-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 1;
      background: linear-gradient(to right, 
        rgba(255, 179, 102, 0.15) 0%,
        rgba(255, 159, 64, 0.1) 25%,
        rgba(255, 159, 64, 0.05) 40%,
        transparent 50%,
        transparent 100%
      );
    `;
    
    // Add stars to the right side
    const rightStars = generateStars().filter(() => Math.random() > 0.7); // Fewer stars
    rightStars.forEach(star => {
      if (star.x > 60) { // Only stars on right side
        const starElement = document.createElement('div');
        starElement.style.cssText = `
          position: absolute;
          left: ${star.x}%;
          top: ${star.y}%;
          width: ${star.size * 0.7}px;
          height: ${star.size * 0.7}px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          opacity: ${star.opacity * 0.8};
          box-shadow: 0 0 ${star.size * 2}px rgba(255, 255, 255, 0.4);
          animation: twinkle-distant ${4 + Math.random() * 4}s ease-in-out infinite alternate;
          animation-delay: ${star.twinkleDelay}s;
          pointer-events: none;
        `;
        overlay.appendChild(starElement);
      }
    });
    
    document.body.appendChild(overlay);
  };

  // Create dusk asymmetric overlay - stars left, brightness right
  const createDuskAsymmetricOverlay = () => {
    removeDuskOverlay(); // Remove existing first
    
    const overlay = document.createElement('div');
    overlay.id = 'dusk-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 1;
      background: linear-gradient(to right, 
        transparent 0%,
        transparent 50%,
        rgba(230, 179, 255, 0.05) 60%,
        rgba(221, 160, 221, 0.1) 75%,
        rgba(255, 140, 0, 0.15) 100%
      );
    `;
    
    // Add stars to the left side
    const leftStars = generateStars().filter(() => Math.random() > 0.7); // Fewer stars
    leftStars.forEach(star => {
      if (star.x < 40) { // Only stars on left side
        const starElement = document.createElement('div');
        starElement.style.cssText = `
          position: absolute;
          left: ${star.x}%;
          top: ${star.y}%;
          width: ${star.size * 0.7}px;
          height: ${star.size * 0.7}px;
          background: rgba(230, 179, 255, 0.8);
          border-radius: 50%;
          opacity: ${star.opacity * 0.9};
          box-shadow: 0 0 ${star.size * 3}px rgba(230, 179, 255, 0.5);
          animation: twinkle-distant ${3 + Math.random() * 3}s ease-in-out infinite alternate;
          animation-delay: ${star.twinkleDelay}s;
          pointer-events: none;
        `;
        overlay.appendChild(starElement);
      }
    });
    
    document.body.appendChild(overlay);
  };

  // Remove dawn overlay
  const removeDawnOverlay = () => {
    const existingOverlay = document.getElementById('dawn-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
  };

  // Remove dusk overlay
  const removeDuskOverlay = () => {
    const existingOverlay = document.getElementById('dusk-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
  };

  // Apply theme to CSS variables
  const applyTheme = (phase) => {
    const theme = themes[phase];
    const root = document.documentElement;
    
    // Show loading notification
    setIsLoading(true);
    
    // Batch DOM updates for better performance
    requestAnimationFrame(() => {
      root.style.setProperty('--ashveil-red', theme.primaryColor);
      root.style.setProperty('--ashveil-text', theme.textColor);
      root.style.setProperty('--dynamic-background', theme.backgroundColor);
      root.style.setProperty('--dynamic-container-bg', theme.containerBg);
      
      // Update body background with instant transition
      document.body.style.transition = 'background 0.1s ease-out';
      document.body.style.background = theme.backgroundColor;
      
      // Apply text animation classes - remove old theme classes first
      document.body.classList.remove('theme-dawn', 'theme-day', 'theme-dusk', 'theme-night');
      document.body.classList.add(`theme-${phase}`);
      
      // Handle different visual effects for each theme
      if (phase === 'night' && starsEnabled) {
        // Night: Full stars overlay
        root.style.setProperty('--dynamic-scratch-color', 'transparent');
        createStarsOverlay();
        removeAshParticlesOverlay();
      } else if (phase === 'dawn') {
        // Dawn: No scratches, brightness left + stars right
        root.style.setProperty('--dynamic-scratch-color', 'transparent');
        createDawnAsymmetricOverlay();
        removeAshParticlesOverlay();
      } else if (phase === 'dusk') {
        // Dusk: No scratches, stars left + brightness right
        root.style.setProperty('--dynamic-scratch-color', 'transparent');
        createDuskAsymmetricOverlay();
        removeAshParticlesOverlay();
      } else if (phase === 'day') {
        // Day: Individual ash particles
        root.style.setProperty('--dynamic-scratch-color', 'transparent');
        removeStarsOverlay();
        removeDawnOverlay();
        removeDuskOverlay();
        createAshParticlesOverlay();
      } else {
        // Default: Clean
        root.style.setProperty('--dynamic-scratch-color', theme.scratchColor);
        removeStarsOverlay();
        removeDawnOverlay();
        removeDuskOverlay();
        removeAshParticlesOverlay();
      }
      
      // Hide loading notification after transition
      setTimeout(() => {
        setIsLoading(false);
      }, 150); // Slightly longer than the 0.1s transition
    });
    
    console.log(`🎨 Theme changed to: ${phase.toUpperCase()} with text animations`);
  };

  // Manual theme change handler
  const handleManualThemeChange = (newPhase) => {
    setManualMode(true);
    setCurrentPhase(newPhase);
    applyTheme(newPhase);
  };

  // Toggle stars/scratches for night theme
  const toggleStarsMode = () => {
    const newStarsEnabled = !starsEnabled;
    setStarsEnabled(newStarsEnabled);
    
    if (currentPhase === 'night') {
      const root = document.documentElement;
      if (newStarsEnabled) {
        // Enable stars mode - hide scratches completely
        root.style.setProperty('--dynamic-scratch-color', 'transparent');
        createStarsOverlay();
      } else {
        // Enable scratches mode - show blue scratches
        root.style.setProperty('--dynamic-scratch-color', themes.night.scratchColor);
        removeStarsOverlay();
      }
    }
  };

  // Fetch server time data
  const fetchTimeData = async () => {
    if (manualMode) return; // Skip auto updates in manual mode
    
    try {
      const response = await fetch('http://localhost:5000/api/server/info');
      const data = await response.json();
      
      if (data.success && data.data.timePhase) {
        const newPhase = data.data.timePhase;
        setTimeData(data.data);
        
        if (newPhase !== currentPhase) {
          setCurrentPhase(newPhase);
          applyTheme(newPhase);
        }
      }
    } catch (error) {
      console.log('⏰ Using demo time cycle (server not connected)');
      // Demo mode - cycle through phases every 30 seconds
      const demoPhases = ['dawn', 'day', 'dusk', 'night'];
      const demoPhase = demoPhases[Math.floor(Date.now() / 30000) % 4];
      
      if (demoPhase !== currentPhase) {
        setCurrentPhase(demoPhase);
        applyTheme(demoPhase);
      }
    }
  };

  // Initialize and set up polling
  useEffect(() => {
    // Apply initial theme
    applyTheme(currentPhase);
    
    // Fetch immediately if not in manual mode
    if (!manualMode) {
      fetchTimeData();
    }
    
    // Poll for time changes every 10 seconds (only if not manual)
    const interval = setInterval(() => {
      if (!manualMode) fetchTimeData();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [currentPhase, manualMode]);

  // WebSocket listener for real-time updates
  useEffect(() => {
    if (manualMode) return; // Skip WebSocket in manual mode
    
    try {
      const ws = new WebSocket('ws://localhost:5001');
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'server_status' && data.data.timePhase) {
          const newPhase = data.data.timePhase;
          if (newPhase !== currentPhase) {
            setCurrentPhase(newPhase);
            applyTheme(newPhase);
          }
        }
      };
      
      return () => ws.close();
    } catch (error) {
      console.log('WebSocket not available, using polling');
    }
  }, [currentPhase, manualMode]);

  // Render theme controls and time indicator
  return (
    <>
      {/* Manual Theme Selector */}
      <ThemeSelector 
        currentTheme={currentPhase}
        onThemeChange={handleManualThemeChange}
      />

      {/* Time Indicator */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.7)',
        color: themes[currentPhase].textColor,
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 1000,
        border: `1px solid ${themes[currentPhase].primaryColor}`
      }}>
        🕐 {currentPhase.toUpperCase()} {manualMode && '(Manual)'}
        {timeData && timeData.currentTimeOfDay && !manualMode && (
          <div style={{ fontSize: '10px', opacity: 0.8 }}>
            {Math.floor(timeData.currentTimeOfDay.minutesRemaining)}min remaining
          </div>
        )}
      </div>

      {/* Stars/Scratches Toggle for Night Theme */}
      {currentPhase === 'night' && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: themes[currentPhase].textColor,
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          zIndex: 1000,
          border: `1px solid ${themes[currentPhase].primaryColor}`,
          cursor: 'pointer'
        }} onClick={toggleStarsMode}>
          {starsEnabled ? '✨ Stars' : '🩸 Scratches'}
        </div>
      )}

      {/* Loading Notification - FULL SCREEN BLUR */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeInBlur 0.1s ease-out'
        }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.95)',
            color: '#ffffff',
            padding: '40px 60px',
            borderRadius: '20px',
            fontSize: '24px',
            fontWeight: 'bold',
            border: `4px solid ${themes[currentPhase].primaryColor}`,
            boxShadow: `
              0 0 40px rgba(0, 0, 0, 0.8),
              0 0 80px ${themes[currentPhase].primaryColor}60,
              inset 0 0 40px rgba(0, 0, 0, 0.5)
            `,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            animation: 'loadingPulseEnhanced 1s ease-in-out infinite alternate',
            minWidth: '300px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: `6px solid ${themes[currentPhase].primaryColor}40`,
              borderTop: `6px solid ${themes[currentPhase].primaryColor}`,
              borderRadius: '50%',
              animation: 'loadingSpinnerEnhanced 1s linear infinite'
            }}></div>
            <div style={{
              fontSize: '28px',
              fontWeight: 'bold',
              textShadow: `0 0 20px ${themes[currentPhase].primaryColor}80`
            }}>
              🎨 Loading Theme
            </div>
            <div style={{
              fontSize: '16px',
              opacity: 0.8,
              fontWeight: 'normal'
            }}>
              Switching to {currentPhase.toUpperCase()}...
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DynamicTheme;