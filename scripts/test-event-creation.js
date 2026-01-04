const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL_APP,
    ssl: { rejectUnauthorized: false }
});

async function testCreateEvent() {
    try {
        console.log('Connecting to database...');
        const client = await pool.connect();

        // 1. Get a valid user ID (admin or teacher)
        console.log('Fetching a valid user...');
        const userRes = await client.query("SELECT id, role, name FROM users WHERE role IN ('ADMIN', 'TEACHING') LIMIT 1");

        if (userRes.rows.length === 0) {
            console.log('❌ No Admin or Teacher found in users table. Cannot test creation.');
            client.release();
            return;
        }

        const user = userRes.rows[0];
        console.log(`Found user: ${user.name} (${user.role}, ID: ${user.id})`);

        // 2. Try to create an event
        console.log('Attempting to create a test event...');
        const eventData = {
            title: 'Test Event CLI',
            description: 'Created via debug script',
            event_type: 'general',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 86400000).toISOString(),
            location: 'Debug Console',
            is_mandatory: false,
            target_roles: [],
            created_by: user.id
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
        console.log('Attempting to create a test announcement...');
        const annData = {
            title: 'Test Announcement CLI',
            content: 'Created via debug script',
            priority: 'normal',
            target_roles: [],
            is_pinned: false,
            created_by: user.id
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

testCreateEvent();
