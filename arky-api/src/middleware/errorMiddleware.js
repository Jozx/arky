// arky-api/src/middleware/errorMiddleware.js

/**
 * Middleware genérico para manejar respuestas de errores.
 *
 * Captura errores lanzados por los controladores (incluyendo los lanzados por express-async-handler)
 * y devuelve una respuesta JSON estructurada y fácil de consumir.
 */
const errorHandler = (err, req, res, next) => {
    // Determinar el código de estado. Si la respuesta ya tiene un código, usarlo, 
    // si no, usar 500 (Error de Servidor).
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Establecer el código de estado en la respuesta
    res.status(statusCode);

    // Enviar una respuesta JSON al cliente
    res.json({
        message: err.message,
        // Incluir el stack trace solo si no estamos en modo producción (para debugging)
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = {
    errorHandler,
};