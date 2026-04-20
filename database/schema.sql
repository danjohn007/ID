-- Portfolio Dashboard Database Schema
-- Run this script to initialize the database

CREATE DATABASE IF NOT EXISTS idactivo_idbot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE idactivo_idbot;

-- Admin table for dashboard login
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Works/Portfolio table
CREATE TABLE IF NOT EXISTS works (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    pdf_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work images table (multiple images per work)
CREATE TABLE IF NOT EXISTS work_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    work_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
);

-- Users table (for future chatbot integration)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) UNIQUE,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    event_name VARCHAR(255),
    chosen_option VARCHAR(10),
    state VARCHAR(50) NOT NULL DEFAULT 'WAITING_NAME',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    name VARCHAR(255) DEFAULT NULL,
    email VARCHAR(255) DEFAULT NULL,
    company VARCHAR(255) DEFAULT NULL,
    event_name VARCHAR(255) DEFAULT NULL,
    interest VARCHAR(255) NOT NULL,
    mode VARCHAR(20) NOT NULL DEFAULT 'PRESENCIAL',
    appointment_at DATETIME NOT NULL,
    meeting_link VARCHAR(500) DEFAULT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_appointments_date (appointment_at),
    INDEX idx_appointments_user (user_id),
    CONSTRAINT fk_appointments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin (username: admin, password: admin123)
-- Password is hashed with bcrypt (cost factor 10)
INSERT INTO admins (username, password) VALUES
('admin', '$2a$10$aSRinrcDS9PJE8h.nc36tOG97bUV9FUOA./dUpOqVbQh1Pw2o9jpy')
ON DUPLICATE KEY UPDATE id=id;
