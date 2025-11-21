// arky-api/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const protect = (req, res, next) => {
    let token;

    // 1. Verificar si el token existe en el header (Bearer Token)
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Obtener el token de la cadena: "Bearer [TOKEN]"
            token = req.headers.authorization.split(' ')[1];

            // 2. Verificar el token
            const decoded = jwt.verify(token, JWT_SECRET);

            // 3. Adjuntar la data del usuario al request
            req.user = { 
                id: decoded.id, 
                rol: decoded.rol 
            };

            next(); // Continuar a la siguiente función (controller)
        } catch (error) {
            console.error('Error en el token:', error);
            res.status(401).json({ message: 'No autorizado, token fallido o expirado.' });
        }
    }

    if (!token) {
        // Importante: No usar res.status().json() si ya se ha enviado una respuesta
        if (!res.headersSent) {
            res.status(401).json({ message: 'No autorizado, no se encontró token.' });
        }
    }
};

/**
 * Middleware para restringir el acceso basado en roles.
 * Ejemplo: authorize('Arquitecto', 'Encargado')
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // Asegurarse de que el usuario fue adjuntado por 'protect' y tiene el rol correcto
        if (!req.user || !allowedRoles.includes(req.user.rol)) {
            return res.status(403).json({ 
                message: `Acceso denegado. Se requiere uno de los roles: ${allowedRoles.join(', ')}.` 
            });
        }
        next();
    };
};

module.exports = { protect, authorize };