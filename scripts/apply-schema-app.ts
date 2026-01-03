import 'dotenv/config';
import { appDb, appPool } from '../lib/db';
import fs from 'fs';
import path from 'path';

async function applyAppSchema() {
    try {
        const schemaPath = path.join(process.cwd(), 'db', 'schema_app.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        console.log('Applying App DB schema...');
        await appDb.query(schema);
        console.log('App DB schema applied successfully.');
    } catch (error) {
        console.error('Error applying App DB schema:', error);
    } finally {
        await appPool.end();
    }
}

applyAppSchema();
