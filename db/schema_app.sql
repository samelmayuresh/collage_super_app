-- App Database Schema

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- references users(id) in Auth DB (logical link)
    enrollment_no VARCHAR(50) UNIQUE NOT NULL,
    major VARCHAR(100),
    year INTEGER,
    gpa DECIMAL(3, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- references users(id) in Auth DB
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100),
    specialization VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Staff Table
CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- references users(id) in Auth DB
    department VARCHAR(100),
    shift VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- references users(id) in Auth DB
    clearance_level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
