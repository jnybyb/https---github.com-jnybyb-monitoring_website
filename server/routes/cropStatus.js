const path = require('path');
const express = require('express');
const multer = require('multer');
const { getPromisePool } = require('../config/database');

const router = express.Router();

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

// List crop status records (with beneficiary info)
router.get('/', async (req, res) => {
  try {
    const [rows] = await getPromisePool().query(`
      SELECT cs.*, 
             bd.first_name, bd.middle_name, bd.last_name, bd.picture as beneficiary_picture
      FROM crop_status cs
      JOIN beneficiary_details bd ON bd.beneficiary_id = cs.beneficiary_id
      ORDER BY cs.survey_date DESC, cs.created_at DESC
    `);
    const data = rows.map(r => {
      const pictures = Array.isArray(r.pictures) ? r.pictures : (r.pictures ? JSON.parse(r.pictures) : []);
      
      return {
        id: r.id,
        surveyDate: r.survey_date,
        surveyer: r.surveyer,
        beneficiaryId: r.beneficiary_id,
        beneficiaryName: `${r.first_name || ''} ${r.middle_name ? r.middle_name + ' ' : ''}${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
        beneficiaryPicture: r.beneficiary_picture ? `/uploads/${path.basename(r.beneficiary_picture)}` : null,
        aliveCrops: r.alive_crops,
        deadCrops: r.dead_crops,
        plot: r.plot || null,
        pictures: pictures
      };
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get crop status by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await getPromisePool().query(`
      SELECT cs.*, 
             bd.first_name, bd.middle_name, bd.last_name, bd.picture as beneficiary_picture
      FROM crop_status cs
      JOIN beneficiary_details bd ON bd.beneficiary_id = cs.beneficiary_id
      WHERE cs.id = ?
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Crop status record not found' });
    const r = rows[0];
    const pictures = Array.isArray(r.pictures) ? r.pictures : (r.pictures ? JSON.parse(r.pictures) : []);
    
    const data = {
      id: r.id,
      surveyDate: r.survey_date,
      surveyer: r.surveyer,
      beneficiaryId: r.beneficiary_id,
      beneficiaryName: `${r.first_name || ''} ${r.middle_name ? r.middle_name + ' ' : ''}${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      beneficiaryPicture: r.beneficiary_picture ? `/uploads/${path.basename(r.beneficiary_picture)}` : null,
      aliveCrops: r.alive_crops,
      deadCrops: r.dead_crops,
      plot: r.plot || null,
      pictures: pictures
    };
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create crop status
router.post('/', upload.array('pictures', 10), async (req, res) => {
  try {
    const body = req.body;
    const files = (req.files || []).map(f => path.basename(f.path));
    if (!body.surveyDate || !body.surveyer || !body.beneficiaryId || body.aliveCrops === undefined || body.aliveCrops === null) {
      return res.status(400).json({ error: 'Missing required fields: surveyDate, surveyer, beneficiaryId, or aliveCrops' });
    }
    const aliveCrops = parseInt(body.aliveCrops);
    const deadCrops = parseInt(body.deadCrops || 0);
    if (isNaN(aliveCrops) || aliveCrops < 0) return res.status(400).json({ error: 'Invalid aliveCrops value' });
    if (isNaN(deadCrops) || deadCrops < 0) return res.status(400).json({ error: 'Invalid deadCrops value' });
    const sql = `INSERT INTO crop_status 
      (survey_date, surveyer, beneficiary_id, alive_crops, dead_crops, pictures)
      VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [
      body.surveyDate,
      body.surveyer,
      body.beneficiaryId,
      aliveCrops,
      deadCrops,
      JSON.stringify(files)
    ];
    const [result] = await getPromisePool().query(sql, params);
    res.json({ success: true, id: result.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update crop status
router.put('/:id', upload.array('pictures', 10), async (req, res) => {
  try {
    const body = req.body;
    const files = (req.files || []).map(f => path.basename(f.path));
    const recordId = req.params.id;
    if (!recordId || isNaN(parseInt(recordId))) return res.status(400).json({ error: 'Invalid record ID' });
    if (!body.surveyDate || !body.surveyer || !body.beneficiaryId || body.aliveCrops === undefined || body.aliveCrops === null) {
      return res.status(400).json({ error: 'Missing required fields: surveyDate, surveyer, beneficiaryId, or aliveCrops' });
    }
    const aliveCrops = parseInt(body.aliveCrops);
    const deadCrops = parseInt(body.deadCrops || 0);
    if (isNaN(aliveCrops) || aliveCrops < 0) return res.status(400).json({ error: 'Invalid aliveCrops value' });
    if (isNaN(deadCrops) || deadCrops < 0) return res.status(400).json({ error: 'Invalid deadCrops value' });

    // Handle pictures: combine existing images with new files
    let allPictures = [];
    
    // Add existing pictures if provided
    if (body.existingPictures) {
      try {
        const existingPictures = JSON.parse(body.existingPictures);
        if (Array.isArray(existingPictures)) {
          allPictures = [...existingPictures];
        }
      } catch (e) {
        console.error('Error parsing existingPictures:', e);
      }
    }
    
    // Add new uploaded files
    allPictures = [...allPictures, ...files];

    let setPictures = '';
    const params = [
      body.surveyDate,
      body.surveyer,
      body.beneficiaryId,
      aliveCrops,
      deadCrops
    ];
    
    // Always update pictures field
    setPictures = ', pictures = ?';
    params.push(JSON.stringify(allPictures));
    
    params.push(recordId);

    const sql = `UPDATE crop_status SET 
      survey_date = ?, surveyer = ?, beneficiary_id = ?, alive_crops = ?, dead_crops = ?${setPictures}
      WHERE id = ?`;
    const [result] = await getPromisePool().query(sql, params);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete crop status
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await getPromisePool().query('DELETE FROM crop_status WHERE id = ?', [req.params.id]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;


