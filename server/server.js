const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

const { initializeDatabase } = require('./config/database');
const apiRouter = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (_) {}
}

// Static files for uploaded images
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount API routes
app.use('/api', apiRouter);

// Initialize DB then start server
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error.message);
    process.exit(1);
  }
})();


