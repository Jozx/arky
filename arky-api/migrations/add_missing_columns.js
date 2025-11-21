// Migration script to add missing columns
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
});

async function runMigration() {
    try {
        console.log('Starting migration...');

        // Add notas_generales column to Presupuesto table
        await pool.query(`
            ALTER TABLE Presupuesto 
            ADD COLUMN IF NOT EXISTS notas_generales TEXT;
        `);
        console.log('✓ Added notas_generales column to Presupuesto table');

        // Add observaciones column to Rubro table
        await pool.query(`
            ALTER TABLE Rubro 
            ADD COLUMN IF NOT EXISTS observaciones TEXT;
        `);
        console.log('✓ Added observaciones column to Rubro table');

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
