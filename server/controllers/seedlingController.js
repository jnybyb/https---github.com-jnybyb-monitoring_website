const Seedling = require('../models/Seedling');

class SeedlingController {
  // List all seedling records
  static async listSeedlings(req, res) {
    try {
      const seedlings = await Seedling.findAll();
      res.json(seedlings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get seedling by ID
  static async getSeedling(req, res) {
    try {
      const seedling = await Seedling.findById(req.params.id);
      if (!seedling) {
        return res.status(404).json({ error: 'Seedling record not found' });
      }
      res.json(seedling);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Create new seedling record
  static async createSeedling(req, res) {
    try {
      const id = await Seedling.create(req.body);
      res.json({ success: true, id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update seedling record
  static async updateSeedling(req, res) {
    try {
      const success = await Seedling.update(req.params.id, req.body);
      if (!success) {
        return res.status(404).json({ error: 'Seedling record not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete seedling record
  static async deleteSeedling(req, res) {
    try {
      const success = await Seedling.delete(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Seedling record not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = SeedlingController;
