const express = require('express');
const router = express.Router();
const licenseController = require('../controllers/licenseController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { verifyLicense, addLicenseWarning } = require('../middleware/license');

/**
 * @route   POST /api/v1/license/verify
 * @desc    Verificar estado de licencia
 * @access  Public
 */
router.post('/verify', licenseController.verifyLicense);

/**
 * @route   GET /api/v1/license/info
 * @desc    Obtener información detallada de licencia
 * @access  Private (requiere licencia válida)
 */
router.get(
    '/info',
    verifyLicense,
    addLicenseWarning,
    licenseController.getLicenseInfo
);

/**
 * @route   POST /api/v1/license/renew
 * @desc    Renovar licencia
 * @access  Private (requiere autenticación de admin)
 */
router.post(
    '/renew',
    verifyToken,
    verifyAdmin,
    licenseController.renewLicense
);

/**
 * @route   GET /api/v1/license/notifications
 * @desc    Obtener notificaciones de licencia
 * @access  Private
 */
router.get(
    '/notifications',
    verifyLicense,
    licenseController.getLicenseNotifications
);

/**
 * @route   PUT /api/v1/license/notifications/:notification_id/read
 * @desc    Marcar notificación como leída
 * @access  Private
 */
router.put(
    '/notifications/:notification_id/read',
    verifyLicense,
    licenseController.markNotificationRead
);

/**
 * @route   POST /api/v1/license/generate
 * @desc    Generar nueva licencia
 * @access  Private (solo super_admin)
 */
router.post(
    '/generate',
    verifyToken,
    verifyAdmin,
    licenseController.generateLicense
);

/**
 * @route   GET /api/v1/license/stats
 * @desc    Obtener estadísticas de licencia
 * @access  Private
 */
router.get(
    '/stats',
    verifyLicense,
    licenseController.getLicenseStats
);

module.exports = router;
