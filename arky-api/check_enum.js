require('dotenv').config({ path: '.env.local' });
const db = require('./src/config/db');

async function checkEnum() {
    try {
        const res = await db.query(`
            SELECT unnest(enum_range(NULL::user_role)) AS role;
        `);
        console.log('Current user_role values:', res.rows.map(r => r.role));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkEnum();
