// create_admin_production.js
// Script to create admin user directly in Neon production database
// Run this with: node create_admin_production.js

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function createAdminInProduction() {
    // You need to set your Neon DATABASE_URL here
    const DATABASE_URL = process.env.DATABASE_URL || process.argv[2];

    if (!DATABASE_URL) {
        console.error('\n❌ Error: DATABASE_URL not provided');
        console.log('\nUsage:');
        console.log('  DATABASE_URL="your-neon-url" node create_admin_production.js');
        console.log('  OR');
        console.log('  node create_admin_production.js "your-neon-url"');
        console.log('\nGet your DATABASE_URL from Neon dashboard\n');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('\n🔐 Creating admin user in production database...\n');

        // Admin credentials
        const email = 'admin@arky.com';
        const password = 'admin123';
        const nombre = 'Administrador';
        const rol = 'Admin';

        // Generate bcrypt hash
        console.log('⏳ Generating password hash...');
        const password_hash = await bcrypt.hash(password, 10);
        console.log('✅ Hash generated');

        // Check if user already exists
        console.log('⏳ Checking if user exists...');
        const checkQuery = 'SELECT * FROM "User" WHERE email = $1';
        const checkResult = await pool.query(checkQuery, [email]);

        if (checkResult.rows.length > 0) {
            console.log('⚠️  User already exists. Updating password...');

            const updateQuery = `
                UPDATE "User" 
                SET password_hash = $1, is_active = TRUE
                WHERE email = $2
                RETURNING id, email, nombre, rol
            `;
            const updateResult = await pool.query(updateQuery, [password_hash, email]);

            console.log('\n✅ Admin user updated successfully:');
            console.log(updateResult.rows[0]);
        } else {
            console.log('⏳ Creating new admin user...');

            const insertQuery = `
                INSERT INTO "User" (email, password_hash, nombre, rol, is_active)
                VALUES ($1, $2, $3, $4, TRUE)
                RETURNING id, email, nombre, rol
            `;
            const insertResult = await pool.query(insertQuery, [email, password_hash, nombre, rol]);

            console.log('\n✅ Admin user created successfully:');
            console.log(insertResult.rows[0]);
        }

        console.log('\n📋 Login credentials:');
        console.log('   Email:', email);
        console.log('   Password:', password);
        console.log('\n⚠️  IMPORTANT: Change this password after first login!\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\nFull error:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

createAdminInProduction();
