const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

const { initializeDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5000
  });
});

// Test database connection route
app.get('/api/test-db', async (req, res) => {
  try {
    // Use the global promisePool that gets created during initialization
    const { promisePool } = require('./config/database');
    const [rows] = await promisePool.query('SELECT 1 as test');
    res.json({ 
      success: true, 
      message: 'Database connection successful', 
      data: rows[0] 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed', 
      error: error.message 
    });
  }
});

// Manual database initialization route
app.post('/api/init-db', async (req, res) => {
  try {
    const { initializeDatabase } = require('./config/database');
    await initializeDatabase();
    res.json({ 
      success: true, 
      message: 'Database initialized successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database initialization failed', 
      error: error.message 
    });
  }
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
