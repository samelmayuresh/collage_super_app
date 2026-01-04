const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL_APP,
    ssl: { rejectUnauthorized: false }
});

async function checkTables() {
    try {
        console.log('Checking database connection...');
        const client = await pool.connect();
        console.log('Connected.');

        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('events', 'announcements', 'alerts');
        `);

        console.log('Found tables:', res.rows.map(r => r.table_name));

        if (res.rows.length < 3) {
            console.log('❌ MISSING TABLES! You need to run db/schema_events.sql');
        } else {
            console.log('✅ All tables present.');
        }

        client.release();
    } catch (err) {
        console.error('Database error:', err);
    } finally {
        pool.end();
    }
}

checkTables();
