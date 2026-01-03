require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect()
    .then(client => {
        console.log('Successfully connected to Supabase!');
        return client.query('SELECT NOW()')
            .then(res => {
                console.log('Current DB Time:', res.rows[0].now);
                client.release();
                pool.end();
            });
    })
    .catch(err => {
        console.error('Connection Failed:', err);
        pool.end();
    });
