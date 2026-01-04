const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL_APP,
    ssl: { rejectUnauthorized: false }
});

async function applySchema() {
    try {
        console.log('Applying multimedia schema...');
        const schema = fs.readFileSync('db/schema_multimedia_events.sql', 'utf8');
        const client = await pool.connect();
        await client.query(schema);
        console.log('✅ Multimedia schema applied successfully!');
        client.release();
    } catch (err) {
        console.error('❌ Error applying schema:', err);
    } finally {
        pool.end();
    }
}

applySchema();
