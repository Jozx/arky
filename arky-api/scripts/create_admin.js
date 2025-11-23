const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const db = require('../src/config/db');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper to mute output for password
rl._writeToOutput = function _writeToOutput(stringToWrite) {
    if (rl.stdoutMuted)
        rl.output.write("*");
    else
        rl.output.write(stringToWrite);
};

const question = (query, hidden = false) => new Promise((resolve) => {
    rl.question(query, (answer) => {
        if (hidden) {
            rl.stdoutMuted = false;
            console.log(); // Add newline after hidden input
        }
        resolve(answer);
    });
    if (hidden) {
        rl.stdoutMuted = true;
    }
});

async function createAdmin() {
    try {
        console.log('--- Create Admin User ---');

        const nombre = await question('Name: ');
        const email = await question('Email: ');
        const password = await question('Password: ', true);

        if (!nombre || !email || !password) {
            console.error('Error: All fields are required.');
            process.exit(1);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert into DB
        const query = `
            INSERT INTO "User" (nombre, email, password_hash, rol)
            VALUES ($1, $2, $3, 'Admin')
            RETURNING id, nombre, email, rol;
        `;

        const { rows } = await db.query(query, [nombre, email, password_hash]);

        console.log('\n✅ Admin user created successfully:');
        console.log(rows[0]);

    } catch (error) {
        console.error('\n❌ Error creating admin:', error.message);
    } finally {
        rl.close();
        process.exit(0);
    }
}

createAdmin();
