import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { appDb, appPool } from '../lib/db';

async function applyAttendanceSchema() {
    console.log('Applying attendance schema to App Database...');

    try {
        const schemaPath = path.join(__dirname, '../db/schema_attendance.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        await appDb.query(schema);

        console.log('✅ Attendance schema applied successfully!');
        console.log('Tables created:');
        console.log('  - buildings');
        console.log('  - floors (with geo-fencing)');
        console.log('  - classrooms');
        console.log('  - attendance_sessions');
        console.log('  - attendance');

    } catch (error) {
        console.error('❌ Error applying schema:', error);
    } finally {
        await appPool.end();
    }
}

applyAttendanceSchema();
