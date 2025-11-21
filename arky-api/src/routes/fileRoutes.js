// arky-api/src/routes/fileRoutes.js
const express = require('express');
const router = express.Router();

// Importamos las funciones del controlador de archivos
const { uploadFile, getFilesByObra, deleteFile } = require('../controllers/fileController');

// Importamos los middlewares necesarios
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Middleware Multer para manejar la subida

/**
 * Rutas de Archivos:
 * * 1. Subida de Archivo: POST /api/files/:obraId
 * - Usa 'protect' para asegurar que el usuario esté autenticado.
 * - Usa 'upload.single('archivo')' para procesar el archivo bajo la clave 'archivo'.
 * * 2. Listado de Archivos: GET /api/files/:obraId
 * - Lista todos los archivos (metadata) de una obra.
 * * 3. Eliminación de Archivo: DELETE /api/files/:fileId
 * - Elimina el registro de la DB y el archivo físico del disco.
 */

// 1. Subir un archivo (POST)
router.post('/:obraId', protect, upload.single('archivo'), uploadFile);

// 2. Listar todos los archivos de una obra (GET)
router.get('/:obraId', protect, getFilesByObra);

// 3. Eliminar un archivo (DELETE)
router.delete('/:fileId', protect, deleteFile);

module.exports = router;