const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

// Try loading .env and .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Verify connection string
if (!process.env.DATABASE_URL_APP) {
    console.error('Error: DATABASE_URL_APP is not defined. Please check .env or .env.local');
    process.exit(1);
}

const appPool = new Pool({
    connectionString: process.env.DATABASE_URL_APP,
    ssl: true
});

async function migrate() {
    try {
        console.log('Starting migration...');

        // Create branches table
        await appPool.query(`
            CREATE TABLE IF NOT EXISTS branches (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                code VARCHAR(50),
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Created branches table');

        // Create teacher_branches table
        await appPool.query(`
            CREATE TABLE IF NOT EXISTS teacher_branches (
                id SERIAL PRIMARY KEY,
                teacher_id INT NOT NULL,
                branch_id INT REFERENCES branches(id) ON DELETE CASCADE,
                assigned_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(teacher_id)
            );
        `);
        console.log('Created teacher_branches table');

        // Create indexes
        await appPool.query(`CREATE INDEX IF NOT EXISTS idx_teacher_branches_teacher ON teacher_branches(teacher_id);`);
        await appPool.query(`CREATE INDEX IF NOT EXISTS idx_teacher_branches_branch ON teacher_branches(branch_id);`);
        console.log('Created indexes');

        console.log('Migration complete!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await appPool.end();
    }
}

migrate();
