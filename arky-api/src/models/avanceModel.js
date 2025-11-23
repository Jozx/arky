const db = require('../config/db');

/**
 * Crea un nuevo registro de avance.
 */
async function create(avanceData) {
    const { rubro_id, obra_id, image_url, uploaded_by, descripcion } = avanceData;
    const query = `
        INSERT INTO Avance (rubro_id, obra_id, image_url, uploaded_by, descripcion)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [rubro_id, obra_id, image_url, uploaded_by, descripcion];
    const { rows } = await db.query(query, values);
    return rows[0];
}

/**
 * Obtiene todos los avances de una obra, ordenados por fecha descendente.
 */
async function findByObraId(obraId) {
    const query = `
        SELECT a.*, r.descripcion as rubro_descripcion, u.nombre as uploaded_by_name
        FROM Avance a
        JOIN Rubro r ON a.rubro_id = r.id
        JOIN "User" u ON a.uploaded_by = u.id
        WHERE a.obra_id = $1
        ORDER BY a.fecha_registro DESC;
    `;
    const { rows } = await db.query(query, [obraId]);
    return rows;
}

module.exports = {
    create,
    findByObraId,
};
