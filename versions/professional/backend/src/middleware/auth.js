const jwt = require('jsonwebtoken');
const { query } = require('../../config/database');
const logger = require('../../config/logger');

/**
 * Middleware para verificar token JWT
 */
const verifyToken = async (req, res, next) => {
    try {
        // Obtener token del header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const token = authHeader.substring(7);

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verificar si la sesión está activa
        const sessions = await query(
            `SELECT * FROM active_sessions
             WHERE session_token = ? AND is_active = TRUE AND expires_at > NOW()`,
            [token]
        );

        if (sessions.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Sesión inválida o expirada'
            });
        }

        // Actualizar última actividad
        await query(
            `UPDATE active_sessions SET last_activity = NOW() WHERE session_token = ?`,
            [token]
        );

        // Agregar información del usuario al request
        req.user = decoded;
        req.session = sessions[0];

        next();
    } catch (error) {
        logger.error('Error en verificación de token:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error al verificar autenticación'
        });
    }
};

/**
 * Middleware para verificar roles de administrador
 */
const verifyAdmin = async (req, res, next) => {
    try {
        const adminUser = await query(
            `SELECT * FROM admin_users WHERE id = ? AND is_active = TRUE`,
            [req.user.id]
        );

        if (adminUser.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado: Se requieren permisos de administrador'
            });
        }

        req.admin = adminUser[0];
        next();
    } catch (error) {
        logger.error('Error en verificación de admin:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al verificar permisos'
        });
    }
};

/**
 * Middleware para verificar roles específicos
 */
const verifyRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.role) {
                return res.status(403).json({
                    success: false,
                    message: 'Rol no definido'
                });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene permisos para realizar esta acción'
                });
            }

            next();
        } catch (error) {
            logger.error('Error en verificación de rol:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al verificar permisos'
            });
        }
    };
};

/**
 * Middleware para registrar intentos de acceso
 */
const logAccess = (attemptType) => {
    return async (req, res, next) => {
        const originalSend = res.send;

        res.send = function(data) {
            const success = res.statusCode < 400;
            const failureReason = success ? null : (typeof data === 'string' ? data : JSON.stringify(data));

            // Registrar intento de acceso de forma asíncrona
            query(
                `CALL log_access_attempt(?, ?, ?, ?, ?, ?, ?)`,
                [
                    req.user?.license_id || null,
                    req.user?.username || req.body?.username || 'anonymous',
                    req.ip,
                    req.get('user-agent'),
                    attemptType,
                    success,
                    failureReason
                ]
            ).catch(error => {
                logger.error('Error al registrar intento de acceso:', error);
            });

            originalSend.call(this, data);
        };

        next();
    };
};

module.exports = {
    verifyToken,
    verifyAdmin,
    verifyRole,
    logAccess
};
