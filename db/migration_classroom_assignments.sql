-- Migration: Add Classroom-based assignments
-- This replaces the class-based system with classroom-based

-- Teacher to Classroom assignments (with optional subject)
CREATE TABLE IF NOT EXISTS teacher_classrooms (
    id SERIAL PRIMARY KEY,
    teacher_id INT NOT NULL,
    classroom_id INT REFERENCES classrooms(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(teacher_id, classroom_id, subject_id)
);

-- Student to Classroom assignments
CREATE TABLE IF NOT EXISTS student_classrooms (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    classroom_id INT REFERENCES classrooms(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, classroom_id)
);

-- Indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_teacher_classrooms_teacher ON teacher_classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_classrooms_classroom ON teacher_classrooms(classroom_id);
CREATE INDEX IF NOT EXISTS idx_student_classrooms_student ON student_classrooms(student_id);
CREATE INDEX IF NOT EXISTS idx_student_classrooms_classroom ON student_classrooms(classroom_id);
