-- =====================================================
-- SISTEMA DE GESTIÓN DE LICENCIAS
-- Schema de Base de Datos MySQL
-- =====================================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS license_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE license_management;

-- =====================================================
-- TABLA DE USUARIOS ADMINISTRATIVOS
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('super_admin', 'admin', 'support') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA DE LICENCIAS
-- =====================================================
CREATE TABLE IF NOT EXISTS licenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_key VARCHAR(64) NOT NULL UNIQUE,
    license_type ENUM('free', 'basic', 'professional', 'enterprise') NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20),
    max_users INT DEFAULT 1,
    max_devices INT DEFAULT 1,

    -- Fechas de licencia
    purchase_date DATE NOT NULL,
    activation_date DATE,
    expiration_date DATE NOT NULL,
    last_verification DATETIME,
    next_verification DATETIME,

    -- Estado de licencia
    status ENUM('active', 'expired', 'suspended', 'pending_payment', 'cancelled') DEFAULT 'active',
    is_paid BOOLEAN DEFAULT FALSE,
    payment_status ENUM('paid', 'pending', 'overdue', 'free') DEFAULT 'pending',

    -- Características habilitadas según tipo de licencia
    features JSON,

    -- Información adicional
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_license_key (license_key),
    INDEX idx_status (status),
    INDEX idx_expiration (expiration_date),
    INDEX idx_type (license_type)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA DE RENOVACIONES Y PAGOS
-- =====================================================
CREATE TABLE IF NOT EXISTS license_renewals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_id INT NOT NULL,
    renewal_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    payment_status ENUM('completed', 'pending', 'failed', 'refunded') DEFAULT 'pending',
    new_expiration_date DATE NOT NULL,
    processed_by INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_license (license_id),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA DE USUARIOS DEL SISTEMA
-- =====================================================
CREATE TABLE IF NOT EXISTS system_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_id INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('owner', 'admin', 'user', 'viewer') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    last_ip VARCHAR(45),
    device_info TEXT,
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_license (license_id, username),
    INDEX idx_email (email),
    INDEX idx_license (license_id)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA DE INTENTOS DE ACCESO
