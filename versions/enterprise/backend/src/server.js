require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('../config/database');
const { scheduleLicenseCheck } = require('./middleware/license');
const logger = require('../config/logger');

// Crear aplicación Express
const app = express();

// =====================================================
// CONFIGURACIÓN DE MIDDLEWARES
// =====================================================

// Helmet para seguridad
app.use(helmet());

// CORS
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Logging de peticiones
app.use((req, res, next) => {
    logger.http(`${req.method} ${req.path} - ${req.ip}`);
    next();
});

// =====================================================
// RUTAS
// =====================================================

// Ruta de salud
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'SystemSegure API - FREE Version',
        version: process.env.API_VERSION || 'v1',
        timestamp: new Date().toISOString(),
        license_type: process.env.LICENSE_TYPE || 'free'
    });
});

// Rutas de API
const authRoutes = require('./routes/auth.routes');
const licenseRoutes = require('./routes/license.routes');

app.use(`/api/${process.env.API_VERSION || 'v1'}/auth`, authRoutes);
app.use(`/api/${process.env.API_VERSION || 'v1'}/license`, licenseRoutes);

// Ruta 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// =====================================================
// MANEJO DE ERRORES
// =====================================================

app.use((err, req, res, next) => {
    logger.error('Error no manejado:', err);

    // Error de validación
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: err.errors
        });
    }

    // Error de sintaxis JSON
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: 'JSON inválido'
        });
    }

    // Error general
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Verificar conexión a base de datos
        const dbConnected = await testConnection();

        if (!dbConnected) {
            logger.error('No se pudo conectar a la base de datos. Abortando inicio del servidor.');
            process.exit(1);
        }

        // Verificar que LICENSE_KEY esté configurada
        if (!process.env.LICENSE_KEY) {
            logger.warn('WARNING: LICENSE_KEY no configurada en .env');
        }

        // Iniciar servidor
        app.listen(PORT, () => {
            logger.info(`
┌─────────────────────────────────────────────────┐
│                                                 │
│     SystemSegure API - FREE Version             │
│                                                 │
│     Servidor iniciado en puerto ${PORT}            │
│     Entorno: ${process.env.NODE_ENV || 'development'}                    │
│     Tipo de licencia: ${process.env.LICENSE_TYPE || 'free'}                  │
│                                                 │
│     API: http://localhost:${PORT}/api/v1           │
│     Health: http://localhost:${PORT}/health        │
│                                                 │
└─────────────────────────────────────────────────┘
            `);

            // Programar verificación de licencias
            scheduleLicenseCheck();
            logger.info('Verificación automática de licencias programada');
        });
    } catch (error) {
        logger.error('Error al iniciar servidor:', error);
        process.exit(1);
    }
};

// Manejo de señales de cierre
process.on('SIGTERM', () => {
    logger.info('SIGTERM recibido. Cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT recibido. Cerrando servidor...');
    process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection en:', promise, 'razón:', reason);
});

// Iniciar servidor
startServer();

module.exports = app;
