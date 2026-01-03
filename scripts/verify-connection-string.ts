import 'dotenv/config';

const userProvidedUrl = 'postgresql://neondb_owner:npg_zbpm4IifAoU2@ep-old-base-adm65gc3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const currentUrl = process.env.DATABASE_URL;

if (!currentUrl) {
    console.log('DATABASE_URL is not set in the environment.');
} else if (currentUrl === userProvidedUrl) {
    console.log('MATCH: The environment DATABASE_URL matches the user provided string.');
} else {
    console.log('MISMATCH: The environment DATABASE_URL does NOT match.');
    console.log('Current Host:', new URL(currentUrl).host);
    console.log('Provided Host:', new URL(userProvidedUrl).host);
}
