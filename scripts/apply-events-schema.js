const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL_APP,
    ssl: { rejectUnauthorized: false }
});

async function applySchema() {
    try {
        console.log('Connecting to database...');
        const client = await pool.connect();
        console.log('Connected.');

        const schemaPath = path.join(__dirname, '../db/schema_events.sql');
        console.log(`Reading schema from ${schemaPath}...`);

        try {
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            console.log('Schema read successfully. Executing...');

            await client.query(schemaSql);
            console.log('✅ Schema applied successfully!');

        } catch (err) {
            console.error('Error reading/executing schema:', err);
        }

        client.release();
    } catch (err) {
        console.error('Database connection error:', err);
    } finally {
        pool.end();
    }
}

applySchema();
