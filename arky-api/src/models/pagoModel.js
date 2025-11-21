// arky-api/src/models/pagoModel.js
const db = require('../config/db');

/**
 * Crea un nuevo pago en la base de datos.
 */
async function create(obra_id, monto, fecha_pago, registered_by_user_id, descripcion = null) {
    const query = `
        INSERT INTO Pago (obra_id, monto, fecha_pago, registered_by_user_id, descripcion)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, obra_id, monto, fecha_pago, registered_by_user_id, descripcion;
    `;
    const values = [obra_id, monto, fecha_pago, registered_by_user_id, descripcion];

    const { rows } = await db.query(query, values);

    if (rows.length === 0) {
        throw new Error("Fallo al crear el pago en la base de datos.");
    }

    return rows[0];
}

/**
 * Encuentra todos los pagos de una obra específica.
 */
async function findByObraId(obra_id) {
    const query = `
        SELECT p.id, p.obra_id, p.monto, p.fecha_pago, p.descripcion,
               p.registered_by_user_id,
               u.nombre AS registered_by_nombre
        FROM Pago p
        LEFT JOIN "User" u ON p.registered_by_user_id = u.id
        WHERE p.obra_id = $1
        ORDER BY p.fecha_pago DESC, p.id DESC;
    `;
    const { rows } = await db.query(query, [obra_id]);
    return rows;
}

/**
 * Calcula el total pagado para una obra específica.
 */
async function getTotalPagado(obra_id) {
    const query = `
        SELECT COALESCE(SUM(monto), 0) AS total_pagado
        FROM Pago
        WHERE obra_id = $1;
    `;
    const { rows } = await db.query(query, [obra_id]);
    return parseFloat(rows[0].total_pagado);
}

module.exports = {
    create,
    findByObraId,
    getTotalPagado,
};
