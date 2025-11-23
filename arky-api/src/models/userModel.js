// arky-api/src/models/userModel.js
const db = require('../config/db');

/**
 * Busca un usuario por su email.
 */
async function findByEmail(email) {
    // La tabla "User" usa comillas dobles
    const query = 'SELECT id, email, password_hash, nombre, rol, is_active FROM "User" WHERE email = $1';
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
        RETURNING id, email, nombre, rol, is_active, created_at`;

    const { rows } = await db.query(userQuery, [email, password_hash, nombre, rol]);
    const newUser = rows[0];

    // 2. Insertar en tabla específica según rol
    if (rol === 'Cliente') {
        await db.query('INSERT INTO cliente (user_id, cif_empresa) VALUES ($1, $2)', [newUser.id, cif_empresa]);
    } else if (rol === 'Arquitecto') {
        await db.query('INSERT INTO arquitecto (user_id, numero_licencia) VALUES ($1, $2)', [newUser.id, numero_licencia]);
    }
    // Si es Admin o Encargado, no se inserta en tablas adicionales por ahora.

    return newUser;
}

/**
 * Busca usuarios por su rol.
 */
async function findByRole(rol) {
    const query = 'SELECT id, email, nombre, rol, is_active, created_at FROM "User" WHERE rol = $1 ORDER BY nombre ASC';
    const { rows } = await db.query(query, [rol]);
    return rows;
}

/**
 * Obtiene todos los usuarios (para Admin).
 */
async function findAll() {
    const query = `
        SELECT id, email, nombre, rol, is_active, created_at 
        FROM "User" 
        ORDER BY created_at DESC`;
    const { rows } = await db.query(query);
    return rows;
}

/**
 * Actualiza datos básicos del usuario.
 */
async function update(id, nombre, email) {
    const query = `
        UPDATE "User"
        SET nombre = $1, email = $2
        WHERE id = $3
        RETURNING id, nombre, email, rol, is_active`;
    const { rows } = await db.query(query, [nombre, email, id]);
    return rows[0];
}

/**
 * Actualiza el estado (activo/inactivo) del usuario.
 */
async function updateStatus(id, isActive) {
    const query = `
        UPDATE "User"
        SET is_active = $1
        WHERE id = $2
        RETURNING id, is_active`;
    const { rows } = await db.query(query, [isActive, id]);
    return rows[0];
}

/**
 * Guarda el token de reseteo de contraseña.
 */
async function saveResetToken(userId, tokenHash, expiresAt) {
    const query = `
        UPDATE "User" 
        SET password_reset_token = $1, password_reset_expires = $2 
        WHERE id = $3`;
    await db.query(query, [tokenHash, expiresAt, userId]);
}

/**
 * Busca usuario por token de reseteo válido.
 */
async function findByResetToken(tokenHash) {
    const query = `
        SELECT id, email, nombre, rol 
        FROM "User" 
        WHERE password_reset_token = $1 
        AND password_reset_expires > NOW()`;
    const { rows } = await db.query(query, [tokenHash]);
    return rows[0] || null;
}

/**
 * Actualiza la contraseña y limpia el token de reseteo.
 */
async function updatePassword(userId, newPasswordHash) {
    const query = `
        UPDATE "User" 
        SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL 
        WHERE id = $2`;
    await db.query(query, [newPasswordHash, userId]);
}

module.exports = {
    findByEmail,
    create,
    findByRole,
    findAll,
    update,
    updateStatus,
    saveResetToken,
    findByResetToken,
    updatePassword,
};