const rubroService = require('../services/rubroService');
const { sendSuccess } = require('../utils/responseHandler');
const asyncHandler = require('express-async-handler');

// @route POST /api/presupuestos/:presupuestoId/rubros
// @access Private (Arquitecto, Encargado)
const createRubro = asyncHandler(async (req, res) => {
    const presupuestoId = parseInt(req.params.presupuestoId);
    const nuevoRubro = await rubroService.createRubro(presupuestoId, req.body, req.user);

    sendSuccess(res, nuevoRubro, 201, "Rubro creado exitosamente.");
});

// @route PUT /api/rubros/:rubroId/avance
// @access Private (Arquitecto, Encargado)
const updateRubroAvance = asyncHandler(async (req, res) => {
    const rubroId = parseInt(req.params.rubroId);
    const avanceActualizado = await rubroService.updateRubroAvance(rubroId, req.body, req.user);

    sendSuccess(res, avanceActualizado, 200, "Avance del rubro actualizado exitosamente.");
});

// @route PUT /api/rubros/:rubroId
// @access Private (Arquitecto, Encargado)
const updateRubro = asyncHandler(async (req, res) => {
    const rubroId = parseInt(req.params.rubroId);
    const rubroActualizado = await rubroService.updateRubro(rubroId, req.body, req.user);

    sendSuccess(res, rubroActualizado, 200, "Rubro actualizado exitosamente.");
});

module.exports = {
    createRubro,
    updateRubroAvance,
    updateRubro
};
