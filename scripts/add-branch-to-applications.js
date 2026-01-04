
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const { Pool } = require('pg');

const appDb = new Pool({
    connectionString: process.env.DATABASE_URL_APP,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('🔄 Checking branch column in admission_applications...');

    try {
        const checkResult = await appDb.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'admission_applications' AND column_name = 'branch'
        `);

        if (checkResult.rows.length === 0) {
            console.log('⚠️ branch column not found. Adding...');
            await appDb.query('ALTER TABLE admission_applications ADD COLUMN branch VARCHAR(50)');
            console.log('✅ branch column added successfully!');
        } else {
            console.log('✅ branch column already exists.');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await appDb.end();
    }
}

migrate();
