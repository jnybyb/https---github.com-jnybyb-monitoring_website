const express = require('express');
const StatisticsController = require('../controllers/statisticsController');

const router = express.Router();

// Get dashboard statistics
router.get('/', StatisticsController.getDashboardStats);

module.exports = router;
