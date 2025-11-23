const obraService = require('../services/obraService');
const { sendSuccess } = require('../utils/responseHandler');
const catchAsync = require('../utils/catchAsync');

// @route POST /api/obras
// @access Private (Arquitecto, Encargado)
const createObra = catchAsync(async (req, res) => {
    const nuevaObra = await obraService.createObra(req.body, req.user);
    sendSuccess(res, nuevaObra, 201);
});

// @route GET /api/obras
// @access Private (Todos)
const getObras = catchAsync(async (req, res) => {
    const obras = await obraService.getObras(req.user);
    sendSuccess(res, obras);
});

// @route GET /api/obras/:id
// @access Private (Arquitecto/Cliente de la obra)
const getObraById = catchAsync(async (req, res) => {
    const obra = await obraService.getObraById(req.params.id, req.user);
    sendSuccess(res, obra);
});

// @route PATCH /api/obras/:id/finalize
// @access Private (Arquitecto only)
const finalizeObra = catchAsync(async (req, res) => {
    const obra = await obraService.finalizeObra(req.params.id, req.user);
    sendSuccess(res, obra);
});

module.exports = {
    createObra,
    getObras,
    getObraById,
    finalizeObra,
};