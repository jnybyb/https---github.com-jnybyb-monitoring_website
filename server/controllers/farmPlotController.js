const FarmPlot = require('../models/FarmPlot');

class FarmPlotController {
  // List all farm plots
  static async listFarmPlots(req, res) {
    try {
      const farmPlots = await FarmPlot.findAll();
      res.json(farmPlots);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get farm plot by ID
  static async getFarmPlot(req, res) {
    try {
      const farmPlot = await FarmPlot.findById(req.params.id);
      if (!farmPlot) {
        return res.status(404).json({ error: 'Farm plot not found' });
      }
      res.json(farmPlot);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Create new farm plot
  static async createFarmPlot(req, res) {
    try {
      const id = await FarmPlot.create(req.body);
      const created = await FarmPlot.findWithBeneficiaryDetails(id);
      res.json(created);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update farm plot
  static async updateFarmPlot(req, res) {
    try {
      const success = await FarmPlot.update(req.params.id, req.body);
      if (!success) {
        return res.status(404).json({ error: 'Farm plot not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete farm plot
  static async deleteFarmPlot(req, res) {
    try {
      const success = await FarmPlot.delete(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Farm plot not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = FarmPlotController;
