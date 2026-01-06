require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { uploadFileToDrive } = require('./src/services/googleDriveService');

// Create a dummy file
const dummyFile = path.join(__dirname, 'test-backup.json');
fs.writeFileSync(dummyFile, JSON.stringify({ test: true }));

console.log('Running test upload...');

uploadFileToDrive(dummyFile, 'test-backup.json')
    .then(result => {
        console.log('Result:', result);
    })
    .catch(err => {
        console.error('CRASHED WITH ERROR:', err);
    });