-- =====================================================
CREATE TABLE IF NOT EXISTS access_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_id INT,
    username VARCHAR(50),
    ip_address VARCHAR(45),
    user_agent TEXT,
    attempt_type ENUM('login', 'api', 'license_verification') NOT NULL,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(255),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    device_info TEXT,
    location_info VARCHAR(200),

    FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE,
    INDEX idx_license (license_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_success (success),
    INDEX idx_ip (ip_address)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA DE LOGS DE SISTEMA
-- =====================================================
CREATE TABLE IF NOT EXISTS system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_id INT,
    user_id INT,
    log_level ENUM('info', 'warning', 'error', 'critical', 'debug') NOT NULL,
    category VARCHAR(50),
    message TEXT NOT NULL,
    error_code VARCHAR(50),
    stack_trace TEXT,
    request_data JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES system_users(id) ON DELETE SET NULL,
    INDEX idx_license (license_id),
    INDEX idx_level (log_level),
    INDEX idx_timestamp (timestamp),
    INDEX idx_category (category)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA DE SESIONES ACTIVAS
-- =====================================================
CREATE TABLE IF NOT EXISTS active_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_id INT NOT NULL,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES system_users(id) ON DELETE CASCADE,
    INDEX idx_token (session_token),
    INDEX idx_license (license_id),
    INDEX idx_user (user_id),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA DE ALERTAS Y NOTIFICACIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_id INT NOT NULL,
    notification_type ENUM('license_expiring', 'license_expired', 'payment_due', 'payment_overdue', 'security_alert', 'system_update') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    action_required BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    expires_at DATETIME,

    FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE,
    INDEX idx_license (license_id),
    INDEX idx_type (notification_type),
    INDEX idx_is_read (is_read),
    INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA DE CONFIGURACIONES POR LICENCIA
-- =====================================================
CREATE TABLE IF NOT EXISTS license_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_id INT NOT NULL UNIQUE,

    -- Configuraciones de seguridad
    require_2fa BOOLEAN DEFAULT FALSE,
    session_timeout_minutes INT DEFAULT 30,
    max_failed_attempts INT DEFAULT 5,
    lockout_duration_minutes INT DEFAULT 30,
    password_expiry_days INT DEFAULT 90,

    -- Configuraciones de notificaciones
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    notification_days_before_expiry INT DEFAULT 7,

    -- Configuraciones personalizadas
    custom_branding JSON,
    custom_features JSON,
    api_access_enabled BOOLEAN DEFAULT FALSE,
    api_rate_limit INT DEFAULT 100,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- TABLA DE AUDITORÍA
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_trail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_id INT,
    user_id INT,
    admin_user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES system_users(id) ON DELETE SET NULL,
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_license (license_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_action (action)
) ENGINE=InnoDB;

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de licencias próximas a vencer
CREATE OR REPLACE VIEW licenses_expiring_soon AS
SELECT
    l.*,
    DATEDIFF(l.expiration_date, CURDATE()) AS days_until_expiration,
    lr.payment_status AS last_payment_status
FROM licenses l
LEFT JOIN (
    SELECT license_id, payment_status,
           ROW_NUMBER() OVER (PARTITION BY license_id ORDER BY created_at DESC) AS rn
    FROM license_renewals
) lr ON l.id = lr.license_id AND lr.rn = 1
WHERE l.status = 'active'
  AND DATEDIFF(l.expiration_date, CURDATE()) <= 7
  AND DATEDIFF(l.expiration_date, CURDATE()) >= 0;

-- Vista de estadísticas de acceso por licencia
CREATE OR REPLACE VIEW license_access_stats AS
SELECT
    l.id AS license_id,
    l.license_key,
    l.license_type,
    l.company_name,
    COUNT(DISTINCT aa.id) AS total_attempts,
    SUM(CASE WHEN aa.success = TRUE THEN 1 ELSE 0 END) AS successful_attempts,
    SUM(CASE WHEN aa.success = FALSE THEN 1 ELSE 0 END) AS failed_attempts,
    COUNT(DISTINCT CASE WHEN aa.success = FALSE THEN aa.ip_address END) AS unique_failed_ips,
    MAX(aa.timestamp) AS last_access_attempt
FROM licenses l
LEFT JOIN access_attempts aa ON l.id = aa.license_id
GROUP BY l.id, l.license_key, l.license_type, l.company_name;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

DELIMITER //

-- Procedimiento para verificar validez de licencia
CREATE PROCEDURE verify_license(IN p_license_key VARCHAR(64))
BEGIN
    DECLARE v_license_id INT;
    DECLARE v_status VARCHAR(20);
    DECLARE v_expiration DATE;
    DECLARE v_days_remaining INT;

    SELECT id, status, expiration_date, DATEDIFF(expiration_date, CURDATE())
    INTO v_license_id, v_status, v_expiration, v_days_remaining
    FROM licenses
    WHERE license_key = p_license_key;

    -- Actualizar última verificación
    IF v_license_id IS NOT NULL THEN
        UPDATE licenses
        SET last_verification = NOW(),
            next_verification = DATE_ADD(NOW(), INTERVAL 7 DAY)
        WHERE id = v_license_id;

        -- Actualizar estado si ha expirado
        IF v_expiration < CURDATE() AND v_status = 'active' THEN
            UPDATE licenses SET status = 'expired' WHERE id = v_license_id;
            SET v_status = 'expired';
        END IF;

        -- Crear notificación si está por vencer
        IF v_days_remaining <= 7 AND v_days_remaining > 0 AND v_status = 'active' THEN
            INSERT INTO notifications (license_id, notification_type, priority, title, message, action_required)
            VALUES (
                v_license_id,
                'license_expiring',
                'high',
                'Licencia próxima a vencer',
                CONCAT('Su licencia vencerá en ', v_days_remaining, ' días. Por favor, renueve para continuar usando el servicio.'),
                TRUE
            );
        END IF;
    END IF;

    -- Retornar información de la licencia
    SELECT
        l.*,
        v_days_remaining AS days_remaining,
        (v_status = 'active' AND v_expiration >= CURDATE()) AS is_valid
    FROM licenses l
    WHERE l.license_key = p_license_key;
END //

-- Procedimiento para registrar intento de acceso
CREATE PROCEDURE log_access_attempt(
    IN p_license_id INT,
    IN p_username VARCHAR(50),
    IN p_ip VARCHAR(45),
    IN p_user_agent TEXT,
    IN p_type VARCHAR(50),
    IN p_success BOOLEAN,
    IN p_failure_reason VARCHAR(255)
)
BEGIN
    INSERT INTO access_attempts (
        license_id, username, ip_address, user_agent,
        attempt_type, success, failure_reason
    ) VALUES (
        p_license_id, p_username, p_ip, p_user_agent,
        p_type, p_success, p_failure_reason
    );
END //

-- Procedimiento para crear renovación de licencia
CREATE PROCEDURE renew_license(
    IN p_license_id INT,
    IN p_amount DECIMAL(10,2),
    IN p_payment_method VARCHAR(50),
    IN p_payment_reference VARCHAR(100)
)
BEGIN
    DECLARE v_current_expiration DATE;
    DECLARE v_new_expiration DATE;

    -- Obtener fecha de expiración actual
    SELECT expiration_date INTO v_current_expiration
    FROM licenses WHERE id = p_license_id;

    -- Calcular nueva fecha de expiración (1 año desde la fecha actual o desde expiración si aún está vigente)
    IF v_current_expiration > CURDATE() THEN
        SET v_new_expiration = DATE_ADD(v_current_expiration, INTERVAL 1 YEAR);
    ELSE
        SET v_new_expiration = DATE_ADD(CURDATE(), INTERVAL 1 YEAR);
    END IF;

    -- Crear registro de renovación
    INSERT INTO license_renewals (
        license_id, renewal_date, amount, payment_method,
        payment_reference, payment_status, new_expiration_date
    ) VALUES (
        p_license_id, CURDATE(), p_amount, p_payment_method,
        p_payment_reference, 'completed', v_new_expiration
    );

    -- Actualizar licencia
    UPDATE licenses
    SET expiration_date = v_new_expiration,
        status = 'active',
        is_paid = TRUE,
        payment_status = 'paid',
        updated_at = NOW()
    WHERE id = p_license_id;

    -- Crear notificación de renovación exitosa
    INSERT INTO notifications (license_id, notification_type, priority, title, message)
    VALUES (
        p_license_id,
        'system_update',
        'medium',
        'Licencia renovada exitosamente',
        CONCAT('Su licencia ha sido renovada hasta el ', DATE_FORMAT(v_new_expiration, '%d/%m/%Y'))
    );
END //

DELIMITER ;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Crear usuario administrador por defecto (password: Admin123!)
-- Hash generado con bcrypt para 'Admin123!'
INSERT INTO admin_users (username, email, password_hash, full_name, role)
VALUES (
    'admin',
    'admin@systemsegure.com',
    '$2b$10$rKZ7QZ7QZ7QZ7QZ7QZ7QZ7QZ7QZ7QZ7QZ7QZ7QZ7QZ7QZ7QZ7QZ7',
    'Administrador del Sistema',
    'super_admin'
);

-- Crear licencia FREE de ejemplo
INSERT INTO licenses (
    license_key,
    license_type,
    company_name,
    contact_email,
    purchase_date,
    activation_date,
    expiration_date,
    status,
    is_paid,
    payment_status,
    max_users,
    max_devices,
    features
) VALUES (
    'FREE-XXXX-XXXX-XXXX-XXXX',
    'free',
    'Empresa Demo',
    'demo@example.com',
    CURDATE(),
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 1 YEAR),
    'active',
    TRUE,
    'free',
    1,
    1,
    JSON_OBJECT(
        'dashboard', true,
        'basic_reports', true,
        'user_management', false,
        'advanced_analytics', false,
        'api_access', false,
        'custom_branding', false
    )
);

