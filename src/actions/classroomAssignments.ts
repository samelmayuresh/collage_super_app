'use server';

import { appDb, authDb } from '../../lib/db';
import { getSession } from './auth';

// ============ TEACHER CLASSROOM ASSIGNMENTS ============

export async function assignTeacherToClassroom(teacherId: number, classroomId: number, subjectId?: number) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized - Admin only' };
    }

    try {
        const result = await appDb.query(
            `INSERT INTO teacher_classrooms (teacher_id, classroom_id, subject_id) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (teacher_id, classroom_id, subject_id) DO NOTHING
             RETURNING *`,
            [teacherId, classroomId, subjectId || null]
        );
        return { success: true, assignment: result.rows[0] };
    } catch (error: any) {
        console.error('Error assigning teacher to classroom:', error);
        return { error: 'Failed to assign teacher: ' + (error.message || 'Unknown error') };
    }
}

export async function getTeacherClassrooms(teacherId?: number) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    const id = teacherId || (session.role === 'TEACHING' ? session.id : null);
    if (!id) {
        return { error: 'Teacher ID required' };
    }

    try {
        const result = await appDb.query(
            `SELECT tc.*, c.room_number, f.floor_number, b.name as building_name, s.name as subject_name
             FROM teacher_classrooms tc
             JOIN classrooms c ON tc.classroom_id = c.id
             JOIN floors f ON c.floor_id = f.id
             JOIN buildings b ON f.building_id = b.id
             LEFT JOIN subjects s ON tc.subject_id = s.id
             WHERE tc.teacher_id = $1
             ORDER BY b.name, f.floor_number, c.room_number`,
            [id]
        );
        return { classrooms: result.rows };
    } catch (error) {
        console.error('Error fetching teacher classrooms:', error);
        return { error: 'Failed to fetch classrooms' };
    }
}

// Get teachers assigned to a specific classroom
export async function getTeachersByClassroom(classroomId: number) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    try {
        const result = await appDb.query(
            `SELECT tc.*, u.name as teacher_name, u.email as teacher_email, s.name as subject_name
             FROM teacher_classrooms tc
             -- We need to join with Auth DB users table, but we can't do cross-db joins easily in one query if they are separate.
             -- However, assuming 'users' table is in authDb, we usually fetch IDs and then fetch users.
             -- Let's stick to the pattern used in 'getStudentsByClassroom': fetch IDs first.
             LEFT JOIN subjects s ON tc.subject_id = s.id
             WHERE tc.classroom_id = $1`,
            [classroomId]
        );

        if (result.rows.length === 0) {
            return { teachers: [] };
        }

        // Get teacher IDs
        const teachersList = result.rows;
        const teacherIds = teachersList.map((t: any) => t.teacher_id);

        // Fetch user details from Auth DB
        const usersResult = await authDb.query(
            'SELECT id, name, email FROM users WHERE id = ANY($1)',
            [teacherIds]
        );

        // Merge details
        const teachers = teachersList.map((t: any) => {
            const user = usersResult.rows.find((u: any) => u.id === t.teacher_id);
            return {
                ...t,
                teacher_name: user?.name || 'Unknown',
                teacher_email: user?.email || ''
            };
        });

        return { teachers };
    } catch (error) {
        console.error('Error fetching classroom teachers:', error);
        return { error: 'Failed to fetch teachers' };
    }
}

export async function removeTeacherFromClassroom(assignmentId: number) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized - Admin only' };
    }

    try {
        await appDb.query('DELETE FROM teacher_classrooms WHERE id = $1', [assignmentId]);
        return { success: true };
    } catch (error) {
        console.error('Error removing teacher assignment:', error);
        return { error: 'Failed to remove assignment' };
    }
}

// ============ STUDENT CLASSROOM ASSIGNMENTS ============

export async function bulkAssignStudentsToClassroom(studentIds: number[], classroomId: number) {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
        return { error: 'Unauthorized' };
    }

    try {
        await appDb.query('BEGIN');

        // 1. Get current max roll number for this classroom
        const maxRes = await appDb.query(
            'SELECT MAX(roll_number) as max_roll FROM student_classrooms WHERE classroom_id = $1',
            [classroomId]
        );
        let nextRoll = (maxRes.rows[0].max_roll || 0) + 1;

        // 2. Assign students sequentially
        for (const studentId of studentIds) {
            await appDb.query(`
                INSERT INTO student_classrooms (student_id, classroom_id, roll_number)
                VALUES ($1, $2, $3)
                ON CONFLICT (student_id, classroom_id) 
                DO UPDATE SET roll_number = $3
            `, [studentId, classroomId, nextRoll]);
            nextRoll++;
        }

        await appDb.query('COMMIT');
        return { success: true };
    } catch (error) {
        await appDb.query('ROLLBACK');
        console.error('Bulk assignment error:', error);
        return { error: 'Failed to assign students' };
    }
}

