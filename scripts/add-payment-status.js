
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const { Pool } = require('pg');

const appDb = new Pool({
    connectionString: process.env.DATABASE_URL_APP,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('🔄 Checking payment_status column in admission_applications...');

    try {
        const checkResult = await appDb.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'admission_applications' AND column_name = 'payment_status'
        `);

        if (checkResult.rows.length === 0) {
            console.log('⚠️ payment_status column not found. Adding...');
            await appDb.query("ALTER TABLE admission_applications ADD COLUMN payment_status VARCHAR(20) DEFAULT 'UNPAID'");
            console.log('✅ payment_status column added successfully!');
        } else {
            console.log('✅ payment_status column already exists.');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await appDb.end();
    }
}

migrate();
