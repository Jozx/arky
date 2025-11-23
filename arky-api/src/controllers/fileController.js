// arky-api/src/controllers/fileController.js
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
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
const uploadFile = catchAsync(async (req, res, next) => {
    const obraId = parseInt(req.params.obraId);

    // 1. Verificar Rol
    if (req.user.rol === 'Cliente') {
        return next(new AppError('Solo el personal del estudio puede subir archivos a la obra.', 403));
    }

    // 2. Verificar archivo y metadata
    const file = req.file; // Proporcionado por multer (diskStorage)
    const { tipo, descripcion } = req.body;

    if (!file) {
        return next(new AppError('No se subió ningún archivo. Asegúrate de usar la clave "archivo" en form-data.', 400));
    }

    // 3. Validar tipo de archivo
    if (!tipo || !['Foto Avance', 'Plano', 'Documento Legal'].includes(tipo)) {
        // En caso de error de validación, eliminamos el archivo que Multer ya guardó en disco
        const filePath = path.join(UPLOAD_DIR, file.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Eliminar el archivo
        }
        return next(new AppError('Tipo de archivo inválido. Debe ser: Foto Avance, Plano o Documento Legal.', 400));
    }

    // 4. Verificar Obra y Acceso
    const obra = await obraModel.findById(obraId);
    if (!obra) {
        // Si la obra no existe, eliminamos el archivo
        const filePath = path.join(UPLOAD_DIR, file.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return next(new AppError('Obra no encontrada.', 404));
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
        return next(new AppError('Fallo al registrar la metadata del archivo en la base de datos y se eliminó el archivo subido.', 500));
    }
});

/**
 * @route GET /api/files/:obraId
 * @description Lista todos los archivos (metadata) de una obra desde PostgreSQL.
 * @access Private (Todos los que tienen acceso a la obra)
 */
const getFilesByObra = catchAsync(async (req, res, next) => {
    const obraId = parseInt(req.params.obraId);

    // 1. Verificar Obra y Acceso
    const obra = await obraModel.findById(obraId);
    if (!obra) {
        return next(new AppError('Obra no encontrada.', 404));
    }

    // Verificación de acceso al cliente (el Arquitecto ya tiene acceso)
    if (req.user.rol === 'Cliente' && req.user.id !== obra.cliente_id) {
        return next(new AppError('No autorizado para ver archivos de esta obra.', 403));
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
const deleteFile = catchAsync(async (req, res, next) => {
    const fileId = parseInt(req.params.fileId);

    // 1. Verificar Rol: Solo personal de estudio puede eliminar.
    if (req.user.rol === 'Cliente') {
        return next(new AppError('Solo el personal del estudio puede eliminar archivos.', 403));
    }

    // 2. Obtener metadata del archivo
    const archivo = await fileModel.findById(fileId);

    if (!archivo) {
        return next(new AppError('Archivo no encontrado.', 404));
    }

    // 3. Verificar acceso a la obra (solo por seguridad)
    const obra = await obraModel.findById(archivo.obra_id);
    if (!obra) {
        return next(new AppError('Obra asociada al archivo no encontrada.', 404));
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
                return next(new AppError(`Archivo eliminado de la DB, pero falló la eliminación en el disco: ${error.message}`, 500));
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
        return next(new AppError('Error interno: Falló la eliminación del registro en DB.', 500));
    }
});


module.exports = {
    uploadFile,
    getFilesByObra,
    deleteFile,
};