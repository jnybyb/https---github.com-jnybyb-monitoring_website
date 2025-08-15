const path = require('path');
const express = require('express');
const { getPromisePool } = require('../config/database');

const router = express.Router();

// List farm plots (joined with beneficiary details)
router.get('/', async (req, res) => {
  try {
    const [rows] = await getPromisePool().query(
      `SELECT fp.id,
              fp.beneficiary_id AS beneficiaryId,
              fp.plot_name AS plotName,
              fp.color,
              fp.coordinates,
              bd.first_name, bd.middle_name, bd.last_name,
              bd.purok, bd.barangay, bd.municipality, bd.province,
              bd.picture
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
      address: `${r.purok || ''}, ${r.barangay || ''}, ${r.municipality || ''}, ${r.province || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ','),
      beneficiaryPicture: r.picture ? `/uploads/${path.basename(r.picture)}` : null
    }));

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get farm plot by ID
router.get('/:id', async (req, res) => {
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

// Create farm plot
router.post('/', async (req, res) => {
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
              bd.purok, bd.barangay, bd.municipality, bd.province,
              bd.picture
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
      address: `${r.purok || ''}, ${r.barangay || ''}, ${r.municipality || ''}, ${r.province || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ','),
      beneficiaryPicture: r.picture ? `/uploads/${path.basename(r.picture)}` : null
    };
    res.json(created);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update farm plot
router.put('/:id', async (req, res) => {
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

// Delete farm plot
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await getPromisePool().query('DELETE FROM farm_plots WHERE id = ?', [req.params.id]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;


