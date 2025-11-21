// arky-api/src/controllers/userController.js
const userService = require('../services/userService');

const register = async (req, res) => {
    try {
        const { email, password, nombre, rol, numero_licencia, cif_empresa } = req.body;

        // Verificación de rol básico para el MVP
        if (!['Arquitecto', 'Cliente', 'Encargado'].includes(rol)) {
            return res.status(400).json({ message: "Rol inválido." });
        }

        const result = await userService.registerUser(email, password, nombre, rol, numero_licencia, cif_empresa);
        res.status(201).json(result);
    } catch (error) {
        // Manejo de errores de negocio (ej: email duplicado)
        res.status(400).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await userService.loginUser(email, password);
        res.status(200).json(result);
    } catch (error) {
        // Manejo de errores de credenciales inválidas
        res.status(401).json({ message: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    register,
    login,
    getUsers,
};