const paymentModel = require('../models/paymentModel');

async function registerPayment(req, res, next) {
    try {
        const { projectId } = req.params;
        const { amountPaid, paymentDate, description } = req.body;
        const userId = req.user.id; // Assumes auth middleware populates req.user

        if (!amountPaid || !paymentDate) {
            return res.status(400).json({
                status: 'fail',
                message: 'Monto y fecha son obligatorios.'
            });
        }

        const newPayment = await paymentModel.create(projectId, { amountPaid, paymentDate, description }, userId);

        res.status(201).json({
            status: 'success',
            data: {
                payment: newPayment
            }
        });
    } catch (err) {
        next(err);
    }
}

async function getPaymentsByProject(req, res, next) {
    try {
        const { projectId } = req.params;
        const payments = await paymentModel.findByProjectId(projectId);

        res.status(200).json({
            status: 'success',
            data: {
                payments
            }
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    registerPayment,
    getPaymentsByProject
};
