const { query } = require('../../config/database');
const logger = require('../../config/logger');
const crypto = require('crypto');

/**
 * Verificar estado de licencia
 */
const verifyLicense = async (req, res) => {
    try {
        const { license_key } = req.body;

        if (!license_key) {
            return res.status(400).json({
                success: false,
                message: 'License key es requerido'
            });
        }

        // Llamar al procedimiento almacenado
        const [result] = await query(
            `CALL verify_license(?)`,
            [license_key]
        );

        if (!result || !result[0] || result[0].length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Licencia no encontrada'
            });
        }

        const license = result[0][0];

        res.json({
            success: true,
            data: {
                license_key: license.license_key,
                license_type: license.license_type,
                company_name: license.company_name,
                status: license.status,
                is_valid: license.is_valid,
                expiration_date: license.expiration_date,
                days_remaining: license.days_remaining,
                payment_status: license.payment_status,
                last_verification: license.last_verification,
                next_verification: license.next_verification,
                features: typeof license.features === 'string'
                    ? JSON.parse(license.features)
                    : license.features
            }
        });
    } catch (error) {
        logger.error('Error al verificar licencia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar licencia'
        });
    }
};

/**
 * Obtener información detallada de licencia
 */
const getLicenseInfo = async (req, res) => {
    try {
        const licenseKey = req.license?.license_key || process.env.LICENSE_KEY;

        const licenses = await query(
            `SELECT l.*,
                    COUNT(DISTINCT su.id) as active_users,
                    COUNT(DISTINCT ass.id) as active_sessions
             FROM licenses l
             LEFT JOIN system_users su ON l.id = su.license_id AND su.is_active = TRUE
             LEFT JOIN active_sessions ass ON l.id = ass.license_id AND ass.is_active = TRUE
             WHERE l.license_key = ?
             GROUP BY l.id`,
            [licenseKey]
        );

        if (licenses.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Licencia no encontrada'
            });
        }

        const license = licenses[0];

        // Obtener últimas renovaciones
        const renewals = await query(
            `SELECT * FROM license_renewals
             WHERE license_id = ?
             ORDER BY created_at DESC
             LIMIT 5`,
            [license.id]
        );

        // Calcular días restantes
        const expirationDate = new Date(license.expiration_date);
        const today = new Date();
        const daysRemaining = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

        res.json({
            success: true,
            data: {
                license: {
                    id: license.id,
                    license_key: license.license_key,
                    license_type: license.license_type,
                    company_name: license.company_name,
                    contact_email: license.contact_email,
                    status: license.status,
                    payment_status: license.payment_status,
                    is_paid: license.is_paid,
                    purchase_date: license.purchase_date,
                    activation_date: license.activation_date,
                    expiration_date: license.expiration_date,
                    days_remaining: daysRemaining,
                    max_users: license.max_users,
                    max_devices: license.max_devices,
                    active_users: license.active_users,
                    active_sessions: license.active_sessions,
                    features: typeof license.features === 'string'
                        ? JSON.parse(license.features)
                        : license.features
                },
                renewals,
                warnings: daysRemaining <= 7 && daysRemaining > 0 ? [{
                    type: 'expiration_warning',
                    message: `Su licencia vencerá en ${daysRemaining} días`,
                    days_remaining: daysRemaining
                }] : []
            }
        });
    } catch (error) {
        logger.error('Error al obtener información de licencia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener información de licencia'
        });
    }
};

/**
 * Renovar licencia
 */
const renewLicense = async (req, res) => {
    try {
        const { license_id, amount, payment_method, payment_reference } = req.body;

        if (!license_id || !amount || !payment_method) {
            return res.status(400).json({
                success: false,
                message: 'license_id, amount y payment_method son requeridos'
            });
        }

        // Verificar que la licencia existe
        const licenses = await query(
            `SELECT * FROM licenses WHERE id = ?`,
            [license_id]
        );

        if (licenses.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Licencia no encontrada'
            });
        }

        // Llamar al procedimiento almacenado de renovación
        await query(
            `CALL renew_license(?, ?, ?, ?)`,
            [license_id, amount, payment_method, payment_reference || null]
        );

        logger.info(`Licencia renovada: ${license_id}`);

        res.json({
            success: true,
            message: 'Licencia renovada exitosamente'
        });
    } catch (error) {
        logger.error('Error al renovar licencia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al renovar licencia'
        });
    }
};

/**
 * Obtener notificaciones de licencia
 */
const getLicenseNotifications = async (req, res) => {
    try {
        const licenseId = req.license?.id;

        if (!licenseId) {
            return res.status(400).json({
                success: false,
                message: 'License ID no encontrado'
            });
        }

        const notifications = await query(
            `SELECT * FROM notifications
             WHERE license_id = ? AND (expires_at IS NULL OR expires_at > NOW())
             ORDER BY sent_at DESC
             LIMIT 20`,
            [licenseId]
        );

        // Contar no leídas
        const unreadCount = await query(
            `SELECT COUNT(*) as count FROM notifications
             WHERE license_id = ? AND is_read = FALSE AND (expires_at IS NULL OR expires_at > NOW())`,
            [licenseId]
        );

        res.json({
            success: true,
            data: {
                notifications,
                unread_count: unreadCount[0].count
            }
        });
    } catch (error) {
        logger.error('Error al obtener notificaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener notificaciones'
        });
    }
};

