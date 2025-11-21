// arky-api/src/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Carpeta de destino para los archivos
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

// Asegúrate de que la carpeta de uploads exista
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// -----------------------------------------------------------
// 1. Configuración de Disk Storage (Almacenamiento Local)
// -----------------------------------------------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Guarda todos los archivos en la carpeta /uploads
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Genera un nombre de archivo único: obraId-timestamp-nombreOriginal
        const obraId = req.params.obraId || 'general'; // Usa el ID de la obra si está disponible
        const extension = path.extname(file.originalname);
        const fileName = `${obraId}-${Date.now()}${extension}`;
        cb(null, fileName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limitar archivos a 5MB
    }
});

module.exports = upload;