const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, logAccess } = require('../middleware/auth');

/**
 * @route   POST /api/v1/auth/register/admin
 * @desc    Registrar nuevo administrador
 * @access  Public (debería ser protegido en producción)
 */
router.post('/register/admin', authController.registerAdmin);

/**
 * @route   POST /api/v1/auth/login/admin
 * @desc    Login de administrador
 * @access  Public
 */
router.post(
    '/login/admin',
    logAccess('login'),
    authController.loginAdmin
);

/**
 * @route   POST /api/v1/auth/login/user
 * @desc    Login de usuario del sistema
 * @access  Public
 */
router.post(
    '/login/user',
    logAccess('login'),
    authController.loginUser
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Cerrar sesión
 * @access  Private
 */
router.post(
    '/logout',
    verifyToken,
    authController.logout
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refrescar access token
 * @access  Public
 */
router.post('/refresh', authController.refreshToken);

module.exports = router;
