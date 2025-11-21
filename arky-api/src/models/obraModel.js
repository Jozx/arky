// arky-api/src/models/obraModel.js
const db = require('../config/db');

/**
 * Crea una nueva obra en la base de datos.
 */
async function create(nombre, direccion, arquitecto_id, cliente_id, fecha_inicio_estimada, fecha_fin_estimada) {
    const query = `
        INSERT INTO Obra (nombre, direccion, arquitecto_id, cliente_id, fecha_inicio_estimada, fecha_fin_estimada)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, nombre, direccion, arquitecto_id, cliente_id, fecha_inicio_estimada, fecha_fin_estimada, status;
    `;
    const values = [nombre, direccion, arquitecto_id, cliente_id, fecha_inicio_estimada, fecha_fin_estimada];

    const { rows } = await db.query(query, values);

    if (rows.length === 0) {
        throw new Error("Fallo al crear la obra en la base de datos.");
    }

    return rows[0];
}

/**
 * Encuentra obras visibles para un usuario, incluyendo el estado del último presupuesto.
 */
async function findVisibleByUser(userId, rol) {
    let query;
    let values = [];

    // Subquery para obtener el estado del último presupuesto de cada obra
    // Se asume que el último presupuesto es el que tiene mayor version_numero
    const statusSubquery = `
        LEFT JOIN Presupuesto p ON p.obra_id = o.id AND p.version_numero = (
            SELECT MAX(version_numero) FROM Presupuesto WHERE obra_id = o.id
        )
    `;

    if (rol === 'Encargado') {
        query = `
            SELECT o.id, o.nombre, o.direccion, o.status, o.fecha_inicio_estimada,
                   p.estado as latest_budget_status
            FROM Obra o
            ${statusSubquery}
            ORDER BY o.fecha_inicio_estimada DESC;
        `;
    } else if (rol === 'Arquitecto') {
        query = `
            SELECT o.id, o.nombre, o.direccion, o.status, o.fecha_inicio_estimada,
                   p.estado as latest_budget_status
            FROM Obra o
            ${statusSubquery}
            WHERE o.arquitecto_id = $1
            ORDER BY o.fecha_inicio_estimada DESC;
        `;
        values = [userId];
    } else if (rol === 'Cliente') {
        query = `
            SELECT o.id, o.nombre, o.direccion, o.status, o.fecha_inicio_estimada,
                   p.estado as latest_budget_status
            FROM Obra o
            ${statusSubquery}
            WHERE o.cliente_id = $1
            ORDER BY o.fecha_inicio_estimada DESC;
        `;
        values = [userId];
    } else {
        return [];
    }

    const { rows } = await db.query(query, values);
    return rows;
}

/**
 * Encuentra una obra por su ID.
 */
async function findById(id) {
    const query = `
        SELECT o.*, 
               u_arq.nombre AS arquitecto_nombre, u_arq.email AS arquitecto_email,
               u_cli.nombre AS cliente_nombre, u_cli.email AS cliente_email
        FROM Obra o
        JOIN "User" u_arq ON o.arquitecto_id = u_arq.id
        JOIN "User" u_cli ON o.cliente_id = u_cli.id
        WHERE o.id = $1;
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
}

module.exports = {
    create,
    findVisibleByUser,
    findById,
};