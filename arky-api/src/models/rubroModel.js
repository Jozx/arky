const db = require('../config/db');

/**
 * @param { object } data - Datos del rubro(descripcion, cantidad, costo, etc.).
 * @returns { object } El rubro creado.
 */
async function create(presupuestoId, data) {
    const {
        descripcion,
        unidad_medida,
        cantidad_estimada,
        costo_unitario,
        fecha_inicio_estimada,
        fecha_fin_estimada
    } = data;

    // 1. Inserción del Rubro
    const rubroQuery = `
        INSERT INTO Rubro(
        presupuesto_id, descripcion, unidad_medida, cantidad_estimada, costo_unitario,
        fecha_inicio_estimada, fecha_fin_estimada
    )
    VALUES($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, descripcion, unidad_medida, cantidad_estimada, costo_unitario,
        fecha_inicio_estimada, fecha_fin_estimada;
    `;
    const rubroValues = [
        presupuestoId,
        descripcion,
        unidad_medida,
        cantidad_estimada,
        costo_unitario,
        fecha_inicio_estimada || null,
        fecha_fin_estimada || null
    ];

    const { rows: rubroRows } = await db.query(rubroQuery, rubroValues);
    const nuevoRubro = rubroRows[0];

    // 2. Inicialización en TrackingAvance (obligatorio para cada rubro)
    // El estado inicial por defecto es 'No Iniciado' y el porcentaje 0.
    await db.query(
        'INSERT INTO TrackingAvance (rubro_id) VALUES ($1)',
        [nuevoRubro.id]
    );

    return nuevoRubro;
}

/**
 * Busca un rubro específico por ID, incluyendo su estado de avance.
 * @param {number} rubroId - ID del rubro.
 * @returns {object | null} El rubro encontrado.
 */
async function findById(rubroId) {
    const query = `
        SELECT r.id, r.presupuesto_id, r.descripcion, r.unidad_medida, r.cantidad_estimada, r.costo_unitario,
        r.fecha_inicio_estimada, r.fecha_fin_estimada,
        ta.estado AS avance_estado,
            ta.porcentaje_avance,
            ta.fecha_actualizacion AS avance_fecha_actualizacion
        FROM Rubro r
        LEFT JOIN TrackingAvance ta ON r.id = ta.rubro_id
        WHERE r.id = $1;
    `;
    const { rows } = await db.query(query, [rubroId]);
    return rows[0] || null;
}

/**
 * Actualiza el estado de avance y el porcentaje de un rubro.
 * @param {number} rubroId - ID del rubro a actualizar.
 * @param {string} estado - Nuevo estado (avance_estado ENUM).
 * @param {number} porcentajeAvance - Nuevo porcentaje (0-100).
 * @returns {object} La entrada de TrackingAvance actualizada.
 */
async function updateAvance(rubroId, estado, porcentajeAvance) {
    const query = `
        INSERT INTO TrackingAvance (rubro_id, estado, porcentaje_avance, fecha_actualizacion)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (rubro_id)
        DO UPDATE SET
            estado = EXCLUDED.estado,
            porcentaje_avance = EXCLUDED.porcentaje_avance,
            fecha_actualizacion = EXCLUDED.fecha_actualizacion
        RETURNING rubro_id, estado, porcentaje_avance, fecha_actualizacion;
    `;
    const values = [rubroId, estado, porcentajeAvance];

    const { rows } = await db.query(query, values);
    return rows[0];
}

/**
 * @returns {object} El rubro actualizado.
 */
async function updateObservaciones(rubroId, observaciones) {
    const query = `
        UPDATE Rubro
        SET observaciones = $2
        WHERE id = $1
        RETURNING id, descripcion, observaciones;
    `;
    const { rows } = await db.query(query, [rubroId, observaciones]);
    return rows[0];
}

/**
 * Actualiza los detalles básicos de un rubro.
 * @param {number} rubroId - ID del rubro.
 * @param {object} data - Datos a actualizar (descripcion, cantidad_estimada, costo_unitario).
 * @returns {object} El rubro actualizado.
 */
async function update(rubroId, data) {
    const { descripcion, cantidad_estimada, costo_unitario } = data;
    const query = `
        UPDATE Rubro
        SET descripcion = COALESCE($2, descripcion),
        cantidad_estimada = COALESCE($3, cantidad_estimada),
        costo_unitario = COALESCE($4, costo_unitario)
        WHERE id = $1
        RETURNING id, descripcion, unidad_medida, cantidad_estimada, costo_unitario;
    `;
    const { rows } = await db.query(query, [rubroId, descripcion, cantidad_estimada, costo_unitario]);
    return rows[0];
}

/**
 * Elimina un rubro por ID.
 * @param {number} rubroId - ID del rubro a eliminar.
 */
async function deleteById(rubroId) {
    const query = 'DELETE FROM Rubro WHERE id = $1 RETURNING id';
    const { rows } = await db.query(query, [rubroId]);
    return rows[0];
}

module.exports = {
    create,
    findById,
    updateAvance,
    updateObservaciones,
    update,
    deleteById,
};