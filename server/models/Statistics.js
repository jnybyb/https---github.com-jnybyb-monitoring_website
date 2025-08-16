const { getPromisePool } = require('../config/database');

class Statistics {
  static async getDashboardStats() {
    try {
      // Get total beneficiaries count
      const beneficiariesResult = await getPromisePool().query('SELECT COUNT(*) as total FROM beneficiary_details');
      const totalBeneficiaries = beneficiariesResult[0][0].total;

      // Get total seeds distributed (sum of received seeds from seedlings table)
      const seedsResult = await getPromisePool().query('SELECT SUM(received) as total FROM seedling_records WHERE received IS NOT NULL');
      const totalSeedsDistributed = seedsResult[0][0].total || 0;

      // Get alive and dead crops count
      const cropsResult = await getPromisePool().query(`
        SELECT 
          SUM(alive_crops) as totalAlive,
          SUM(dead_crops) as totalDead
        FROM crop_status 
        WHERE alive_crops IS NOT NULL OR dead_crops IS NOT NULL
      `);
      
      const totalAlive = cropsResult[0][0].totalAlive || 0;
      const totalDead = cropsResult[0][0].totalDead || 0;

      return {
        totalBeneficiaries,
        totalSeedsDistributed,
        totalAlive,
        totalDead
      };
    } catch (error) {
      throw new Error('Failed to fetch statistics: ' + error.message);
    }
  }
}

module.exports = Statistics;
