import { NextResponse } from 'next/server';
import { authDb, appDb } from '../../../../../lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { name, email, password, classId, rollNumber } = await request.json();

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

        // Add to class if classId provided
        if (classId) {
            await appDb.query(
                `INSERT INTO student_classes (student_id, class_id, roll_number) 
                 VALUES ($1, $2, $3) 
                 ON CONFLICT (student_id, class_id) DO UPDATE SET roll_number = $3`,
                [studentId, classId, rollNumber || null]
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
