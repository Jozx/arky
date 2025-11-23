const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
});

async function runMigration() {
    try {
        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'migrations', 'add_terminado_to_enum.sql'),
            'utf8'
        );

        console.log('Running migration: add_terminado_to_enum.sql');
        await pool.query(migrationSQL);
        console.log('✅ Migration completed successfully!');
        console.log('   Added "Terminado" to avance_estado enum');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();
