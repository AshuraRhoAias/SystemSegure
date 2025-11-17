const winston = require('winston');
const path = require('path');
require('dotenv').config();

// Definir niveles de log personalizados
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Definir colores para cada nivel
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

winston.addColors(colors);

// Formato de log
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Formato para consola
const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// Crear directorio de logs si no existe
const logDir = process.env.LOG_FILE_PATH || './logs';
const fs = require('fs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Configuración de transports
const transports = [
    // Consola
    new winston.transports.Console({
        format: consoleFormat,
    }),

    // Archivo de errores
    new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 14,
    }),

    // Archivo de todos los logs
    new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
        maxsize: 10485760, // 10MB
        maxFiles: 14,
    }),

    // Archivo de accesos HTTP
    new winston.transports.File({
        filename: path.join(logDir, 'http.log'),
        level: 'http',
        maxsize: 10485760, // 10MB
        maxFiles: 7,
    }),
];

// Crear logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format,
    transports,
    exitOnError: false,
});

// Función helper para logging de base de datos
logger.logToDatabase = async (logData) => {
    try {
        const { query } = require('./database');
        await query(
            `INSERT INTO system_logs
            (license_id, user_id, log_level, category, message, error_code, stack_trace, request_data, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                logData.license_id || null,
                logData.user_id || null,
                logData.level || 'info',
                logData.category || 'system',
                logData.message,
                logData.error_code || null,
                logData.stack_trace || null,
                logData.request_data ? JSON.stringify(logData.request_data) : null,
                logData.ip_address || null,
                logData.user_agent || null
            ]
        );
    } catch (error) {
        logger.error('Error al guardar log en base de datos:', error);
    }
};

module.exports = logger;
