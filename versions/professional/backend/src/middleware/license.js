const { query } = require('../../config/database');
const logger = require('../../config/logger');

/**
 * Middleware para verificar licencia válida
 */
const verifyLicense = async (req, res, next) => {
    try {
        const licenseKey = process.env.LICENSE_KEY;

        if (!licenseKey) {
            logger.error('LICENSE_KEY no configurada en variables de entorno');
            return res.status(500).json({
                success: false,
                message: 'Error de configuración del sistema'
            });
        }

        // Llamar al procedimiento almacenado para verificar licencia
        const [licenseData] = await query(
            `CALL verify_license(?)`,
            [licenseKey]
        );

        if (!licenseData || licenseData.length === 0 || !licenseData[0] || licenseData[0].length === 0) {
            logger.error('Licencia no encontrada');
            return res.status(403).json({
                success: false,
                message: 'Licencia no válida',
                requiresPayment: true
            });
        }

        const license = licenseData[0][0];

        // Verificar si la licencia está activa
        if (!license.is_valid) {
            const daysRemaining = license.days_remaining;

            // Si está expirada
            if (license.status === 'expired') {
                logger.warn(`Licencia expirada: ${licenseKey}`);
                return res.status(403).json({
                    success: false,
                    message: 'Su licencia ha expirado. Por favor, renueve su suscripción para continuar usando el servicio.',
                    requiresPayment: true,
                    expiredDate: license.expiration_date,
                    status: 'expired'
                });
            }

            // Si requiere pago
            if (license.payment_status === 'pending' || license.payment_status === 'overdue') {
                logger.warn(`Licencia pendiente de pago: ${licenseKey}`);
                return res.status(403).json({
                    success: false,
                    message: 'Pago pendiente. Por favor, complete el pago para continuar.',
                    requiresPayment: true,
                    status: license.status,
                    paymentStatus: license.payment_status
                });
            }

            // Otras razones
            return res.status(403).json({
                success: false,
                message: 'Licencia no válida',
                requiresPayment: true,
                status: license.status
            });
        }

        // Verificar si está próxima a vencer (7 días)
        if (license.days_remaining <= 7 && license.days_remaining > 0) {
            // Agregar warning al response
            res.locals.licenseWarning = {
                message: `Su licencia vencerá en ${license.days_remaining} días. Por favor, renueve para evitar interrupciones.`,
                daysRemaining: license.days_remaining,
                expirationDate: license.expiration_date
            };
        }

        // Agregar información de licencia al request
        req.license = license;

        next();
    } catch (error) {
        logger.error('Error al verificar licencia:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al verificar licencia'
        });
    }
};

/**
 * Middleware para verificar características habilitadas según tipo de licencia
 */
const verifyFeature = (featureName) => {
    return async (req, res, next) => {
        try {
            if (!req.license) {
                return res.status(403).json({
                    success: false,
                    message: 'Licencia no verificada'
                });
            }

            // Parsear features JSON
            let features;
            try {
                features = typeof req.license.features === 'string'
                    ? JSON.parse(req.license.features)
                    : req.license.features;
            } catch (e) {
                features = {};
            }

            // Verificar si la característica está habilitada
            if (!features[featureName]) {
                return res.status(403).json({
                    success: false,
                    message: `La característica "${featureName}" no está disponible en su plan actual.`,
                    feature: featureName,
                    currentPlan: req.license.license_type,
                    upgradeRequired: true
                });
            }

            next();
        } catch (error) {
            logger.error('Error al verificar característica:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al verificar permisos de característica'
            });
        }
    };
};

/**
 * Middleware para verificar límites de usuarios
 */
const verifyUserLimit = async (req, res, next) => {
    try {
        if (!req.license) {
            return res.status(403).json({
                success: false,
                message: 'Licencia no verificada'
            });
        }

        // Contar usuarios actuales
        const [userCount] = await query(
            `SELECT COUNT(*) as count FROM system_users WHERE license_id = ? AND is_active = TRUE`,
            [req.license.id]
        );

        const currentUsers = userCount[0].count;
        const maxUsers = req.license.max_users;

        if (currentUsers >= maxUsers) {
            return res.status(403).json({
                success: false,
                message: `Ha alcanzado el límite máximo de usuarios (${maxUsers}) para su plan.`,
                currentUsers,
                maxUsers,
                upgradeRequired: true
            });
        }

        req.licenseUsage = {
            currentUsers,
            maxUsers,
            availableSlots: maxUsers - currentUsers
        };

        next();
    } catch (error) {
        logger.error('Error al verificar límite de usuarios:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al verificar límites'
        });
    }
};

/**
 * Middleware para agregar warning de licencia a todas las respuestas
 */
const addLicenseWarning = (req, res, next) => {
    const originalJson = res.json;

    res.json = function(data) {
        if (res.locals.licenseWarning) {
            data.licenseWarning = res.locals.licenseWarning;
        }
        originalJson.call(this, data);
    };

    next();
};

/**
 * Función para verificar si necesita verificación (cada 7 días)
 */
const needsVerification = async (licenseKey) => {
    try {
        const licenses = await query(
            `SELECT last_verification, next_verification FROM licenses WHERE license_key = ?`,
            [licenseKey]
        );

        if (licenses.length === 0) {
            return true; // Necesita verificación si no existe
        }

        const license = licenses[0];

        // Si nunca se ha verificado
        if (!license.next_verification) {
            return true;
        }

        // Si la fecha de próxima verificación ya pasó
        const now = new Date();
        const nextVerification = new Date(license.next_verification);

        return now >= nextVerification;
    } catch (error) {
        logger.error('Error al verificar si necesita verificación:', error);
        return true; // En caso de error, forzar verificación
    }
};

/**
 * Tarea programada para verificar licencias (ejecutar cada 24 horas)
 */
const scheduleLicenseCheck = () => {
    const CronJob = require('cron').CronJob;

    // Ejecutar todos los días a las 2:00 AM
    const job = new CronJob('0 2 * * *', async () => {
        try {
            logger.info('Ejecutando verificación programada de licencias...');

            const licenseKey = process.env.LICENSE_KEY;
            if (!licenseKey) {
                logger.error('LICENSE_KEY no configurada');
                return;
            }

            // Verificar licencia
            await query(`CALL verify_license(?)`, [licenseKey]);

            logger.info('Verificación programada completada');
        } catch (error) {
            logger.error('Error en verificación programada:', error);
        }
    });

    job.start();
    logger.info('Tarea programada de verificación de licencias iniciada');
};

module.exports = {
    verifyLicense,
    verifyFeature,
    verifyUserLimit,
    addLicenseWarning,
    needsVerification,
    scheduleLicenseCheck
};
