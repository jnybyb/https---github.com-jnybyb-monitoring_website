CREATE DATABASE IF NOT EXISTS coffee_monitoring;

USE coffee_monitoring;

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

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Manager', 'Worker', 'Viewer') DEFAULT 'Viewer',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farm_plots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plot_name VARCHAR(100) NOT NULL,
  plot_number VARCHAR(50) UNIQUE,
  area_hectares DECIMAL(8,2),
  location_coordinates POINT,
  soil_type VARCHAR(100),
  irrigation_type ENUM('Drip', 'Sprinkler', 'Flood', 'None'),
  planting_date DATE,
  expected_harvest_date DATE,
  status ENUM('Active', 'Inactive', 'Harvested') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS beneficiaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  gender ENUM('Male', 'Female', 'Other'),
  registration_date DATE,
  status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crop_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plot_id INT,
  status_date DATE NOT NULL,
  growth_stage ENUM('Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Mature', 'Harvested'),
  health_status ENUM('Excellent', 'Good', 'Fair', 'Poor', 'Critical'),
  pest_pressure ENUM('None', 'Low', 'Medium', 'High', 'Severe'),
  disease_pressure ENUM('None', 'Low', 'Medium', 'High', 'Severe'),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (plot_id) REFERENCES farm_plots(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS seedling_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plot_id INT,
  seedling_type VARCHAR(100),
  quantity INT,
  planting_date DATE,
  germination_rate DECIMAL(5,2),
  survival_rate DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (plot_id) REFERENCES farm_plots(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS temperature_readings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_id INT,
  temperature_celsius DECIMAL(5,2) NOT NULL,
  humidity_percent DECIMAL(5,2),
  reading_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sensor_location VARCHAR(100),
  notes TEXT,
  FOREIGN KEY (batch_id) REFERENCES coffee_batches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_coffee_batches_batch_name ON coffee_batches(batch_name);
CREATE INDEX idx_coffee_batches_harvest_date ON coffee_batches(harvest_date);
CREATE INDEX idx_beneficiaries_email ON beneficiaries(email);
CREATE INDEX idx_beneficiaries_status ON beneficiaries(status);
CREATE INDEX idx_farm_plots_plot_number ON farm_plots(plot_number);
CREATE INDEX idx_farm_plots_status ON farm_plots(status);
CREATE INDEX idx_crop_status_plot_id ON crop_status(plot_id);
CREATE INDEX idx_crop_status_status_date ON crop_status(status_date);
CREATE INDEX idx_seedling_records_plot_id ON seedling_records(plot_id);
CREATE INDEX idx_temperature_readings_batch_id ON temperature_readings(batch_id);
CREATE INDEX idx_temperature_readings_reading_timestamp ON temperature_readings(reading_timestamp);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