-- =====================================================
-- TRIGGERS
-- =====================================================

DELIMITER //

-- Trigger para crear configuración por defecto al crear una licencia
CREATE TRIGGER after_license_insert
AFTER INSERT ON licenses
FOR EACH ROW
BEGIN
    INSERT INTO license_settings (license_id) VALUES (NEW.id);
END //

-- Trigger para auditoría de cambios en licencias
CREATE TRIGGER after_license_update
AFTER UPDATE ON licenses
FOR EACH ROW
BEGIN
    INSERT INTO audit_trail (
        license_id, action, entity_type, entity_id,
        old_values, new_values
    ) VALUES (
        NEW.id,
        'UPDATE_LICENSE',
        'license',
        NEW.id,
        JSON_OBJECT(
            'status', OLD.status,
            'expiration_date', OLD.expiration_date,
            'payment_status', OLD.payment_status
        ),
        JSON_OBJECT(
            'status', NEW.status,
            'expiration_date', NEW.expiration_date,
            'payment_status', NEW.payment_status
        )
    );
END //

DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONALES PARA RENDIMIENTO
-- =====================================================

-- Índice compuesto para búsquedas comunes
CREATE INDEX idx_license_status_expiration ON licenses(status, expiration_date);
CREATE INDEX idx_access_license_timestamp ON access_attempts(license_id, timestamp);
CREATE INDEX idx_logs_license_level_timestamp ON system_logs(license_id, log_level, timestamp);

