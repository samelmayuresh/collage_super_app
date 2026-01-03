'use server';

import { appDb, authDb } from '../../lib/db';
import { getSession } from './auth';
import { revalidatePath } from 'next/cache';

// ============ BRANCH CRUD ============

export async function createBranch(name: string, code?: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    try {
        const result = await appDb.query(
            'INSERT INTO branches (name, code) VALUES ($1, $2) RETURNING *',
            [name, code || null]
        );
        revalidatePath('/dashboard/admin/branches');
        return { success: true, branch: result.rows[0] };
    } catch (error) {
        console.error('Error creating branch:', error);
        return { error: 'Failed to create branch' };
    }
}

export async function getBranches() {
    try {
        const result = await appDb.query('SELECT * FROM branches ORDER BY name');
        return { branches: result.rows };
    } catch (error) {
        console.error('Error fetching branches:', error);
        return { error: 'Failed to fetch branches' };
    }
}

export async function deleteBranch(id: number) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    try {
        await appDb.query('DELETE FROM branches WHERE id = $1', [id]);
        revalidatePath('/dashboard/admin/branches');
        return { success: true };
    } catch (error) {
        console.error('Error deleting branch:', error);
        return { error: 'Failed to delete branch' };
    }
}

// ============ TEACHER BRANCH ASSIGNMENTS ============

export async function assignTeacherToBranch(teacherId: number, branchId: number) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    try {
        // Upsert (since we have UNIQUE constraint, we handle conflict by updating)
        await appDb.query(
            `INSERT INTO teacher_branches (teacher_id, branch_id) 
             VALUES ($1, $2) 
             ON CONFLICT (teacher_id) 
             DO UPDATE SET branch_id = EXCLUDED.branch_id, assigned_at = NOW()
             RETURNING *`,
            [teacherId, branchId]
        );
        revalidatePath('/dashboard/admin/branches');
        return { success: true };
    } catch (error) {
        console.error('Error assigning teacher to branch:', error);
        return { error: 'Failed to assign teacher' };
    }
}

export async function removeTeacherFromBranch(teacherId: number) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    try {
        await appDb.query('DELETE FROM teacher_branches WHERE teacher_id = $1', [teacherId]);
        revalidatePath('/dashboard/admin/branches');
        return { success: true };
    } catch (error) {
        console.error('Error removing teacher from branch:', error);
        return { error: 'Failed to remove teacher' };
    }
}

export async function getTeachersByBranch(branchId: number) {
    // This returns IDs. To get details we need to join/fetch from authDb.
    try {
        const result = await appDb.query(
            'SELECT teacher_id FROM teacher_branches WHERE branch_id = $1',
            [branchId]
        );
        const teacherIds = result.rows.map(r => r.teacher_id);

        if (teacherIds.length === 0) return { teachers: [] };

        const usersResult = await authDb.query(
            'SELECT id, name, email FROM users WHERE id = ANY($1)',
            [teacherIds]
        );

        return { teachers: usersResult.rows };
    } catch (error) {
        console.error('Error fetching branch teachers:', error);
        return { error: 'Failed to fetch teachers' };
    }
}

export async function getAllTeachersWithBranches() {
    // Returns { [teacherId]: branchId } mapping or similar
    try {
        const result = await appDb.query('SELECT teacher_id, branch_id FROM teacher_branches');
        return { mappings: result.rows };
    } catch (error) {
        console.error('Error fetching teacher branches:', error);
        return { error: 'Failed to fetch data' };
    }
}
