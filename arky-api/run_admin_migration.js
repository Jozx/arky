require('dotenv').config({ path: '.env.local' });
const db = require('./src/config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', 'add_admin_role.sql'), 'utf8');
        console.log('Running migration...');
        await db.query(sql);
        console.log('✅ Migration completed successfully.');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        process.exit();
    }
}

runMigration();
