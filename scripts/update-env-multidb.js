const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const content = `DATABASE_URL_AUTH="postgresql://neondb_owner:npg_zbpm4IifAoU2@ep-old-base-adm65gc3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DATABASE_URL_APP="postgresql://neondb_owner:npg_lui7zyd6FbOv@ep-crimson-paper-adlzo9s3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="your-secret-key-change-this"
DATABASE_URL="postgresql://neondb_owner:npg_zbpm4IifAoU2@ep-old-base-adm65gc3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
`;
// Note: Keeping DATABASE_URL as a fallback for now pointing to Auth DB to avoid breaking things immediately if I missed a ref.

try {
    fs.writeFileSync(envPath, content, 'utf-8');
    console.log('.env file updated for Multi-DB (Auth + App).');
} catch (e) {
    console.error('Failed to write .env file:', e);
}
