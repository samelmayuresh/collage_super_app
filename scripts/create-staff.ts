import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { authDb, authPool } from '../lib/db';

async function createStaffUser() {
    console.log('Creating Staff user...');

    const email = 'staff@college.com';
    const password = '1234';
    const name = 'Staff User';
    const role = 'STAFF';

    try {
        // Check if user already exists
        const existing = await authDb.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existing.rows.length > 0) {
            console.log('Staff user already exists!');
            console.log('Email:', email);
            console.log('Password:', password);
        } else {
            const passwordHash = await bcrypt.hash(password, 10);
            await authDb.query(
                'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)',
                [email, passwordHash, name, role]
            );
            console.log('✅ Staff user created!');
            console.log('================================');
            console.log('Email:', email);
            console.log('Password:', password);
            console.log('================================');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await authPool.end();
    }
}

createStaffUser();
