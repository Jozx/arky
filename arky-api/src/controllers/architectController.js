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
 * Registra un nuevo Cliente (Solo Arquitecto).
 */
const registerClient = catchAsync(async (req, res, next) => {
    const { email, nombre, cif_empresa } = req.body;

    // Verificar que quien llama es Arquitecto
    if (req.user.rol !== 'Arquitecto') {
        return next(new AppError('No tienes permisos para realizar esta acción.', 403));
    }

    // Generar contraseña temporal
    const tempPassword = generateTempPassword();

    // Crear usuario con rol Cliente
    const newUser = await userService.registerUser(email, tempPassword, nombre, 'Cliente', null, cif_empresa);

    // En un entorno real, aquí se enviaría un email.
    console.log(`🔐 Contraseña temporal para Cliente ${email}: ${tempPassword}`);

    res.status(201).json({
        status: 'success',
        message: 'Cliente registrado exitosamente.',
        data: {
            user: newUser,
            tempPassword // SOLO PARA DEMO/DEV
        }
    });
});

module.exports = {
    registerClient,
};
