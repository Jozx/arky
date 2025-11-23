const userService = require('../services/userService');
const userModel = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Iniciar sesión (Login).
 */
const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const result = await userService.loginUser(email, password);
    res.status(200).json(result);
});

/**
 * Solicitar reseteo de contraseña (Forgot Password).
 */
const forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    const user = await userModel.findByEmail(email);

    if (!user) {
        return next(new AppError('No existe un usuario con ese correo.', 404));
    }

    // Generar token aleatorio
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hashear token para guardar en DB
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Expiración: 10 minutos
    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    await userModel.saveResetToken(user.id, resetTokenHash, passwordResetExpires);

    // URL de reseteo (Frontend)
    // Asumimos que el frontend corre en localhost:3000 o 5173. 
    // En prod, usar process.env.FRONTEND_URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // Enviar email (Simulado)
    console.log(`📧 [SIMULACIÓN EMAIL] Link de reseteo para ${email}: ${resetUrl}`);

    res.status(200).json({
        status: 'success',
        message: 'Token enviado al correo (Revisar consola del servidor).',
    });
});

/**
 * Resetear contraseña con token.
 */
const resetPassword = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;

    // Hashear el token recibido para comparar con DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await userModel.findByResetToken(hashedToken);

    if (!user) {
        return next(new AppError('El token es inválido o ha expirado.', 400));
    }

    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(password, salt);

    // Actualizar usuario
    await userModel.updatePassword(user.id, newPasswordHash);

    // Opcional: Loguear al usuario automáticamente enviando token JWT aquí.
    // Por ahora, solo confirmamos y pedimos login.

    res.status(200).json({
        status: 'success',
        message: 'Contraseña actualizada exitosamente. Por favor inicia sesión.',
    });
});

module.exports = {
    login,
    forgotPassword,
    resetPassword,
};
