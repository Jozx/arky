require('dotenv').config();
const db = require('./src/config/db');
const fs = require('fs');
const path = require('path');

async function addFinalizada() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', 'add_finalizada_to_obra_enum.sql'), 'utf8');
        await db.query(sql);
        console.log('✅ Successfully added "Finalizada" to estado_obra enum');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding "Finalizada" to estado_obra enum:', error.message);
        process.exit(1);
    }
}

addFinalizada();
