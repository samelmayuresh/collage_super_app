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
}
