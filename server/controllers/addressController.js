const Address = require('../models/Address');

class AddressController {
  // Get all provinces
  static async getProvinces(req, res) {
    try {
      const provinces = Address.getProvinces();
      res.json(provinces);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get municipalities by province
  static async getMunicipalities(req, res) {
    try {
      const municipalities = Address.getMunicipalities(req.params.province);
      res.json(municipalities);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get barangays by province and municipality
  static async getBarangays(req, res) {
    try {
      const barangays = Address.getBarangays(req.params.province, req.params.municipality);
      res.json(barangays);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AddressController;
