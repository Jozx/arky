const db = require('../config/db');

/**
 * Crea un nuevo pago para una obra.
 * @param {number} projectId - ID de la obra.
 * @param {object} data - Datos del pago (amountPaid, paymentDate, description).
 * @param {number} userId - ID del usuario que registra el pago.
 * @returns {object} El pago creado.
 */
async function create(projectId, data, userId) {
    const { amountPaid, paymentDate, description } = data;

    const query = `
        INSERT INTO Pago (obra_id, monto, fecha_pago, descripcion, registered_by_user_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, obra_id, monto, fecha_pago, descripcion, registered_by_user_id;
    `;

    const values = [
        projectId,
        amountPaid,
        paymentDate,
        description,
        userId
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
}

/**
 * Obtiene todos los pagos de una obra.
 * @param {number} projectId - ID de la obra.
 * @returns {array} Lista de pagos.
 */
async function findByProjectId(projectId) {
    const query = `
        SELECT p.id, p.obra_id, p.monto, p.fecha_pago, p.descripcion, p.registered_by_user_id,
               u.nombre as registrado_por
        FROM Pago p
        LEFT JOIN "User" u ON p.registered_by_user_id = u.id
        WHERE p.obra_id = $1
        ORDER BY p.fecha_pago DESC;
    `;

    const { rows } = await db.query(query, [projectId]);
    return rows;
}

module.exports = {
    create,
    findByProjectId
};
