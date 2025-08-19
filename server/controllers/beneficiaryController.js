const path = require('path');
const Beneficiary = require('../models/Beneficiary');
const BaseController = require('./baseController');
const { beneficiaryUpload, uploadsDir } = require('../utils/upload');
const { generateBeneficiaryId } = require('../utils/beneficiaryId');

class BeneficiaryController {
  // Generate beneficiary ID
  static async generateBeneficiaryId(req, res) {
    const { firstName, lastName } = req.body;
    if (!firstName || !lastName) {
      return BaseController.sendBadRequest(res, 'First name and last name are required');
    }
    
    const beneficiaryId = await generateBeneficiaryId(firstName, lastName);
    BaseController.sendSuccess(res, { beneficiaryId });
  }

  // List all beneficiaries
  static async listBeneficiaries(req, res) {
    const beneficiaries = await Beneficiary.findAll();
    BaseController.sendSuccess(res, beneficiaries);
  }

  // Get beneficiary by ID
  static async getBeneficiary(req, res) {
    const beneficiary = await Beneficiary.findById(req.params.id);
    if (!beneficiary) {
      return BaseController.sendNotFound(res, 'Beneficiary not found');
    }
    BaseController.sendSuccess(res, beneficiary);
  }

  // Create new beneficiary
  static async createBeneficiary(req, res) {
    console.log('Creating beneficiary with data:', {
      beneficiaryId: req.body.beneficiaryId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      beneficiaryIdLength: req.body.beneficiaryId?.length || 0
    });
    
    const filePath = req.file ? path.join(uploadsDir, req.file.filename) : null;
    const result = await Beneficiary.create(req.body, filePath);
    BaseController.sendSuccess(res, { id: result.id, beneficiaryId: result.beneficiaryId });
  }

  // Update beneficiary
  static async updateBeneficiary(req, res) {
    const filePath = req.file ? path.join(uploadsDir, req.file.filename) : null;
    const success = await Beneficiary.update(req.params.id, req.body, filePath);
    if (!success) {
      return BaseController.sendNotFound(res, 'Beneficiary not found');
    }
    BaseController.sendSuccess(res);
  }

  // Delete beneficiary
  static async deleteBeneficiary(req, res) {
    const success = await Beneficiary.delete(req.params.id);
    if (!success) {
      return BaseController.sendNotFound(res, 'Beneficiary not found');
    }
    BaseController.sendSuccess(res);
  }

  // Get multer upload middleware
  static getUploadMiddleware() {
    return beneficiaryUpload;
  }
}

module.exports = BeneficiaryController;
