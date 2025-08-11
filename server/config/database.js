const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

// Read SQL queries from file
const sqlQueries = fs.readFileSync(path.join(__dirname, 'db_queries.sql'), 'utf8');

// Database configuration without database name for initial connection
const initialDbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3307,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Coffee_Monitoring',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Database configuration with database name for normal operations
const dbConfig = {
  ...initialDbConfig,
  database: process.env.DB_NAME || 'coffee_monitoring'
};

// Create initial connection pool (without database)
const initialPool = mysql.createPool(initialDbConfig);
const initialPromisePool = initialPool.promise();

// Create connection pool for normal operations (will be replaced after DB exists)
let pool = mysql.createPool(dbConfig);
let promisePool = pool.promise();

// Initialize database and create tables
const initializeDatabase = async () => {
  try {
    // First, create the database if it doesn't exist
    await createDatabase();

    // Then create a new connection pool with the database context
    await createDatabaseConnection();

    // Finally, execute the table and index creation queries
    await createTables();
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    throw error;
  }
};

// Create database first
const createDatabase = async () => {
  try {
    await initialPromisePool.query('CREATE DATABASE IF NOT EXISTS coffee_monitoring');
  } catch (error) {
    console.error('Error creating database:', error.message);
    throw error;
  }
};

// Create a new connection pool with the database context
const createDatabaseConnection = async () => {
  try {
    if (pool) {
      try { await pool.end(); } catch (_) {}
    }

    pool = mysql.createPool({
      ...initialDbConfig,
      database: process.env.DB_NAME || 'coffee_monitoring'
    });
    promisePool = pool.promise();

    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Error creating database connection pool:', error.message);
    throw error;
  }
};

// Helper: extract table name from CREATE TABLE statement
const extractTableName = (query) => {
  const match = query.match(/^create\s+table\s+if\s+not\s+exists\s+[`"]?(\w+)[`"]?/i);
  return match ? match[1] : null;
};

// Create tables and indexes from SQL file (excluding database creation and USE statements)
const createTables = async () => {
  try {
    // Parse SQL queries and skip DB/USE statements
    const queries = sqlQueries
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0)
      .filter(q => {
        const lower = q.toLowerCase();
        return !lower.startsWith('create database') && !lower.startsWith('use ');
      });

    for (const query of queries) {
      const lower = query.toLowerCase();

      // Handle CREATE TABLE IF NOT EXISTS with conditional logging
      if (lower.startsWith('create table if not exists')) {
        const tableName = extractTableName(query);
        if (!tableName) {
          // If we cannot parse table name, just execute silently
          try { await promisePool.query(query); } catch (error) {
            if (!(error.code === 'ER_TABLE_EXISTS_ERROR' || error.message.includes('already exists'))) {
              throw error;
            }
          }
          continue;
        }

        // Check if table already exists
        const [existsRows] = await promisePool.query('SHOW TABLES LIKE ?', [tableName]);
        const tableExists = Array.isArray(existsRows) && existsRows.length > 0;
        if (tableExists) {
          // Do nothing and no log if already exists
          continue;
        }

        // Create table and log once created
        await promisePool.query(query);
        console.log(`Table ${tableName} created successfully.`);
        continue;
      }

      // For non-table statements (indexes, etc.), execute silently
      try {
        await promisePool.query(query);
      } catch (error) {
        // Ignore duplicates for indexes/keys
        if (
          error.code === 'ER_DUP_KEYNAME' ||
          (typeof error.message === 'string' && error.message.includes('Duplicate key name'))
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

module.exports = {
  pool,
  promisePool,
  initialPool,
  initialPromisePool,
  initializeDatabase,
  createDatabase,
  createDatabaseConnection,
  createTables
};
