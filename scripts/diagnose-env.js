const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');

if (fs.existsSync(envPath)) {
    console.log('.env file FOUND.');
    const content = fs.readFileSync(envPath, 'utf-8');
    console.log('--- CONTENT START ---');
    console.log(content);
    console.log('--- CONTENT END ---');
} else {
    console.log('.env file NOT FOUND.');
}
