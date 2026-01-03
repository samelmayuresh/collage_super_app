import { Pool } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL_AUTH) {
    throw new Error('DATABASE_URL_AUTH is not defined');
}
if (!process.env.DATABASE_URL_APP) {
    throw new Error('DATABASE_URL_APP is not defined');
}

// Auth Database Connection (Credentials)
export const authPool = new Pool({
    connectionString: process.env.DATABASE_URL_AUTH,
});

// App Database Connection (Application Data)
export const appPool = new Pool({
    connectionString: process.env.DATABASE_URL_APP,
});

export const authDb = {
    query: (text: string, params?: any[]) => authPool.query(text, params),
};

export const appDb = {
    query: (text: string, params?: any[]) => appPool.query(text, params),
};

// Fallback for generic usage if needed (deprecated)
export const db = authDb;

