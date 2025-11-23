// verify_schema.js
// Script to verify that all tables were created correctly

// verify_schema.js
// Script to verify that all tables were created correctly

const path = require('path');
const envFile = process.env.NODE_ENV === 'production' ? './.env.prod' : './.env.local';
require('dotenv').config({ path: path.join(__dirname, envFile) });
const db = require('./src/config/db');

async function verifySchema() {
    let output = '';
    const log = (msg) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        log('\n🔍 Verificando estructura de la base de datos...\n');

        // Check all tables
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `;

        const { rows: tables } = await db.query(tablesQuery);

        log('📋 Tablas encontradas:');
        tables.forEach(t => log(`   ✓ ${t.table_name}`));

        // Check ENUMs
        const enumsQuery = `
            SELECT t.typname as enum_name,
                   string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as values
            FROM pg_type t 
            JOIN pg_enum e ON t.oid = e.enumtypid  
            JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
            WHERE n.nspname = 'public'
            GROUP BY t.typname
            ORDER BY t.typname;
        `;

        const { rows: enums } = await db.query(enumsQuery);

        log('\n🏷️  ENUMs encontrados:');
        enums.forEach(e => log(`   ✓ ${e.enum_name}: ${e.values}`));

        // Check admin user
        const adminQuery = `SELECT email, nombre, rol FROM "User" WHERE email = 'admin@arky.com'`;
        const { rows: admin } = await db.query(adminQuery);

        log('\n👤 Usuario Admin:');
        if (admin.length > 0) {
            log(`   ✓ Email: ${admin[0].email}`);
            log(`   ✓ Nombre: ${admin[0].nombre}`);
            log(`   ✓ Rol: ${admin[0].rol}`);
        } else {
            log('   ❌ No se encontró el usuario admin');
        }

        // Expected tables
        const expectedTables = [
            'User', 'arquitecto', 'cliente', 'Obra', 'Presupuesto',
            'Rubro', 'TrackingAvance', 'Pago', 'Avance', 'Archivo', 'schema_version'
        ];

        const foundTableNames = tables.map(t => t.table_name);
        const missingTables = expectedTables.filter(t => !foundTableNames.includes(t));

        log('\n📊 Resumen:');
        log(`   Total de tablas: ${tables.length}`);
        log(`   Total de ENUMs: ${enums.length}`);

        if (missingTables.length > 0) {
            log(`\n⚠️  Tablas faltantes: ${missingTables.join(', ')}`);
        } else {
            log('\n✅ Todas las tablas esperadas están presentes!');
        }

        require('fs').writeFileSync('schema_verification.txt', output);
        log('\n📄 Resultado guardado en schema_verification.txt');

        process.exit(0);
    } catch (error) {
        log('\n❌ Error verificando schema: ' + error.message);
        require('fs').writeFileSync('schema_verification.txt', output);
        process.exit(1);
    }
}

verifySchema();
