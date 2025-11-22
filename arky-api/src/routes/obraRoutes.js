const express = require('express');
const router = express.Router();
const obraController = require('../controllers/obraController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Importamos el middleware

// Rutas protegidas
// POST /api/obras (Solo Arquitectos y Encargados pueden crear)
router.post('/', protect, authorize('Arquitecto', 'Encargado'), obraController.createObra);

// GET /api/obras (Todos los usuarios logueados pueden ver sus listas de obras)
router.get('/', protect, obraController.getObras);

// GET /api/obras/:id (Todos los usuarios logueados pueden ver los detalles de una obra si son el dueño o el arquitecto)
router.get('/:id', protect, obraController.getObraById);

// PATCH /api/obras/:id/finalize (Solo Arquitectos pueden finalizar obras)
router.patch('/:id/finalize', protect, authorize('Arquitecto'), obraController.finalizeObra);

module.exports = router;