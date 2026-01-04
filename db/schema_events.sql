-- Events, Announcements, and Alerts Schema
-- Applied to the App Database (DATABASE_URL_APP)

-- Events Table (college events, workshops, etc.)
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) DEFAULT 'general', -- general, academic, sports, cultural, workshop
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    location VARCHAR(255),
    image_url TEXT,
    is_mandatory BOOLEAN DEFAULT false,
    target_roles TEXT[], -- ['STUDENT', 'TEACHING'] or NULL for all
    created_by INT NOT NULL, -- user id
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    target_roles TEXT[], -- ['STUDENT'] or NULL for all
    is_pinned BOOLEAN DEFAULT false,
    expires_at TIMESTAMP,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Alerts Table (system-generated alerts)
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL, -- target user
    alert_type VARCHAR(50) NOT NULL, -- low_attendance, fee_due, assignment_due, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'warning', -- info, warning, danger
    is_read BOOLEAN DEFAULT false,
    action_url TEXT, -- optional link
    created_at TIMESTAMP DEFAULT NOW()
);

-- Attendance Summary (for quick lookups)
CREATE TABLE IF NOT EXISTS attendance_summary (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    total_classes INT DEFAULT 0,
    present_count INT DEFAULT 0,
    absent_count INT DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, month, year)
);

-- Event Registrations (students registering for events)
CREATE TABLE IF NOT EXISTS event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES events(id) ON DELETE CASCADE,
    user_id INT NOT NULL,
    registered_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_unread ON alerts(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_attendance_summary_student ON attendance_summary(student_id);
