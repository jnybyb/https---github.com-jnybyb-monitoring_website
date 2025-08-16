const { getPromisePool } = require('../config/database');

class Seedling {
  static async findAll() {
    const [rows] = await getPromisePool().query('SELECT * FROM seedling_records ORDER BY date_of_planting DESC, created_at DESC');
    return rows.map(r => ({
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
  }

  static async findById(id) {
    const [rows] = await getPromisePool().query('SELECT * FROM seedling_records WHERE id = ?', [id]);
    if (!rows.length) return null;
    
    const r = rows[0];
    return {
      id: r.id,
      beneficiaryId: r.beneficiary_id,
      received: r.received,
      planted: r.planted,
      hectares: Number(r.hectares),
      dateOfPlantingStart: r.date_of_planting,
      dateOfPlantingEnd: r.date_of_planting_end || null,
      gps: r.gps,
      dateReceived: r.created_at
    };
  }

  static async create(seedlingData) {
    const dateStart = seedlingData.dateOfPlantingStart || seedlingData.dateOfPlanting || null;
    const dateEnd = seedlingData.dateOfPlantingEnd || null;
    
    const sql = `INSERT INTO seedling_records 
      (beneficiary_id, received, planted, hectares, date_of_planting, date_of_planting_end, gps)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      seedlingData.beneficiaryId,
      Number(seedlingData.received),
      Number(seedlingData.planted),
      Number(seedlingData.hectares),
      dateStart,
      dateEnd,
      seedlingData.gps || null
    ];
    
    const [result] = await getPromisePool().query(sql, params);
    return result.insertId;
  }

  static async update(id, seedlingData) {
    const dateStart = seedlingData.dateOfPlantingStart || seedlingData.dateOfPlanting || null;
    const dateEnd = seedlingData.dateOfPlantingEnd || null;
    
    const sql = `UPDATE seedling_records SET 
      beneficiary_id = ?, received = ?, planted = ?, hectares = ?, date_of_planting = ?, date_of_planting_end = ?, gps = ?
      WHERE id = ?`;
    const params = [
      seedlingData.beneficiaryId,
      Number(seedlingData.received),
      Number(seedlingData.planted),
      Number(seedlingData.hectares),
      dateStart,
      dateEnd,
      seedlingData.gps || null,
      id
    ];
    
    const [result] = await getPromisePool().query(sql, params);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await getPromisePool().query('DELETE FROM seedling_records WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Seedling;
