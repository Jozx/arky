// arky-api/src/controllers/fileController.js
const asyncHandler = require('express-async-handler');
const fileModel = require('../models/fileModel');
const obraModel = require('../models/obraModel');
const path = require('path');
const fs = require('fs'); // Necesario para manipular archivos del disco

// El directorio donde Multer guarda los archivos (debe coincidir con el middleware)
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

/**
 * @route POST /api/files/:obraId
 * @description Sube un archivo a la carpeta 'uploads' y registra su metadata en PostgreSQL.
 * @access Private (Arquitecto, Encargado)
 */
const uploadFile = asyncHandler(async (req, res) => {
    const obraId = parseInt(req.params.obraId);

    // 1. Verificar Rol
    if (req.user.rol === 'Cliente') {
        res.status(403);
        throw new Error('Solo el personal del estudio puede subir archivos a la obra.');
    }

    // 2. Verificar archivo y metadata
    const file = req.file; // Proporcionado por multer (diskStorage)
    const { tipo, descripcion } = req.body;

    if (!file) {
        res.status(400);
        throw new Error('No se subió ningún archivo. Asegúrate de usar la clave "archivo" en form-data.');
    }

    // 3. Validar tipo de archivo
    if (!tipo || !['Foto Avance', 'Plano', 'Documento Legal'].includes(tipo)) {
        // En caso de error de validación, eliminamos el archivo que Multer ya guardó en disco
        const filePath = path.join(UPLOAD_DIR, file.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Eliminar el archivo
        }
        res.status(400);
        throw new Error('Tipo de archivo inválido. Debe ser: Foto Avance, Plano o Documento Legal.');
    }

    // 4. Verificar Obra y Acceso
    const obra = await obraModel.findById(obraId);
    if (!obra) {
        // Si la obra no existe, eliminamos el archivo
        const filePath = path.join(UPLOAD_DIR, file.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        res.status(404);
        throw new Error('Obra no encontrada.');
    }

    // 5. Determinar la URL pública
    const host = req.get('host');
    const fileUrl = `${req.protocol}://${host}/uploads/${file.filename}`;

    // El "ruta_almacenamiento" ahora es el nombre del archivo en la carpeta 'uploads'
    const storagePath = file.filename;

    // 6. Registro en PostgreSQL
    try {
        const nuevoArchivo = await fileModel.create({
            obra_id: obraId,
            nombre_original: file.originalname,
            url_archivo: fileUrl,
            ruta_almacenamiento: storagePath,
            subido_por_id: req.user.id,
            tipo: tipo,
            descripcion: descripcion
        });

        res.status(201).json({
            message: 'Archivo subido y registrado con éxito en el servidor local.',
            archivo: nuevoArchivo
        });
    } catch (dbError) {
        // Si falla el registro en DB, eliminamos el archivo del disco para limpiar
        const filePath = path.join(UPLOAD_DIR, file.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        console.error('Fallo al registrar en DB, archivo eliminado de disco:', dbError.message);
        res.status(500).json({
            message: 'Fallo al registrar la metadata del archivo en la base de datos y se eliminó el archivo subido.',
            error: dbError.message
        });
    }
});

/**
 * @route GET /api/files/:obraId
 * @description Lista todos los archivos (metadata) de una obra desde PostgreSQL.
 * @access Private (Todos los que tienen acceso a la obra)
 */
const getFilesByObra = asyncHandler(async (req, res) => {
    const obraId = parseInt(req.params.obraId);

    // 1. Verificar Obra y Acceso
    const obra = await obraModel.findById(obraId);
    if (!obra) {
        res.status(404);
        throw new Error('Obra no encontrada.');
    }

    // Verificación de acceso al cliente (el Arquitecto ya tiene acceso)
    if (req.user.rol === 'Cliente' && req.user.id !== obra.cliente_id) {
        res.status(403);
        throw new Error('No autorizado para ver archivos de esta obra.');
    }

    // 2. Obtener Archivos de PostgreSQL
    const archivos = await fileModel.findByObraId(obraId);

    res.status(200).json(archivos);
});

/**
 * @route DELETE /api/files/:fileId
 * @description Elimina un archivo del disco local y de la base de datos.
 * @access Private (Arquitecto, Encargado)
 */
const deleteFile = asyncHandler(async (req, res) => {
    const fileId = parseInt(req.params.fileId);

    // 1. Verificar Rol: Solo personal de estudio puede eliminar.
    if (req.user.rol === 'Cliente') {
        res.status(403);
        throw new Error('Solo el personal del estudio puede eliminar archivos.');
    }

    // 2. Obtener metadata del archivo
    const archivo = await fileModel.findById(fileId);

    if (!archivo) {
        res.status(404);
        throw new Error('Archivo no encontrado.');
    }

    // 3. Verificar acceso a la obra (solo por seguridad)
    const obra = await obraModel.findById(archivo.obra_id);
    if (!obra) {
        res.status(404);
        throw new Error('Obra asociada al archivo no encontrada.');
    }

    const storagePath = archivo.ruta_almacenamiento;
    const filePath = path.join(UPLOAD_DIR, storagePath);

    // 4. Eliminar de la Base de Datos (DB)
    const dbDeleted = await fileModel.deleteById(fileId);

    // 5. Eliminar del Disco Local (File System)
    let fsDeleted = false;
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath); // Elimina el archivo
            fsDeleted = true;
        } catch (error) {
            console.error(`Error al eliminar el archivo ${filePath} del disco:`, error.message);

            // Si la DB eliminó el registro pero el FS falló, notificamos el error de disco.
            if (dbDeleted) {
                return res.status(500).json({
                    message: `Archivo eliminado de la DB, pero falló la eliminación en el disco.`,
                    diskError: error.message
                });
            }
        }
    } else {
        console.warn(`Archivo DB encontrado (ID: ${fileId}) pero no existe en disco: ${filePath}`);
    }


    if (dbDeleted) {
        res.status(200).json({
            message: 'Archivo eliminado exitosamente.',
            fileId: fileId,
            diskStatus: fsDeleted ? 'Eliminado de disco' : 'No encontrado en disco (metadata borrada)'
        });
    } else {
        res.status(500).json({ message: 'Error interno: Falló la eliminación del registro en DB.' });
    }
});


module.exports = {
    uploadFile,
    getFilesByObra,
    deleteFile,
};