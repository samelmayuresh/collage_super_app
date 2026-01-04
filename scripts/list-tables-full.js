const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL_APP,
    ssl: { rejectUnauthorized: false }
});

async function listTablesFull() {
    try {
        const client = await pool.connect();
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        console.log('--- TABLES ---');
        res.rows.forEach(r => console.log(r.table_name));
        console.log('--------------');
        client.release();
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

listTablesFull();
