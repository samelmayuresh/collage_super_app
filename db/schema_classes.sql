-- Teacher-Student Attendance & Calendar System Schema
-- Run this migration to add new tables

-- 1. Classes Table
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    section TEXT,
    academic_year TEXT NOT NULL DEFAULT '2025-26',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Subjects Table  
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Teacher Assignments (Teacher ↔ Class ↔ Subject mapping)
CREATE TABLE IF NOT EXISTS teacher_assignments (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, class_id, subject_id)
);

-- 4. Student Classes (Student ↔ Class mapping)
CREATE TABLE IF NOT EXISTS student_classes (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    roll_number TEXT,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, class_id)
);

-- 5. Calendar Events
DO $$ BEGIN
    CREATE TYPE event_type AS ENUM ('lecture', 'exam', 'assignment', 'meeting', 'holiday', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS calendar_events (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_type event_type NOT NULL DEFAULT 'other',
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT, -- 'weekly', 'monthly', 'daily'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Add class_id and subject_id to attendance_sessions if not exists
ALTER TABLE attendance_sessions 
    ADD COLUMN IF NOT EXISTS class_id INTEGER REFERENCES classes(id),
    ADD COLUMN IF NOT EXISTS subject_id INTEGER REFERENCES subjects(id);

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher ON teacher_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_classes_student ON student_classes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_classes_class ON student_classes(class_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_class ON calendar_events(class_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);
