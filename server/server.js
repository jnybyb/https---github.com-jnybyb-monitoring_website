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
    // First, get the beneficiary details to find the beneficiary_id and picture
    const [beneficiaryRows] = await getPromisePool().query('SELECT beneficiary_id, picture FROM beneficiary_details WHERE id = ?', [req.params.id]);
    
    if (beneficiaryRows.length === 0) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }
    
    const beneficiary = beneficiaryRows[0];
    const beneficiaryId = beneficiary.beneficiary_id;
    
    // Start a transaction to ensure data consistency
    const connection = await getPromisePool().getConnection();
    await connection.beginTransaction();
    
    try {
      // Verify beneficiary still exists before proceeding
      const [verifyResult] = await connection.query('SELECT id FROM beneficiary_details WHERE id = ?', [req.params.id]);
      if (verifyResult.length === 0) {
        throw new Error('Beneficiary record not found or already deleted');
      }
      
      // Delete all related records first
      
      // 1. Delete seedling records
      const [seedlingResult] = await connection.query('DELETE FROM seedling_records WHERE beneficiary_id = ?', [beneficiaryId]);
      console.log(`Deleted ${seedlingResult.affectedRows} seedling records for beneficiary ${beneficiaryId}`);
      
      // 2. Delete crop status records
      const [cropResult] = await connection.query('DELETE FROM crop_status WHERE beneficiary_id = ?', [beneficiaryId]);
      console.log(`Deleted ${cropResult.affectedRows} crop status records for beneficiary ${beneficiaryId}`);
      
      // 3. Delete farm plots (this table has ON DELETE CASCADE, but we'll delete explicitly for consistency)
      const [plotResult] = await connection.query('DELETE FROM farm_plots WHERE beneficiary_id = ?', [beneficiaryId]);
      console.log(`Deleted ${plotResult.affectedRows} farm plots for beneficiary ${beneficiaryId}`);
      
      // 4. Finally, delete the beneficiary record
      const [result] = await connection.query('DELETE FROM beneficiary_details WHERE id = ?', [req.params.id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Beneficiary record not found or already deleted');
      }
      
      // Commit the transaction
      await connection.commit();
      
      // Clean up uploaded picture file if it exists
      if (beneficiary.picture) {
        try {
          // Handle both full paths and relative paths
          let picturePath;
          if (beneficiary.picture.startsWith('/uploads/')) {
            picturePath = path.join(__dirname, 'uploads', path.basename(beneficiary.picture));
          } else {
            picturePath = beneficiary.picture;
          }
          
          if (fs.existsSync(picturePath)) {
            fs.unlinkSync(picturePath);
            console.log(`Deleted picture file: ${picturePath}`);
          } else {
            console.log(`Picture file not found at: ${picturePath}`);
          }
        } catch (fileError) {
          console.warn('Warning: Could not delete picture file:', fileError.message);
          // Don't fail the entire operation if file deletion fails
        }
      }
      
      // Log the deletion summary
      console.log(`Successfully deleted beneficiary ${beneficiaryId} and all related records`);
      
      res.json({ 
        success: true, 
        affectedRows: result.affectedRows,
        deletedRecords: {
          seedlings: seedlingResult.affectedRows,
          cropStatus: cropResult.affectedRows,
          farmPlots: plotResult.affectedRows,
          beneficiary: result.affectedRows
        },
        message: 'Beneficiary and all related records deleted successfully'
      });
      
    } catch (error) {
      // Rollback transaction on error
      try {
        await connection.rollback();
        console.log('Transaction rolled back due to error:', error.message);
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError.message);
      }
      throw error;
    } finally {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('Error releasing connection:', releaseError.message);
      }
    }
    
  } catch (e) {
    console.error('Error deleting beneficiary:', e);
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
    const [rows] = await getPromisePool().query(`
      SELECT cs.*, 
             bd.first_name, bd.middle_name, bd.last_name, bd.picture as beneficiary_picture
      FROM crop_status cs
      JOIN beneficiary_details bd ON bd.beneficiary_id = cs.beneficiary_id
      ORDER BY cs.survey_date DESC, cs.created_at DESC
    `);
    const data = rows.map(r => ({
      id: r.id,
      surveyDate: r.survey_date,
      surveyer: r.surveyer,
      beneficiaryId: r.beneficiary_id,
      beneficiaryName: `${r.first_name || ''} ${r.middle_name ? r.middle_name + ' ' : ''}${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      beneficiaryPicture: r.beneficiary_picture ? `/uploads/${path.basename(r.beneficiary_picture)}` : null,
      aliveCrops: r.alive_crops,
      deadCrops: r.dead_crops,
      pictures: Array.isArray(r.pictures) ? r.pictures : (r.pictures ? JSON.parse(r.pictures) : [])
    }));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/crop-status/:id', async (req, res) => {
  try {
    const [rows] = await getPromisePool().query(`
      SELECT cs.*, 
             bd.first_name, bd.middle_name, bd.last_name, bd.picture as beneficiary_picture
      FROM crop_status cs
      JOIN beneficiary_details bd ON bd.beneficiary_id = cs.beneficiary_id
      WHERE cs.id = ?
    `, [req.params.id]);
    
    if (!rows.length) {
      return res.status(404).json({ error: 'Crop status record not found' });
    }
    
    const r = rows[0];
    const data = {
      id: r.id,
      surveyDate: r.survey_date,
      surveyer: r.surveyer,
      beneficiaryId: r.beneficiary_id,
      beneficiaryName: `${r.first_name || ''} ${r.middle_name ? r.middle_name + ' ' : ''}${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      beneficiaryPicture: r.beneficiary_picture ? `/uploads/${path.basename(r.beneficiary_picture)}` : null,
      aliveCrops: r.alive_crops,
      deadCrops: r.dead_crops,
      pictures: Array.isArray(r.pictures) ? r.pictures : (r.pictures ? JSON.parse(r.pictures) : [])
    };
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/crop-status', upload.array('pictures', 10), async (req, res) => {
  try {
    const body = req.body;
    const files = (req.files || []).map(f => path.basename(f.path));
    
    // Validate required fields and convert to proper types
    if (!body.surveyDate || !body.surveyer || !body.beneficiaryId || body.aliveCrops === undefined || body.aliveCrops === null) {
      return res.status(400).json({ error: 'Missing required fields: surveyDate, surveyer, beneficiaryId, or aliveCrops' });
    }

    // Convert numeric fields with proper validation
    const aliveCrops = parseInt(body.aliveCrops);
    const deadCrops = parseInt(body.deadCrops || 0);
    
    if (isNaN(aliveCrops) || aliveCrops < 0) {
      return res.status(400).json({ error: 'Invalid aliveCrops value' });
    }
    
    if (isNaN(deadCrops) || deadCrops < 0) {
      return res.status(400).json({ error: 'Invalid deadCrops value' });
    }
    
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

app.put('/api/crop-status/:id', upload.array('pictures', 10), async (req, res) => {
  try {
    const body = req.body;
    const files = (req.files || []).map(f => path.basename(f.path));
    const recordId = req.params.id;



    // Validate ID parameter
    if (!recordId || isNaN(parseInt(recordId))) {
      return res.status(400).json({ error: 'Invalid record ID' });
    }

    // Validate required fields and convert to proper types
    if (!body.surveyDate || !body.surveyer || !body.beneficiaryId || body.aliveCrops === undefined || body.aliveCrops === null) {
      return res.status(400).json({ error: 'Missing required fields: surveyDate, surveyer, beneficiaryId, or aliveCrops' });
    }

    // Convert numeric fields with proper validation
    const aliveCrops = parseInt(body.aliveCrops);
    const deadCrops = parseInt(body.deadCrops || 0);
    
    if (isNaN(aliveCrops) || aliveCrops < 0) {
      return res.status(400).json({ error: 'Invalid aliveCrops value' });
    }
    
    if (isNaN(deadCrops) || deadCrops < 0) {
      return res.status(400).json({ error: 'Invalid deadCrops value' });
    }

    // If new files uploaded, replace pictures; otherwise keep existing
    let setPictures = '';
    const params = [
      body.surveyDate,
      body.surveyer,
      body.beneficiaryId,
      aliveCrops,
      deadCrops
    ];
    if (files.length > 0) {
      setPictures = ', pictures = ?';
      params.push(JSON.stringify(files));
    }
    params.push(recordId);

    const sql = `UPDATE crop_status SET 
      survey_date = ?, surveyer = ?, beneficiary_id = ?, alive_crops = ?, dead_crops = ?${setPictures}
      WHERE id = ?`;

    const [result] = await getPromisePool().query(sql, params);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (e) {
    console.error('Error updating crop status:', e);
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

// Farm Plots routes for Map Monitoring
app.get('/api/farm-plots', async (req, res) => {
  try {
    const [rows] = await getPromisePool().query(
      `SELECT fp.id,
              fp.beneficiary_id AS beneficiaryId,
              fp.plot_name AS plotName,
              fp.color,
              fp.coordinates,
              bd.first_name, bd.middle_name, bd.last_name,
              bd.purok, bd.barangay, bd.municipality, bd.province
       FROM farm_plots fp
       JOIN beneficiary_details bd ON bd.beneficiary_id = fp.beneficiary_id
       ORDER BY fp.created_at DESC`
    );

    const data = rows.map(r => ({
      id: r.id,
      beneficiaryId: r.beneficiaryId,
      plotName: r.plotName,
      color: r.color || '#2d7c4a',
      coordinates: Array.isArray(r.coordinates) ? r.coordinates : JSON.parse(r.coordinates || '[]'),
      beneficiaryName: `${r.first_name || ''} ${r.middle_name ? r.middle_name + ' ' : ''}${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      address: `${r.purok || ''}, ${r.barangay || ''}, ${r.municipality || ''}, ${r.province || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ',')
    }));

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/farm-plots/:id', async (req, res) => {
  try {
    const [rows] = await getPromisePool().query(
      'SELECT * FROM farm_plots WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const r = rows[0];
    res.json({
      id: r.id,
      beneficiaryId: r.beneficiary_id,
      plotName: r.plot_name,
      color: r.color || '#2d7c4a',
      coordinates: Array.isArray(r.coordinates) ? r.coordinates : JSON.parse(r.coordinates || '[]')
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/farm-plots', async (req, res) => {
  try {
    const body = req.body;
    const sql = `INSERT INTO farm_plots (beneficiary_id, plot_name, color, coordinates)
                 VALUES (?, ?, ?, ?)`;
    const params = [
      body.beneficiaryId,
      body.plotName || 'Plot',
      body.color || '#2d7c4a',
      JSON.stringify(body.coordinates || [])
    ];
    const [result] = await getPromisePool().query(sql, params);
    const [rows] = await getPromisePool().query(
      `SELECT fp.id,
              fp.beneficiary_id AS beneficiaryId,
              fp.plot_name AS plotName,
              fp.color,
              fp.coordinates,
              bd.first_name, bd.middle_name, bd.last_name,
              bd.purok, bd.barangay, bd.municipality, bd.province
       FROM farm_plots fp
       JOIN beneficiary_details bd ON bd.beneficiary_id = fp.beneficiary_id
       WHERE fp.id = ?`,
      [result.insertId]
    );
    const r = rows[0];
    const created = {
      id: r.id,
      beneficiaryId: r.beneficiaryId,
      plotName: r.plotName,
      color: r.color || '#2d7c4a',
      coordinates: Array.isArray(r.coordinates) ? r.coordinates : JSON.parse(r.coordinates || '[]'),
      beneficiaryName: `${r.first_name || ''} ${r.middle_name ? r.middle_name + ' ' : ''}${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      address: `${r.purok || ''}, ${r.barangay || ''}, ${r.municipality || ''}, ${r.province || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ',')
    };
    res.json(created);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/farm-plots/:id', async (req, res) => {
  try {
    const body = req.body;
    const sql = `UPDATE farm_plots
                 SET beneficiary_id = ?, plot_name = ?, color = ?, coordinates = ?
                 WHERE id = ?`;
    const params = [
      body.beneficiaryId,
      body.plotName || 'Plot',
      body.color || '#2d7c4a',
      JSON.stringify(body.coordinates || []),
      req.params.id
    ];
    const [result] = await getPromisePool().query(sql, params);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/farm-plots/:id', async (req, res) => {
  try {
    const [result] = await getPromisePool().query('DELETE FROM farm_plots WHERE id = ?', [req.params.id]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Philippine Address API endpoints
app.get('/api/addresses/provinces', async (req, res) => {
  try {
    // Load provinces directly from the JSON file
    try {
      const addressDataPath = path.join(__dirname, 'data', 'philippine_addresses.json');
      const fileContent = fs.readFileSync(addressDataPath, 'utf8');
      const jsonData = JSON.parse(fileContent);
      
      // Extract all province names from the JSON structure
      const provinces = jsonData.map(province => province.province).sort((a, b) => a.localeCompare(b));
      
      res.json(provinces);
    } catch (fileError) {
      console.error('Error reading province data from JSON:', fileError.message);
      // Fallback to database if JSON read fails
      const [rows] = await getPromisePool().query(
        'SELECT DISTINCT province FROM philippine_addresses ORDER BY province'
      );
      const provinces = rows.map(row => row.province);
      res.json(provinces);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/addresses/municipalities/:province', async (req, res) => {
  try {
    // Load municipalities from the JSON file
    try {
      const addressDataPath = path.join(__dirname, 'data', 'philippine_addresses.json');
      const fileContent = fs.readFileSync(addressDataPath, 'utf8');
      const jsonData = JSON.parse(fileContent);
      
      // Find the province and extract its municipalities
      const provinceData = jsonData.find(p => p.province === req.params.province);
      if (provinceData && Array.isArray(provinceData.municipalities)) {
        const municipalities = [...provinceData.municipalities].sort((a, b) => a.localeCompare(b));
        res.json(municipalities);
      } else {
        res.json([]);
      }
    } catch (fileError) {
      console.error('Error reading municipality data from JSON:', fileError.message);
      // Fallback to database if JSON read fails
      const [rows] = await getPromisePool().query(
        'SELECT DISTINCT municipality FROM philippine_addresses WHERE province = ? ORDER BY municipality',
        [req.params.province]
      );
      const municipalities = rows.map(row => row.municipality);
      res.json(municipalities);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/addresses/barangays/:province/:municipality', async (req, res) => {
  try {
    // For barangays, we need to check if it's Davao Oriental (which has detailed barangay data)
    // or other provinces (which only have municipality names in the JSON)
    if (req.params.province === 'Davao Oriental') {
      try {
        // Use the detailed davao-oriental.json for barangays
        const fallbackPath = path.join(__dirname, 'data', 'municipalities', 'davao-oriental.json');
        const content = fs.readFileSync(fallbackPath, 'utf8');
        const jsonData = JSON.parse(content);
        const entry = jsonData.find(e => e.municipality === req.params.municipality);
        if (entry && Array.isArray(entry.barangays)) {
          const barangays = [...entry.barangays].sort((a, b) => a.localeCompare(b));
          res.json(barangays);
          return;
        }
      } catch (fallbackErr) {
        console.error('Error reading Davao Oriental barangay data:', fallbackErr.message);
      }
    }
    
    // For other provinces or fallback, try database first
    try {
      const [rows] = await getPromisePool().query(
        'SELECT DISTINCT barangay FROM philippine_addresses WHERE province = ? AND municipality = ? ORDER BY barangay',
        [req.params.province, req.params.municipality]
      );
      const barangays = rows.map(row => row.barangay);
      res.json(barangays);
    } catch (dbError) {
      console.error('Database error for barangays:', dbError.message);
      res.json([]);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/addresses/sync', async (req, res) => {
  try {
    const { addresses } = req.body;
    if (!Array.isArray(addresses)) {
      return res.status(400).json({ error: 'Addresses must be an array' });
    }

    // Use INSERT IGNORE to avoid duplicates
    const sql = `INSERT IGNORE INTO philippine_addresses (province, municipality, barangay) VALUES ?`;
    const values = addresses.map(addr => [addr.province, addr.municipality, addr.barangay]);
    
    const [result] = await getPromisePool().query(sql, values);
    res.json({ 
      success: true, 
      message: `Synced ${result.affectedRows} new addresses`,
      totalAddresses: addresses.length
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Function to fetch Philippine address data from JSON file and sync to database
const syncPhilippineAddresses = async () => {
  try {
    // Check if we already have address data
    const [existingRows] = await getPromisePool().query('SELECT COUNT(*) as count FROM philippine_addresses');
    if (existingRows[0].count > 0) {
      console.log('Address data already exists in database, skipping sync');
      return;
    }

    console.log('Loading Philippine address data from JSON file...');
    
    // Load address data from JSON file
    const addressDataPath = path.join(__dirname, 'data', 'philippine_addresses.json');
    let addressData = [];
    
    try {
      const fileContent = fs.readFileSync(addressDataPath, 'utf8');
      const jsonData = JSON.parse(fileContent);
      
      // Flatten the hierarchical data structure
      jsonData.forEach(province => {
        province.municipalities.forEach(municipality => {
          municipality.barangays.forEach(barangay => {
            addressData.push({
              province: province.province,
              municipality: municipality.name,
              barangay: barangay
            });
          });
        });
      });
      
      console.log(`Processed ${addressData.length} addresses from JSON file`);
      console.log('Sample addresses:', addressData.slice(0, 3));
    } catch (fileError) {
      console.error('Error reading address data file:', fileError.message);
      // Fallback to basic data if file read fails
      addressData = [
        { province: 'Davao Oriental', municipality: 'Manay', barangay: 'Central' },
        { province: 'Davao Oriental', municipality: 'Manay', barangay: 'San Isidro' },
        { province: 'Davao Oriental', municipality: 'Manay', barangay: 'Rizal' }
      ];
    }

    if (addressData.length > 0) {
      // Insert the address data using individual INSERT statements to avoid syntax issues
      const sql = `INSERT IGNORE INTO philippine_addresses (province, municipality, barangay) VALUES (?, ?, ?)`;
      
      let insertedCount = 0;
      for (const addr of addressData) {
        try {
          const [result] = await getPromisePool().query(sql, [addr.province, addr.municipality, addr.barangay]);
          if (result.affectedRows > 0) {
            insertedCount++;
          }
        } catch (insertError) {
          // Log individual insert errors but continue with other records
          console.error(`Error inserting address ${addr.province}, ${addr.municipality}, ${addr.barangay}:`, insertError.message);
        }
      }
      
      console.log(`Synced ${insertedCount} Philippine addresses to database`);
    }
    
  } catch (error) {
    console.error('Error syncing Philippine addresses:', error.message);
  }
};

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    await syncPhilippineAddresses();
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
