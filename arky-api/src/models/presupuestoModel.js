// arky-api/src/models/presupuestoModel.js
const db = require('../config/db');

/**
 * Crea una nueva versión del presupuesto para una obra. 
 * Siempre será la siguiente versión disponible.
 * @param {number} obraId - ID de la obra a la que pertenece.
 * @returns {object} El presupuesto creado.
 */
async function create(obraId) {
    // 1. Obtener la última versión para saber el número y el ID (para copiar rubros)
    const latestQuery = `
        SELECT id, version_numero
        FROM Presupuesto
        WHERE obra_id = $1
        ORDER BY version_numero DESC
        LIMIT 1;
    `;
    const { rows: latestRows } = await db.query(latestQuery, [obraId]);

    let nextVersion = 1;
    let previousPresupuestoId = null;

    if (latestRows.length > 0) {
        nextVersion = latestRows[0].version_numero + 1;
        previousPresupuestoId = latestRows[0].id;
    }

    // 2. Insertar el nuevo presupuesto.
    const insertQuery = `
        INSERT INTO Presupuesto (obra_id, version_numero, estado)
        VALUES ($1, $2, 'Borrador')
        RETURNING id, obra_id, version_numero, fecha_creacion, estado;
    `;
    const { rows } = await db.query(insertQuery, [obraId, nextVersion]);
    const newPresupuesto = rows[0];

    // 3. Si existe una versión anterior, copiar los rubros
    if (previousPresupuestoId) {
        const copyRubrosQuery = `
            INSERT INTO Rubro (
                presupuesto_id, descripcion, unidad_medida, cantidad_estimada, costo_unitario,
                fecha_inicio_estimada, fecha_fin_estimada, observaciones
            )
            SELECT 
                $1, descripcion, unidad_medida, cantidad_estimada, costo_unitario,
                fecha_inicio_estimada, fecha_fin_estimada, NULL
            FROM Rubro
            WHERE presupuesto_id = $2
            RETURNING id;
        `;
        const { rows: newRubros } = await db.query(copyRubrosQuery, [newPresupuesto.id, previousPresupuestoId]);

        // 4. Crear TrackingAvance para los nuevos rubros
        if (newRubros.length > 0) {
            const rubroIds = newRubros.map(r => r.id);
            const placeholders = rubroIds.map((_, i) => `($${i + 1})`).join(', ');
            const trackingQuery = `
                INSERT INTO TrackingAvance (rubro_id)
                VALUES ${placeholders}
            `;
            await db.query(trackingQuery, rubroIds);
        }
    }

    return newPresupuesto;
}

/**
 * Busca el presupuesto más reciente y su lista de rubros asociados.
 * Esta es la vista principal que la API usará.
 * @param {number} presupuestoId - ID del presupuesto específico.
 * @returns {object | null} El presupuesto con sus rubros, o null si no existe.
 */
async function findWithRubros(presupuestoId) {
    // Obtener la cabecera del presupuesto
    const presupuestoQuery = `
        SELECT id, obra_id, version_numero, estado, notas_generales, fecha_creacion
        FROM Presupuesto
        WHERE id = $1;
    `;
    const { rows: pRows } = await db.query(presupuestoQuery, [presupuestoId]);
    const presupuesto = pRows[0];

    if (!presupuesto) return null;

    // Obtener todos los rubros asociados a este presupuesto
    const rubrosQuery = `
        SELECT r.id, r.descripcion, r.unidad_medida, r.cantidad_estimada, r.costo_unitario,
               r.fecha_inicio_estimada, r.fecha_fin_estimada, r.observaciones,
               ta.estado AS avance_estado, 
               ta.porcentaje_avance
        FROM Rubro r
        LEFT JOIN TrackingAvance ta ON r.id = ta.rubro_id
        WHERE r.presupuesto_id = $1
        ORDER BY r.id;
    `;
    const { rows: rRows } = await db.query(rubrosQuery, [presupuestoId]);

    return {
        presupuesto: presupuesto,
        rubros: rRows
    };
}

/**
 * Busca el presupuesto más reciente (última versión) para una obra.
 * @param {number} obraId - ID de la obra.
 * @returns {object | null} El presupuesto más reciente.
 */
async function findLatestByObraId(obraId) {
    const query = `
        SELECT id, obra_id, version_numero, estado, fecha_creacion
        FROM Presupuesto
        WHERE obra_id = $1
        ORDER BY version_numero DESC
        LIMIT 1;
    `;
    const { rows } = await db.query(query, [obraId]);
    return rows[0] || null;
}

/**
 * Actualiza las notas generales de un presupuesto.
 * @param {number} presupuestoId - ID del presupuesto.
 * @param {string} notas - Notas generales del cliente.
 * @returns {object} El presupuesto actualizado.
 */
async function updateNotes(presupuestoId, notas) {
    const query = `
        UPDATE Presupuesto
        SET notas_generales = $2
        WHERE id = $1
        RETURNING id, obra_id, version_numero, estado, notas_generales, fecha_creacion;
    `;
    const { rows } = await db.query(query, [presupuestoId, notas]);
    return rows[0];
}

/**
 * Actualiza el estado de un presupuesto.
 * @param {number} presupuestoId - ID del presupuesto.
 * @param {string} estado - Nuevo estado (Pendiente, Aprobado, Rechazado, etc.).
 * @returns {object} El presupuesto actualizado.
 */
async function updateStatus(presupuestoId, estado) {
    const query = `
        UPDATE Presupuesto
        SET estado = $2
        WHERE id = $1
        RETURNING id, obra_id, version_numero, estado, notas_generales, fecha_creacion;
    `;
    const { rows } = await db.query(query, [presupuestoId, estado]);
    return rows[0];
}

module.exports = {
    create,
    findWithRubros,
    findLatestByObraId,
    updateNotes,
    updateStatus,
};