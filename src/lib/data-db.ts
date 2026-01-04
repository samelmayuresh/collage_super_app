import { Pool } from 'pg';

if (!process.env.DATABASE_URL_DATA_PIPELINE) {
    throw new Error('DATABASE_URL_DATA_PIPELINE is not defined in .env');
}

export const dataDb = new Pool({
    connectionString: process.env.DATABASE_URL_DATA_PIPELINE,
    ssl: true, // Neon requires SSL
});

// Helper to sanitize table names (basic prevention)
export const sanitizeTableName = (name: string) => {
    return name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
};
