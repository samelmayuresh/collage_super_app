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

-- Admission Applications Table
CREATE TABLE IF NOT EXISTS admission_applications (
    id SERIAL PRIMARY KEY,
    applicant_id INTEGER NOT NULL, -- references users(id) in Auth DB
    
    -- Personal Details
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone VARCHAR(20),
    dob DATE,
    gender VARCHAR(20),
    
    -- Address
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    
    -- Academic Details
    tenth_marks DECIMAL(5,2),
    twelfth_marks DECIMAL(5,2),
    preferred_course VARCHAR(100),
    
    -- Application Status
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'ADMITTED')),
    remarks TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admission_applicant_id ON admission_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_admission_status ON admission_applications(status);
