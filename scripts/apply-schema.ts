import 'dotenv/config';
import { db, authPool } from '../lib/db';
import fs from 'fs';
import path from 'path';

async function applySchema() {
    try {
        const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        console.log('Applying schema...');
        await db.query(schema);
        console.log('Schema applied successfully.');
    } catch (error) {
        console.error('Error applying schema:', error);
    } finally {
        await authPool.end();
    }
}

applySchema();
