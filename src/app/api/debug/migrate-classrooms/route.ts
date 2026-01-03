import { NextResponse } from 'next/server';
import { appDb } from '../../../../../lib/db';

export async function GET() {
    try {
        // Create teacher_classrooms table
        await appDb.query(`
            CREATE TABLE IF NOT EXISTS teacher_classrooms (
                id SERIAL PRIMARY KEY,
                teacher_id INT NOT NULL,
                classroom_id INT REFERENCES classrooms(id) ON DELETE CASCADE,
                subject_id INT REFERENCES subjects(id) ON DELETE SET NULL,
                assigned_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(teacher_id, classroom_id, subject_id)
            );
        `);

        // Create student_classrooms table
        await appDb.query(`
            CREATE TABLE IF NOT EXISTS student_classrooms (
                id SERIAL PRIMARY KEY,
                student_id INT NOT NULL,
                classroom_id INT REFERENCES classrooms(id) ON DELETE CASCADE,
                enrolled_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(student_id, classroom_id)
            );
        `);

        // Create indexes
        await appDb.query(`CREATE INDEX IF NOT EXISTS idx_teacher_classrooms_teacher ON teacher_classrooms(teacher_id);`);
        await appDb.query(`CREATE INDEX IF NOT EXISTS idx_teacher_classrooms_classroom ON teacher_classrooms(classroom_id);`);
        await appDb.query(`CREATE INDEX IF NOT EXISTS idx_student_classrooms_student ON student_classrooms(student_id);`);
        await appDb.query(`CREATE INDEX IF NOT EXISTS idx_student_classrooms_classroom ON student_classrooms(classroom_id);`);

        return NextResponse.json({
            success: true,
            message: 'Migration complete: teacher_classrooms and student_classrooms tables created'
        });
    } catch (error: any) {
        console.error('Migration error:', error);
        return NextResponse.json({ error: error.message }, { status: 200 });
    }
}
