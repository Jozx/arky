const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const architectController = require('../controllers/architectController');
const { protect, authorize } = require('../middleware/authMiddleware');

// RUTAS PÚBLICAS
// -----------------------------------------------------------------------------
// POST /api/users/login
router.post('/login', authController.login);

// POST /api/users/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// PATCH /api/users/reset-password/:token
router.patch('/reset-password/:token', authController.resetPassword);

// RUTAS PROTEGIDAS
// -----------------------------------------------------------------------------
router.use(protect); // Todas las rutas debajo de esta línea requieren autenticación

// GET /api/users (Listar usuarios - Solo Arquitectos y Encargados)
router.get('/', authorize('Arquitecto', 'Encargado', 'Admin'), userController.getUsers);

// RUTAS DE ADMIN
// -----------------------------------------------------------------------------
// POST /api/users/admin/register-architect (Solo Admin puede crear Arquitectos)
router.post('/admin/register-architect', authorize('Admin'), adminController.registerArchitect);

// GET /api/users/admin/users (Listar todos los usuarios)
router.get('/admin/users', authorize('Admin'), adminController.getAllUsers);

// PATCH /api/users/admin/users/:userId (Actualizar usuario)
router.patch('/admin/users/:userId', authorize('Admin'), adminController.updateUser);

// PATCH /api/users/admin/users/:userId/status (Cambiar estado)
router.patch('/admin/users/:userId/status', authorize('Admin'), adminController.toggleUserStatus);

// RUTAS DE ARQUITECTO
// -----------------------------------------------------------------------------
// POST /api/users/architect/register-client (Solo Arquitecto puede crear Clientes)
router.post('/architect/register-client', authorize('Arquitecto'), architectController.registerClient);

module.exports = router;