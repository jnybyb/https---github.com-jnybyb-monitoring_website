const path = require('path');
const express = require('express');
const multer = require('multer');
const { getPromisePool } = require('../config/database');
const { calculateAge } = require('../utils/age');
const { generateBeneficiaryId } = require('../utils/beneficiaryId');

const router = express.Router();

// Multer storage for beneficiary pictures
const uploadsDir = path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, `beneficiary-${unique}${ext}`);
  }
});
const upload = multer({ storage });

// List beneficiaries
router.get('/', async (req, res) => {
  try {
    const [rows] = await getPromisePool().query('SELECT * FROM beneficiary_details ORDER BY created_at ASC');
    const data = rows.map(r => {
      const birth = r.birth_date instanceof Date ? r.birth_date.toISOString().slice(0, 10) : r.birth_date;
      return {
        id: r.id,
        beneficiaryId: r.beneficiary_id,
        firstName: r.first_name,
        middleName: r.middle_name,
        lastName: r.last_name,
        purok: r.purok,
        barangay: r.barangay,
        municipality: r.municipality,
        province: r.province,
        gender: r.gender,
        birthDate: birth,
        maritalStatus: r.marital_status,
        cellphone: r.cellphone,
        age: r.age ?? calculateAge(birth),
        picture: r.picture ? `/uploads/${path.basename(r.picture)}` : null
      };
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get beneficiary by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await getPromisePool().query('SELECT * FROM beneficiary_details WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const r = rows[0];
    const birth = r.birth_date instanceof Date ? r.birth_date.toISOString().slice(0, 10) : r.birth_date;
    res.json({
      id: r.id,
      beneficiaryId: r.beneficiary_id,
      firstName: r.first_name,
      middleName: r.middle_name,
      lastName: r.last_name,
      purok: r.purok,
      barangay: r.barangay,
      municipality: r.municipality,
      province: r.province,
      gender: r.gender,
      birthDate: birth,
      maritalStatus: r.marital_status,
      cellphone: r.cellphone,
      age: r.age ?? calculateAge(birth),
      picture: r.picture ? `/uploads/${path.basename(r.picture)}` : null
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create beneficiary
router.post('/', upload.single('picture'), async (req, res) => {
  try {
    const body = req.body;
    const filePath = req.file ? path.join(uploadsDir, req.file.filename) : null;
    const computedAge = calculateAge(body.birthDate);
    
    // Generate beneficiary ID based on first and last name
    const beneficiaryId = await generateBeneficiaryId(body.firstName, body.lastName);
    
    const sql = `INSERT INTO beneficiary_details 
      (beneficiary_id, first_name, middle_name, last_name, purok, barangay, municipality, province, gender, birth_date, age, marital_status, cellphone, picture)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      beneficiaryId,
      body.firstName,
      body.middleName || null,
      body.lastName,
      body.purok,
      body.barangay,
      body.municipality,
      body.province,
      body.gender,
      body.birthDate,
      computedAge,
      body.maritalStatus,
      body.cellphone,
      filePath
    ];
    const [result] = await getPromisePool().query(sql, params);
    res.json({ success: true, id: result.insertId, beneficiaryId: beneficiaryId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update beneficiary
router.put('/:id', upload.single('picture'), async (req, res) => {
  try {
    const body = req.body;
    let setPicture = '';
    const computedAge = calculateAge(body.birthDate);
    const params = [
      body.firstName,
      body.middleName || null,
      body.lastName,
      body.purok,
      body.barangay,
      body.municipality,
      body.province,
      body.gender,
      body.birthDate,
      computedAge,
      body.maritalStatus,
      body.cellphone,
    ];
    if (req.file) {
      setPicture = ', picture = ?';
      params.push(path.join(uploadsDir, req.file.filename));
    }
    params.push(req.params.id);

    const sql = `UPDATE beneficiary_details SET 
      first_name = ?, middle_name = ?, last_name = ?, purok = ?, barangay = ?, municipality = ?, province = ?, gender = ?, birth_date = ?, age = ?, marital_status = ?, cellphone = ?${setPicture}
      WHERE id = ?`;

    const [result] = await getPromisePool().query(sql, params);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete beneficiary (with cascading deletions)
router.delete('/:id', async (req, res) => {
  try {
    const [beneficiaryRows] = await getPromisePool().query('SELECT beneficiary_id, picture FROM beneficiary_details WHERE id = ?', [req.params.id]);
    if (beneficiaryRows.length === 0) return res.status(404).json({ error: 'Beneficiary not found' });

    const beneficiary = beneficiaryRows[0];
    const beneficiaryId = beneficiary.beneficiary_id;

    const connection = await getPromisePool().getConnection();
    await connection.beginTransaction();
    try {
      const [verifyResult] = await connection.query('SELECT id FROM beneficiary_details WHERE id = ?', [req.params.id]);
      if (verifyResult.length === 0) throw new Error('Beneficiary record not found or already deleted');

      const [seedlingResult] = await connection.query('DELETE FROM seedling_records WHERE beneficiary_id = ?', [beneficiaryId]);
      const [cropResult] = await connection.query('DELETE FROM crop_status WHERE beneficiary_id = ?', [beneficiaryId]);
      const [plotResult] = await connection.query('DELETE FROM farm_plots WHERE beneficiary_id = ?', [beneficiaryId]);
      const [result] = await connection.query('DELETE FROM beneficiary_details WHERE id = ?', [req.params.id]);

      await connection.commit();

      if (beneficiary.picture) {
        try {
          let picturePath;
          if (beneficiary.picture.startsWith('/uploads/')) {
            picturePath = path.join(__dirname, '..', 'uploads', path.basename(beneficiary.picture));
          } else {
            picturePath = beneficiary.picture;
          }
          const fs = require('fs');
          if (fs.existsSync(picturePath)) fs.unlinkSync(picturePath);
        } catch (_) { /* ignore file delete errors */ }
      }

      res.json({ 
        success: true, 
        affectedRows: result.affectedRows,
        deletedRecords: {
          seedlings: seedlingResult.affectedRows,
          cropStatus: cropResult.affectedRows,
          farmPlots: plotResult.affectedRows,
          beneficiary: result.affectedRows
        }
      });
    } catch (error) {
      try { await connection.rollback(); } catch (_) {}
      throw error;
    } finally {
      try { connection.release(); } catch (_) {}
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;


