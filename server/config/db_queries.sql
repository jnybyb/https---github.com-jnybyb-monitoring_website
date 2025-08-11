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

CREATE TABLE IF NOT EXISTS seedling_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  beneficiary_id VARCHAR(10) NOT NULL,
  received INT NOT NULL,
  planted INT NOT NULL,
  hectares DECIMAL(8,2) NOT NULL,
  date_of_planting DATE NOT NULL,
  gps VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_seedlings_beneficiary_id (beneficiary_id)
);

CREATE TABLE IF NOT EXISTS crop_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  survey_date DATE NOT NULL,
  surveyer VARCHAR(100) NOT NULL,
  beneficiary_id VARCHAR(10) NOT NULL,
  alive_crops INT NOT NULL,
  dead_crops INT NOT NULL DEFAULT 0,
  pictures JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_crop_status_beneficiary_id (beneficiary_id),
  INDEX idx_crop_status_survey_date (survey_date)
);

ALTER TABLE seedling_records
  ADD CONSTRAINT fk_seedlings_beneficiary
  FOREIGN KEY (beneficiary_id)
  REFERENCES beneficiary_details(beneficiary_id)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

ALTER TABLE crop_status
  ADD CONSTRAINT fk_crop_status_beneficiary
  FOREIGN KEY (beneficiary_id)
  REFERENCES beneficiary_details(beneficiary_id)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;
