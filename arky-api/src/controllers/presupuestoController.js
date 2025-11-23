const presupuestoService = require('../services/presupuestoService');
const { sendSuccess } = require('../utils/responseHandler');
const catchAsync = require('../utils/catchAsync');

// @route POST /api/obras/:obraId/presupuestos
// @access Private (Arquitecto, Encargado)
const createNewPresupuesto = catchAsync(async (req, res) => {
    const obraId = parseInt(req.params.obraId);
    const nuevoPresupuesto = await presupuestoService.createPresupuesto(obraId, req.user);

    sendSuccess(res, nuevoPresupuesto, 201, `Presupuesto versión ${nuevoPresupuesto.version_numero} creado en estado Borrador.`);
});

// @route GET /api/obras/:obraId/presupuestos/latest
// @access Private (Todos los que tienen acceso a la obra)
const getLatestPresupuesto = catchAsync(async (req, res) => {
    const obraId = parseInt(req.params.obraId);
    const presupuestoCompleto = await presupuestoService.getLatestPresupuesto(obraId, req.user);

    sendSuccess(res, presupuestoCompleto);
});

// @route PATCH /api/presupuestos/:id/status
// @access Private (Cliente, Arquitecto)
const updateStatus = catchAsync(async (req, res) => {
    const presupuestoId = parseInt(req.params.id);
    const updatedPresupuesto = await presupuestoService.updateStatus(presupuestoId, req.body, req.user);

    sendSuccess(res, updatedPresupuesto, 200, `Presupuesto actualizado a ${req.body.status}`);
});

module.exports = {
    createNewPresupuesto,
    getLatestPresupuesto,
    updateStatus,
};