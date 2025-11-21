// arky-api/src/services/userService.js
const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Registra un nuevo usuario (Arquitecto o Cliente).
 */
async function registerUser(email, password, nombre, rol, numero_licencia, cif_empresa) {
    if (!email || !password || !nombre || !rol) {
        throw new Error('Todos los campos son requeridos.');
    }

    // 1. Verificar si el usuario ya existe
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
        throw new Error('El email ya está registrado.');
    }

    // 2. Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 3. Crear el usuario en la DB
    const newUser = await userModel.create(email, password_hash, nombre, rol, numero_licencia, cif_empresa);

    // 4. Generar el token
    const token = jwt.sign(
        { id: newUser.id, rol: newUser.rol },
        JWT_SECRET,
        { expiresIn: '1d' }
    );

    return { user: newUser, token };
}

/**
 * Autentica a un usuario.
 */
async function loginUser(email, password) {
    // 1. Buscar usuario por email
    const user = await userModel.findByEmail(email);
    if (!user) {
        throw new Error('Credenciales inválidas.');
    }

    // 2. Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw new Error('Credenciales inválidas.');
    }

    // 3. Generar token
    const token = jwt.sign(
        { id: user.id, rol: user.rol },
        JWT_SECRET,
        { expiresIn: '1d' }
    );

    // Devolvemos el perfil sin el hash de la contraseña
    const { password_hash, ...userProfile } = user;

    return { user: userProfile, token };
}

/**
 * Obtiene usuarios por rol.
 */
async function getUsersByRole(rol) {
    return await userModel.findByRole(rol);
}

module.exports = {
    registerUser,
    loginUser,
    getUsersByRole,
};