/**
 * Marcar notificación como leída
 */
const markNotificationRead = async (req, res) => {
    try {
        const { notification_id } = req.params;

        await query(
            `UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ?`,
            [notification_id]
        );

        res.json({
            success: true,
            message: 'Notificación marcada como leída'
        });
    } catch (error) {
        logger.error('Error al marcar notificación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar notificación'
        });
    }
};

/**
 * Generar nueva licencia (solo admin)
 */
const generateLicense = async (req, res) => {
    try {
        const {
            license_type,
            company_name,
            contact_email,
            contact_phone,
            max_users,
            max_devices,
            features
        } = req.body;

        if (!license_type || !company_name || !contact_email) {
            return res.status(400).json({
                success: false,
                message: 'license_type, company_name y contact_email son requeridos'
            });
        }

        // Generar license key único
        const licenseKey = generateLicenseKey(license_type);

        // Determinar características según tipo de licencia
        let defaultFeatures = {};
        let defaultMaxUsers = 1;
        let defaultMaxDevices = 1;

        switch (license_type) {
            case 'free':
                defaultFeatures = {
                    dashboard: true,
                    basic_reports: true,
                    user_management: false,
                    advanced_analytics: false,
                    api_access: false,
                    custom_branding: false
                };
                defaultMaxUsers = 1;
                defaultMaxDevices = 1;
                break;
            case 'basic':
                defaultFeatures = {
                    dashboard: true,
                    basic_reports: true,
                    user_management: true,
                    advanced_analytics: false,
                    api_access: false,
                    custom_branding: false
                };
                defaultMaxUsers = 5;
                defaultMaxDevices = 3;
                break;
            case 'professional':
                defaultFeatures = {
                    dashboard: true,
                    basic_reports: true,
                    user_management: true,
                    advanced_analytics: true,
                    api_access: true,
                    custom_branding: false
                };
                defaultMaxUsers = 20;
                defaultMaxDevices = 10;
                break;
            case 'enterprise':
                defaultFeatures = {
                    dashboard: true,
                    basic_reports: true,
                    user_management: true,
                    advanced_analytics: true,
                    api_access: true,
                    custom_branding: true
                };
                defaultMaxUsers = 999999;
                defaultMaxDevices = 999999;
                break;
        }

        const finalFeatures = features || defaultFeatures;
        const finalMaxUsers = max_users || defaultMaxUsers;
        const finalMaxDevices = max_devices || defaultMaxDevices;

        // Calcular fechas
        const purchaseDate = new Date();
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);

        // Insertar licencia
        const result = await query(
            `INSERT INTO licenses
            (license_key, license_type, company_name, contact_email, contact_phone,
             max_users, max_devices, purchase_date, activation_date, expiration_date,
             status, is_paid, payment_status, features)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                licenseKey,
                license_type,
                company_name,
                contact_email,
                contact_phone || null,
                finalMaxUsers,
                finalMaxDevices,
                purchaseDate,
                purchaseDate,
                expirationDate,
                'active',
                license_type === 'free' ? true : false,
                license_type === 'free' ? 'free' : 'pending',
                JSON.stringify(finalFeatures)
            ]
        );

        logger.info(`Nueva licencia generada: ${licenseKey} para ${company_name}`);

        res.status(201).json({
            success: true,
            message: 'Licencia generada exitosamente',
            data: {
                license_id: result.insertId,
                license_key: licenseKey,
                license_type,
                company_name,
                expiration_date: expirationDate,
                max_users: finalMaxUsers,
                max_devices: finalMaxDevices,
                features: finalFeatures
            }
        });
    } catch (error) {
        logger.error('Error al generar licencia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar licencia'
        });
    }
};

/**
 * Función helper para generar license key
 */
function generateLicenseKey(type) {
    const prefix = type.toUpperCase().substring(0, 4);
    const parts = [];

    for (let i = 0; i < 4; i++) {
        const part = crypto.randomBytes(2).toString('hex').toUpperCase();
        parts.push(part);
    }

    return `${prefix}-${parts.join('-')}`;
}

/**
 * Obtener estadísticas de licencia
 */
const getLicenseStats = async (req, res) => {
    try {
        const licenseId = req.license?.id;

        if (!licenseId) {
            return res.status(400).json({
                success: false,
                message: 'License ID no encontrado'
            });
        }

        // Estadísticas de acceso
        const [accessStats] = await query(
            `SELECT * FROM license_access_stats WHERE license_id = ?`,
            [licenseId]
        );

        // Logs recientes
        const recentLogs = await query(
            `SELECT log_level, category, message, timestamp
             FROM system_logs
             WHERE license_id = ?
             ORDER BY timestamp DESC
             LIMIT 10`,
            [licenseId]
        );

        // Sesiones activas
        const activeSessions = await query(
            `SELECT COUNT(*) as count FROM active_sessions
             WHERE license_id = ? AND is_active = TRUE AND expires_at > NOW()`,
            [licenseId]
        );

        res.json({
            success: true,
            data: {
                access_stats: accessStats || {},
                recent_logs: recentLogs,
                active_sessions: activeSessions[0].count
            }
        });
    } catch (error) {
        logger.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
        });
    }
};

module.exports = {
    verifyLicense,
    getLicenseInfo,
    renewLicense,
    getLicenseNotifications,
    markNotificationRead,
    generateLicense,
    getLicenseStats
};
