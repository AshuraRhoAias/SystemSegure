# 🛡️ GUÍA DE IMPLEMENTACIÓN - REQUEST BLOCKER SYSTEM V1.0
## Sistema de Detección y Bloqueo de Peticiones Múltiples

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Reglas de Bloqueo](#reglas-de-bloqueo)
4. [Estructura de Base de Datos](#estructura-de-base-de-datos)
5. [Implementación Técnica](#implementación-técnica)
6. [Configuración](#configuración)
7. [Integración con Sistema Existente](#integración-con-sistema-existente)
8. [API Endpoints](#api-endpoints)
9. [Monitoreo y Alertas](#monitoreo-y-alertas)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 RESUMEN EJECUTIVO

### Objetivo

Crear un sistema robusto que detecte y bloquee automáticamente usuarios/equipos que realicen múltiples peticiones desde la misma IP o dispositivo, protegiendo contra:

- ✅ **Ataques de fuerza bruta**
- ✅ **Scraping automatizado**
- ✅ **Abuso de recursos**
- ✅ **Bots maliciosos**
- ✅ **DDoS distribuido**

### Características Principales

| Característica | Descripción |
|----------------|-------------|
| **Bloqueo Temporal** | 2 horas automático al detectar múltiples peticiones |
| **Bloqueo Permanente** | Después de 3 bloqueos en 1 semana |
| **Detección por IP** | Identifica peticiones desde la misma dirección IP |
| **Detección por Hardware** | Fingerprinting de dispositivo (CPU, MAC, etc.) |
| **Auto-desbloqueo** | Se reestablece el acceso automáticamente después del tiempo |
| **Contador Inteligente** | Ventana deslizante de 7 días para contar bloqueos |

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUARIO HACE PETICIÓN                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              REQUEST BLOCKER MIDDLEWARE                         │
│  1. Extrae IP + Hardware Fingerprint                            │
│  2. Verifica si está bloqueado (cache + DB)                     │
│  3. Analiza patrón de peticiones                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ¿Está Bloqueado?
                    ↙           ↘
                  SÍ            NO
                   ↓             ↓
    ┌──────────────────┐   ┌──────────────────┐
    │ RECHAZAR (403)   │   │ VERIFICAR        │
    │ Retornar tiempo  │   │ FRECUENCIA       │
    │ restante         │   │                  │
    └──────────────────┘   └──────────────────┘
                                    ↓
                         ¿Múltiples Peticiones?
                         ↙                    ↘
                       SÍ                      NO
                        ↓                       ↓
         ┌────────────────────────┐   ┌──────────────────┐
         │ BLOQUEAR               │   │ PERMITIR         │
         │ 1. Registrar bloqueo   │   │ Registrar uso    │
         │ 2. Guardar en DB       │   │ Continuar normal │
         │ 3. Actualizar cache    │   │                  │
         │ 4. Enviar alerta       │   │                  │
         └────────────────────────┘   └──────────────────┘
                  ↓
         ¿Es 3er bloqueo en semana?
         ↙                        ↘
       SÍ                          NO
        ↓                           ↓
┌──────────────────┐      ┌──────────────────┐
│ BLOQUEO          │      │ BLOQUEO          │
│ PERMANENTE       │      │ TEMPORAL         │
│ • Sin fecha fin  │      │ • 2 horas        │
│ • Requiere admin │      │ • Auto-unlock    │
└──────────────────┘      └──────────────────┘
```

### Componentes del Sistema

```
request-blocker/
├── src/
│   ├── services/
│   │   ├── RequestBlockerService.js      (Core - Lógica principal)
│   │   ├── HardwareFingerprintService.js (Detección hardware)
│   │   ├── BlockAnalyzerService.js       (Análisis patrones)
│   │   └── NotificationService.js        (Alertas email/SMS)
│   ├── middleware/
│   │   └── RequestBlockerMiddleware.js   (Express middleware)
│   ├── models/
│   │   ├── RequestLog.js                 (Modelo registro peticiones)
│   │   ├── BlockedIP.js                  (Modelo IPs bloqueadas)
│   │   └── BlockedHardware.js            (Modelo hardware bloqueado)
│   ├── utils/
│   │   ├── IPValidator.js                (Validación IPs)
│   │   ├── TimeCalculator.js             (Cálculo tiempos bloqueo)
│   │   └── CacheManager.js               (Gestión cache Redis)
│   └── config/
│       └── blocker.config.js             (Configuración)
├── database/
│   ├── migrations/
│   │   ├── 001_create_request_logs.sql
│   │   ├── 002_create_blocked_ips.sql
│   │   ├── 003_create_blocked_hardware.sql
│   │   └── 004_create_block_history.sql
│   └── seeds/
│       └── initial_config.sql
├── tests/
│   ├── unit/
│   ├── integration/
│   └── load/
└── docs/
    └── API.md
```

---

## 🔒 REGLAS DE BLOQUEO

### Regla 1: Detección de Múltiples Peticiones

**Condición de Bloqueo:**
- Más de **5 peticiones** en una ventana de **10 segundos**
- O menos de **2 segundos** entre peticiones consecutivas

**Acción:**
- Bloqueo temporal de **2 horas**
- Registro en `blocked_ips` y `blocked_hardware`
- Notificación al administrador

**Ejemplo:**
```javascript
// Usuario hace 6 peticiones en 8 segundos
Request 1: 10:00:00
Request 2: 10:00:02  // OK (2 segundos)
Request 3: 10:00:03  // OK (1 segundo)
Request 4: 10:00:04  // OK (1 segundo)
Request 5: 10:00:05  // OK (1 segundo)
Request 6: 10:00:08  // ⚠️ BLOQUEO (6 peticiones en 8 segundos)
```

### Regla 2: Bloqueo Temporal (Primera vez)

**Duración:** 2 horas desde el momento del bloqueo

**Durante el Bloqueo:**
- Todas las peticiones retornan `HTTP 403 Forbidden`
- Respuesta incluye tiempo restante
- Se registra cada intento de acceso

**Auto-desbloqueo:**
- Después de 2 horas, el sistema desbloquea automáticamente
- El usuario puede volver a hacer peticiones normales
- El contador de bloqueos aumenta en 1

### Regla 3: Bloqueos Recurrentes

**Condición:**
- Si el usuario/equipo es bloqueado **3 veces** en **7 días**

**Acción:**
- **BLOQUEO PERMANENTE**
- No hay auto-desbloqueo
- Requiere intervención manual del administrador
- Se marca el hardware como `permanently_blocked`

**Cálculo de Ventana:**
```javascript
// Bloqueo 1: Lunes 10:00
// Bloqueo 2: Martes 15:00
// Bloqueo 3: Jueves 08:00  // ⚠️ 3 en 7 días → PERMANENTE

// La ventana es deslizante:
// Cada bloqueo cuenta solo si ocurrió en los últimos 7 días
```

### Regla 4: Detección Combinada (IP + Hardware)

El sistema bloquea si detecta:

1. **Misma IP + Mismo Hardware** → Bloqueo estándar
2. **Misma IP + Hardware diferente** → Sospechoso (múltiples dispositivos en misma red)
3. **IP diferente + Mismo Hardware** → Uso de VPN (bloqueo más severo)
4. **Múltiples IPs + Múltiples Hardware** → Bot distribuido (bloqueo permanente inmediato)

---

## 💾 ESTRUCTURA DE BASE DE DATOS

### Tabla 1: `request_logs`

Registra todas las peticiones para análisis de patrones.

```sql
CREATE TABLE request_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Identificación
    ip_address VARCHAR(45) NOT NULL,
    hardware_fingerprint VARCHAR(255),
    user_agent TEXT,
    
    -- Detalles de la petición
    endpoint VARCHAR(255) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    request_timestamp DATETIME(3) NOT NULL,
    
    -- Geolocalización
    country VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Detección de anomalías
    vpn_detected BOOLEAN DEFAULT FALSE,
    proxy_detected BOOLEAN DEFAULT FALSE,
    tor_detected BOOLEAN DEFAULT FALSE,
    bot_detected BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    response_status INT,
    response_time_ms INT,
    was_blocked BOOLEAN DEFAULT FALSE,
    
    -- Índices para búsqueda rápida
    INDEX idx_ip_timestamp (ip_address, request_timestamp),
    INDEX idx_hardware_timestamp (hardware_fingerprint, request_timestamp),
    INDEX idx_timestamp (request_timestamp),
    INDEX idx_blocked (was_blocked, request_timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabla 2: `blocked_ips`

Almacena IPs bloqueadas temporalmente o permanentemente.

```sql
CREATE TABLE blocked_ips (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- IP bloqueada
    ip_address VARCHAR(45) NOT NULL UNIQUE,
    
    -- Información del bloqueo
    blocked_at DATETIME NOT NULL,
    unblock_at DATETIME NULL,  -- NULL = permanente
    block_type ENUM('temporary', 'permanent') NOT NULL DEFAULT 'temporary',
    block_reason TEXT,
    
    -- Contador de bloqueos
    block_count INT UNSIGNED DEFAULT 1,
    last_block_reset DATETIME,
    
    -- Metadata
    blocked_by_admin BOOLEAN DEFAULT FALSE,
    admin_notes TEXT,
    
    -- Intentos durante bloqueo
    blocked_request_count INT UNSIGNED DEFAULT 0,
    last_attempt_at DATETIME,
    
    INDEX idx_unblock_at (unblock_at),
    INDEX idx_block_type (block_type),
    INDEX idx_blocked_at (blocked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabla 3: `blocked_hardware`

Almacena dispositivos bloqueados por hardware fingerprint.

```sql
CREATE TABLE blocked_hardware (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Fingerprint del hardware
    hardware_fingerprint VARCHAR(255) NOT NULL UNIQUE,
    
    -- Componentes individuales (para análisis forense)
    cpu_id VARCHAR(255),
    motherboard_uuid VARCHAR(255),
    mac_address VARCHAR(17),
    disk_serial VARCHAR(255),
    ram_serial VARCHAR(255),
    
    -- Información del bloqueo
    blocked_at DATETIME NOT NULL,
    unblock_at DATETIME NULL,
    block_type ENUM('temporary', 'permanent') NOT NULL DEFAULT 'temporary',
    block_reason TEXT,
    
    -- Contador de bloqueos
    block_count INT UNSIGNED DEFAULT 1,
    last_block_reset DATETIME,
    
    -- Asociación con IPs
    associated_ips JSON,  -- Lista de IPs usadas con este hardware
    ip_count INT UNSIGNED DEFAULT 0,
    
    -- Metadata
    first_seen_at DATETIME,
    last_seen_at DATETIME,
    total_requests INT UNSIGNED DEFAULT 0,
    
    INDEX idx_unblock_at (unblock_at),
    INDEX idx_block_type (block_type),
    INDEX idx_blocked_at (blocked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabla 4: `block_history`

Historial completo de todos los bloqueos para auditoría.

```sql
CREATE TABLE block_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Referencia
    blocked_ip_id BIGINT UNSIGNED,
    blocked_hardware_id BIGINT UNSIGNED,
    
    -- Detalles del bloqueo
    ip_address VARCHAR(45),
    hardware_fingerprint VARCHAR(255),
    blocked_at DATETIME NOT NULL,
    unblocked_at DATETIME,
    block_duration_seconds INT,
    
    -- Tipo y razón
    block_type ENUM('temporary', 'permanent') NOT NULL,
    block_reason ENUM(
        'multiple_requests',
        'rate_limit_exceeded',
        'suspicious_pattern',
        'vpn_detected',
        'third_offense',
        'manual_block',
        'bot_detected'
    ) NOT NULL,
    
    -- Estadísticas durante bloqueo
    blocked_requests_count INT UNSIGNED DEFAULT 0,
    
    -- Patrón que causó el bloqueo
    trigger_pattern JSON,  -- { requests: [...], timeWindow: 10, count: 6 }
    
    -- Desbloqueo
    unblock_type ENUM('automatic', 'manual', 'expired') NULL,
    unblocked_by VARCHAR(100),  -- 'system' o admin email
    
    -- Auditoría
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (blocked_ip_id) REFERENCES blocked_ips(id) ON DELETE SET NULL,
    FOREIGN KEY (blocked_hardware_id) REFERENCES blocked_hardware(id) ON DELETE SET NULL,
    
    INDEX idx_blocked_at (blocked_at),
    INDEX idx_ip_address (ip_address),
    INDEX idx_hardware (hardware_fingerprint),
    INDEX idx_block_reason (block_reason)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabla 5: `whitelist`

IPs y hardware permitidos que nunca serán bloqueados.

```sql
CREATE TABLE whitelist (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Identificación
    ip_address VARCHAR(45) NULL,
    hardware_fingerprint VARCHAR(255) NULL,
    ip_range VARCHAR(50) NULL,  -- CIDR notation: 192.168.1.0/24
    
    -- Metadata
    description TEXT,
    added_by VARCHAR(100) NOT NULL,
    added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Al menos uno debe estar presente
    CHECK (
        ip_address IS NOT NULL OR 
        hardware_fingerprint IS NOT NULL OR 
        ip_range IS NOT NULL
    ),
    
    INDEX idx_ip_address (ip_address),
    INDEX idx_hardware (hardware_fingerprint),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 💻 IMPLEMENTACIÓN TÉCNICA

### 1. RequestBlockerService (Core)

```javascript
/**
 * Servicio principal de bloqueo de peticiones
 */
class RequestBlockerService {
    constructor(db, redis, config) {
        this.db = db;
        this.redis = redis;
        this.config = {
            minTimeBetweenRequests: 2,        // segundos
            maxRequestsInWindow: 5,            // peticiones
            requestWindowTime: 10,             // segundos
            temporaryBlockHours: 2,            // horas
            maxBlocksBeforePermanent: 3,       // bloqueos
            blockCountWindowDays: 7,           // días
            hardwareDetectionEnabled: true,
            ...config
        };
        
        this.hardwareFP = new HardwareFingerprintService();
        this.notifier = new NotificationService();
    }
    
    /**
     * Verifica si una petición debe ser bloqueada
     * @returns {Object} { blocked: boolean, reason: string, remainingTime: number }
     */
    async checkRequest(ip, userAgent, hardwareData = null) {
        // 1. Verificar whitelist
        if (await this.isWhitelisted(ip, hardwareData)) {
            return { blocked: false, whitelisted: true };
        }
        
        // 2. Verificar si ya está bloqueado
        const blockStatus = await this.getBlockStatus(ip, hardwareData);
        if (blockStatus.blocked) {
            await this.incrementBlockedRequestCount(ip, hardwareData);
            return blockStatus;
        }
        
        // 3. Registrar petición actual
        await this.logRequest(ip, userAgent, hardwareData);
        
        // 4. Analizar patrón de peticiones
        const pattern = await this.analyzeRequestPattern(ip, hardwareData);
        
        // 5. Decidir si bloquear
        if (pattern.shouldBlock) {
            await this.blockEntity(ip, hardwareData, pattern.reason);
            return {
                blocked: true,
                reason: pattern.reason,
                blockType: pattern.blockType,
                remainingTime: pattern.blockType === 'permanent' ? null : this.config.temporaryBlockHours * 3600
            };
        }
        
        return { blocked: false };
    }
    
    /**
     * Analiza el patrón de peticiones para detectar abuso
     */
    async analyzeRequestPattern(ip, hardwareData) {
        const windowStart = new Date(Date.now() - this.config.requestWindowTime * 1000);
        
        // Obtener peticiones recientes desde cache o DB
        const recentRequests = await this.getRecentRequests(ip, hardwareData, windowStart);
        
        // Regla 1: Demasiadas peticiones en ventana de tiempo
        if (recentRequests.length >= this.config.maxRequestsInWindow) {
            return {
                shouldBlock: true,
                reason: `${recentRequests.length} peticiones en ${this.config.requestWindowTime} segundos`,
                blockType: 'temporary',
                triggerPattern: {
                    requests: recentRequests.map(r => r.timestamp),
                    timeWindow: this.config.requestWindowTime,
                    count: recentRequests.length
                }
            };
        }
        
        // Regla 2: Peticiones muy rápidas (menos de X segundos entre ellas)
        if (recentRequests.length >= 2) {
            const lastTwo = recentRequests.slice(-2);
            const timeDiff = (lastTwo[1].timestamp - lastTwo[0].timestamp) / 1000;
            
            if (timeDiff < this.config.minTimeBetweenRequests) {
                return {
                    shouldBlock: true,
                    reason: `Peticiones consecutivas en ${timeDiff.toFixed(2)} segundos`,
                    blockType: 'temporary',
                    triggerPattern: {
                        timeBetweenRequests: timeDiff,
                        minimum: this.config.minTimeBetweenRequests
                    }
                };
            }
        }
        
        return { shouldBlock: false };
    }
    
    /**
     * Bloquea una IP y/o hardware
     */
    async blockEntity(ip, hardwareData, reason) {
        const now = new Date();
        const hardwareFP = hardwareData ? this.hardwareFP.generate(hardwareData) : null;
        
        // Verificar cuántos bloqueos previos tiene en los últimos 7 días
        const recentBlocks = await this.getRecentBlockCount(ip, hardwareFP);
        
        // Determinar tipo de bloqueo
        const isThirdOffense = recentBlocks >= this.config.maxBlocksBeforePermanent - 1;
        const blockType = isThirdOffense ? 'permanent' : 'temporary';
        const unblockAt = blockType === 'temporary' 
            ? new Date(now.getTime() + this.config.temporaryBlockHours * 3600 * 1000)
            : null;
        
        // Bloquear IP
        await this.db.query(`
            INSERT INTO blocked_ips (ip_address, blocked_at, unblock_at, block_type, block_reason, block_count)
            VALUES (?, ?, ?, ?, ?, 1)
            ON DUPLICATE KEY UPDATE
                blocked_at = VALUES(blocked_at),
                unblock_at = VALUES(unblock_at),
                block_type = VALUES(block_type),
                block_reason = VALUES(block_reason),
                block_count = block_count + 1,
                last_block_reset = CASE
                    WHEN TIMESTAMPDIFF(DAY, last_block_reset, NOW()) > ? THEN NOW()
                    ELSE last_block_reset
                END
        `, [ip, now, unblockAt, blockType, reason, this.config.blockCountWindowDays]);
        
        // Bloquear hardware si está disponible
        if (hardwareFP) {
            await this.blockHardware(hardwareFP, hardwareData, now, unblockAt, blockType, reason);
        }
        
        // Registrar en historial
        await this.recordBlockHistory(ip, hardwareFP, now, unblockAt, blockType, reason);
        
        // Actualizar cache
        await this.updateBlockCache(ip, hardwareFP, unblockAt, blockType);
        
        // Enviar notificación
        await this.notifier.sendBlockAlert({
            ip,
            hardwareFP,
            blockType,
            reason,
            unblockAt,
            isThirdOffense
        });
        
        console.log(`🔒 Bloqueado: IP=${ip}, Hardware=${hardwareFP}, Tipo=${blockType}, Razón=${reason}`);
    }
    
    /**
     * Verifica el estado de bloqueo (cache first, luego DB)
     */
    async getBlockStatus(ip, hardwareData) {
        const hardwareFP = hardwareData ? this.hardwareFP.generate(hardwareData) : null;
        
        // Verificar cache primero (Redis)
        const cacheKey = `block:${ip}:${hardwareFP || 'no-hw'}`;
        const cachedBlock = await this.redis.get(cacheKey);
        
        if (cachedBlock) {
            const blockData = JSON.parse(cachedBlock);
            
            // Si es temporal y ya expiró, desbloquear
            if (blockData.unblockAt && new Date(blockData.unblockAt) <= new Date()) {
                await this.unblockEntity(ip, hardwareFP, 'automatic');
                return { blocked: false };
            }
            
            return {
                blocked: true,
                blockType: blockData.blockType,
                reason: blockData.reason,
                remainingTime: blockData.unblockAt 
                    ? Math.max(0, (new Date(blockData.unblockAt) - new Date()) / 1000)
                    : null,
                blockedAt: blockData.blockedAt
            };
        }
        
        // Si no está en cache, verificar BD
        const [ipBlock] = await this.db.query(
            'SELECT * FROM blocked_ips WHERE ip_address = ? AND (unblock_at IS NULL OR unblock_at > NOW())',
            [ip]
        );
        
        if (ipBlock && ipBlock.length > 0) {
            const block = ipBlock[0];
            
            // Guardar en cache
            await this.updateBlockCache(ip, hardwareFP, block.unblock_at, block.block_type);
            
            return {
                blocked: true,
                blockType: block.block_type,
                reason: block.block_reason,
                remainingTime: block.unblock_at 
                    ? Math.max(0, (new Date(block.unblock_at) - new Date()) / 1000)
                    : null,
                blockedAt: block.blocked_at
            };
        }
        
        // Verificar hardware si está disponible
        if (hardwareFP) {
            const [hwBlock] = await this.db.query(
                'SELECT * FROM blocked_hardware WHERE hardware_fingerprint = ? AND (unblock_at IS NULL OR unblock_at > NOW())',
                [hardwareFP]
            );
            
            if (hwBlock && hwBlock.length > 0) {
                const block = hwBlock[0];
                await this.updateBlockCache(ip, hardwareFP, block.unblock_at, block.block_type);
                
                return {
                    blocked: true,
                    blockType: block.block_type,
                    reason: `Hardware bloqueado: ${block.block_reason}`,
                    remainingTime: block.unblock_at 
                        ? Math.max(0, (new Date(block.unblock_at) - new Date()) / 1000)
                        : null,
                    blockedAt: block.blocked_at
                };
            }
        }
        
        return { blocked: false };
    }
    
    /**
     * Desbloquea una entidad
     */
    async unblockEntity(ip, hardwareFP, unblockType = 'manual', unlockedBy = 'system') {
        const now = new Date();
        
        // Desbloquear IP
        await this.db.query(`
            UPDATE blocked_ips 
            SET unblock_at = ?
            WHERE ip_address = ? AND (unblock_at IS NULL OR unblock_at > NOW())
        `, [now, ip]);
        
        // Desbloquear hardware
        if (hardwareFP) {
            await this.db.query(`
                UPDATE blocked_hardware 
                SET unblock_at = ?
                WHERE hardware_fingerprint = ? AND (unblock_at IS NULL OR unblock_at > NOW())
            `, [now, hardwareFP]);
        }
        
        // Actualizar historial
        await this.db.query(`
            UPDATE block_history 
            SET unblocked_at = ?, 
                block_duration_seconds = TIMESTAMPDIFF(SECOND, blocked_at, ?),
                unblock_type = ?,
                unblocked_by = ?
            WHERE (ip_address = ? OR hardware_fingerprint = ?)
              AND unblocked_at IS NULL
        `, [now, now, unblockType, unlockedBy, ip, hardwareFP]);
        
        // Eliminar del cache
        const cacheKey = `block:${ip}:${hardwareFP || 'no-hw'}`;
        await this.redis.del(cacheKey);
        
        console.log(`🔓 Desbloqueado: IP=${ip}, Hardware=${hardwareFP}, Tipo=${unblockType}`);
    }
    
    /**
     * Obtiene el conteo de bloqueos recientes (últimos 7 días)
     */
    async getRecentBlockCount(ip, hardwareFP) {
        const windowStart = new Date(Date.now() - this.config.blockCountWindowDays * 24 * 3600 * 1000);
        
        const [result] = await this.db.query(`
            SELECT COUNT(*) as count 
            FROM block_history
            WHERE (ip_address = ? OR hardware_fingerprint = ?)
              AND blocked_at >= ?
        `, [ip, hardwareFP, windowStart]);
        
        return result[0].count;
    }
    
    /**
     * Tarea programada: Auto-desbloqueo de bloqueos temporales expirados
     */
    async autoUnblockExpired() {
        const now = new Date();
        
        // Desbloquear IPs expiradas
        const [expiredIPs] = await this.db.query(`
            SELECT ip_address, hardware_fingerprint 
            FROM blocked_ips 
            WHERE block_type = 'temporary' 
              AND unblock_at IS NOT NULL 
              AND unblock_at <= ?
        `, [now]);
        
        for (const entity of expiredIPs) {
            await this.unblockEntity(entity.ip_address, entity.hardware_fingerprint, 'automatic', 'system');
        }
        
        // Desbloquear hardware expirado
        const [expiredHW] = await this.db.query(`
            SELECT hardware_fingerprint 
            FROM blocked_hardware 
            WHERE block_type = 'temporary' 
              AND unblock_at IS NOT NULL 
              AND unblock_at <= ?
        `, [now]);
        
        for (const hw of expiredHW) {
            await this.unblockEntity(null, hw.hardware_fingerprint, 'automatic', 'system');
        }
        
        console.log(`✅ Auto-desbloqueo completado: ${expiredIPs.length} IPs, ${expiredHW.length} hardware`);
    }
}

module.exports = RequestBlockerService;
```

### 2. HardwareFingerprintService

```javascript
const crypto = require('crypto');
const os = require('os');

/**
 * Servicio de generación de fingerprint de hardware
 */
class HardwareFingerprintService {
    /**
     * Genera fingerprint único del hardware
     * @param {Object} hardwareData - Datos del hardware del cliente
     * @returns {string} Hash único del hardware
     */
    generate(hardwareData) {
        if (!hardwareData) return null;
        
        const components = [
            hardwareData.cpuId || '',
            hardwareData.motherboardUuid || '',
            hardwareData.macAddress || '',
            hardwareData.diskSerial || '',
            hardwareData.ramSerial || ''
        ].filter(Boolean);
        
        if (components.length === 0) return null;
        
        // Crear hash combinado
        const combined = components.join('|');
        return crypto.createHash('sha256').update(combined).digest('hex');
    }
    
    /**
     * Recolecta información del hardware en el servidor (limitado)
     * Nota: En producción, esto debe venir del cliente
     */
    collectServerInfo() {
        return {
            cpuModel: os.cpus()[0]?.model || null,
            platform: os.platform(),
            arch: os.arch(),
            hostname: os.hostname(),
            // Nota: Esta información es limitada en el servidor
            // Para fingerprinting real, necesitas un agente en el cliente
        };
    }
    
    /**
     * Valida que el fingerprint sea válido
     */
    isValid(fingerprint) {
        return fingerprint && /^[a-f0-9]{64}$/.test(fingerprint);
    }
    
    /**
     * Compara dos fingerprints
     */
    compare(fp1, fp2) {
        if (!fp1 || !fp2) return false;
        return crypto.timingSafeEqual(
            Buffer.from(fp1, 'hex'),
            Buffer.from(fp2, 'hex')
        );
    }
}

module.exports = HardwareFingerprintService;
```

### 3. RequestBlockerMiddleware (Express)

```javascript
/**
 * Middleware de Express para bloqueo de peticiones
 */
class RequestBlockerMiddleware {
    constructor(blockerService) {
        this.blocker = blockerService;
    }
    
    /**
     * Middleware principal
     */
    middleware() {
        return async (req, res, next) => {
            try {
                // Extraer información de la petición
                const ip = this.getClientIP(req);
                const userAgent = req.headers['user-agent'] || '';
                const hardwareData = this.extractHardwareData(req);
                
                // Verificar si debe ser bloqueado
                const result = await this.blocker.checkRequest(ip, userAgent, hardwareData);
                
                if (result.blocked) {
                    return this.sendBlockedResponse(res, result);
                }
                
                // Adjuntar información a la petición para uso posterior
                req.clientInfo = {
                    ip,
                    hardwareFingerprint: hardwareData ? this.blocker.hardwareFP.generate(hardwareData) : null,
                    whitelisted: result.whitelisted || false
                };
                
                next();
            } catch (error) {
                console.error('Error en RequestBlockerMiddleware:', error);
                // En caso de error, permitir la petición pero loguear
                next();
            }
        };
    }
    
    /**
     * Obtiene la IP real del cliente (considerando proxies)
     */
    getClientIP(req) {
        return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
               req.headers['x-real-ip'] ||
               req.connection?.remoteAddress ||
               req.socket?.remoteAddress ||
               req.ip;
    }
    
    /**
     * Extrae datos de hardware del cliente (si están presentes)
     */
    extractHardwareData(req) {
        // El cliente debe enviar esto en headers personalizados
        const hwHeader = req.headers['x-hardware-fingerprint'];
        
        if (hwHeader) {
            try {
                return JSON.parse(Buffer.from(hwHeader, 'base64').toString());
            } catch (e) {
                console.warn('Invalid hardware fingerprint header');
                return null;
            }
        }
        
        return null;
    }
    
    /**
     * Envía respuesta de bloqueo
     */
    sendBlockedResponse(res, result) {
        const response = {
            error: 'ACCESS_BLOCKED',
            message: 'Tu acceso ha sido bloqueado por múltiples peticiones',
            blocked: true,
            blockType: result.blockType,
            reason: result.reason,
            blockedAt: result.blockedAt
        };
        
        if (result.blockType === 'temporary' && result.remainingTime) {
            const hours = Math.floor(result.remainingTime / 3600);
            const minutes = Math.floor((result.remainingTime % 3600) / 60);
            
            response.remainingTime = {
                seconds: Math.floor(result.remainingTime),
                formatted: `${hours}h ${minutes}m`
            };
            response.message += `. Se reestablecerá automáticamente en ${response.remainingTime.formatted}`;
        } else if (result.blockType === 'permanent') {
            response.message += '. Bloqueo permanente. Contacta al administrador.';
        }
        
        res.status(403).json(response);
    }
}

module.exports = RequestBlockerMiddleware;
```

---

## ⚙️ CONFIGURACIÓN

### Archivo: `blocker.config.js`

```javascript
module.exports = {
    // Detección de múltiples peticiones
    requestDetection: {
        // Tiempo mínimo entre peticiones consecutivas (segundos)
        minTimeBetweenRequests: 2,
        
        // Máximo de peticiones en ventana de tiempo
        maxRequestsInWindow: 5,
        
        // Ventana de tiempo para contar peticiones (segundos)
        requestWindowTime: 10,
        
        // Análisis de patrones
        enablePatternAnalysis: true,
        patternSensitivity: 'medium' // low, medium, high
    },
    
    // Bloqueos
    blocking: {
        // Duración del bloqueo temporal (horas)
        temporaryBlockHours: 2,
        
        // Máximo de bloqueos antes de permanente
        maxBlocksBeforePermanent: 3,
        
        // Ventana de tiempo para contar bloqueos (días)
        blockCountWindowDays: 7,
        
        // Auto-desbloqueo automático
        enableAutoUnblock: true,
        autoUnblockCheckIntervalMinutes: 5
    },
    
    // Hardware fingerprinting
    hardware: {
        // Habilitar detección de hardware
        enabled: true,
        
        // Requerir fingerprint (si false, solo usa IP)
        required: false,
        
        // Componentes a verificar
        components: {
            cpuId: true,
            motherboardUuid: true,
            macAddress: true,
            diskSerial: true,
            ramSerial: false // Opcional, no siempre disponible
        }
    },
    
    // Detección de anomalías
    anomalyDetection: {
        // Detectar VPN/Proxy
        detectVPN: true,
        detectProxy: true,
        detectTor: true,
        
        // Acción al detectar VPN (warn, block, ignore)
        vpnAction: 'warn',
        
        // Detectar bots
        detectBots: true,
        botAction: 'block'
    },
    
    // Cache (Redis)
    cache: {
        // Habilitar cache
        enabled: true,
        
        // TTL del cache de bloqueos (segundos)
        blockCacheTTL: 7200, // 2 horas
        
        // TTL del cache de peticiones (segundos)
        requestCacheTTL: 60,
        
        // Prefijo de claves
        keyPrefix: 'blocker:'
    },
    
    // Notificaciones
    notifications: {
        // Habilitar notificaciones
        enabled: true,
        
        // Email para alertas
        adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
        
        // Notificar en bloqueo temporal
        notifyOnTemporaryBlock: false,
        
        // Notificar en bloqueo permanente
        notifyOnPermanentBlock: true,
        
        // Notificar en múltiples intentos durante bloqueo
        notifyOnBlockedAttempts: true,
        blockAttemptThreshold: 10
    },
    
    // Whitelist
    whitelist: {
        // IPs siempre permitidas
        ips: [
            '127.0.0.1',
            '::1',
            // Agregar IPs de confianza aquí
        ],
        
        // Rangos IP permitidos (CIDR)
        ipRanges: [
            // '10.0.0.0/8',  // Red interna
        ],
        
        // User agents permitidos (regex)
        userAgents: [
            // /^HealthCheck/,  // Monitoreo
        ]
    },
    
    // Logging
    logging: {
        // Log todas las peticiones
        logAllRequests: false,
        
        // Log solo peticiones bloqueadas
        logBlockedOnly: true,
        
        // Log patrones sospechosos
        logSuspiciousPatterns: true,
        
        // Nivel de log (debug, info, warn, error)
        level: process.env.LOG_LEVEL || 'info'
    },
    
    // Base de datos
    database: {
        // Retención de logs (días)
        requestLogsRetentionDays: 30,
        
        // Retención de historial de bloqueos (días)
        blockHistoryRetentionDays: 365,
        
        // Limpiar automáticamente datos antiguos
        autoCleanup: true,
        cleanupIntervalHours: 24
    }
};
```

### Variables de Entorno (`.env`)

```bash
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ultra_secure_db
DB_USER=secure_user
DB_PASSWORD=super_secret_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Request Blocker
BLOCKER_ENABLED=true
BLOCKER_MIN_TIME_BETWEEN_REQUESTS=2
BLOCKER_MAX_REQUESTS_IN_WINDOW=5
BLOCKER_REQUEST_WINDOW_TIME=10
BLOCKER_TEMPORARY_BLOCK_HOURS=2
BLOCKER_MAX_BLOCKS_BEFORE_PERMANENT=3
BLOCKER_BLOCK_COUNT_WINDOW_DAYS=7

# Hardware Detection
HARDWARE_DETECTION_ENABLED=true
HARDWARE_DETECTION_REQUIRED=false

# Notificaciones
ADMIN_EMAIL=admin@example.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=smtp_password
NOTIFY_ON_PERMANENT_BLOCK=true

# Logging
LOG_LEVEL=info
LOG_ALL_REQUESTS=false
```

---

## 🔗 INTEGRACIÓN CON SISTEMA EXISTENTE

### Paso 1: Instalar Dependencias

```bash
npm install --save \
  mysql2 \
  redis \
  ioredis \
  node-machine-id \
  systeminformation \
  geoip-lite \
  nodemailer
```

### Paso 2: Agregar al `server.js` Principal

```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const Redis = require('ioredis');
const RequestBlockerService = require('./request-blocker/src/RequestBlockerService');
const RequestBlockerMiddleware = require('./request-blocker/src/middleware/RequestBlockerMiddleware');
const blockerConfig = require('./request-blocker/src/config/blocker.config');

const app = express();

// Conexiones
const db = await mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB
});

// Inicializar Request Blocker
const requestBlocker = new RequestBlockerService(db, redis, blockerConfig);
const blockerMiddleware = new RequestBlockerMiddleware(requestBlocker);

// Aplicar middleware GLOBALMENTE (antes de todas las rutas)
app.use(blockerMiddleware.middleware());

// Tarea programada: Auto-desbloqueo cada 5 minutos
setInterval(async () => {
    await requestBlocker.autoUnblockExpired();
}, 5 * 60 * 1000);

// Resto de tu aplicación...
app.get('/api/data', async (req, res) => {
    // Tu lógica aquí
    // req.clientInfo.ip está disponible
    // req.clientInfo.hardwareFingerprint está disponible
    res.json({ data: 'ok' });
});

// Endpoint especial para verificar estado de bloqueo
app.get('/api/blocker/status', async (req, res) => {
    const ip = blockerMiddleware.getClientIP(req);
    const status = await requestBlocker.getBlockStatus(ip, null);
    res.json(status);
});

// Endpoint de administración: desbloquear manualmente
app.post('/api/admin/unblock', async (req, res) => {
    // TODO: Agregar autenticación de admin aquí
    const { ip, hardwareFingerprint } = req.body;
    await requestBlocker.unblockEntity(ip, hardwareFingerprint, 'manual', 'admin@example.com');
    res.json({ success: true, message: 'Desbloqueado exitosamente' });
});

app.listen(3000, () => {
    console.log('✅ Servidor corriendo en puerto 3000');
    console.log('🛡️ Request Blocker activo');
});
```

### Paso 3: Aplicar Solo en Rutas Específicas (Opcional)

Si NO quieres bloquear todas las rutas, puedes aplicar el middleware selectivamente:

```javascript
// NO aplicar globalmente
// app.use(blockerMiddleware.middleware());

// Aplicar solo en rutas específicas
app.post('/api/auth/login', 
    blockerMiddleware.middleware(), 
    loginController
);

app.post('/api/data/create', 
    blockerMiddleware.middleware(), 
    createController
);

// Rutas públicas sin protección
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
```

---

## 📡 API ENDPOINTS

### 1. Verificar Estado de Bloqueo

```http
GET /api/blocker/status
```

**Response (No bloqueado):**
```json
{
    "blocked": false
}
```

**Response (Bloqueado temporal):**
```json
{
    "blocked": true,
    "blockType": "temporary",
    "reason": "6 peticiones en 10 segundos",
    "remainingTime": 7123,
    "blockedAt": "2025-10-23T10:30:00.000Z"
}
```

**Response (Bloqueado permanente):**
```json
{
    "blocked": true,
    "blockType": "permanent",
    "reason": "Tercer bloqueo en 7 días",
    "remainingTime": null,
    "blockedAt": "2025-10-23T10:30:00.000Z"
}
```

### 2. Desbloquear Manualmente (Admin)

```http
POST /api/admin/unblock
Authorization: Bearer <admin_token>
Content-Type: application/json

{
    "ip": "192.168.1.100",
    "hardwareFingerprint": "abc123..."
}
```

**Response:**
```json
{
    "success": true,
    "message": "Desbloqueado exitosamente"
}
```

### 3. Agregar a Whitelist (Admin)

```http
POST /api/admin/whitelist
Authorization: Bearer <admin_token>
Content-Type: application/json

{
    "ip": "203.0.113.10",
    "description": "Servidor de monitoreo",
    "expiresAt": "2026-01-01T00:00:00Z"
}
```

### 4. Obtener Estadísticas

```http
GET /api/admin/blocker/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
    "totalBlocked": 127,
    "temporaryBlocks": 98,
    "permanentBlocks": 29,
    "activeBlocks": 15,
    "blocksToday": 8,
    "blocksThisWeek": 45,
    "topBlockedIPs": [
        { "ip": "192.168.1.100", "count": 12 },
        { "ip": "10.0.0.50", "count": 8 }
    ]
}
```

### 5. Obtener Historial de Bloqueos

```http
GET /api/admin/blocker/history?page=1&limit=20&ip=192.168.1.100
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
    "total": 245,
    "page": 1,
    "limit": 20,
    "data": [
        {
            "id": 1234,
            "ipAddress": "192.168.1.100",
            "hardwareFingerprint": "abc123...",
            "blockedAt": "2025-10-23T10:30:00.000Z",
            "unblockedAt": "2025-10-23T12:30:00.000Z",
            "blockType": "temporary",
            "blockReason": "multiple_requests",
            "blockDurationSeconds": 7200,
            "blockedRequestsCount": 23
        }
    ]
}
```

---

## 📊 MONITOREO Y ALERTAS

### Dashboard de Métricas (Grafana)

Crear dashboard con:

1. **Panel de Bloqueos en Tiempo Real**
   - Gráfica de bloqueos por hora/día/semana
   - Bloqueos temporales vs permanentes
   - Tendencias

2. **Top IPs Bloqueadas**
   - Lista de IPs más bloqueadas
   - Geolocalización en mapa
   - Detalles de cada IP

3. **Peticiones por Segundo**
   - Tráfico total
   - Peticiones bloqueadas
   - Ratio bloqueo/éxito

4. **Hardware Bloqueado**
   - Dispositivos únicos bloqueados
   - Distribución por componente (CPU, MAC, etc.)

### Alertas Automáticas

**Email Alert Template:**

```
Asunto: ⚠️ Bloqueo Permanente Detectado

IP: 192.168.1.100
Hardware: abc123def456...
Fecha: 2025-10-23 10:30:00 UTC
Razón: Tercer bloqueo en 7 días

Historial de bloqueos:
1. 2025-10-17 - multiple_requests
2. 2025-10-20 - rate_limit_exceeded
3. 2025-10-23 - multiple_requests (PERMANENTE)

Geolocalización:
País: México
Región: Ciudad de México
Ciudad: Ciudad de México

Acciones recomendadas:
- Revisar logs completos
- Verificar si es ataque coordinado
- Considerar bloqueo de rango IP

Ver detalles: https://admin.example.com/blocker/12345
```

### Queries de Monitoreo (SQL)

```sql
-- Bloqueos en las últimas 24 horas
SELECT 
    COUNT(*) as total_blocks,
    SUM(CASE WHEN block_type = 'permanent' THEN 1 ELSE 0 END) as permanent_blocks,
    SUM(CASE WHEN block_type = 'temporary' THEN 1 ELSE 0 END) as temporary_blocks
FROM block_history
WHERE blocked_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR);

-- Top 10 IPs más bloqueadas
SELECT 
    ip_address,
    COUNT(*) as block_count,
    MAX(blocked_at) as last_block,
    SUM(blocked_requests_count) as total_blocked_attempts
FROM block_history
WHERE blocked_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY ip_address
ORDER BY block_count DESC
LIMIT 10;

-- Patrones de ataque por hora del día
SELECT 
    HOUR(blocked_at) as hour,
    COUNT(*) as blocks,
    AVG(blocked_requests_count) as avg_attempts
FROM block_history
WHERE blocked_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY HOUR(blocked_at)
ORDER BY blocks DESC;

-- Efectividad del sistema
SELECT 
    DATE(blocked_at) as date,
    COUNT(DISTINCT ip_address) as unique_ips_blocked,
    SUM(blocked_requests_count) as total_blocked_requests,
    AVG(block_duration_seconds) as avg_block_duration
FROM block_history
WHERE blocked_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(blocked_at)
ORDER BY date DESC;
```

---

## 🧪 TESTING

### 1. Test de Múltiples Peticiones

```javascript
const axios = require('axios');

async function testMultipleRequests() {
    const baseURL = 'http://localhost:3000';
    
    console.log('🧪 Test: Múltiples peticiones rápidas...\n');
    
    try {
        // Hacer 6 peticiones rápidas (debería bloquear en la 6ta)
        for (let i = 1; i <= 6; i++) {
            const start = Date.now();
            
            try {
                const response = await axios.get(`${baseURL}/api/test`);
                const elapsed = Date.now() - start;
                console.log(`✅ Petición ${i}: ${response.status} (${elapsed}ms)`);
            } catch (error) {
                const elapsed = Date.now() - start;
                
                if (error.response && error.response.status === 403) {
                    console.log(`🔒 Petición ${i}: BLOQUEADO (${elapsed}ms)`);
                    console.log('Detalles:', JSON.stringify(error.response.data, null, 2));
                    break;
                } else {
                    console.log(`❌ Petición ${i}: ERROR ${error.message}`);
                }
            }
            
            // Esperar 500ms entre peticiones
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    } catch (error) {
        console.error('Error en test:', error.message);
    }
}

testMultipleRequests();
```

**Output Esperado:**
```
🧪 Test: Múltiples peticiones rápidas...

✅ Petición 1: 200 (45ms)
✅ Petición 2: 200 (38ms)
✅ Petición 3: 200 (42ms)
✅ Petición 4: 200 (39ms)
✅ Petición 5: 200 (41ms)
🔒 Petición 6: BLOQUEADO (12ms)
Detalles: {
  "error": "ACCESS_BLOCKED",
  "message": "Tu acceso ha sido bloqueado por múltiples peticiones. Se reestablecerá automáticamente en 2h 0m",
  "blocked": true,
  "blockType": "temporary",
  "reason": "6 peticiones en 10 segundos",
  "remainingTime": {
    "seconds": 7200,
    "formatted": "2h 0m"
  }
}
```

### 2. Test de Bloqueo Permanente

```javascript
async function testPermanentBlock() {
    console.log('🧪 Test: Bloqueo permanente (3 bloqueos en 7 días)...\n');
    
    // Simular 3 bloqueos consecutivos
    for (let attempt = 1; attempt <= 3; attempt++) {
        console.log(`\n--- Intento ${attempt} ---`);
        
        // Hacer 6 peticiones rápidas para causar bloqueo
        for (let i = 1; i <= 6; i++) {
            try {
                await axios.get(`${baseURL}/api/test`);
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    const data = error.response.data;
                    console.log(`🔒 Bloqueado: ${data.blockType}`);
                    console.log(`Razón: ${data.reason}`);
                    
                    if (data.blockType === 'permanent') {
                        console.log('\n⚠️ BLOQUEO PERMANENTE ALCANZADO!');
                        return;
                    }
                    break;
                }
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Esperar a que se desbloquee (en producción serían 2 horas)
        console.log('⏱️ Esperando desbloqueo...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simular con 2 segundos
    }
}
```

### 3. Test de Whitelist

```javascript
async function testWhitelist() {
    console.log('🧪 Test: Whitelist...\n');
    
    // Agregar IP a whitelist
    await axios.post(`${baseURL}/api/admin/whitelist`, {
        ip: '127.0.0.1',
        description: 'Localhost para testing'
    }, {
        headers: { 'Authorization': 'Bearer admin_token' }
    });
    
    console.log('✅ IP agregada a whitelist');
    
    // Intentar múltiples peticiones (no debería bloquear)
    for (let i = 1; i <= 10; i++) {
        const response = await axios.get(`${baseURL}/api/test`);
        console.log(`✅ Petición ${i}: ${response.status} (whitelisted)`);
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}
```

### 4. Test de Hardware Fingerprint

```javascript
const { machineIdSync } = require('node-machine-id');
const os = require('os');

async function testHardwareFingerprint() {
    console.log('🧪 Test: Hardware Fingerprint...\n');
    
    // Generar fingerprint
    const hardwareData = {
        cpuId: os.cpus()[0].model,
        macAddress: Object.values(os.networkInterfaces())
            .flat()
            .find(i => !i.internal && i.mac !== '00:00:00:00:00:00')
            ?.mac,
        diskSerial: machineIdSync(),
    };
    
    console.log('Hardware Data:', hardwareData);
    
    // Enviar en header personalizado
    const hwHeader = Buffer.from(JSON.stringify(hardwareData)).toString('base64');
    
    // Hacer peticiones con fingerprint
    for (let i = 1; i <= 6; i++) {
        try {
            await axios.get(`${baseURL}/api/test`, {
                headers: {
                    'X-Hardware-Fingerprint': hwHeader
                }
            });
            console.log(`✅ Petición ${i} con fingerprint`);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log(`🔒 Bloqueado: Hardware + IP`);
                break;
            }
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}
```

### 5. Test de Carga

```javascript
const { performance } = require('perf_hooks');

async function loadTest() {
    console.log('🧪 Test de Carga: 1000 peticiones concurrentes...\n');
    
    const concurrentRequests = 1000;
    const start = performance.now();
    
    const promises = Array(concurrentRequests).fill().map(async (_, i) => {
        try {
            await axios.get(`${baseURL}/api/test`);
            return { success: true, index: i };
        } catch (error) {
            return { 
                success: false, 
                index: i,
                blocked: error.response?.status === 403
            };
        }
    });
    
    const results = await Promise.all(promises);
    const elapsed = performance.now() - start;
    
    const successful = results.filter(r => r.success).length;
    const blocked = results.filter(r => r.blocked).length;
    const errors = results.length - successful - blocked;
    
    console.log(`\n📊 Resultados:`);
    console.log(`   Total: ${results.length}`);
    console.log(`   ✅ Exitosas: ${successful}`);
    console.log(`   🔒 Bloqueadas: ${blocked}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log(`   ⏱️ Tiempo: ${(elapsed / 1000).toFixed(2)}s`);
    console.log(`   📈 Rate: ${(results.length / (elapsed / 1000)).toFixed(0)} req/s`);
}
```

---

## 🚀 DEPLOYMENT

### Script de Deployment Completo

```bash
#!/bin/bash
# deploy-request-blocker.sh

set -e

echo "🚀 Deploying Request Blocker System..."

# 1. Crear directorios
echo "📁 Creando estructura de directorios..."
mkdir -p request-blocker/{src/{services,middleware,models,utils,config},database/{migrations,seeds},tests,logs}

# 2. Instalar dependencias
echo "📦 Instalando dependencias..."
npm install --save mysql2 redis ioredis node-machine-id systeminformation geoip-lite nodemailer

# 3. Crear base de datos
echo "💾 Creando base de datos..."
mysql -u root -p < request-blocker/database/migrations/001_create_tables.sql

# 4. Configurar Redis
echo "🔴 Verificando Redis..."
redis-cli ping || (echo "❌ Redis no está corriendo" && exit 1)

# 5. Configurar variables de entorno
echo "⚙️ Configurando variables de entorno..."
cp .env.example .env
# Editar .env manualmente

# 6. Ejecutar tests
echo "🧪 Ejecutando tests..."
npm test

# 7. Iniciar servicio
echo "▶️ Iniciando servicio..."
pm2 start server.js --name "ultra-secure-blocker"
pm2 save

# 8. Configurar tarea programada (cron)
echo "⏰ Configurando auto-desbloqueo..."
(crontab -l 2>/dev/null; echo "*/5 * * * * curl http://localhost:3000/api/admin/auto-unblock") | crontab -

echo "✅ Deployment completado!"
echo "📊 Dashboard: http://localhost:3000/admin/blocker"
echo "📝 Logs: tail -f logs/request-blocker.log"
```

### Verificación Post-Deployment

```bash
#!/bin/bash
# verify-deployment.sh

echo "🔍 Verificando deployment..."

# 1. Verificar servicio
echo -n "1. Servicio activo: "
pm2 list | grep "ultra-secure-blocker" && echo "✅" || echo "❌"

# 2. Verificar base de datos
echo -n "2. Tablas creadas: "
mysql -u root -p -e "USE ultra_secure_db; SHOW TABLES LIKE 'blocked_%';" | wc -l

# 3. Verificar Redis
echo -n "3. Redis conectado: "
redis-cli ping

# 4. Test de endpoint
echo -n "4. Endpoint responde: "
curl -s http://localhost:3000/api/blocker/status | jq .blocked

# 5. Verificar logs
echo "5. Últimos logs:"
tail -n 5 logs/request-blocker.log

echo -e "\n✅ Verificación completada"
```

### Rollback en Caso de Error

```bash
#!/bin/bash
# rollback.sh

echo "⏮️ Ejecutando rollback..."

# 1. Detener servicio
pm2 stop ultra-secure-blocker
pm2 delete ultra-secure-blocker

# 2. Backup de base de datos
mysqldump -u root -p ultra_secure_db blocked_ips blocked_hardware block_history > backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Eliminar tablas
mysql -u root -p -e "USE ultra_secure_db; DROP TABLE IF EXISTS blocked_ips, blocked_hardware, block_history, request_logs;"

# 4. Restaurar versión anterior
git checkout HEAD~1

# 5. Reinstalar
npm install

echo "✅ Rollback completado"
```

---

## 🔧 TROUBLESHOOTING

### Problema 1: Redis no conecta

**Síntomas:**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solución:**
```bash
# Verificar que Redis esté corriendo
sudo systemctl status redis

# Si no está corriendo
sudo systemctl start redis

# Habilitar auto-inicio
sudo systemctl enable redis

# Verificar conexión
redis-cli ping
# Debe retornar: PONG
```

### Problema 2: Bloqueos no se desbloquean automáticamente

**Síntomas:**
- Bloqueos temporales no expiran después de 2 horas

**Solución:**
```bash
# 1. Verificar que la tarea programada esté corriendo
pm2 logs ultra-secure-blocker | grep "Auto-desbloqueo"

# 2. Ejecutar manualmente
curl -X POST http://localhost:3000/api/admin/auto-unblock \
  -H "Authorization: Bearer admin_token"

# 3. Verificar en base de datos
mysql -u root -p -e "
  SELECT ip_address, unblock_at, 
         TIMESTAMPDIFF(MINUTE, NOW(), unblock_at) as minutes_remaining
  FROM ultra_secure_db.blocked_ips
  WHERE block_type = 'temporary'
    AND unblock_at IS NOT NULL
    AND unblock_at > NOW();
"
```

### Problema 3: Cache desincronizado con BD

**Síntomas:**
- Usuario reporta estar bloqueado pero en BD no aparece

**Solución:**
```bash
# Limpiar cache de Redis
redis-cli FLUSHDB

# O limpiar solo claves del blocker
redis-cli KEYS "blocker:*" | xargs redis-cli DEL

# Reiniciar servicio para reconstruir cache
pm2 restart ultra-secure-blocker
```

### Problema 4: Hardware fingerprint no se detecta

**Síntomas:**
```
hardware_fingerprint: null en logs
```

**Solución:**
```javascript
// En el cliente (frontend/app), asegurar que se envíe el header

// Ejemplo con fetch
const hardwareData = await collectHardwareInfo(); // Tu función
const hwHeader = btoa(JSON.stringify(hardwareData));

fetch('/api/endpoint', {
    headers: {
        'X-Hardware-Fingerprint': hwHeader
    }
});

// Verificar que el servidor lo reciba
console.log(req.headers['x-hardware-fingerprint']);
```

### Problema 5: Performance degradado

**Síntomas:**
- Respuestas lentas
- Alta latencia

**Solución:**
```sql
-- 1. Verificar índices
SHOW INDEX FROM blocked_ips;
SHOW INDEX FROM request_logs;

-- 2. Analizar queries lentas
EXPLAIN SELECT * FROM blocked_ips WHERE ip_address = '192.168.1.1';

-- 3. Limpiar logs antiguos
DELETE FROM request_logs 
WHERE request_timestamp < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- 4. Optimizar tablas
OPTIMIZE TABLE blocked_ips;
OPTIMIZE TABLE blocked_hardware;
OPTIMIZE TABLE request_logs;
```

### Problema 6: Falsos positivos (usuarios legítimos bloqueados)

**Solución:**

1. **Ajustar configuración:**
```javascript
// blocker.config.js
module.exports = {
    requestDetection: {
        maxRequestsInWindow: 10,  // Aumentar de 5 a 10
        requestWindowTime: 30,    // Aumentar ventana a 30 segundos
    }
};
```

2. **Agregar a whitelist:**
```bash
curl -X POST http://localhost:3000/api/admin/whitelist \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin_token" \
  -d '{
    "ip": "203.0.113.50",
    "description": "Cliente corporativo legítimo"
  }'
```

3. **Desbloquear manualmente:**
```bash
curl -X POST http://localhost:3000/api/admin/unblock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin_token" \
  -d '{
    "ip": "203.0.113.50"
  }'
```

---

## 📚 ANEXOS

### A. SQL Completo para Migraciones

Ver archivo: `database/migrations/001_create_all_tables.sql`

### B. Ejemplo de Cliente con Hardware Fingerprint

Ver archivo: `examples/client-with-fingerprint.js`

### C. Dashboard HTML

Ver archivo: `public/admin/blocker-dashboard.html`

### D. Postman Collection

Ver archivo: `docs/RequestBlocker.postman_collection.json`

---

## 📞 SOPORTE

**Documentación completa:** `/docs/request-blocker/`  
**Reportar bugs:** GitHub Issues  
**Email:** support@example.com

---

## 📄 LICENCIA

Proprietary - Ultra Secure System © 2025

---

**Versión:** 1.0.0  
**Última actualización:** 2025-10-23  
**Autor:** Ultra Secure System Team

---

