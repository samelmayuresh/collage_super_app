-- Attendance System Schema
-- This schema is for the QR + Geo-fencing attendance feature
-- Applied to the App Database (DATABASE_URL_APP)
-- Note: user_id references are NOT foreign keys since users table is in Auth DB

-- Buildings (managed by Staff)
CREATE TABLE IF NOT EXISTS buildings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_by INT NOT NULL, -- References users.id in Auth DB
    created_at TIMESTAMP DEFAULT NOW()
);

-- Floors with geo-fencing (location set by Staff)
CREATE TABLE IF NOT EXISTS floors (
    id SERIAL PRIMARY KEY,
    building_id INT REFERENCES buildings(id) ON DELETE CASCADE,
    floor_number INT NOT NULL,
    center_lat DECIMAL(10,8),
    center_lng DECIMAL(11,8),
    radius_m INT DEFAULT 45,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(building_id, floor_number)
);

-- Classrooms (assigned to floors)
CREATE TABLE IF NOT EXISTS classrooms (
    id SERIAL PRIMARY KEY,
    floor_id INT REFERENCES floors(id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(floor_id, room_number)
);

-- Attendance Sessions (created by Teacher)
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id SERIAL PRIMARY KEY,
    classroom_id INT REFERENCES classrooms(id) ON DELETE CASCADE,
    teacher_id INT NOT NULL, -- References users.id in Auth DB
    qr_token VARCHAR(64) UNIQUE NOT NULL,
    started_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Index for quick token lookups
CREATE INDEX IF NOT EXISTS idx_sessions_token ON attendance_sessions(qr_token);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON attendance_sessions(is_active);

-- Attendance Records (student check-ins)
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    session_id INT REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id INT NOT NULL, -- References users.id in Auth DB
    lat DECIMAL(10,8) NOT NULL,
    lng DECIMAL(11,8) NOT NULL,
    distance_m DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PRESENT',
    marked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(session_id, student_id)
);

-- Index for quick attendance lookups
CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
