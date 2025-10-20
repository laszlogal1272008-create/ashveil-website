import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create Event Context
const EventContext = createContext();

// Custom hook to use the Event Context
export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};

// Event Provider Component
export const EventProvider = ({ children }) => {
  const [scheduledEvents, setScheduledEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('scheduledEvents');
    const savedRegistrations = localStorage.getItem('eventRegistrations');
    const savedAdminAuth = localStorage.getItem('adminAuthenticated');

    if (savedEvents) {
      try {
        setScheduledEvents(JSON.parse(savedEvents));
      } catch (error) {
        console.error('Failed to load scheduled events:', error);
      }
    }

    if (savedRegistrations) {
      try {
        setRegisteredEvents(JSON.parse(savedRegistrations));
      } catch (error) {
        console.error('Failed to load event registrations:', error);
      }
    }

    if (savedAdminAuth === 'true') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  // Save scheduled events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('scheduledEvents', JSON.stringify(scheduledEvents));
  }, [scheduledEvents]);

  // Save registrations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('eventRegistrations', JSON.stringify(registeredEvents));
  }, [registeredEvents]);

  // Save admin authentication status
  useEffect(() => {
    localStorage.setItem('adminAuthenticated', isAdminAuthenticated.toString());
  }, [isAdminAuthenticated]);

  // Check for events that should start
  useEffect(() => {
    const checkEventStart = () => {
      const now = new Date().getTime();
      
      scheduledEvents.forEach(event => {
        const eventTime = new Date(event.scheduledTime).getTime();
        const timeDiff = eventTime - now;
        
        // Start event if it's time (within 5 seconds tolerance)
        if (timeDiff <= 5000 && timeDiff >= -5000 && !event.started && !activeEvent) {
          triggerScheduledEvent(event);
        }
      });
    };

    const interval = setInterval(checkEventStart, 1000);
    return () => clearInterval(interval);
  }, [scheduledEvents, activeEvent]);

  // Admin functions
  const authenticateAdmin = (password) => {
    // In a real app, this would be secure authentication
    if (password === 'ashveil2025') {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
  };

  // Event management functions
  const scheduleEvent = useCallback((eventData) => {
    const newEvent = {
      id: Date.now() + Math.random(), // Ensure uniqueness
      ...eventData,
      createdAt: new Date().toISOString(),
      status: 'scheduled',
      started: false
    };

    setScheduledEvents(prev => {
      const updated = [...prev, newEvent];
      // Sort by scheduled time
      return updated.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
    });

    return newEvent;
  }, []);

  const cancelEvent = useCallback((eventId) => {
    setScheduledEvents(prev => prev.filter(event => event.id !== eventId));
    
    // Also remove from registrations if users were registered
    setRegisteredEvents(prev => prev.filter(id => id !== eventId));
  }, []);

  const updateEvent = useCallback((eventId, updates) => {
    setScheduledEvents(prev => 
      prev.map(event => 
        event.id === eventId ? { ...event, ...updates } : event
      )
    );
  }, []);

  // Player registration functions
  const registerForEvent = useCallback((eventId) => {
    if (!registeredEvents.includes(eventId)) {
      setRegisteredEvents(prev => [...prev, eventId]);
      return true;
    }
    return false;
  }, [registeredEvents]);

  const unregisterFromEvent = useCallback((eventId) => {
    setRegisteredEvents(prev => prev.filter(id => id !== eventId));
  }, []);

  // Event triggering functions
  const triggerScheduledEvent = useCallback((event) => {
    // Mark event as started
    updateEvent(event.id, { started: true, status: 'active' });
    
    // Set as active event
    setActiveEvent({
      ...event,
      started: true,
      triggeredAt: new Date().toISOString()
    });

    // Auto-dismiss after event duration
    setTimeout(() => {
      dismissActiveEvent();
      updateEvent(event.id, { status: 'completed' });
    }, getDurationForEventType(event.type));

  }, [updateEvent]);

  const triggerImmediateEvent = useCallback((eventType) => {
    const immediateEvent = {
      id: 'immediate-' + Date.now(),
      type: eventType,
      immediate: true,
      triggeredAt: new Date().toISOString()
    };

    setActiveEvent(immediateEvent);

    // Auto-dismiss after event duration
    setTimeout(() => {
      dismissActiveEvent();
    }, getDurationForEventType(eventType));
  }, []);

  const dismissActiveEvent = useCallback(() => {
    setActiveEvent(null);
  }, []);

  // Helper functions
  const getDurationForEventType = (eventType) => {
    switch (eventType) {
      case 'Moonlight Hunt': return 30000; // 30 seconds
      case 'Great Migration': return 35000; // 35 seconds
      case 'King of the Hill': return 40000; // 40 seconds
      default: return 30000;
    }
  };

  const getUpcomingEvents = useCallback(() => {
    const now = new Date().getTime();
    return scheduledEvents.filter(event => {
      const eventTime = new Date(event.scheduledTime).getTime();
      return eventTime > now && !event.started;
    });
  }, [scheduledEvents]);

  const getActiveEvents = useCallback(() => {
    const now = new Date().getTime();
    return scheduledEvents.filter(event => {
      const eventTime = new Date(event.scheduledTime).getTime();
      const eventDuration = getDurationForEventType(event.type);
      return eventTime <= now && (eventTime + eventDuration) > now;
    });
  }, [scheduledEvents]);

  const getCompletedEvents = useCallback(() => {
    const now = new Date().getTime();
    return scheduledEvents.filter(event => {
      const eventTime = new Date(event.scheduledTime).getTime();
      const eventDuration = getDurationForEventType(event.type);
      return (eventTime + eventDuration) <= now || event.status === 'completed';
    });
  }, [scheduledEvents]);

  const getEventById = useCallback((eventId) => {
    return scheduledEvents.find(event => event.id === eventId);
  }, [scheduledEvents]);

  const isEventRegistered = useCallback((eventId) => {
    return registeredEvents.includes(eventId);
  }, [registeredEvents]);

  const getRegisteredEvents = useCallback(() => {
    return scheduledEvents.filter(event => registeredEvents.includes(event.id));
  }, [scheduledEvents, registeredEvents]);

  // Cleanup old completed events (keep last 10)
  useEffect(() => {
    const cleanupOldEvents = () => {
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000; // 24 hours
      
      setScheduledEvents(prev => {
        const recentEvents = prev.filter(event => {
          const eventTime = new Date(event.scheduledTime).getTime();
          return (now - eventTime) < oneDay; // Keep events from last 24 hours
        });
        
        // Keep only last 50 events to prevent localStorage from growing too large
        return recentEvents.slice(-50);
      });
    };

    const interval = setInterval(cleanupOldEvents, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const contextValue = {
    // State
    scheduledEvents,
    registeredEvents,
    activeEvent,
    isAdminAuthenticated,

    // Admin functions
    authenticateAdmin,
    logoutAdmin,

    // Event management
    scheduleEvent,
    cancelEvent,
    updateEvent,
    triggerScheduledEvent,
    triggerImmediateEvent,
    dismissActiveEvent,

    // Player registration
    registerForEvent,
    unregisterFromEvent,
    isEventRegistered,

    // Utility functions
    getUpcomingEvents,
    getActiveEvents,
    getCompletedEvents,
    getEventById,
    getRegisteredEvents,
    getDurationForEventType
  };

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
};

export default EventContext;