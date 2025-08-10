-- SQL queries for database initialization

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS coffee_monitoring;

-- Create coffee_batches table (referenced by temperature_readings)
CREATE TABLE IF NOT EXISTS coffee_batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_name VARCHAR(100) NOT NULL,
  harvest_date DATE,
  farm_location VARCHAR(200),
  variety VARCHAR(100),
  quantity_kg DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
