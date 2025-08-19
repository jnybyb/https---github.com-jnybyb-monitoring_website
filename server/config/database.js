const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

// Read SQL queries from file
const sqlQueries = fs.readFileSync(path.join(__dirname, 'db_queries.sql'), 'utf8');

// Database configuration without database name for initial connection
const initialDbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const dbName = process.env.DB_NAME || 'coffee_monitoring';

const initialPool = mysql.createPool(initialDbConfig);
const initialPromisePool = initialPool.promise();

let pool = null;
let promisePool = null;

const initializeDatabase = async () => {
  try {
    await createDatabase();
    await createDatabaseConnection();
    await createTables();
    await backfillBeneficiaryAges();
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    throw error;
  }
};

const createDatabase = async () => {
  try {
    await initialPromisePool.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
  } catch (error) {
    console.error('Error creating database:', error.message);
    throw error;
  }
};

const createDatabaseConnection = async () => {
  try {
    if (pool) {
      try { await pool.end(); } catch (_) {}
    }

    pool = mysql.createPool({
      ...initialDbConfig,
      database: dbName
    });
    promisePool = pool.promise();

    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Error creating database connection pool:', error.message);
    throw error;
  }
};

const getPromisePool = () => {
  if (!promisePool) {
    throw new Error('Database not initialized');
  }
  return promisePool;
};

const stripSqlComments = (query) => {
  // Remove line comments starting with -- and block comments /* ... */
  return query
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();
};

const extractTableName = (query) => {
  const normalized = stripSqlComments(query);
  const match = normalized.match(/create\s+table\s+if\s+not\s+exists\s+[`"]?(\w+)[`"]?/i);
  return match ? match[1] : null;
};

const createTables = async () => {
  try {
    const queries = sqlQueries
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0)
      .filter(q => {
        const lower = q.toLowerCase();
        return !lower.startsWith('create database') && !lower.startsWith('use ');
      });

    for (const query of queries) {
      const normalized = stripSqlComments(query);
      if (!normalized) continue;
      const lower = normalized.toLowerCase();

      if (lower.includes('create table if not exists')) {
        const tableName = extractTableName(normalized);
        if (!tableName) {
          try { await getPromisePool().query(normalized); } catch (error) {
            if (!(error.code === 'ER_TABLE_EXISTS_ERROR' || error.message.includes('already exists'))) {
              throw error;
            }
          }
          continue;
        }
        const [existsRows] = await getPromisePool().query('SHOW TABLES LIKE ?', [tableName]);
        const tableExists = Array.isArray(existsRows) && existsRows.length > 0;
        if (tableExists) continue;
        await getPromisePool().query(normalized);
        console.log(`Table ${tableName} created successfully.`);
        continue;
      }

      try {
        await getPromisePool().query(normalized);
      } catch (error) {
        // Ignore duplicates for indexes/keys and foreign keys already present
        const msg = String(error.message || '').toLowerCase();
        if (
          error.code === 'ER_DUP_KEYNAME' ||
          error.code === 'ER_CANT_DROP_FIELD_OR_KEY' ||
          msg.includes('duplicate key name') ||
          msg.includes('duplicate foreign key constraint name') ||
          msg.includes("can't create table") && msg.includes('errno: 121') ||
          msg.includes('check that column/key exists') ||
          msg.includes('doesn\'t exist')
        ) {
          continue;
        }
        throw error;
      }
    }
  } catch (error) {
    console.error('Error creating tables:', error.message);
    throw error;
  }
};

// Backfill ages for existing rows if missing
const backfillBeneficiaryAges = async () => {
  try {
    const [result] = await getPromisePool().query(
      `UPDATE beneficiary_details 
       SET age = TIMESTAMPDIFF(YEAR, birth_date, CURDATE())
       WHERE birth_date IS NOT NULL AND (age IS NULL OR age = 0)`
    );
    if (result.affectedRows > 0) {
      console.log(`Backfilled age for ${result.affectedRows} beneficiaries.`);
    }
  } catch (error) {
    console.error('Error backfilling ages:', error.message);
  }
};


module.exports = {
  getPromisePool,
  initializeDatabase,
  createDatabase,
  createDatabaseConnection,
  createTables,
  backfillBeneficiaryAges
};
