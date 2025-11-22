const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('./config/db');

async function runMigration() {
    try {
        const sqlPath = path.join(__dirname, '../migrations', 'add_missing_role_columns.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Running migration...');
        await db.query(sql);
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

runMigration();
