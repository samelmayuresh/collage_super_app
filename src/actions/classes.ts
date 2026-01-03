'use server';

import { appDb } from '../../lib/db';
import { getSession } from './auth';

// ============ CLASSES ============

export async function createClass(name: string, section?: string, academicYear?: string) {
    const session = await getSession();
    if (!session || session.role !== 'STAFF') {
        return { error: 'Unauthorized - Staff only' };
    }

    try {
        const result = await appDb.query(
            `INSERT INTO classes (name, section, academic_year) 
             VALUES ($1, $2, $3) RETURNING *`,
            [name, section || null, academicYear || '2025-26']
        );
        return { success: true, class: result.rows[0] };
    } catch (error) {
        console.error('Error creating class:', error);
        return { error: 'Failed to create class' };
    }
}

export async function getClasses() {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    try {
        const result = await appDb.query(
            'SELECT * FROM classes ORDER BY name, section'
        );
        return { classes: result.rows };
    } catch (error) {
        console.error('Error fetching classes:', error);
        return { error: 'Failed to fetch classes' };
    }
}

export async function deleteClass(classId: number) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized - Admin only' };
    }

    try {
        await appDb.query('DELETE FROM classes WHERE id = $1', [classId]);
        return { success: true };
    } catch (error) {
        console.error('Error deleting class:', error);
        return { error: 'Failed to delete class' };
    }
}

// ============ SUBJECTS ============

export async function createSubject(name: string, code?: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized - Admin only' };
    }

    try {
        const result = await appDb.query(
            `INSERT INTO subjects (name, code) VALUES ($1, $2) RETURNING *`,
            [name, code || null]
        );
        return { success: true, subject: result.rows[0] };
    } catch (error) {
        console.error('Error creating subject:', error);
        return { error: 'Failed to create subject' };
    }
}

export async function getSubjects() {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    try {
        const result = await appDb.query('SELECT * FROM subjects ORDER BY name');
        return { subjects: result.rows };
    } catch (error) {
        console.error('Error fetching subjects:', error);
        return { error: 'Failed to fetch subjects' };
    }
}

export async function deleteSubject(subjectId: number) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized - Admin only' };
    }

    try {
        await appDb.query('DELETE FROM subjects WHERE id = $1', [subjectId]);
        return { success: true };
    } catch (error) {
        console.error('Error deleting subject:', error);
        return { error: 'Failed to delete subject' };
    }
}

// ============ TEACHER ASSIGNMENTS ============

export async function assignTeacherToClass(teacherId: number, classId: number, subjectId: number) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized - Admin only' };
    }

    try {
        const result = await appDb.query(
            `INSERT INTO teacher_assignments (teacher_id, class_id, subject_id) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (teacher_id, class_id, subject_id) DO NOTHING
             RETURNING *`,
            [teacherId, classId, subjectId]
        );
        return { success: true, assignment: result.rows[0] };
    } catch (error) {
        console.error('Error assigning teacher:', error);
        return { error: 'Failed to assign teacher' };
    }
}

export async function getTeacherAssignments(teacherId?: number) {
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
            `SELECT ta.*, c.name as class_name, c.section, s.name as subject_name, s.code as subject_code
             FROM teacher_assignments ta
             JOIN classes c ON ta.class_id = c.id
             JOIN subjects s ON ta.subject_id = s.id
             WHERE ta.teacher_id = $1
             ORDER BY c.name, s.name`,
            [id]
        );
        return { assignments: result.rows };
    } catch (error) {
        console.error('Error fetching assignments:', error);
        return { error: 'Failed to fetch assignments' };
    }
}

export async function getAllTeacherAssignments() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized - Admin only' };
    }

    try {
        const result = await appDb.query(
            `SELECT ta.*, c.name as class_name, c.section, s.name as subject_name
             FROM teacher_assignments ta
             JOIN classes c ON ta.class_id = c.id
             JOIN subjects s ON ta.subject_id = s.id
             ORDER BY ta.teacher_id, c.name, s.name`
        );
        return { assignments: result.rows };
    } catch (error) {
        console.error('Error fetching all assignments:', error);
        return { error: 'Failed to fetch assignments' };
    }
}

export async function removeTeacherAssignment(assignmentId: number) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized - Admin only' };
    }

    try {
        await appDb.query('DELETE FROM teacher_assignments WHERE id = $1', [assignmentId]);
        return { success: true };
    } catch (error) {
        console.error('Error removing assignment:', error);
        return { error: 'Failed to remove assignment' };
    }
}

// ============ STUDENT CLASSES ============

export async function addStudentToClass(studentId: number, classId: number, rollNumber?: string) {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF' && session.role !== 'TEACHING')) {
        return { error: 'Unauthorized' };
    }

    try {
        const result = await appDb.query(
            `INSERT INTO student_classes (student_id, class_id, roll_number) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (student_id, class_id) DO UPDATE SET roll_number = $3
             RETURNING *`,
            [studentId, classId, rollNumber || null]
        );
        return { success: true, enrollment: result.rows[0] };
    } catch (error) {
        console.error('Error adding student to class:', error);
        return { error: 'Failed to add student to class' };
    }
}

export async function getStudentsByClass(classId: number) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    try {
        const result = await appDb.query(
            `SELECT sc.*, sc.roll_number
             FROM student_classes sc
             WHERE sc.class_id = $1
             ORDER BY sc.roll_number, sc.student_id`,
            [classId]
        );
        return { students: result.rows };
    } catch (error) {
        console.error('Error fetching students:', error);
        return { error: 'Failed to fetch students' };
    }
}

export async function getStudentClass(studentId?: number) {
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
            `SELECT sc.*, c.name as class_name, c.section
             FROM student_classes sc
             JOIN classes c ON sc.class_id = c.id
             WHERE sc.student_id = $1`,
            [id]
        );
        return { enrollment: result.rows[0] || null };
    } catch (error) {
        console.error('Error fetching student class:', error);
        return { error: 'Failed to fetch student class' };
    }
}

export async function removeStudentFromClass(studentId: number, classId: number) {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
        return { error: 'Unauthorized' };
    }

    try {
        await appDb.query(
            'DELETE FROM student_classes WHERE student_id = $1 AND class_id = $2',
            [studentId, classId]
        );
        return { success: true };
    } catch (error) {
        console.error('Error removing student:', error);
        return { error: 'Failed to remove student' };
    }
}
