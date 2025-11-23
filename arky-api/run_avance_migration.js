const path = require('path');
const envFile = process.env.NODE_ENV === 'production' ? './.env.prod' : './.env.local';
require('dotenv').config({ path: path.join(__dirname, envFile) });
const db = require('./src/config/db');
const fs = require('fs');

async function runMigration() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'migrations/create_avance_table.sql'), 'utf8');
        await db.query(sql);
        console.log('✅ Avance table created successfully.');
    } catch (error) {
        console.error('❌ Error creating Avance table:', error);
    } finally {
        process.exit();
    }
}

runMigration();
