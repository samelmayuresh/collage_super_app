
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const { Pool } = require('pg');

const appDb = new Pool({
    connectionString: process.env.DATABASE_URL_APP,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('🔄 Updating admission_applications status check constraint...');

    try {
        // Drop existing constraint
        await appDb.query(`
            ALTER TABLE admission_applications 
            DROP CONSTRAINT IF EXISTS admission_applications_status_check
        `);
        console.log('✅ Dropped old constraint.');

        // Add new constraint including 'ADMITTED'
        await appDb.query(`
            ALTER TABLE admission_applications 
            ADD CONSTRAINT admission_applications_status_check 
            CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'ADMITTED'))
        `);
        console.log('✅ Added new constraint with ADMITTED status.');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await appDb.end();
    }
}

migrate();
