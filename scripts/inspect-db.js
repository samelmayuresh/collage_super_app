const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL_APP,
    ssl: { rejectUnauthorized: false }
});

async function inspectDB() {
    try {
        const client = await pool.connect();

        console.log('--- ADMINS ---');
        const admins = await client.query('SELECT * FROM admins LIMIT 5');
        console.log(admins.rows);

        console.log('--- EVENTS TABLE DEFN ---');
        // Get constraint info
        const constraints = await client.query(`
            SELECT conname, pg_get_constraintdef(c.oid)
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE conrelid = 'events'::regclass
        `);
        console.log(constraints.rows);

        client.release();
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

inspectDB();
