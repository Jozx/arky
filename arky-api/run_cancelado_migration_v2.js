const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function runMigration() {
    try {
        console.log('Attempting to add Cancelado to enum...');
        // We use a DO block to avoid errors if it already exists (though IF NOT EXISTS should handle it in newer PG versions)
        // But ALTER TYPE ... ADD VALUE cannot run inside a transaction block in some contexts.
        // However, node-postgres query() is auto-commit unless we start a transaction.

        await pool.query("ALTER TYPE presupuesto_estado ADD VALUE IF NOT EXISTS 'Cancelado'");
        console.log('Migration successful: Added Cancelado to enum');

        // Verify
        const res = await pool.query("SELECT unnest(enum_range(NULL::presupuesto_estado))");
        console.log('Current enum values:', res.rows.map(r => r.unnest));

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

runMigration();
