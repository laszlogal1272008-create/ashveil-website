const { setupAuth } = require('../../backend/auth');
const express = require('express');
const serverless = require('serverless-http');

const app = express();

// Setup authentication routes
setupAuth(app);

exports.handler = serverless(app);