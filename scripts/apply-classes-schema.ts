import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function applyClassesSchema() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL_APP,
    });

    try {
        console.log('📚 Applying classes schema...');

        const schemaPath = path.join(__dirname, '../db/schema_classes.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        await pool.query(schema);

        console.log('✅ Classes schema applied successfully!');
        console.log('   - classes table');
        console.log('   - subjects table');
        console.log('   - teacher_assignments table');
        console.log('   - student_classes table');
        console.log('   - calendar_events table');
        console.log('   - Updated attendance_sessions with class_id, subject_id');
    } catch (error) {
        console.error('❌ Failed to apply schema:', error);
    } finally {
        await pool.end();
    }
}

applyClassesSchema();
