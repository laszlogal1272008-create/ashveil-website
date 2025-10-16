

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

import Home from './components/Home';
import Profile from './components/Profile';
import Inventory from './components/Inventory';
import Shop from './components/Shop';
import Market from './components/Market';
import Games from './components/Games';
import Leaderboards from './components/Leaderboards';
import Information from './components/Information';

function App() {
  return (
    <Router>
      <div className="container">
        <header className="header">
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
            </ul>
          </nav>
        </header>
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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
