import 'dotenv/config';
import { authDb as db, authPool } from '../lib/db';
import bcrypt from 'bcryptjs';

async function updateAdminPassword() {
    const newPassword = '1234';

    try {
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update admin password
        const result = await db.query(
            'UPDATE users SET password = $1 WHERE role = $2 RETURNING id, name, email, role',
            [hashedPassword, 'ADMIN']
        );

        if (result.rows.length > 0) {
            console.log('✅ Admin password updated successfully!');
            console.log('================================');
            console.log('Email:', result.rows[0].email);
            console.log('New Password:', newPassword);
            console.log('================================');
        } else {
            console.log('No admin found to update.');
        }

    } catch (error) {
        console.error('Error updating password:', error);
    } finally {
        await authPool.end();
    }
}

updateAdminPassword();
