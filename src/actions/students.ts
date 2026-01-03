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
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF' && session.role !== 'TEACHING')) {
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

        // 2. Fetch enrollment info from App DB for these students (Classrooms)
        const studentIds = students.map(s => s.id);
        const enrollmentQuery = `
            SELECT sc.student_id, c.id as classroom_id, c.room_number, b.name as building_name
            FROM student_classrooms sc
            JOIN classrooms c ON sc.classroom_id = c.id
            JOIN floors f ON c.floor_id = f.id
            JOIN buildings b ON f.building_id = b.id
            WHERE sc.student_id = ANY($1)
        `;
        const enrollmentResult = await appDb.query(enrollmentQuery, [studentIds]);
        const enrollments = enrollmentResult.rows;

        // 3. Merge data
        const mergedStudents = students.map(student => {
            // A student might be in multiple classrooms? 
            // For listing, we might just pick the first one or concat.
            // Let's pick the first one found for now.
            const enrollment = enrollments.find(e => e.student_id === student.id);
            return {
                ...student,
                classroom_id: enrollment ? enrollment.classroom_id : null,
                room_number: enrollment ? enrollment.room_number : null,
                building_name: enrollment ? enrollment.building_name : null,
                // Legacy fields nullified
                roll_number: null,
                class_name: enrollment ? `${enrollment.building_name} - ${enrollment.room_number}` : null,
                class_id: null,
            };
        });

        return { students: mergedStudents };

    } catch (error) {
        console.error('Error fetching students:', error);
        return { error: 'Failed to fetch students' };
    }
}
