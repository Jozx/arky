const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const crypto = require('crypto');

/**
 * Genera una contraseña temporal segura.
 */
const generateTempPassword = (length = 10) => {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
};

/**
 * Registra un nuevo Arquitecto (Solo Admin).
 */
const registerArchitect = catchAsync(async (req, res, next) => {
    const { email, nombre, numero_licencia } = req.body;

    // Verificar que quien llama es Admin (esto también se puede hacer en middleware de ruta)
    if (req.user.rol !== 'Admin') {
        return next(new AppError('No tienes permisos para realizar esta acción.', 403));
    }

    // Generar contraseña temporal
    const tempPassword = generateTempPassword();

    // Crear usuario con rol Arquitecto
    const newUser = await userService.registerUser(email, tempPassword, nombre, 'Arquitecto', numero_licencia);

    // En un entorno real, aquí se enviaría un email.
    // Para este MVP, devolvemos la contraseña en la respuesta (o la logueamos).
    console.log(`🔐 Contraseña temporal para ${email}: ${tempPassword}`);

    res.status(201).json({
        status: 'success',
        message: 'Arquitecto registrado exitosamente.',
        data: {
            user: newUser,
            tempPassword // SOLO PARA DEMO/DEV
        }
    });
});

/**
 * Obtiene todos los usuarios (Solo Admin).
 */
const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await userService.getAllUsers();
    res.status(200).json({
        status: 'success',
        data: users
    });
});

/**
 * Actualiza datos de un usuario (Solo Admin).
 */
const updateUser = catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const { nombre, email } = req.body;

    const updatedUser = await userService.updateUser(userId, nombre, email);

    if (!updatedUser) {
        return next(new AppError('Usuario no encontrado', 404));
    }

    res.status(200).json({
        status: 'success',
        data: updatedUser
    });
});

/**
 * Cambia el estado de un usuario (Solo Admin).
 */
const toggleUserStatus = catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const { is_active } = req.body;

    const updatedUser = await userService.toggleUserStatus(userId, is_active);

    if (!updatedUser) {
        return next(new AppError('Usuario no encontrado', 404));
    }

    res.status(200).json({
        status: 'success',
        data: updatedUser
    });
});

module.exports = {
    registerArchitect,
    getAllUsers,
    updateUser,
    toggleUserStatus,
};
