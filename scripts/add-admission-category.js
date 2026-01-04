
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const { Pool } = require('pg');

const appDb = new Pool({
    connectionString: process.env.DATABASE_URL_APP,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('🔄 Checking admission_category column in admission_applications...');

    try {
        const checkResult = await appDb.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'admission_applications' AND column_name = 'admission_category'
        `);

        if (checkResult.rows.length === 0) {
            console.log('⚠️ admission_category column not found. Adding...');
            await appDb.query('ALTER TABLE admission_applications ADD COLUMN admission_category VARCHAR(20)');
            console.log('✅ admission_category column added successfully!');
        } else {
            console.log('✅ admission_category column already exists.');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await appDb.end();
    }
}

migrate();
