// arky-api/src/routes/presupuestoRoutes.js
const express = require('express');
const router = express.Router();
const {
    createNewPresupuesto,
    getLatestPresupuesto,
    updateStatus
} = require('../controllers/presupuestoController');
const { protect } = require('../middleware/authMiddleware');

// Ruta para crear un nuevo presupuesto para una obra (requiere auth)
// POST /api/obras/:obraId/presupuestos
router.post('/:obraId/presupuestos', protect, createNewPresupuesto);

// Ruta para obtener la última versión del presupuesto de una obra (requiere auth)
// GET /api/obras/:obraId/presupuestos/latest
router.get('/:obraId/presupuestos/latest', protect, getLatestPresupuesto);

// Ruta para actualizar el estado del presupuesto (Aprobar/Rechazar)
// PATCH /api/presupuestos/:id/status
router.patch('/:id/status', protect, updateStatus);

module.exports = router;