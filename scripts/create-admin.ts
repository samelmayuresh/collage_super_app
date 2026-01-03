import 'dotenv/config';
import { authDb as db, authPool } from '../lib/db';
import bcrypt from 'bcryptjs';

async function createAdmin() {
    const email = 'admin@collegesuperapp.com';
    const password = 'Admin@123';
    const name = 'Super Admin';
    const role = 'ADMIN';

    try {
        // Check if admin already exists
        const existing = await db.query('SELECT * FROM users WHERE role = $1', ['ADMIN']);

        if (existing.rows.length > 0) {
            console.log('Admin already exists:', existing.rows[0].email);
            await authPool.end();
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin user
        const result = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, role]
        );

        console.log('✅ Admin created successfully!');
        console.log('================================');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('================================');
        console.log('User:', result.rows[0]);

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await authPool.end();
    }
}

createAdmin();
