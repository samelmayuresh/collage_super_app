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
        const result = await authDb.query(`
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.role, 
                u.created_at,
                sc.roll_number,
                c.name as class_name,
                c.id as class_id
            FROM users u
            LEFT JOIN ${process.env.POSTGRES_DATABASE_APP}.student_classes sc ON u.id = sc.student_id
            LEFT JOIN ${process.env.POSTGRES_DATABASE_APP}.classes c ON sc.class_id = c.id
            WHERE u.role = 'STUDENT'
            ORDER BY u.created_at DESC
        `);

        return { students: result.rows as Student[] };
    } catch (error) {
        console.error('Error fetching students:', error);
        return { error: 'Failed to fetch students' };
    }
}