export async function addStudentToClassroom(studentId: number, classroomId: number) {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'TEACHING')) {
        return { error: 'Unauthorized' };
    }

    // If teacher, verify they are assigned to this classroom
    if (session.role === 'TEACHING') {
        const teacherCheck = await appDb.query(
            'SELECT 1 FROM teacher_classrooms WHERE teacher_id = $1 AND classroom_id = $2',
            [session.id, classroomId]
        );
        if (teacherCheck.rows.length === 0) {
            return { error: 'You are not assigned to this classroom' };
        }
    }

    try {
        const result = await appDb.query(
            `INSERT INTO student_classrooms (student_id, classroom_id) 
             VALUES ($1, $2) 
             ON CONFLICT (student_id, classroom_id) DO NOTHING
             RETURNING *`,
            [studentId, classroomId]
        );
        return { success: true, enrollment: result.rows[0] };
    } catch (error) {
        console.error('Error adding student to classroom:', error);
        return { error: 'Failed to add student' };
    }
}

export async function getStudentsByClassroom(classroomId: number) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    try {
        // Get student IDs from app DB
        const enrollments = await appDb.query(
            'SELECT * FROM student_classrooms WHERE classroom_id = $1',
            [classroomId]
        );

        if (enrollments.rows.length === 0) {
            return { students: [] };
        }

        // Get student details from auth DB
        const studentIds = enrollments.rows.map((r: any) => r.student_id);
        const studentsResult = await authDb.query(
            'SELECT id, name, email FROM users WHERE id = ANY($1)',
            [studentIds]
        );

        // Merge enrollment data with student info
        const students = enrollments.rows.map((e: any) => {
            const student = studentsResult.rows.find((s: any) => s.id === e.student_id);
            return {
                ...e,
                name: student?.name || 'Unknown',
                email: student?.email || ''
            };
        });

        return { students };
    } catch (error) {
        console.error('Error fetching students:', error);
        return { error: 'Failed to fetch students' };
    }
}

export async function removeStudentFromClassroom(studentId: number, classroomId: number) {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'TEACHING')) {
        return { error: 'Unauthorized' };
    }

    try {
        await appDb.query(
            'DELETE FROM student_classrooms WHERE student_id = $1 AND classroom_id = $2',
            [studentId, classroomId]
        );
        return { success: true };
    } catch (error) {
        console.error('Error removing student:', error);
        return { error: 'Failed to remove student' };
    }
}

export async function getStudentClassroom(studentId?: number) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    const id = studentId || (session.role === 'STUDENT' ? session.id : null);
    if (!id) {
        return { error: 'Student ID required' };
    }

    try {
        const result = await appDb.query(
            `SELECT sc.*, c.room_number, f.floor_number, b.name as building_name
             FROM student_classrooms sc
             JOIN classrooms c ON sc.classroom_id = c.id
             JOIN floors f ON c.floor_id = f.id
             JOIN buildings b ON f.building_id = b.id
             WHERE sc.student_id = $1`,
            [id]
        );
        return { classrooms: result.rows };
    } catch (error) {
        console.error('Error fetching student classroom:', error);
        return { error: 'Failed to fetch classroom' };
    }
}

// ============ ALL CLASSROOMS (for dropdowns) ============

export async function getAllClassroomsWithDetails() {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    try {
        const result = await appDb.query(
            `SELECT c.id, c.room_number, f.floor_number, b.name as building_name, b.id as building_id, f.id as floor_id
             FROM classrooms c
             JOIN floors f ON c.floor_id = f.id
             JOIN buildings b ON f.building_id = b.id
             ORDER BY b.name, f.floor_number, c.room_number`
        );
        return { classrooms: result.rows };
    } catch (error) {
        console.error('Error fetching classrooms:', error);
        return { error: 'Failed to fetch classrooms' };
    }
}// ============ TEACHER STUDENTS HELPER ============

export async function getMyStudents() {
    const session = await getSession();
    if (!session || session.role !== 'TEACHING') {
        return { error: 'Unauthorized' };
    }

    try {
        // 1. Get enrollments for classrooms taught by this teacher
        const result = await appDb.query(
            `SELECT sc.student_id, sc.classroom_id, sc.roll_number,
                    c.room_number, f.floor_number, b.name as building_name,
                    s.name as subject_name
             FROM teacher_classrooms tc
             JOIN classrooms c ON tc.classroom_id = c.id
             JOIN floors f ON c.floor_id = f.id
             JOIN buildings b ON f.building_id = b.id
             LEFT JOIN subjects s ON tc.subject_id = s.id
             JOIN student_classrooms sc ON sc.classroom_id = c.id
             WHERE tc.teacher_id = $1
             ORDER BY b.name, f.floor_number, c.room_number, sc.roll_number`,
            [session.id]
        );

        const enrollments = result.rows;

        if (enrollments.length === 0) {
            return { students: [] };
        }

        // 2. Fetch student details from Auth DB
        const studentIds = Array.from(new Set(enrollments.map((e: any) => e.student_id)));
        const usersResult = await authDb.query(
            'SELECT id, name, email FROM users WHERE id = ANY($1)',
            [studentIds]
        );

        const userMap = new Map();
        usersResult.rows.forEach((u: any) => userMap.set(u.id, u));

        // 3. Merge data
        const students = enrollments.map((e: any) => {
            const user = userMap.get(e.student_id);
            return {
                id: e.student_id,
                name: user?.name || 'Unknown',
                email: user?.email || '',
                classroom_id: e.classroom_id,
                room_number: e.room_number,
                building_name: e.building_name,
                subject_name: e.subject_name,
                roll_number: e.roll_number
            };
        });

        return { students };
    } catch (error) {
        console.error('Error fetching my students:', error);
        return { error: 'Failed to fetch students' };
    }
}
