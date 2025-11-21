const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /api/users/register
router.post('/register', userController.register);

// POST /api/users/login
router.post('/login', userController.login);

// GET /api/users (Protegido, para listar clientes, etc.)
const { protect, authorize } = require('../middleware/authMiddleware');
router.get('/', protect, authorize('Arquitecto', 'Encargado'), userController.getUsers);

module.exports = router;