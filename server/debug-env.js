require('dotenv').config();
const path = require('path');
const fs = require('fs');

console.log('--- ENV DEBUG START ---');
console.log('Current Directory:', process.cwd());
const envPath = path.join(process.cwd(), '.env');
console.log('.env file exists?', fs.existsSync(envPath));

console.log('SMTP_HOST:', process.env.SMTP_HOST || 'MISSING');
console.log('SMTP_PORT:', process.env.SMTP_PORT || 'MISSING');
console.log('SMTP_USER:', process.env.SMTP_USER ? 'LOADED (Hidden)' : 'MISSING');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'LOADED (Hidden)' : 'MISSING');
console.log('--- ENV DEBUG END ---');
