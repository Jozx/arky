// arky-api/src/models/userModel.js
const db = require('../config/db');

/**
 * Busca un usuario por su email.
 */
async function findByEmail(email) {
    // La tabla "User" usa comillas dobles
    const query = 'SELECT id, email, password_hash, nombre, rol FROM "User" WHERE email = $1';
    const { rows } = await db.query(query, [email]);
    return rows[0] || null;
}

/**
 * Crea un nuevo usuario y su entrada en la tabla cliente o arquitecto si aplica.
 */
async function create(email, password_hash, nombre, rol, numero_licencia, cif_empresa) {
    // 1. Insertar en la tabla principal "User"
    const userQuery = `
        INSERT INTO "User" (email, password_hash, nombre, rol)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, nombre, rol`;

    const { rows } = await db.query(userQuery, [email, password_hash, nombre, rol]);
    const newUser = rows[0];

    // 2. Insertar en tabla específica según rol
    if (rol === 'Cliente') {
        await db.query('INSERT INTO cliente (user_id, cif_empresa) VALUES ($1, $2)', [newUser.id, cif_empresa]);
    } else if (rol === 'Arquitecto') {
        await db.query('INSERT INTO arquitecto (user_id, numero_licencia) VALUES ($1, $2)', [newUser.id, numero_licencia]);
    }

    return newUser;
}

/**
 * Busca usuarios por su rol.
 */
async function findByRole(rol) {
    const query = 'SELECT id, email, nombre, rol FROM "User" WHERE rol = $1 ORDER BY nombre ASC';
    const { rows } = await db.query(query, [rol]);
    return rows;
}

module.exports = {
    findByEmail,
    create,
    findByRole,
};