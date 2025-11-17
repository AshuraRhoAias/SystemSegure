const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query, transaction } = require('../../config/database');
const logger = require('../../config/logger');

/**
 * Registrar nuevo usuario administrador
 */
const registerAdmin = async (req, res) => {
    try {
        const { username, email, password, full_name, role } = req.body;

        // Validar datos requeridos
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email y password son requeridos'
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await query(
            `SELECT id FROM admin_users WHERE username = ? OR email = ?`,
            [username, email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'El usuario o email ya existe'
            });
        }

        // Hash de password
        const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

        // Insertar usuario
        const result = await query(
            `INSERT INTO admin_users (username, email, password_hash, full_name, role)
             VALUES (?, ?, ?, ?, ?)`,
            [username, email, passwordHash, full_name || null, role || 'admin']
        );

        logger.info(`Nuevo usuario administrador registrado: ${username}`);

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                id: result.insertId,
                username,
                email,
                role: role || 'admin'
            }
        });
    } catch (error) {
        logger.error('Error al registrar administrador:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario'
        });
    }
};

/**
 * Login de administrador
 */
const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        // Validar datos
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username y password son requeridos'
            });
        }

        // Buscar usuario
        const users = await query(
            `SELECT * FROM admin_users WHERE username = ? OR email = ?`,
            [username, username]
        );

        if (users.length === 0) {
            // Log intento fallido
            await query(
                `CALL log_access_attempt(?, ?, ?, ?, ?, ?, ?)`,
                [null, username, ip, userAgent, 'login', false, 'Usuario no encontrado']
            );

            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const user = users[0];

        // Verificar si está activo
        if (!user.is_active) {
            await query(
                `CALL log_access_attempt(?, ?, ?, ?, ?, ?, ?)`,
                [null, username, ip, userAgent, 'login', false, 'Usuario inactivo']
            );

            return res.status(403).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        // Verificar password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            await query(
                `CALL log_access_attempt(?, ?, ?, ?, ?, ?, ?)`,
                [null, username, ip, userAgent, 'login', false, 'Password incorrecto']
            );

            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Generar tokens
        const accessToken = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                type: 'admin'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        const refreshToken = jwt.sign(
            { id: user.id, type: 'admin' },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
        );

        // Crear sesión
        const sessionExpiry = new Date();
        sessionExpiry.setHours(sessionExpiry.getHours() + 24);

        // Para admin no necesitamos license_id, usamos NULL o un valor especial
        await query(
            `INSERT INTO active_sessions (license_id, user_id, session_token, ip_address, user_agent, expires_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [null, user.id, accessToken, ip, userAgent, sessionExpiry]
        );

        // Actualizar último login
        await query(
            `UPDATE admin_users SET last_login = NOW() WHERE id = ?`,
            [user.id]
        );

        // Log intento exitoso
        await query(
            `CALL log_access_attempt(?, ?, ?, ?, ?, ?, ?)`,
            [null, username, ip, userAgent, 'login', true, null]
        );

        logger.info(`Admin login exitoso: ${username}`);

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        logger.error('Error en login admin:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión'
        });
    }
};

/**
 * Login de usuario del sistema
 */
const loginUser = async (req, res) => {
    try {
        const { username, password, license_key } = req.body;
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        if (!username || !password || !license_key) {
            return res.status(400).json({
                success: false,
                message: 'Username, password y license_key son requeridos'
            });
        }

        // Verificar licencia primero
        const licenses = await query(
            `SELECT * FROM licenses WHERE license_key = ?`,
            [license_key]
        );

        if (licenses.length === 0) {
            await query(
                `CALL log_access_attempt(?, ?, ?, ?, ?, ?, ?)`,
                [null, username, ip, userAgent, 'login', false, 'Licencia no encontrada']
            );

            return res.status(401).json({
                success: false,
                message: 'Licencia inválida'
            });
        }

        const license = licenses[0];

        // Verificar estado de licencia
        if (license.status !== 'active') {
            await query(
                `CALL log_access_attempt(?, ?, ?, ?, ?, ?, ?)`,
                [license.id, username, ip, userAgent, 'login', false, `Licencia ${license.status}`]
            );

            return res.status(403).json({
                success: false,
                message: `La licencia está ${license.status}`,
                requiresPayment: license.status === 'expired' || license.payment_status !== 'paid'
            });
        }

        // Buscar usuario
        const users = await query(
            `SELECT * FROM system_users WHERE license_id = ? AND (username = ? OR email = ?)`,
            [license.id, username, username]
        );

        if (users.length === 0) {
            await query(
                `CALL log_access_attempt(?, ?, ?, ?, ?, ?, ?)`,
                [license.id, username, ip, userAgent, 'login', false, 'Usuario no encontrado']
            );

            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const user = users[0];

        // Verificar si está activo
        if (!user.is_active) {
            await query(
                `CALL log_access_attempt(?, ?, ?, ?, ?, ?, ?)`,
                [license.id, username, ip, userAgent, 'login', false, 'Usuario inactivo']
            );

            return res.status(403).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        // Verificar password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            await query(
                `CALL log_access_attempt(?, ?, ?, ?, ?, ?, ?)`,
                [license.id, username, ip, userAgent, 'login', false, 'Password incorrecto']
            );

            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Generar tokens
        const accessToken = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                license_id: license.id,
                license_type: license.license_type,
                type: 'user'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        const refreshToken = jwt.sign(
            { id: user.id, license_id: license.id, type: 'user' },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
        );

        // Crear sesión
        const sessionExpiry = new Date();
        sessionExpiry.setHours(sessionExpiry.getHours() + 24);

        await query(
            `INSERT INTO active_sessions (license_id, user_id, session_token, ip_address, user_agent, expires_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [license.id, user.id, accessToken, ip, userAgent, sessionExpiry]
        );

        // Actualizar último login
        await query(
            `UPDATE system_users SET last_login = NOW(), last_ip = ? WHERE id = ?`,
            [ip, user.id]
        );

        // Log intento exitoso
        await query(
            `CALL log_access_attempt(?, ?, ?, ?, ?, ?, ?)`,
            [license.id, username, ip, userAgent, 'login', true, null]
        );

        logger.info(`User login exitoso: ${username} (License: ${license_key})`);

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role
                },
                license: {
                    type: license.license_type,
                    expiration_date: license.expiration_date,
                    company_name: license.company_name
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        logger.error('Error en login user:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión'
        });
    }
};

