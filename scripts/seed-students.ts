import 'dotenv/config';
import { authDb as db, authPool } from '../lib/db';
import bcrypt from 'bcryptjs';

const students = [
    { name: 'Alice Johnson', email: 'alice@student.com' },
    { name: 'Bob Smith', email: 'bob@student.com' },
    { name: 'Charlie Brown', email: 'charlie@student.com' },
    { name: 'Diana Prince', email: 'diana@student.com' },
    { name: 'Evan Wright', email: 'evan@student.com' },
];

async function seedStudents() {
    console.log('🌱 Seeding students...');
    const defaultPassword = 'student';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    try {
        for (const student of students) {
            // Check if exists
            const existing = await db.query('SELECT id FROM users WHERE email = $1', [student.email]);

            if (existing.rows.length === 0) {
                await db.query(
                    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
                    [student.name, student.email, hashedPassword, 'STUDENT']
                );
                console.log(`✅ Created: ${student.name} (${student.email})`);
            } else {
                console.log(`ℹ️ Skipped: ${student.name} (already exists)`);
            }
        }

        console.log('\n✨ Seeding complete!');
        console.log('Default Password: "student"');

    } catch (error) {
        console.error('Error seeding students:', error);
    } finally {
        await authPool.end();
        process.exit(0);
    }
}

seedStudents();
