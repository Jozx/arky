const fs = require('fs');
const path = require('path');
const db = require('./src/config/db');

async function runMigration() {
    try {
        const migrationPath = path.join(__dirname, 'migrations', 'add_payment_fields.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');
        console.log('Running migration: add_payment_fields.sql');
        await db.query(sql);
        console.log('✅ Migration completed successfully.');
    } catch (err) {
        console.error('❌ Error running migration:', err);
    } finally {
        process.exit(0);
    }
}

runMigration();
