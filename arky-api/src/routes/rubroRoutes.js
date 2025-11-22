// arky-api/src/routes/rubroRoutes.js
const express = require('express');
const router = express.Router();
const {
    createRubro,
    updateRubroAvance,
    updateRubro,
    deleteRubro
} = require('../controllers/rubroController');
const { protect } = require('../middleware/authMiddleware');

// NOTA IMPORTANTE: Este router se montará DOS VECES en server.js.

// 1. Para la ruta de creación de rubro: POST /api/presupuestos/:presupuestoId/rubros
router.post('/:presupuestoId/rubros', protect, createRubro);

// 2. Para la ruta de actualización de avance: PUT /api/rubros/:rubroId/avance
router.put('/:rubroId/avance', protect, updateRubroAvance);

// 3. Para la ruta de actualización de rubro (descripción, cantidad, costo): PUT /api/rubros/:rubroId
router.put('/:rubroId', protect, updateRubro);

// 4. Para la ruta de eliminación de rubro: DELETE /api/rubros/:rubroId
router.delete('/:rubroId', protect, deleteRubro);

module.exports = router;