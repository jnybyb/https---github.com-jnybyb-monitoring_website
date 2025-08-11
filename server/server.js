const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

const { initializeDatabase, getPromisePool } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Helper to compute age from YYYY-MM-DD
const calculateAge = (birthDateStr) => {
  if (!birthDateStr) return null;
  const birthDate = new Date(birthDateStr);
  if (Number.isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age < 0 || age > 125 ? null : age;
};

// Middleware
app.use(cors());
app.use(express.json());

// Static serving for uploaded images
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, `beneficiary-${unique}${ext}`);
  }
});
const upload = multer({ storage });

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Beneficiaries routes
app.get('/api/beneficiaries', async (req, res) => {
  try {
    const [rows] = await getPromisePool().query('SELECT * FROM beneficiary_details ORDER BY created_at DESC');
    // Map DB columns to UI fields
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

app.get('/api/beneficiaries/:id', async (req, res) => {
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

app.post('/api/beneficiaries', upload.single('picture'), async (req, res) => {
  try {
    const body = req.body;
    const filePath = req.file ? path.join(uploadsDir, req.file.filename) : null;
    const computedAge = calculateAge(body.birthDate);
    const sql = `INSERT INTO beneficiary_details 
      (beneficiary_id, first_name, middle_name, last_name, purok, barangay, municipality, province, gender, birth_date, age, marital_status, cellphone, picture)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      body.beneficiaryId,
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
    res.json({ success: true, id: result.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/beneficiaries/:id', upload.single('picture'), async (req, res) => {
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

app.delete('/api/beneficiaries/:id', async (req, res) => {
  try {
    const [result] = await getPromisePool().query('DELETE FROM beneficiary_details WHERE id = ?', [req.params.id]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Seedling Records routes
app.get('/api/seedlings', async (req, res) => {
  try {
    const [rows] = await getPromisePool().query('SELECT * FROM seedling_records ORDER BY date_of_planting DESC, created_at DESC');
    const data = rows.map(r => ({
      id: r.id,
      beneficiaryId: r.beneficiary_id,
      received: r.received,
      planted: r.planted,
      hectares: Number(r.hectares),
      dateOfPlanting: r.date_of_planting,
      gps: r.gps
    }));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/seedlings', async (req, res) => {
  try {
    const body = req.body;
    const sql = `INSERT INTO seedling_records 
      (beneficiary_id, received, planted, hectares, date_of_planting, gps)
      VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [
      body.beneficiaryId,
      Number(body.received),
      Number(body.planted),
      Number(body.hectares),
      body.dateOfPlanting,
      body.gps || null
    ];
    const [result] = await getPromisePool().query(sql, params);
    res.json({ success: true, id: result.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/seedlings/:id', async (req, res) => {
  try {
    const body = req.body;
    const sql = `UPDATE seedling_records SET 
      beneficiary_id = ?, received = ?, planted = ?, hectares = ?, date_of_planting = ?, gps = ?
      WHERE id = ?`;
    const params = [
      body.beneficiaryId,
      Number(body.received),
      Number(body.planted),
      Number(body.hectares),
      body.dateOfPlanting,
      body.gps || null,
      req.params.id
    ];
    const [result] = await getPromisePool().query(sql, params);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/seedlings/:id', async (req, res) => {
  try {
    const [result] = await getPromisePool().query('DELETE FROM seedling_records WHERE id = ?', [req.params.id]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Crop Status routes (supports photo uploads)
app.get('/api/crop-status', async (req, res) => {
  try {
    const [rows] = await getPromisePool().query('SELECT * FROM crop_status ORDER BY survey_date DESC, created_at DESC');
    const data = rows.map(r => ({
      id: r.id,
      surveyDate: r.survey_date,
      surveyer: r.surveyer,
      beneficiaryId: r.beneficiary_id,
      aliveCrops: r.alive_crops,
      deadCrops: r.dead_crops,
      pictures: Array.isArray(r.pictures) ? r.pictures : (r.pictures ? JSON.parse(r.pictures) : [])
    }));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/crop-status', upload.array('pictures', 10), async (req, res) => {
  try {
    const body = req.body;
    const files = (req.files || []).map(f => path.basename(f.path));
    const sql = `INSERT INTO crop_status 
      (survey_date, surveyer, beneficiary_id, alive_crops, dead_crops, pictures)
      VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [
      body.surveyDate,
      body.surveyer,
      body.beneficiaryId,
      Number(body.aliveCrops),
      Number(body.deadCrops || 0),
      JSON.stringify(files)
    ];
    const [result] = await getPromisePool().query(sql, params);
    res.json({ success: true, id: result.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/crop-status/:id', upload.array('pictures', 10), async (req, res) => {
  try {
    const body = req.body;
    const files = (req.files || []).map(f => path.basename(f.path));

    // If new files uploaded, replace pictures; otherwise keep existing
    let setPictures = '';
    const params = [
      body.surveyDate,
      body.surveyer,
      body.beneficiaryId,
      Number(body.aliveCrops),
      Number(body.deadCrops || 0)
    ];
    if (files.length > 0) {
      setPictures = ', pictures = ?';
      params.push(JSON.stringify(files));
    }
    params.push(req.params.id);

    const sql = `UPDATE crop_status SET 
      survey_date = ?, surveyer = ?, beneficiary_id = ?, alive_crops = ?, dead_crops = ?${setPictures}
      WHERE id = ?`;

    const [result] = await getPromisePool().query(sql, params);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/crop-status/:id', async (req, res) => {
  try {
    const [result] = await getPromisePool().query('DELETE FROM crop_status WHERE id = ?', [req.params.id]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

startServer();
