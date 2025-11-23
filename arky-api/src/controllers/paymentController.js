const paymentModel = require('../models/paymentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const registerPayment = catchAsync(async (req, res, next) => {
    const { projectId } = req.params;
    const { amountPaid, paymentDate, description } = req.body;
    const userId = req.user.id; // Assumes auth middleware populates req.user

    if (!amountPaid || !paymentDate) {
        return next(new AppError('Monto y fecha son obligatorios.', 400));
    }

    const newPayment = await paymentModel.create(projectId, { amountPaid, paymentDate, description }, userId);

    res.status(201).json({
        status: 'success',
        data: {
            payment: newPayment
        }
    });
});

const getPaymentsByProject = catchAsync(async (req, res, next) => {
    const { projectId } = req.params;
    const payments = await paymentModel.findByProjectId(projectId);

    res.status(200).json({
        status: 'success',
        data: {
            payments
        }
    });
});

module.exports = {
    registerPayment,
    getPaymentsByProject
};
