const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración del pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'license_app',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'license_management',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    timezone: '+00:00'
});

// Función para verificar la conexión
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✓ Conexión a la base de datos establecida correctamente');
        connection.release();
        return true;
    } catch (error) {
        console.error('✗ Error al conectar con la base de datos:', error.message);
        return false;
    }
};

// Función para ejecutar queries
const query = async (sql, params) => {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Error en query:', error.message);
        throw error;
    }
};

// Función para transacciones
const transaction = async (callback) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Cerrar pool de conexiones
const closePool = async () => {
    try {
        await pool.end();
        console.log('Pool de conexiones cerrado');
    } catch (error) {
        console.error('Error al cerrar pool:', error.message);
    }
};

module.exports = {
    pool,
    query,
    transaction,
    testConnection,
    closePool
};
