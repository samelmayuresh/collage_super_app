const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

// Try loading .env and .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Debug logs
console.log('Auth DB URL defined:', !!process.env.DATABASE_URL_AUTH);
console.log('App DB URL defined:', !!process.env.DATABASE_URL_APP);

// Auth DB Connection (for Roles)
const authDb = new Pool({
    connectionString: process.env.DATABASE_URL_AUTH,
    ssl: { rejectUnauthorized: false }
});

// App DB Connection (for Admission Applications Table)
const appDb = new Pool({
    connectionString: process.env.DATABASE_URL_APP,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('Starting Admission System Migration...');

    try {
        // 1. Update Role Enum (Auth DB)
        // Note: ALTER TYPE ADD VALUE cannot be run inside a transaction block easily if using text query directly in some versions,
        // but typically it works. We'll try individually.
        console.log('Updating Role Enum in Auth DB...');

        try {
            await authDb.query("ALTER TYPE role ADD VALUE IF NOT EXISTS 'OFFICE_STAFF'");
            console.log(' - Added OFFICE_STAFF role');
        } catch (e) {
            console.log(' - OFFICE_STAFF role might already exist or error:', e.message);
        }

        try {
            await authDb.query("ALTER TYPE role ADD VALUE IF NOT EXISTS 'APPLICANT'");
            console.log(' - Added APPLICANT role');
        } catch (e) {
            console.log(' - APPLICANT role might already exist or error:', e.message);
        }

        // 2. Create Admission Applications Table (App DB)
        console.log('Creating admission_applications table in App DB...');
        await appDb.query(`
            CREATE TABLE IF NOT EXISTS admission_applications (
                id SERIAL PRIMARY KEY,
                applicant_id INTEGER NOT NULL, -- Link to Auth DB User ID
                
                -- Personal Details
                full_name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone VARCHAR(20),
                dob DATE,
                gender VARCHAR(20),
                
                -- Address
                address TEXT,
                city VARCHAR(100),
                state VARCHAR(100),
                pincode VARCHAR(20),
                
                -- Academic Details
                tenth_marks DECIMAL(5,2),
                twelfth_marks DECIMAL(5,2),
                preferred_course VARCHAR(100),
                
                -- Application Status
                status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
                remarks TEXT,
                
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log(' - Table admission_applications created/verified.');

        // Add index for faster lookups
        await appDb.query(`
            CREATE INDEX IF NOT EXISTS idx_admission_applicant_id ON admission_applications(applicant_id);
            CREATE INDEX IF NOT EXISTS idx_admission_status ON admission_applications(status);
        `);

        console.log('Migration completed successfully.');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await authDb.end();
        await appDb.end();
    }
}

migrate();
