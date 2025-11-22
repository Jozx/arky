const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./src/config/db');

async function checkColumns() {
    try {
        console.log('Checking Cliente table columns...');
        const res = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'cliente';
        `);
        console.log('Columns in Cliente table:', res.rows);
    } catch (err) {
        console.error('Error checking columns:', err);
    } finally {
        process.exit();
    }
}

checkColumns();
