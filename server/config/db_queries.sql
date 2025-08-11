CREATE DATABASE IF NOT EXISTS coffee_monitoring;

USE coffee_monitoring;

CREATE TABLE IF NOT EXISTS beneficiary_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  beneficiary_id VARCHAR(10) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NOT NULL,
  purok VARCHAR(100) NOT NULL,
  barangay VARCHAR(100) NOT NULL,
  municipality VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  gender ENUM('Male', 'Female') NOT NULL,
  birth_date DATE NOT NULL,
  age TINYINT UNSIGNED NULL,
  marital_status ENUM('Single', 'Married', 'Widowed', 'Divorced', 'Separated') NOT NULL,
  cellphone VARCHAR(15) NOT NULL,
  picture VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
