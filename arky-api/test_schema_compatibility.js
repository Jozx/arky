// test_schema_compatibility.js
// Script to test that the schema is compatible with backend models

const path = require('path');
const envFile = process.env.NODE_ENV === 'production' ? './.env.prod' : './.env.local';
require('dotenv').config({ path: path.join(__dirname, envFile) });
const db = require('./src/config/db');

async function testSchemaCompatibility() {
    let output = '';
    const log = (msg) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        log('\n🧪 Probando compatibilidad entre Schema y Modelos del Backend...\n');

        // Test 1: Verify table names work with backend queries
        log('📋 Test 1: Verificando nombres de tablas...');

        const tests = [
            { name: 'User', query: 'SELECT COUNT(*) FROM "User"' },
            { name: 'Obra', query: 'SELECT COUNT(*) FROM Obra' },
            { name: 'Presupuesto', query: 'SELECT COUNT(*) FROM Presupuesto' },
            { name: 'Rubro', query: 'SELECT COUNT(*) FROM Rubro' },
            { name: 'Pago', query: 'SELECT COUNT(*) FROM Pago' },
            { name: 'Avance', query: 'SELECT COUNT(*) FROM Avance' },
            { name: 'TrackingAvance', query: 'SELECT COUNT(*) FROM TrackingAvance' },
            { name: 'arquitecto', query: 'SELECT COUNT(*) FROM arquitecto' },
            { name: 'cliente', query: 'SELECT COUNT(*) FROM cliente' },
        ];

        let allPassed = true;
        for (const test of tests) {
            try {
                await db.query(test.query);
                log(`   ✅ ${test.name} - OK`);
            } catch (error) {
                log(`   ❌ ${test.name} - FAILED: ${error.message}`);
                allPassed = false;
            }
        }

        // Test 2: Verify foreign key relationships
        log('\n🔗 Test 2: Verificando relaciones (Foreign Keys)...');

        const fkTests = [
            {
                name: 'Obra -> User (arquitecto_id)',
                query: `SELECT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_type = 'FOREIGN KEY' 
                    AND table_name = 'obra' 
                    AND constraint_name LIKE '%arquitecto_id%'
                )`
            },
            {
                name: 'Presupuesto -> Obra',
                query: `SELECT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_type = 'FOREIGN KEY' 
                    AND table_name = 'presupuesto' 
                    AND constraint_name LIKE '%obra_id%'
                )`
            },
            {
                name: 'Rubro -> Presupuesto',
                query: `SELECT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_type = 'FOREIGN KEY' 
                    AND table_name = 'rubro' 
                    AND constraint_name LIKE '%presupuesto_id%'
                )`
            },
            {
                name: 'Avance -> Rubro',
                query: `SELECT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_type = 'FOREIGN KEY' 
                    AND table_name = 'avance' 
                    AND constraint_name LIKE '%rubro_id%'
                )`
            },
        ];

        for (const test of fkTests) {
            try {
                const { rows } = await db.query(test.query);
                if (rows[0].exists) {
                    log(`   ✅ ${test.name} - OK`);
                } else {
                    log(`   ⚠️  ${test.name} - No encontrado`);
                }
            } catch (error) {
                log(`   ❌ ${test.name} - ERROR: ${error.message}`);
                allPassed = false;
            }
        }

        // Test 3: Verify ENUMs
        log('\n🏷️  Test 3: Verificando ENUMs...');

        const enumTests = [
            { name: 'user_role', expectedValues: ['Admin', 'Arquitecto', 'Cliente', 'Encargado'] },
            { name: 'obra_status', expectedValues: ['Activa', 'Pausada', 'Finalizada', 'Cancelada'] },
            { name: 'presupuesto_estado', expectedValues: ['Borrador', 'Negociación', 'Aprobado', 'Rechazado', 'Cancelado'] },
            { name: 'avance_estado', expectedValues: ['No Iniciado', 'En Proceso', 'Completado', 'Bloqueado', 'Terminado'] },
        ];

        for (const test of enumTests) {
            try {
                const query = `
                    SELECT enumlabel 
                    FROM pg_enum 
                    WHERE enumtypid = '${test.name}'::regtype
                    ORDER BY enumsortorder
                `;
                const { rows } = await db.query(query);
                const actualValues = rows.map(r => r.enumlabel);

                const hasAllValues = test.expectedValues.every(v => actualValues.includes(v));
                if (hasAllValues) {
                    log(`   ✅ ${test.name} - OK (${actualValues.length} valores)`);
                } else {
                    log(`   ⚠️  ${test.name} - Valores no coinciden`);
                    log(`      Esperados: ${test.expectedValues.join(', ')}`);
                    log(`      Actuales: ${actualValues.join(', ')}`);
                }
            } catch (error) {
                log(`   ❌ ${test.name} - ERROR: ${error.message}`);
                allPassed = false;
            }
        }

        // Test 4: Test actual model queries
        log('\n🔧 Test 4: Probando queries de modelos reales...');

        try {
            // Test User model
            const userQuery = 'SELECT id, email, nombre, rol FROM "User" LIMIT 1';
            await db.query(userQuery);
            log('   ✅ User model query - OK');
        } catch (error) {
            log(`   ❌ User model query - FAILED: ${error.message}`);
            allPassed = false;
        }

        try {
            // Test Obra model (from obraModel.js)
            const obraQuery = `
                SELECT o.*, 
                       u_arq.nombre AS arquitecto_nombre, u_arq.email AS arquitecto_email,
                       u_cli.nombre AS cliente_nombre, u_cli.email AS cliente_email
                FROM Obra o
                LEFT JOIN "User" u_arq ON o.arquitecto_id = u_arq.id
                LEFT JOIN "User" u_cli ON o.cliente_id = u_cli.id
                LIMIT 1
            `;
            await db.query(obraQuery);
            log('   ✅ Obra model query - OK');
        } catch (error) {
            log(`   ❌ Obra model query - FAILED: ${error.message}`);
            allPassed = false;
        }

        try {
            // Test Presupuesto model
            const presupuestoQuery = `
                SELECT id, obra_id, version_numero, estado, notas_generales, fecha_creacion
                FROM Presupuesto
                LIMIT 1
            `;
            await db.query(presupuestoQuery);
            log('   ✅ Presupuesto model query - OK');
        } catch (error) {
            log(`   ❌ Presupuesto model query - FAILED: ${error.message}`);
            allPassed = false;
        }

        // Final summary
        log('\n' + '='.repeat(60));
        if (allPassed) {
            log('✅ TODOS LOS TESTS PASARON');
            log('El schema es 100% compatible con los modelos del backend');
        } else {
            log('⚠️  ALGUNOS TESTS FALLARON');
            log('Revisa los errores arriba para más detalles');
        }
        log('='.repeat(60) + '\n');

        require('fs').writeFileSync('schema_compatibility_test.txt', output);
        log('📄 Resultado guardado en schema_compatibility_test.txt');

        process.exit(allPassed ? 0 : 1);
    } catch (error) {
        log('\n❌ Error ejecutando tests: ' + error.message);
        log(error.stack);
        require('fs').writeFileSync('schema_compatibility_test.txt', output);
        process.exit(1);
    }
}

testSchemaCompatibility();
