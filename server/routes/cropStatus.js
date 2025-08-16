const express = require('express');
const CropStatusController = require('../controllers/cropStatusController');

const router = express.Router();

// List crop status records
router.get('/', CropStatusController.listCropStatus);

// Get crop status by ID
router.get('/:id', CropStatusController.getCropStatus);

// Create crop status
router.post('/', CropStatusController.getUploadMiddleware(), CropStatusController.createCropStatus);

// Update crop status
router.put('/:id', CropStatusController.getUploadMiddleware(), CropStatusController.updateCropStatus);

// Delete crop status
router.delete('/:id', CropStatusController.deleteCropStatus);

module.exports = router;


