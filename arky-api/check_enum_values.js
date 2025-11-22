const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function checkEnum() {
    try {
        const res = await pool.query("SELECT unnest(enum_range(NULL::presupuesto_estado))");
        console.log('Current enum values:', res.rows.map(r => r.unnest));
    } catch (err) {
        console.error('Error checking enum:', err);
    } finally {
        await pool.end();
    }
}

checkEnum();
