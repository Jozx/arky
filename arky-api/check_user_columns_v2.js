require('dotenv').config({ path: '.env.local' });
const db = require('./src/config/db');

async function checkColumns() {
    try {
        const res = await db.query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns 
            WHERE table_name = 'User';
        `);
        console.log(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkColumns();
