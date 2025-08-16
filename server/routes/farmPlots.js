const express = require('express');
const FarmPlotController = require('../controllers/farmPlotController');

const router = express.Router();

// List farm plots
router.get('/', FarmPlotController.listFarmPlots);

// Get farm plot by ID
router.get('/:id', FarmPlotController.getFarmPlot);

// Create farm plot
router.post('/', FarmPlotController.createFarmPlot);

// Update farm plot
router.put('/:id', FarmPlotController.updateFarmPlot);

// Delete farm plot
router.delete('/:id', FarmPlotController.deleteFarmPlot);

module.exports = router;


