const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const { setupAuth } = require('../../backend/auth');

const app = express();

// Middleware
app.use(cors({
  origin: ['https://ashveil.live', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Setup OAuth authentication
setupAuth(app);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Export the serverless function
exports.handler = serverless(app);