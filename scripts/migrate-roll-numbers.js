const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL_APP,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration for roll numbers...');

        await client.query('BEGIN');

        // Add roll_number column if it doesn't exist
        console.log('Adding roll_number column to student_classrooms...');
        await client.query(`
            ALTER TABLE student_classrooms 
            ADD COLUMN IF NOT EXISTS roll_number INTEGER;
        `);

        // Add unique constraint per classroom
        // Note: We name it clearly so we can check/drop if needed
        console.log('Adding unique constraint...');

        // We might want to clear old duplicates if any exist (unlikely given it's new)
        // Or check if constraint exists

        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'unique_classroom_roll_number'
                ) THEN
                    ALTER TABLE student_classrooms 
                    ADD CONSTRAINT unique_classroom_roll_number UNIQUE (classroom_id, roll_number);
                END IF;
            END $$;
        `);

        await client.query('COMMIT');
        console.log('Migration completed successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
