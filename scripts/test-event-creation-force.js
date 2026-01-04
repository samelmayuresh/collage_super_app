const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL_APP,
    ssl: { rejectUnauthorized: false }
});

async function testCreateEventForce() {
    try {
        console.log('Connecting to database...');
        const client = await pool.connect();

        // Skip fetching user. Use dummy ID 999.
        const userId = 999;

        // 2. Try to create an event
        console.log('Attempting to create a test event (Force User 999)...');
        const eventData = {
            title: 'Test Event Force',
            description: 'Created via debug script without user check',
            event_type: 'general',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 86400000).toISOString(),
            location: 'Debug Console',
            is_mandatory: false,
            target_roles: [],
            created_by: userId
        };

        const insertRes = await client.query(`
            INSERT INTO events (
                title, description, event_type, start_date, end_date, 
                location, is_mandatory, target_roles, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `, [
            eventData.title, eventData.description, eventData.event_type,
            eventData.start_date, eventData.end_date, eventData.location,
            eventData.is_mandatory, eventData.target_roles, eventData.created_by
        ]);

        console.log('✅ Event created successfully:', insertRes.rows[0]);

        // 3. Try to create an announcement
        console.log('Attempting to create a test announcement (Force User 999)...');
        const annData = {
            title: 'Test Announcement Force',
            content: 'Created via debug script without user check',
            priority: 'normal',
            target_roles: [],
            is_pinned: false,
            created_by: userId
        };

        const annRes = await client.query(`
            INSERT INTO announcements (
                title, content, priority, target_roles, is_pinned, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [
            annData.title, annData.content, annData.priority,
            annData.target_roles, annData.is_pinned, annData.created_by
        ]);

        console.log('✅ Announcement created successfully:', annRes.rows[0]);

        client.release();
    } catch (err) {
        console.error('❌ Error during creation test:', err);
    } finally {
        pool.end();
    }
}

testCreateEventForce();
