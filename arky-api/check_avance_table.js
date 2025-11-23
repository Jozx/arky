const path = require('path');
const envFile = process.env.NODE_ENV === 'production' ? './.env.prod' : './.env.local';
require('dotenv').config({ path: path.join(__dirname, envFile) });
const db = require('./src/config/db');

const fs = require('fs');

async function checkTable() {
    try {
        let log = 'Checking if Avance table exists...\n';
        const res = await db.query("SELECT to_regclass('public.Avance')");
        log += `Result: ${JSON.stringify(res.rows[0])}\n`;

        if (!res.rows[0].to_regclass) {
            log += 'Table Avance does not exist. Creating it now...\n';
            const createSql = `
                CREATE TABLE IF NOT EXISTS Avance (
                    id SERIAL PRIMARY KEY,
                    rubro_id INTEGER REFERENCES Rubro(id) ON DELETE CASCADE,
                    obra_id INTEGER REFERENCES Obra(id) ON DELETE CASCADE,
                    image_url TEXT NOT NULL,
                    fecha_registro TIMESTAMP DEFAULT NOW(),
                    uploaded_by INTEGER REFERENCES "User"(id),
                    descripcion TEXT
                );
            `;
            await db.query(createSql);
            log += '✅ Avance table created successfully.\n';
        } else {
            log += '✅ Avance table already exists.\n';
        }
        fs.writeFileSync('migration_log.txt', log);
    } catch (error) {
        fs.writeFileSync('migration_log.txt', `❌ Error: ${error.message}\n${error.stack}`);
    } finally {
        process.exit();
    }
}

checkTable();
