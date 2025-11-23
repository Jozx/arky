const express = require('express');
const router = express.Router();
const { createAvance, getAvancesByObra } = require('../controllers/avanceController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// POST /api/obras/:obraId/avances - Subir avance (Arquitecto)
// Usamos upload.array('images', 10) para permitir hasta 10 imágenes
router.post('/:obraId/avances', protect, upload.array('images', 10), createAvance);

// GET /api/obras/:obraId/avances - Ver avances (Todos)
router.get('/:obraId/avances', protect, getAvancesByObra);

module.exports = router;
