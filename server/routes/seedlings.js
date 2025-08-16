const express = require('express');
const SeedlingController = require('../controllers/seedlingController');

const router = express.Router();

// List seedling records
router.get('/', SeedlingController.listSeedlings);

// Get seedling by ID
router.get('/:id', SeedlingController.getSeedling);

// Create seedling record
router.post('/', SeedlingController.createSeedling);

// Update seedling record
router.put('/:id', SeedlingController.updateSeedling);

// Delete seedling record
router.delete('/:id', SeedlingController.deleteSeedling);

module.exports = router;


