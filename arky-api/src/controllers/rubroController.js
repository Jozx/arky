const rubroService = require('../services/rubroService');
const { sendSuccess } = require('../utils/responseHandler');
const catchAsync = require('../utils/catchAsync');

// @route POST /api/presupuestos/:presupuestoId/rubros
// @access Private (Arquitecto, Encargado)
const createRubro = catchAsync(async (req, res) => {
    const presupuestoId = parseInt(req.params.presupuestoId);
    const nuevoRubro = await rubroService.createRubro(presupuestoId, req.body, req.user);

    sendSuccess(res, nuevoRubro, 201, "Rubro creado exitosamente.");
});

// @route PUT /api/rubros/:rubroId/avance
// @access Private (Arquitecto, Encargado)
const updateRubroAvance = catchAsync(async (req, res) => {
    const rubroId = parseInt(req.params.rubroId);
    const avanceActualizado = await rubroService.updateRubroAvance(rubroId, req.body, req.user);

    sendSuccess(res, avanceActualizado, 200, "Avance del rubro actualizado exitosamente.");
});

// @route PUT /api/rubros/:rubroId
// @access Private (Arquitecto, Encargado)
const updateRubro = catchAsync(async (req, res) => {
    const rubroId = parseInt(req.params.rubroId);
    const rubroActualizado = await rubroService.updateRubro(rubroId, req.body, req.user);

    sendSuccess(res, rubroActualizado, 200, "Rubro actualizado exitosamente.");
});

// @route DELETE /api/rubros/:rubroId
// @access Private (Arquitecto, Encargado)
const deleteRubro = catchAsync(async (req, res) => {
    const rubroId = parseInt(req.params.rubroId);
    const rubroEliminado = await rubroService.deleteRubro(rubroId, req.user);

    sendSuccess(res, rubroEliminado, 200, "Rubro eliminado exitosamente.");
});

module.exports = {
    createRubro,
    updateRubroAvance,
    updateRubro,
    deleteRubro
};
