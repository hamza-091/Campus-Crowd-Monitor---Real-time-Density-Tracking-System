-- Campus Crowd Monitoring System - Database Setup Script
-- Execute this file in PostgreSQL to set up the database

-- Create database
CREATE DATABASE campusdb;

-- Connect to the database (use \c campusdb in psql)
-- Or create all tables in your existing database

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    capacity INTEGER NOT NULL,
    current_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'NORMAL',
    entry_closed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create logs table (activity tracking)
CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL,
    action VARCHAR(20),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- Create alerts table (auto-generated alerts)
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL,
    message VARCHAR(500),
    alert_type VARCHAR(50),
    reroute_suggestion VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_logs_location_id ON logs(location_id);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_location_id ON alerts(location_id);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp DESC);

-- Insert sample campus locations
INSERT INTO locations (name, capacity) VALUES
    ('Cafeteria', 30),
    ('Admin Block', 50),
    ('Academic Block', 150),
    ('Basketball Court', 20)
ON CONFLICT (name) DO NOTHING;

-- Verify data
SELECT * FROM locations;

-- Additional useful queries (comment out or modify as needed)

-- View all tables
-- \dt

-- View table structure
-- \d locations
-- \d logs
-- \d alerts

-- View database info
-- \l

-- Drop database (use with caution!)
-- DROP DATABASE IF EXISTS campusdb;
