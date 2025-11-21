const fs = require('fs');
const path = require('path');
const db = require('./src/config/db');

async function runMigration() {
    try {
        const migrationPath = path.join(__dirname, 'migrations', 'add_user_columns.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');
        console.log('Running migration:', migrationPath);
        await db.query(sql);
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Error running migration:', err);
    } finally {
        // We need to close the pool to exit the script
        // Assuming db.query uses a pool, we might need to access the pool directly to end it.
        // If db module exports query function, we might rely on process.exit() but it's better to close connection.
        // Looking at db.js might be needed, but process.exit(0) usually works for scripts.
        process.exit(0);
    }
}

runMigration();
