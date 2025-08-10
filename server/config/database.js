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

// Create connection pool for normal operations
const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

// Initialize database and create tables
const initializeDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    await createTables();
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    throw error;
  }
};

// Create tables from SQL file
const createTables = async () => {
  try {
    // First, create the database if it doesn't exist
    try {
      await initialPromisePool.execute('CREATE DATABASE IF NOT EXISTS coffee_monitoring');
      console.log('Database created or already exists');
    } catch (error) {
      if (error.code !== 'ER_DB_CREATE_EXISTS') {
        throw error;
      }
    }

    // Create tables directly instead of parsing SQL file
    console.log('Creating coffee_batches table...');
    
    const createCoffeeBatchesTable = `
      CREATE TABLE IF NOT EXISTS coffee_batches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        batch_name VARCHAR(100) NOT NULL,
        harvest_date DATE,
        farm_location VARCHAR(200),
        variety VARCHAR(100),
        quantity_kg DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    try {
      await promisePool.execute(createCoffeeBatchesTable);
      console.log('coffee_batches table created successfully');
    } catch (error) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('coffee_batches table already exists, skipping');
      } else {
        console.error('Error creating coffee_batches table:', error.message);
        throw error;
      }
    }
    
    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  promisePool,
  initializeDatabase,
  createTables
};
