// generate_admin_hash.js
// Script to generate a proper bcrypt hash for the admin password

const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    console.log('\n=== Admin Password Hash ===');
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\nReplace line 196 in schema.sql with this hash:');
    console.log(`    '$${hash}',`);
    console.log('\n⚠️  Remember to change this password after first login in production!\n');
}

generateHash();
