'use server';

import { authDb as db } from '../../lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-this';
const key = new TextEncoder().encode(SECRET_KEY);

export async function signup(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;

    if (!name || !email || !password || !role) {
        return { error: 'All fields are required' };
    }

    try {
        // Check if user exists
        const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return { error: 'User already exists' };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, role]
        );
        const user = result.rows[0];

        // Create session
        await createSession(user);

        return { success: true };
    } catch (error) {
        console.error('Signup error:', error);
        return { error: 'Something went wrong' };
    }
}

export async function signin(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'All fields are required' };
    }

    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return { error: 'Invalid credentials' };
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return { error: 'Invalid credentials' };
        }

        await createSession(user);
        return { success: true };
    } catch (error) {
        console.error('Signin error:', error);
        return { error: 'Something went wrong' };
    }
}

export async function logout() {
    (await cookies()).delete('session');
    redirect('/signin');
}

export interface SessionUser {
    id: number;
    name: string;
    email: string;
    role: string;
    [key: string]: any;
}

export async function getSession(): Promise<SessionUser | null> {
    const session = (await cookies()).get('session')?.value;
    if (!session) return null;
    try {
        const { payload } = await jwtVerify(session, key, {
            algorithms: ['HS256'],
        });
        return payload as unknown as SessionUser;
    } catch (error) {
        return null;
    }
}

async function createSession(user: any) {
    const expires = new Date(Date.now() + 60 * 60 * 1000 * 24); // 1 day
    const session = await new SignJWT({ ...user })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);

    (await cookies()).set('session', session, {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
}
