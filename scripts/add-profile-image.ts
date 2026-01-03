import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function addProfileImageColumn() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL_AUTH,
    });

    try {
        console.log('Adding profile_image column to users table...');

        // Add column if it doesn't exist
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS profile_image TEXT
        `);

        console.log('✅ Migration complete: profile_image column added');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await pool.end();
    }
}

addProfileImageColumn();
