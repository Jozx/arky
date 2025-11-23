// arky-api/src/controllers/userController.js
const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const register = catchAsync(async (req, res, next) => {
    const { email, password, nombre, rol, numero_licencia, cif_empresa } = req.body;

    // Verificación de rol básico para el MVP
    if (!['Arquitecto', 'Cliente', 'Encargado'].includes(rol)) {
        return next(new AppError('Rol inválido.', 400));
    }

    const result = await userService.registerUser(email, password, nombre, rol, numero_licencia, cif_empresa);
    res.status(201).json(result);
});

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const result = await userService.loginUser(email, password);
    res.status(200).json(result);
});

const getUsers = catchAsync(async (req, res, next) => {
    const { rol } = req.query;
    let users;

    if (rol) {
        users = await userService.getUsersByRole(rol);
    } else {
        // Si no se especifica rol, podríamos devolver todos o error. 
        // Por seguridad, mejor requerir rol o devolver vacío por ahora.
        users = [];
    }

    res.status(200).json(users);
});

module.exports = {
    register,
    login,
    getUsers,
};