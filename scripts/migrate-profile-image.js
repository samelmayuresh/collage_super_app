/**
 * Migration script to add profile_image column if it doesn't exist
 * Run: node scripts/migrate-profile-image.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const { Pool } = require('pg');

const authDb = new Pool({
    connectionString: process.env.DATABASE_URL_AUTH,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('🔄 Checking profile_image column...');

    try {
        // Check if column exists
        const checkResult = await authDb.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'profile_image'
        `);

        if (checkResult.rows.length === 0) {
            console.log('⚠️ profile_image column not found. Adding...');
            await authDb.query('ALTER TABLE users ADD COLUMN profile_image TEXT');
            console.log('✅ profile_image column added successfully!');
        } else {
            console.log('✅ profile_image column already exists.');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await authDb.end();
    }
}

migrate();
