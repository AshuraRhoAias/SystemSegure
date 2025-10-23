USE encryption_vault;

CREATE TABLE IF NOT EXISTS blocked_ips (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ip_address_encrypted TEXT NOT NULL,
    ip_hash VARCHAR(64) NOT NULL UNIQUE,
    blocked_at DATETIME NOT NULL,
    unblock_at DATETIME NULL,
    block_type ENUM('temporary', 'permanent') DEFAULT 'temporary',
    block_reason TEXT,
    INDEX idx_ip_hash (ip_hash)
) ENGINE=InnoDB;

-- Ver GUIA_COMPLETA_REQUEST_BLOCKER_INTEGRADO.md para SQL completo