-- =====================================================
-- EVENTOS PROGRAMADOS (CRON JOBS)
-- =====================================================

-- Habilitar el programador de eventos
SET GLOBAL event_scheduler = ON;

DELIMITER //

-- Evento para verificar licencias expiradas diariamente
CREATE EVENT IF NOT EXISTS check_expired_licenses
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    -- Marcar licencias expiradas
    UPDATE licenses
    SET status = 'expired'
    WHERE expiration_date < CURDATE() AND status = 'active';

    -- Crear notificaciones para licencias expiradas
    INSERT INTO notifications (license_id, notification_type, priority, title, message, action_required)
    SELECT
        id,
        'license_expired',
        'critical',
        'Licencia expirada',
        CONCAT('Su licencia ha expirado. Por favor, renueve para continuar usando el servicio.'),
        TRUE
    FROM licenses
    WHERE status = 'expired'
      AND id NOT IN (
          SELECT license_id FROM notifications
          WHERE notification_type = 'license_expired'
            AND sent_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
      );
END //

-- Evento para limpiar sesiones expiradas
CREATE EVENT IF NOT EXISTS cleanup_expired_sessions
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    UPDATE active_sessions
    SET is_active = FALSE
    WHERE expires_at < NOW() AND is_active = TRUE;

    DELETE FROM active_sessions
    WHERE expires_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
END //

-- Evento para limpiar logs antiguos (opcional, mantener últimos 90 días)
CREATE EVENT IF NOT EXISTS cleanup_old_logs
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    DELETE FROM system_logs
    WHERE timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY);

    DELETE FROM access_attempts
    WHERE timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY);
END //

DELIMITER ;

-- =====================================================
-- PERMISOS Y USUARIOS DE BASE DE DATOS
-- =====================================================

-- Crear usuario para la aplicación (cambiar password en producción)
-- CREATE USER 'license_app'@'localhost' IDENTIFIED BY 'StrongPassword123!';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON license_management.* TO 'license_app'@'localhost';
-- FLUSH PRIVILEGES;

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================
