import 'dotenv/config';
import { db, authPool } from '../lib/db';

async function listTables() {
    try {
        console.log('Connected to Auth DB');

        const result = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

        console.log('Tables found:', result.rows.map(row => row.table_name));
    } catch (error) {
        console.error('Error listing tables:', error);
    } finally {
        await authPool.end();
    }
}

listTables();
