const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL_APP,
    ssl: { rejectUnauthorized: false }
});

async function listTables() {
    try {
        console.log('Connecting to database...');
        const client = await pool.connect();

        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);

        console.log('Tables found:', res.rows.map(r => r.table_name));

        client.release();
    } catch (err) {
        console.error('Database error:', err);
    } finally {
        pool.end();
    }
}

listTables();
