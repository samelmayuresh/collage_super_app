const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const content = `DATABASE_URL="postgresql://neondb_owner:npg_zbpm4IifAoU2@ep-old-base-adm65gc3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="your-secret-key-change-this"
`;

try {
    fs.writeFileSync(envPath, content, 'utf-8');
    console.log('.env file updated successfully to Neon DB.');
} catch (e) {
    console.error('Failed to write .env file:', e);
}
