// generate_production_admin.js
// Generate a valid bcrypt hash for admin password

const bcrypt = require('bcryptjs');

async function generateAdmin() {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);

    console.log('\n=== SQL para crear Admin en Neon ===\n');
    console.log(`INSERT INTO "User" (email, password_hash, nombre, rol, is_active)`);
    console.log(`VALUES (`);
    console.log(`    'admin@arky.com',`);
    console.log(`    '${hash}',`);
    console.log(`    'Administrador',`);
    console.log(`    'Admin',`);
    console.log(`    TRUE`);
    console.log(`)`);
    console.log(`ON CONFLICT (email) DO NOTHING;`);
    console.log('\n');
    console.log('📋 Copia el SQL de arriba y ejecútalo en Neon SQL Editor');
    console.log('⚠️  Recuerda cambiar la contraseña después del primer login!\n');
}

generateAdmin();
