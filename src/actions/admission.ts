'use server';

import { authDb, appDb } from '../../lib/db';
import bcrypt from 'bcryptjs';
import { createSession, getSession } from './auth';
import { revalidatePath } from 'next/cache';

export async function registerApplicant(formData: FormData) {
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phone = formData.get('phone') as string;

    // Personal & Address
    const dob = formData.get('dob') as string;
    const gender = formData.get('gender') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const pincode = formData.get('pincode') as string;

    // Academic
    const tenthMarks = formData.get('tenthMarks');
    const twelfthMarks = formData.get('twelfthMarks');
    const preferredCourse = formData.get('preferredCourse') as string;

    if (!fullName || !email || !password || !phone) {
        return { error: 'Required fields missing' };
    }

    try {
        // 1. Check if user exists in Auth DB
        const existingUser = await authDb.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return { error: 'Email already registered. Please login.' };
        }

        // 2. Create User in Auth DB (Role: APPLICANT)
        const hashedPassword = await bcrypt.hash(password, 10);
        const userResult = await authDb.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [fullName, email, hashedPassword, 'APPLICANT']
        );
        const newUser = userResult.rows[0];

        // 3. Create Application Record in App DB
        await appDb.query(
            `INSERT INTO admission_applications (
                applicant_id, full_name, email, phone, dob, gender,
                address, city, state, pincode,
                tenth_marks, twelfth_marks, preferred_course, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'PENDING')`,
            [
                newUser.id, fullName, email, phone, dob || null, gender || null,
                address || null, city || null, state || null, pincode || null,
                tenthMarks || null, twelfthMarks || null, preferredCourse || null
            ]
        );

        // 4. Create Session (Auto Login)
        await createSession(newUser);

        return { success: true };

    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'Registration failed. Please try again.' };
    }
}

export async function getApplicantDashboardData() {
    const session = await getSession();
    if (!session || session.role !== 'APPLICANT') {
        return { error: 'Unauthorized' };
    }

    try {
        const result = await appDb.query(
            'SELECT * FROM admission_applications WHERE applicant_id = $1',
            [session.id]
        );

        if (result.rows.length === 0) {
            return { error: 'Application not found' };
        }

        return { application: result.rows[0] };
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return { error: 'Failed to load data' };
    }
}

export async function getAllApplications() {
    const session = await getSession();
    // Allow ADMIN and OFFICE_STAFF
    if (!session || (session.role !== 'OFFICE_STAFF' && session.role !== 'ADMIN')) {
        return { error: 'Unauthorized' };
    }

    try {
        const result = await appDb.query(
            'SELECT * FROM admission_applications ORDER BY created_at DESC'
        );
        return { applications: result.rows };
    } catch (error) {
        console.error('Error fetching applications:', error);
        return { error: 'Failed to fetch applications' };
    }
}

export async function updateApplicationStatus(applicationId: number, status: string, remarks: string) {
    const session = await getSession();
    if (!session || (session.role !== 'OFFICE_STAFF' && session.role !== 'ADMIN')) {
        return { error: 'Unauthorized' };
    }

    try {
        await appDb.query(
            'UPDATE admission_applications SET status = $1, remarks = $2, updated_at = NOW() WHERE id = $3',
            [status, remarks, applicationId]
        );

        revalidatePath('/dashboard/office/applications');
        return { success: true };
    } catch (error) {
        console.error('Error updating status:', error);
        return { error: 'Failed to update application' };
    }
}
