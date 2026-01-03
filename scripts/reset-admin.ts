import 'dotenv/config';
import { authDb as db, authPool } from '../lib/db';
import bcrypt from 'bcryptjs';

async function resetAdmin() {
    console.log('🔄 Setting up Admin credentials...');
    const email = 'admin@college.com';
    const password = 'admin';
    const name = 'System Admin';
    const role = 'ADMIN';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if admin exists with this email
        const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existing.rows.length > 0) {
            // Update existing
            await db.query(
                'UPDATE users SET password = $1, role = $2, name = $3 WHERE email = $4',
                [hashedPassword, role, name, email]
            );
            console.log('✅ Updated existing admin account.');
        } else {
            // Create new
            await db.query(
                'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
                [name, email, hashedPassword, role]
            );
            console.log('✅ Created new admin account.');
        }

        console.log('\n🔐 Admin Credentials:');
        console.log('------------------------');
        console.log(`Email:    ${email}`);
        console.log(`Password: ${password}`);
        console.log('------------------------');

    } catch (error) {
        console.error('❌ Error setup admin:', error);
    } finally {
        await authPool.end();
        process.exit(0);
    }
}

resetAdmin();
