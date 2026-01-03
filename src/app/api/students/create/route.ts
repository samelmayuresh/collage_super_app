import { NextResponse } from 'next/server';
import { authDb, appDb } from '../../../../../lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { name, email, password, classroomId, rollNumber } = await request.json();

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email required' }, { status: 400 });
        }

        // Check if student already exists
        const existing = await authDb.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);

        let studentId: number;

        if (existing.rows.length > 0) {
            // Student exists, use existing ID
            studentId = existing.rows[0].id;
        } else {
            // Create new student account
            const hashedPassword = await bcrypt.hash(password || 'student123', 10);
            const result = await authDb.query(
                'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
                [name, email.toLowerCase(), hashedPassword, 'STUDENT']
            );
            studentId = result.rows[0].id;
        }

        // Add to classroom if classroomId provided
        if (classroomId) {
            // We ignore rollNumber for now as student_classrooms doesn't support it
            // Ideally we'd store it in students table, but for attendance logic it's not strictly required yet.

            await appDb.query(
                `INSERT INTO student_classrooms (student_id, classroom_id) 
                 VALUES ($1, $2) 
                 ON CONFLICT (student_id, classroom_id) DO NOTHING`,
                [studentId, parseInt(classroomId)]
            );
        }

        return NextResponse.json({
            success: true,
            studentId,
            isNew: existing.rows.length === 0
        });
    } catch (error) {
        console.error('Error creating student:', error);
        return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
    }
}
