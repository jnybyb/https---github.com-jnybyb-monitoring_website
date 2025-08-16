const path = require('path');
const multer = require('multer');
const CropStatus = require('../models/CropStatus');

// Multer storage for crop pictures
const uploadsDir = path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, `crop-${unique}${ext}`);
  }
});
const upload = multer({ storage });

class CropStatusController {
  // List all crop status records
  static async listCropStatus(req, res) {
    try {
      const cropStatusList = await CropStatus.findAll();
      res.json(cropStatusList);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get crop status by ID
  static async getCropStatus(req, res) {
    try {
      const cropStatus = await CropStatus.findById(req.params.id);
      if (!cropStatus) {
        return res.status(404).json({ error: 'Crop status record not found' });
      }
      res.json(cropStatus);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Create new crop status
  static async createCropStatus(req, res) {
    try {
      const files = req.files || [];
      const id = await CropStatus.create(req.body, files);
      res.json({ success: true, id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update crop status
  static async updateCropStatus(req, res) {
    try {
      const files = req.files || [];
      const success = await CropStatus.update(req.params.id, req.body, files);
      if (!success) {
        return res.status(404).json({ error: 'Crop status record not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete crop status
  static async deleteCropStatus(req, res) {
    try {
      const success = await CropStatus.delete(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Crop status record not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get multer upload middleware
  static getUploadMiddleware() {
    return upload.array('pictures', 10);
  }
}

module.exports = CropStatusController;
