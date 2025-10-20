

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

import { CurrencyProvider } from './contexts/CurrencyContext';
import { EventProvider, useEvents } from './contexts/EventContext';
import CurrencyDisplay from './components/CurrencyDisplay';
import NotificationSystem from './components/NotificationSystem';
import EventSystem from './components/EventSystem';
import EventRegistration from './components/EventRegistration';
import EventCountdown from './components/EventCountdown';
import AdminPanel from './components/AdminPanel';
import DynamicTheme from './components/DynamicTheme'; // NEW: Dynamic time-based theming

import Home from './components/Home';
import Profile from './components/Profile';
import Inventory from './components/Inventory';
import Shop from './components/Shop';
import Market from './components/Market';
import Games from './components/Games';
import Leaderboards from './components/Leaderboards';
import Information from './components/Information';
import RedeemPage from './components/RedeemPage';
import DinosaurSelection from './components/DinosaurSelection';
import AuthenticationTest from './components/AuthenticationTest';
import LiveMap from './components/LiveMap';

function App() {
  return (
    <CurrencyProvider>
      <EventProvider>
        <Router>
          <DynamicTheme /> {/* NEW: Dynamic time-based theming component */}
          <div className="container">
            <header className="header">
              <div className="header-left">
                <h1>Ashveil</h1>
                <nav>
                  <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/profile">Profile</Link></li>
                    <li><Link to="/inventory">Inventory</Link></li>
                    <li><Link to="/shop">Shop</Link></li>
                    <li><Link to="/market">Market</Link></li>
                    <li><Link to="/games">Games</Link></li>
                    <li><Link to="/leaderboards">Leaderboards</Link></li> 
                    <li><Link to="/information">Information</Link></li>
                    <li><Link to="/redeem">Redeem</Link></li>
                    <li><Link to="/map">Live Map</Link></li>
                    <li><Link to="/auth">Auth Test</Link></li>
                    <li><Link to="/admin">Admin</Link></li>
                  </ul>
                </nav>
              </div>
              <div className="header-right">
                <CurrencyDisplay />
              </div>
            </header>
            
            <NotificationSystem />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/market" element={<Market />} />
                <Route path="/games" element={<Games />} />
                <Route path="/leaderboards" element={<Leaderboards />} />            
                <Route path="/information" element={<Information />} />
                <Route path="/redeem" element={<RedeemPage />} />
                <Route path="/dinosaur-selection" element={<DinosaurSelection />} />
                <Route path="/map" element={<LiveMap />} />
                <Route path="/auth" element={<AuthenticationTest />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </main>
            
            {/* Global Event System Components */}
            <EventSystemWrapper />
          </div>
        </Router>
      </EventProvider>
    </CurrencyProvider>
  );
}

// Wrapper component to use the Event Context
function EventSystemWrapper() {
  const { 
    scheduledEvents, 
    registeredEvents, 
    scheduleEvent,
    registerForEvent,
    unregisterFromEvent,
    triggerScheduledEvent
  } = useEvents();

  const handleEventScheduled = (event) => {
    console.log('Event scheduled:', event);
  };

  const handleEventRegistration = (event) => {
    registerForEvent(event.id);
  };

  const handleEventUnregistration = (event) => {
    unregisterFromEvent(event.id);
  };

  const handleEventStart = (event) => {
    triggerScheduledEvent(event);
  };

  return (
    <>
      {/* Event Registration Panel */}
      <EventRegistration 
        scheduledEvents={scheduledEvents}
        onRegister={handleEventRegistration}
        onUnregister={handleEventUnregistration}
        registeredEvents={registeredEvents}
      />
      
      {/* Event Countdown Timer */}
      <EventCountdown 
        scheduledEvents={scheduledEvents}
        onEventStart={handleEventStart}
        registeredEvents={registeredEvents}
      />
      
      {/* Global Event System Overlay */}
      <EventSystem />
    </>
  );
}

export default App;