/**
 * Logout
 */
const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.substring(7);

        if (token) {
            // Marcar sesión como inactiva
            await query(
                `UPDATE active_sessions SET is_active = FALSE WHERE session_token = ?`,
                [token]
            );
        }

        res.json({
            success: true,
            message: 'Logout exitoso'
        });
    } catch (error) {
        logger.error('Error en logout:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cerrar sesión'
        });
    }
};

/**
 * Refrescar token
 */
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token requerido'
            });
        }

        // Verificar refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Buscar usuario según el tipo
        let user;
        if (decoded.type === 'admin') {
            const users = await query(
                `SELECT * FROM admin_users WHERE id = ? AND is_active = TRUE`,
                [decoded.id]
            );
            user = users[0];
        } else {
            const users = await query(
                `SELECT * FROM system_users WHERE id = ? AND is_active = TRUE`,
                [decoded.id]
            );
            user = users[0];
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Generar nuevo access token
        const payload = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            type: decoded.type
        };

        if (decoded.type === 'user') {
            payload.license_id = decoded.license_id;
        }

        const newAccessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
            success: true,
            data: {
                accessToken: newAccessToken
            }
        });
    } catch (error) {
        logger.error('Error al refrescar token:', error);

        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Refresh token inválido o expirado'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al refrescar token'
        });
    }
};

module.exports = {
    registerAdmin,
    loginAdmin,
    loginUser,
    logout,
    refreshToken
};
