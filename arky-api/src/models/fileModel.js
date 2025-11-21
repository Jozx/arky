// arky-api/src/models/fileModel.js
const db = require('../config/db');

/**
 * Registra un nuevo archivo en la base de datos después de la subida a Storage.
 * @param {object} data - Metadata del archivo.
 * @returns {object} El archivo registrado.
 */
async function create(data) {
    const {
        obra_id,
        nombre_original,
        url_archivo,
        ruta_almacenamiento,
        subido_por_id,
        tipo,
        descripcion
    } = data;

    const query = `
        INSERT INTO Archivo (
            obra_id, nombre_original, url_archivo, ruta_almacenamiento, subido_por_id, tipo, descripcion
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    const values = [
        obra_id,
        nombre_original,
        url_archivo,
        ruta_almacenamiento,
        subido_por_id,
        tipo,
        descripcion
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
}

/**
 * Obtiene un archivo por su ID.
 * @param {number} fileId - ID del archivo.
 * @returns {object | null} El archivo encontrado o null.
 */
async function findById(fileId) {
    const query = `
        SELECT a.*, u.nombre AS subido_por_nombre
        FROM Archivo a
        JOIN "User" u ON a.subido_por_id = u.id
        WHERE a.id = $1;
    `;
    // Nota: Se asume que la tabla de usuarios se llama "User"
    const { rows } = await db.query(query, [fileId]);
    return rows[0] || null;
}

/**
 * Obtiene todos los archivos asociados a una obra.
 * @param {number} obraId - ID de la obra.
 * @returns {array} Lista de archivos.
 */
async function findByObraId(obraId) {
    const query = `
        SELECT a.*, u.nombre AS subido_por_nombre
        FROM Archivo a
        JOIN "User" u ON a.subido_por_id = u.id
        WHERE a.obra_id = $1
        ORDER BY a.fecha_subida DESC;
    `;
    const { rows } = await db.query(query, [obraId]);
    return rows;
}

/**
 * Elimina un archivo de la base de datos por su ID.
 * @param {number} fileId - ID del archivo a eliminar.
 * @returns {boolean} True si se eliminó un registro, false si no.
 */
async function deleteById(fileId) {
    const query = 'DELETE FROM Archivo WHERE id = $1 RETURNING id;';
    const { rows } = await db.query(query, [fileId]);
    return rows.length > 0;
}


module.exports = {
    create,
    findById,
    findByObraId,
    deleteById,
};