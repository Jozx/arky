const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./src/config/db');

async function checkColumns() {
    try {
        const tables = ['obra', 'presupuesto', 'rubro', 'pago', 'user', 'arquitecto', 'cliente'];
        for (const table of tables) {
            console.log(`\nChecking ${table} table columns...`);
            const res = await db.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '${table}';
            `);
            console.log(res.rows.map(r => `${r.column_name} (${r.data_type})`));
        }
    } catch (err) {
        console.error('Error checking columns:', err);
    } finally {
        process.exit();
    }
}

checkColumns();
