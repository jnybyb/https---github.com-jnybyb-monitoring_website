const express = require('express');
const { getPromisePool } = require('../config/database');

const router = express.Router();

// List seedling records
router.get('/', async (req, res) => {
  try {
    const [rows] = await getPromisePool().query('SELECT * FROM seedling_records ORDER BY date_of_planting DESC, created_at DESC');
    const data = rows.map(r => ({
      id: r.id,
      beneficiaryId: r.beneficiary_id,
      received: r.received,
      planted: r.planted,
      hectares: Number(r.hectares),
      dateOfPlantingStart: r.date_of_planting,
      dateOfPlantingEnd: r.date_of_planting_end || null,
      gps: r.gps,
      dateReceived: r.created_at
    }));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create seedling record
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const dateStart = body.dateOfPlantingStart || body.dateOfPlanting || null;
    const dateEnd = body.dateOfPlantingEnd || null;
    if (!dateStart) {
      return res.status(400).json({ error: 'dateOfPlantingStart is required' });
    }
    const sql = `INSERT INTO seedling_records 
      (beneficiary_id, received, planted, hectares, date_of_planting, date_of_planting_end, gps)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      body.beneficiaryId,
      Number(body.received),
      Number(body.planted),
      Number(body.hectares),
      dateStart,
      dateEnd,
      body.gps || null
    ];
    const [result] = await getPromisePool().query(sql, params);
    res.json({ success: true, id: result.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update seedling record
router.put('/:id', async (req, res) => {
  try {
    const body = req.body;
    const dateStart = body.dateOfPlantingStart || body.dateOfPlanting || null;
    const dateEnd = body.dateOfPlantingEnd || null;
    if (!dateStart) {
      return res.status(400).json({ error: 'dateOfPlantingStart is required' });
    }
    const sql = `UPDATE seedling_records SET 
      beneficiary_id = ?, received = ?, planted = ?, hectares = ?, date_of_planting = ?, date_of_planting_end = ?, gps = ?
      WHERE id = ?`;
    const params = [
      body.beneficiaryId,
      Number(body.received),
      Number(body.planted),
      Number(body.hectares),
      dateStart,
      dateEnd,
      body.gps || null,
      req.params.id
    ];
    const [result] = await getPromisePool().query(sql, params);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete seedling record
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await getPromisePool().query('DELETE FROM seedling_records WHERE id = ?', [req.params.id]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;


