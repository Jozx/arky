const express = require('express');
const router = express.Router({ mergeParams: true }); // Important for accessing :projectId from parent route
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Routes for /api/projects/:projectId/payments
// Note: In server.js, we will likely mount this at /api/obras/:projectId/pagos or similar.
// If we mount at /api/obras, we need to handle the nesting.
// Let's assume we mount it specifically for payments or use mergeParams.

// GET /api/obras/:projectId/pagos
router.get('/:projectId/pagos', protect, paymentController.getPaymentsByProject);

// POST /api/obras/:projectId/pagos (Architect only)
router.post('/:projectId/pagos', protect, authorize('Arquitecto'), paymentController.registerPayment);

module.exports = router;
