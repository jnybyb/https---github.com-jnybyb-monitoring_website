const express = require('express');
const AddressController = require('../controllers/addressController');

const router = express.Router();

// Get all provinces
router.get('/provinces', AddressController.getProvinces);

// Get municipalities by province
router.get('/municipalities/:province', AddressController.getMunicipalities);

// Get barangays by province and municipality
router.get('/barangays/:province/:municipality', AddressController.getBarangays);

module.exports = router;


