const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function addCancelado() {
    const client = await pool.connect();
    try {
        console.log('Checking current enum values...');
        const checkResult = await client.query(`
            SELECT enumlabel 
            FROM pg_enum 
            WHERE enumtypid = 'presupuesto_estado'::regtype
            ORDER BY enumsortorder;
        `);

        const currentValues = checkResult.rows.map(r => r.enumlabel);
        console.log('Current values:', currentValues);

        if (currentValues.includes('Cancelado')) {
            console.log('✓ Cancelado already exists in enum');
        } else {
            console.log('Adding Cancelado to enum...');
            await client.query(`ALTER TYPE presupuesto_estado ADD VALUE 'Cancelado'`);
            console.log('✓ Successfully added Cancelado to enum');
        }

        // Verify final state
        const finalResult = await client.query(`
            SELECT enumlabel 
            FROM pg_enum 
            WHERE enumtypid = 'presupuesto_estado'::regtype
            ORDER BY enumsortorder;
        `);
        console.log('Final enum values:', finalResult.rows.map(r => r.enumlabel));

    } catch (err) {
        console.error('Error:', err.message);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

addCancelado().catch(console.error);
