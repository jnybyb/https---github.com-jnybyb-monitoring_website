-- Add plot column to crop_status table
USE coffee_monitoring;

ALTER TABLE crop_status 
ADD COLUMN plot VARCHAR(255) NULL AFTER dead_crops;
