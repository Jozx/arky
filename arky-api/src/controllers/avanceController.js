const avanceModel = require('../models/avanceModel');
const obraModel = require('../models/obraModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

// @route POST /api/obras/:obraId/avances
// @access Private (Arquitecto)
const createAvance = catchAsync(async (req, res, next) => {
    const obraId = parseInt(req.params.obraId);
    const { rubro_id, descripcion } = req.body;
    const files = req.files; // Multer array

    if (req.user.rol !== 'Arquitecto' && req.user.rol !== 'Encargado') {
        return next(new AppError('Solo el arquitecto o encargado puede subir avances.', 403));
    }

    if (!files || files.length === 0) {
        return next(new AppError('Debe subir al menos una imagen.', 400));
    }

    if (!rubro_id) {
        return next(new AppError('Debe seleccionar un rubro.', 400));
    }

    const obra = await obraModel.findById(obraId);
    if (!obra) {
        return next(new AppError('Obra no encontrada.', 404));
    }

    const createdAvances = [];

    for (const file of files) {
        const host = req.get('host');
        const imageUrl = `${req.protocol}://${host}/uploads/${file.filename}`;

        const newAvance = await avanceModel.create({
            rubro_id: parseInt(rubro_id),
            obra_id: obraId,
            image_url: imageUrl,
            uploaded_by: req.user.id,
            descripcion: descripcion || ''
        });
        createdAvances.push(newAvance);
    }

    res.status(201).json({
        status: 'success',
        data: createdAvances,
        message: 'Avances registrados exitosamente.'
    });
});

// @route GET /api/obras/:obraId/avances
// @access Private (Todos con acceso a la obra)
const getAvancesByObra = catchAsync(async (req, res, next) => {
    const obraId = parseInt(req.params.obraId);

    const obra = await obraModel.findById(obraId);
    if (!obra) {
        return next(new AppError('Obra no encontrada.', 404));
    }

    if (req.user.rol === 'Cliente' && req.user.id !== obra.cliente_id) {
        return next(new AppError('No autorizado para ver esta obra.', 403));
    }

    const avances = await avanceModel.findByObraId(obraId);

    // Group by Rubro for easier frontend display
    const groupedAvances = avances.reduce((acc, avance) => {
        const rubroId = avance.rubro_id;
        if (!acc[rubroId]) {
            acc[rubroId] = {
                rubro_descripcion: avance.rubro_descripcion,
                avances: []
            };
        }
        acc[rubroId].avances.push(avance);
        return acc;
    }, {});

    res.status(200).json({
        status: 'success',
        data: groupedAvances
    });
});

module.exports = {
    createAvance,
    getAvancesByObra
};
