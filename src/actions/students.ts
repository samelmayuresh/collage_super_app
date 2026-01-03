'use server';

import { appDb, authDb } from '../../lib/db';
import { getSession } from './auth';

// ============ STUDENT MANAGEMENT (Admin) ============

interface Student {
    id: number;
    name: string;
    email: string;
    role: string;
    roll_number: string | null;
    class_name: string | null;
    class_id: number | null;
    created_at: string;
}

export async function getAllStudents() {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
        return { error: 'Unauthorized' };
    }

    try {
        // 1. Fetch students from Auth DB
        const usersResult = await authDb.query(`
            SELECT id, name, email, role, created_at 
            FROM users 
            WHERE role = 'STUDENT' 
            ORDER BY created_at DESC
        `);
        const students = usersResult.rows;

        if (students.length === 0) {
            return { students: [] };
        }

        // 2. Fetch enrollment info from App DB for these students
        const studentIds = students.map(s => s.id);
        const enrollmentQuery = `
            SELECT sc.student_id, sc.roll_number, c.name as class_name, c.id as class_id
            FROM student_classes sc
            JOIN classes c ON sc.class_id = c.id
            WHERE sc.student_id = ANY($1)
        `;
        const enrollmentResult = await appDb.query(enrollmentQuery, [studentIds]);
        const enrollments = enrollmentResult.rows;

        // 3. Merge data
        const mergedStudents = students.map(student => {
            const enrollment = enrollments.find(e => e.student_id === student.id);
            return {
                ...student,
                roll_number: enrollment ? enrollment.roll_number : null,
                class_name: enrollment ? enrollment.class_name : null,
                class_id: enrollment ? enrollment.class_id : null,
            };
        });

        return { students: mergedStudents };

    } catch (error) {
        console.error('Error fetching students:', error);
        return { error: 'Failed to fetch students' };
    }
}
