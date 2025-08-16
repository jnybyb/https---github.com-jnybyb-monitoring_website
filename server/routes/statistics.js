const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get dashboard statistics
router.get('/', async (req, res) => {
  try {
    // Get total beneficiaries count
    const beneficiariesResult = await query('SELECT COUNT(*) as total FROM beneficiaries');
    const totalBeneficiaries = beneficiariesResult[0].total;

    // Get total seeds distributed (sum of received seeds from seedlings table)
    const seedsResult = await query('SELECT SUM(received) as total FROM seedlings WHERE received IS NOT NULL');
    const totalSeedsDistributed = seedsResult[0].total || 0;

    // Get alive and dead crops count
    const cropsResult = await query(`
      SELECT 
        SUM(aliveCrops) as totalAlive,
        SUM(deadCrops) as totalDead
      FROM crop_status 
      WHERE aliveCrops IS NOT NULL OR deadCrops IS NOT NULL
    `);
    
    const totalAlive = cropsResult[0].totalAlive || 0;
    const totalDead = cropsResult[0].totalDead || 0;

    res.json({
      totalBeneficiaries,
      totalSeedsDistributed,
      totalAlive,
      totalDead
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
