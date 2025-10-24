# 🛡️ ULTRA SECURE SYSTEM V4.0 - SMART IA
## Sistema de Seguridad de Grado Militar con IA y Licenciamiento Dinámico

> **🏆 NIVEL DE SEGURIDAD: 10/10**  
> **🤖 SMART IA INTEGRADA**  
> **♾️ ESCALABILIDAD INFINITA**  
> **⚡ DEPLOYMENT AUTOMÁTICO EN 1 COMANDO**

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Características Smart IA](#características-smart-ia)
3. [Sistema de Licenciamiento Global Infiniti](#sistema-de-licenciamiento-global-infiniti)
4. [Arquitectura Completa](#arquitectura-completa)
5. [Sistema de Bloqueos Inteligentes](#sistema-de-bloqueos-inteligentes)
6. [Backups Cifrados 10 Capas](#backups-cifrados-10-capas)
7. [Frontend React + Next.js](#frontend-react-nextjs)
8. [Infraestructura de Hardware](#infraestructura-de-hardware)
9. [Sistema de Recuperación](#sistema-de-recuperación)
10. [Deployment Automatizado](#deployment-automatizado)
11. [Escalabilidad Multi-Sistema](#escalabilidad-multi-sistema)
12. [CORS y Seguridad Administrativa](#cors-y-seguridad-administrativa)

---

## 🎯 RESUMEN EJECUTIVO

### ¿Qué es Ultra Secure System V4.0 Smart IA?

El sistema de seguridad más avanzado del mercado que combina:

- ✅ **Smart IA** - Bloqueos inteligentes con patrones variables
- ✅ **Licenciamiento Dinámico** - 4 niveles: Basic, Pro, Max, Diamante
- ✅ **Cifrado 10 Capas** - Para backups críticos
- ✅ **Auto-Deployment** - Script .sh automatizado completo
- ✅ **Escalabilidad Infinita** - Sistema distribuido multi-nodo
- ✅ **React + Next.js** - UI moderna y profesional
- ✅ **Hardware Optimizado** - AMD Ryzen, NVMe, GPU acceleration

### Características Nuevas en V4.0

| Característica | V3.0 | V4.0 Smart IA |
|----------------|------|---------------|
| **Niveles de cifrado** | 3 capas | 10 capas (backups) |
| **Bloqueos** | Estándar | Inteligentes + Variables |
| **Licenciamiento** | Manual | Dinámico automático |
| **Escalabilidad** | Single | Multi-nodo infinito |
| **Frontend** | N/A | React + Next.js + CSS puro |
| **Backups** | Básico | Cifrados 10 capas + BD oculta |
| **IA** | No | Sí - Patrones predictivos |
| **Recovery** | Manual | Automático inteligente |
| **Deployment** | Semi-auto | 100% automatizado |

---

## 🤖 CARACTERÍSTICAS SMART IA

### 1. Sistema de Bloqueos Inteligentes

El Smart IA implementa 3 tipos de bloqueos:

#### A. Bloqueo Manual (Admin)
```javascript
// Bloqueo manual por administrador
await smartIA.blockManual({
    target: 'user_id_123',
    type: 'ip', // o 'hardware', 'user', 'network'
    duration: '24h', // o 'permanent'
    reason: 'Actividad sospechosa detectada',
    admin: 'admin@company.com'
});
```

#### B. Bloqueo Temporal Variable
```javascript
// El IA calcula tiempo de bloqueo según comportamiento
const blockDuration = smartIA.calculateSmartDuration({
    offense_count: 3,
    risk_score: 85,
    time_of_day: 'night',
    day_of_week: 'weekend',
    previous_blocks: 2,
    user_behavior_pattern: 'suspicious'
});

// Resultado: Bloqueo de 4h23m (variable, no fijo)
```

**Patrón Variable por Día/Hora:**
```
Lunes 10:00   → Usuario bloqueado por: 2h15m
Martes 15:30  → Usuario bloqueado por: 3h42m
Miércoles 02:00 → Usuario bloqueado por: 6h08m (hora sospechosa)
Jueves 18:45  → Usuario bloqueado por: 1h55m (hora normal)
```

**Algoritmo de IA:**
```javascript
class SmartBlockingIA {
    calculateSmartDuration(params) {
        let baseDuration = 2 * 3600; // 2 horas base
        
        // Factor 1: Horario (noche = más sospechoso)
        const hour = new Date().getHours();
        if (hour >= 22 || hour <= 6) {
            baseDuration *= 1.5; // +50% en horario nocturno
        }
        
        // Factor 2: Día de la semana
        const day = new Date().getDay();
        if (day === 0 || day === 6) {
            baseDuration *= 1.3; // +30% en fines de semana
        }
        
        // Factor 3: Historial del usuario
        baseDuration *= (1 + params.offense_count * 0.2);
        
        // Factor 4: Risk score
        baseDuration *= (params.risk_score / 50);
        
        // Factor 5: Variabilidad aleatoria (±20%)
        const randomFactor = 0.8 + (Math.random() * 0.4);
        baseDuration *= randomFactor;
        
        // Factor 6: Patrón de comportamiento
        if (params.user_behavior_pattern === 'bot') {
            baseDuration *= 2; // Doble para bots
        }
        
        // Factor 7: Geo-location
        if (params.high_risk_country) {
            baseDuration *= 1.5;
        }
        
        return Math.floor(baseDuration);
    }
    
    // Patrón de horarios variables
    generateDynamicSchedule() {
        return {
            monday: {
                peak_hours: [9, 10, 11, 14, 15, 16],
                low_risk_hours: [12, 13, 17, 18],
                high_risk_hours: [0, 1, 2, 3, 4, 5, 22, 23]
            },
            tuesday: {
                // Patrón diferente cada día
                peak_hours: [10, 11, 13, 14, 15, 17],
                low_risk_hours: [9, 12, 16, 18],
                high_risk_hours: [0, 1, 2, 3, 4, 5, 21, 22, 23]
            },
            // ... patrones únicos para cada día
        };
    }
}
```

#### C. Bloqueo Preventivo por IA

El sistema aprende y predice ataques:

```javascript
class PredictiveBlockingIA {
    async analyzeThreatPatterns(userId) {
        // Analizar últimos 30 días de comportamiento
        const behaviorHistory = await this.getUserBehaviorHistory(userId, 30);
        
        // Análisis de patrones
        const patterns = {
            login_times: this.analyzeLoginPatterns(behaviorHistory),
            request_frequency: this.analyzeRequestFrequency(behaviorHistory),
            geo_locations: this.analyzeGeoLocations(behaviorHistory),
            device_changes: this.analyzeDeviceChanges(behaviorHistory),
            failed_attempts: this.analyzeFailedAttempts(behaviorHistory)
        };
        
        // Calcular probabilidad de ataque
        const threatProbability = this.calculateThreatProbability(patterns);
        
        if (threatProbability > 0.75) {
            // Bloqueo preventivo antes de que pase algo
            await this.preventiveBlock(userId, {
                probability: threatProbability,
                patterns_detected: patterns,
                action: 'temporary_restriction',
                duration: '1h'
            });
            
            // Alertar al admin
            await this.notifyAdmin({
                type: 'PREVENTIVE_BLOCK',
                user: userId,
                threat_level: 'HIGH',
                probability: `${(threatProbability * 100).toFixed(1)}%`
            });
        }
        
        return {
            threat_probability: threatProbability,
            recommendation: threatProbability > 0.5 ? 'monitor_closely' : 'normal',
            patterns
        };
    }
}
```

### 2. Patrones de Aprendizaje

```javascript
// El IA aprende de cada intento de ataque
class SmartLearningEngine {
    async learnFromIncident(incident) {
        // Extraer características del ataque
        const features = this.extractFeatures(incident);
        
        // Actualizar modelo de ML
        await this.updateMLModel(features, {
            was_attack: incident.confirmed_attack,
            success: incident.breach_success,
            detection_time: incident.detection_latency,
            block_effectiveness: incident.block_success
        });
        
        // Ajustar umbrales dinámicamente
        await this.adjustThresholds({
            false_positives: await this.getFalsePositiveRate(),
            false_negatives: await this.getFalseNegativeRate(),
            average_threat_level: await this.getAverageThreatLevel()
        });
        
        console.log('🤖 IA actualizada con nuevo patrón de ataque');
    }
}
```

---

## ♾️ SISTEMA DE LICENCIAMIENTO GLOBAL INFINITI

### Niveles de Licencia

```javascript
const LICENSE_TIERS = {
    'global-infiniti-basic': {
        name: 'Global Infiniti Basic',
        price: 9999, // USD/año
        features: {
            encryption_layers: 3,
            max_nodes: 1,
            max_users: 100,
            backup_retention_days: 30,
            support_level: 'email',
            smart_ia: false,
            hardware_blocking: true,
            custom_css: false,
            api_rate_limit: 1000, // requests/hour
            storage_gb: 100,
            bandwidth_gb_month: 1000,
            modules: ['encryption', 'auth', 'rate-limiter', 'audit']
        }
    },
    
    'global-infiniti-pro': {
        name: 'Global Infiniti Pro',
        price: 24999, // USD/año
        features: {
            encryption_layers: 7,
            max_nodes: 3,
            max_users: 1000,
            backup_retention_days: 90,
            support_level: 'priority_email',
            smart_ia: true,
            hardware_blocking: true,
            custom_css: true,
            api_rate_limit: 5000,
            storage_gb: 500,
            bandwidth_gb_month: 5000,
            modules: [
                'encryption', 'auth', 'rate-limiter', 'audit',
                'smart-blocker', 'predictive-ia', 'advanced-analytics'
            ]
        }
    },
    
    'global-infiniti-max': {
        name: 'Global Infiniti Max',
        price: 49999, // USD/año
        features: {
            encryption_layers: 10,
            max_nodes: 10,
            max_users: 10000,
            backup_retention_days: 180,
            support_level: '24/7_phone',
            smart_ia: true,
            hardware_blocking: true,
            custom_css: true,
            api_rate_limit: 20000,
            storage_gb: 2000,
            bandwidth_gb_month: 20000,
            gpu_acceleration: true,
            modules: [
                'encryption', 'auth', 'rate-limiter', 'audit',
                'smart-blocker', 'predictive-ia', 'advanced-analytics',
                'multi-region', 'load-balancer', 'cdn'
            ]
        }
    },
    
    'global-infiniti-diamante': {
        name: 'Global Infiniti Diamante',
        price: 99999, // USD/año
        features: {
            encryption_layers: 10,
            max_nodes: 'unlimited',
            max_users: 'unlimited',
            backup_retention_days: 365,
            support_level: 'dedicated_engineer',
            smart_ia: true,
            hardware_blocking: true,
            custom_css: true,
            api_rate_limit: 'unlimited',
            storage_gb: 'unlimited',
            bandwidth_gb_month: 'unlimited',
            gpu_acceleration: true,
            quantum_resistant: true,
            white_label: true,
            custom_development: true,
            modules: 'all',
            sla: '99.999%'
        }
    }
};
```

### Sistema de Validación de Licencias

```javascript
class LicenseValidator {
    async validateLicense(licenseKey, requestedFeatures) {
        // 1. Verificar licencia en BD cifrada
        const license = await this.getLicenseFromVault(licenseKey);
        
        if (!license) {
            throw new Error('INVALID_LICENSE');
        }
        
        // 2. Verificar expiración
        if (new Date() > new Date(license.expires_at)) {
            await this.suspendServices(license.client_id, 'LICENSE_EXPIRED');
            throw new Error('LICENSE_EXPIRED');
        }
        
        // 3. Verificar características solicitadas
        const tier = LICENSE_TIERS[license.tier];
        
        for (const feature of requestedFeatures) {
            if (!this.isFeatureIncluded(feature, tier)) {
                // SUSPENDER SERVICIO AUTOMÁTICAMENTE
                await this.suspendServices(license.client_id, 'UNAUTHORIZED_FEATURE_USE', {
                    requested_feature: feature,
                    license_tier: license.tier,
                    timestamp: new Date()
                });
                
                // Alertar admin
                await this.notifyAdmin({
                    type: 'LICENSE_VIOLATION',
                    client: license.client_id,
                    feature: feature,
                    action: 'SERVICE_SUSPENDED'
                });
                
                throw new Error(`FEATURE_NOT_INCLUDED: ${feature}`);
            }
        }
        
        // 4. Verificar límites de uso
        const usage = await this.getCurrentUsage(license.client_id);
        
        if (usage.nodes > tier.features.max_nodes && tier.features.max_nodes !== 'unlimited') {
            await this.suspendServices(license.client_id, 'NODE_LIMIT_EXCEEDED');
            throw new Error('NODE_LIMIT_EXCEEDED');
        }
        
        if (usage.users > tier.features.max_users && tier.features.max_users !== 'unlimited') {
            await this.suspendServices(license.client_id, 'USER_LIMIT_EXCEEDED');
            throw new Error('USER_LIMIT_EXCEEDED');
        }
        
        // 5. Verificar módulos activos
        const activeModules = await this.getActiveModules(license.client_id);
        const allowedModules = tier.features.modules === 'all' 
            ? 'all' 
            : tier.features.modules;
        
        if (allowedModules !== 'all') {
            for (const module of activeModules) {
                if (!allowedModules.includes(module)) {
                    // MÓDULO NO AUTORIZADO - SUSPENDER
                    await this.suspendServices(license.client_id, 'UNAUTHORIZED_MODULE', {
                        unauthorized_module: module,
                        allowed_modules: allowedModules
                    });
                    
                    throw new Error(`UNAUTHORIZED_MODULE: ${module}`);
                }
            }
        }
        
        return {
            valid: true,
            tier: license.tier,
            features: tier.features,
            usage,
            limits: {
                nodes: tier.features.max_nodes,
                users: tier.features.max_users,
                storage: tier.features.storage_gb,
                bandwidth: tier.features.bandwidth_gb_month
            }
        };
    }
    
    async suspendServices(clientId, reason, metadata = {}) {
        // 1. Marcar en BD como suspendido
        await db.query(`
            UPDATE licenses 
            SET status = 'suspended',
                suspension_reason = ?,
                suspension_metadata = ?,
                suspended_at = NOW()
            WHERE client_id = ?
        `, [reason, JSON.stringify(metadata), clientId]);
        
        // 2. Bloquear acceso a todas las APIs
        await redis.set(`suspended:${clientId}`, JSON.stringify({
            reason,
            suspended_at: new Date(),
            metadata
        }), 'EX', 86400 * 30); // 30 días
        
        // 3. Detener servicios activos
        await this.stopClientServices(clientId);
        
        // 4. Enviar notificaciones
        await this.notifyClient(clientId, {
            type: 'SERVICE_SUSPENDED',
            reason,
            action_required: 'Contact support or upgrade license',
            support_email: process.env.SUPPORT_EMAIL
        });
        
        console.log(`🚫 Servicios suspendidos para cliente ${clientId}: ${reason}`);
    }
}
```

---

## 🔐 BACKUPS CIFRADOS 10 CAPAS

### Arquitectura de Backup Cifrado

```javascript
class TenLayerBackupSystem {
    constructor() {
        // 10 algoritmos diferentes para máxima seguridad
        this.encryptionLayers = [
            { algo: 'AES-256-GCM', lib: 'crypto' },
            { algo: 'ChaCha20-Poly1305', lib: 'crypto' },
            { algo: 'Camellia-256-CBC', lib: 'crypto' },
            { algo: 'Twofish-256', lib: 'twofish' },
            { algo: 'Serpent-256', lib: 'serpent' },
            { algo: 'Blowfish-448', lib: 'crypto' },
            { algo: 'CAST-256', lib: 'cast' },
            { algo: 'IDEA-128', lib: 'idea' },
            { algo: 'RC6-256', lib: 'rc6' },
            { algo: 'MARS-256', lib: 'mars' }
        ];
        
        // Base de datos oculta para backups
        this.hiddenBackupDB = null;
    }
    
    async createTenLayerBackup(data, metadata) {
        console.log('🔐 Iniciando cifrado de 10 capas...');
        
        // Paso 1: Serializar datos
        let encryptedData = JSON.stringify(data);
        
        // Paso 2: Aplicar 10 capas de cifrado
        const keys = [];
        
        for (let i = 0; i < 10; i++) {
            const layer = this.encryptionLayers[i];
            
            // Generar clave única para esta capa
            const layerKey = await this.generateLayerKey(i, metadata);
            keys.push(layerKey);
            
            // Cifrar con este algoritmo
            encryptedData = await this.encryptWithAlgorithm(
                encryptedData,
                layerKey,
                layer.algo
            );
            
            console.log(`  ✓ Capa ${i + 1}/10: ${layer.algo}`);
        }
        
        // Paso 3: Generar clave maestra de backup
        const masterBackupKey = await this.generateMasterBackupKey(keys);
        
        // Paso 4: Crear metadata del backup
        const backupMetadata = {
            backup_id: crypto.randomUUID(),
            created_at: new Date(),
            encryption_layers: 10,
            algorithms_used: this.encryptionLayers.map(l => l.algo),
            data_size: Buffer.from(encryptedData).length,
            original_size: Buffer.from(JSON.stringify(data)).length,
            compression_ratio: this.calculateCompressionRatio(data, encryptedData),
            checksum: crypto.createHash('sha512').update(encryptedData).digest('hex'),
            ...metadata
        };
        
        // Paso 5: Guardar en BD oculta
        await this.saveToHiddenDB(backupMetadata, encryptedData, masterBackupKey);
        
        console.log(`✅ Backup ${backupMetadata.backup_id} creado con éxito`);
        console.log(`   Tamaño original: ${backupMetadata.original_size} bytes`);
        console.log(`   Tamaño cifrado: ${backupMetadata.data_size} bytes`);
        
        return {
            backup_id: backupMetadata.backup_id,
            backup_key: masterBackupKey,
            metadata: backupMetadata
        };
    }
    
    async saveToHiddenDB(metadata, encryptedData, masterKey) {
        // Conexión a BD oculta (diferentes credenciales)
        const hiddenDB = await mysql.createConnection({
            host: process.env.HIDDEN_BACKUP_DB_HOST,
            port: process.env.HIDDEN_BACKUP_DB_PORT,
            user: process.env.HIDDEN_BACKUP_DB_USER, // Usuario diferente
            password: process.env.HIDDEN_BACKUP_DB_PASSWORD, // Password diferente
            database: process.env.HIDDEN_BACKUP_DB_NAME,
            ssl: {
                rejectUnauthorized: true
            }
        });
        
        // Insertar backup
        await hiddenDB.query(`
            INSERT INTO hidden_backups (
                backup_id,
                backup_name,
                encrypted_data,
                master_key_encrypted,
                metadata,
                created_at,
                visible_to_roles
            ) VALUES (?, ?, ?, ?, ?, NOW(), ?)
        `, [
            metadata.backup_id,
            metadata.backup_name || 'Backup',
            encryptedData,
            await this.encryptMasterKey(masterKey), // Clave también cifrada
            JSON.stringify(metadata),
            JSON.stringify(['admin', 'backup_manager']) // Solo ciertos roles
        ]);
        
        await hiddenDB.end();
        
        // NO MOSTRAR información de la BD oculta en logs públicos
        console.log('✓ Backup almacenado en ubicación segura');
    }
    
    async listBackupsForUser(userId, userRole) {
        const hiddenDB = await this.connectToHiddenDB();
        
        // Query diferente según rol
        const query = userRole === 'admin' || userRole === 'backup_manager'
            ? `SELECT backup_id, backup_name, created_at, metadata 
               FROM hidden_backups 
               WHERE JSON_CONTAINS(visible_to_roles, '"${userRole}"')
               ORDER BY created_at DESC`
            : `SELECT NULL`; // Usuario normal no ve nada
        
        const [backups] = await hiddenDB.query(query);
        await hiddenDB.end();
        
        if (userRole !== 'admin' && userRole !== 'backup_manager') {
            return {
                visible: false,
                message: 'No tienes permisos para ver backups',
                contact: 'Contacta al administrador'
            };
        }
        
        // Retornar solo nombre y clave de cifrado
        return backups.map(b => ({
            backup_name: b.backup_name,
            backup_id: b.backup_id,
            created_at: b.created_at,
            encryption_key: '***ENCRYPTED***', // No mostrar clave real
            size: JSON.parse(b.metadata).data_size,
            instructions: 'Use decryption key to restore'
        }));
    }
    
    async restoreBackup(backupId, decryptionKey, requestedByUser, userRole) {
        // Verificar permisos
        if (userRole !== 'admin' && userRole !== 'backup_manager') {
            throw new Error('UNAUTHORIZED: No tienes permisos para restaurar backups');
        }
        
        console.log(`🔄 Restaurando backup ${backupId}...`);
        
        // 1. Obtener backup de BD oculta
        const hiddenDB = await this.connectToHiddenDB();
        const [rows] = await hiddenDB.query(
            'SELECT * FROM hidden_backups WHERE backup_id = ?',
            [backupId]
        );
        await hiddenDB.end();
        
        if (rows.length === 0) {
            throw new Error('BACKUP_NOT_FOUND');
        }
        
        const backup = rows[0];
        
        // 2. Verificar clave de descifrado
        const isKeyValid = await this.verifyDecryptionKey(
            decryptionKey,
            backup.master_key_encrypted
        );
        
        if (!isKeyValid) {
            // Log intento fallido
            await this.logFailedRestoreAttempt(backupId, requestedByUser);
            throw new Error('INVALID_DECRYPTION_KEY');
        }
        
        // 3. Descifrar 10 capas (en orden inverso)
        let decryptedData = backup.encrypted_data;
        
        for (let i = 9; i >= 0; i--) {
            const layer = this.encryptionLayers[i];
            const layerKey = await this.deriveLayerKey(decryptionKey, i);
            
            decryptedData = await this.decryptWithAlgorithm(
                decryptedData,
                layerKey,
                layer.algo
            );
            
            console.log(`  ✓ Descifrada capa ${10 - i}/10: ${layer.algo}`);
        }
        
        // 4. Parsear datos
        const restoredData = JSON.parse(decryptedData);
        
        // 5. Verificar integridad
        const metadata = JSON.parse(backup.metadata);
        const checksum = crypto.createHash('sha512')
            .update(backup.encrypted_data)
            .digest('hex');
        
        if (checksum !== metadata.checksum) {
            throw new Error('INTEGRITY_CHECK_FAILED: Backup corrupted');
        }
        
        console.log(`✅ Backup ${backupId} restaurado exitosamente`);
        
        // 6. Log de auditoría
        await this.logBackupRestore(backupId, requestedByUser, 'SUCCESS');
        
        return {
            data: restoredData,
            metadata,
            restored_at: new Date(),
            restored_by: requestedByUser
        };
    }
}
```

### Base de Datos Oculta

```sql
-- Base de datos separada para backups
CREATE DATABASE IF NOT EXISTS hidden_backups_vault;

USE hidden_backups_vault;

-- Usuario con permisos limitados
CREATE USER IF NOT EXISTS 'backup_admin'@'localhost' 
IDENTIFIED BY 'ULTRA_SECRET_PASSWORD_DIFFERENT_FROM_MAIN';

GRANT SELECT, INSERT ON hidden_backups_vault.* TO 'backup_admin'@'localhost';

-- Tabla de backups cifrados
CREATE TABLE hidden_backups (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    backup_id VARCHAR(36) NOT NULL UNIQUE,
    backup_name VARCHAR(255) NOT NULL,
    encrypted_data LONGBLOB NOT NULL,
    master_key_encrypted TEXT NOT NULL,
    metadata JSON NOT NULL,
    created_at DATETIME NOT NULL,
    visible_to_roles JSON NOT NULL,
    restore_count INT UNSIGNED DEFAULT 0,
    last_restored_at DATETIME NULL,
    last_restored_by VARCHAR(255) NULL,
    
    INDEX idx_backup_id (backup_id),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_visible_roles ((CAST(visible_to_roles AS CHAR(255) ARRAY)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de intentos de restauración
CREATE TABLE restore_attempts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    backup_id VARCHAR(36) NOT NULL,
    attempted_by VARCHAR(255) NOT NULL,
    attempted_at DATETIME NOT NULL,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(255) NULL,
    ip_address VARCHAR(45) NOT NULL,
    
    INDEX idx_backup_id (backup_id),
    INDEX idx_attempted_at (attempted_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Trigger de auditoría
DELIMITER //

CREATE TRIGGER after_backup_restore
AFTER UPDATE ON hidden_backups
FOR EACH ROW
BEGIN
    IF NEW.restore_count > OLD.restore_count THEN
        INSERT INTO restore_attempts (
            backup_id,
            attempted_by,
            attempted_at,
            success,
            ip_address
        ) VALUES (
            NEW.backup_id,
            NEW.last_restored_by,
            NEW.last_restored_at,
            TRUE,
            '0.0.0.0' -- Se debe pasar desde la aplicación
        );
    END IF;
END//

DELIMITER ;
```

---

## ⚛️ FRONTEND REACT + NEXT.JS

### Estructura del Proyecto

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.jsx
│   │   └── register/
│   │       └── page.jsx
│   ├── (dashboard)/
│   │   ├── layout.jsx
│   │   ├── page.jsx
│   │   ├── users/
│   │   │   └── page.jsx
│   │   ├── security/
│   │   │   ├── page.jsx
│   │   │   ├── blocks/
│   │   │   │   └── page.jsx
│   │   │   └── audit/
│   │   │       └── page.jsx
│   │   ├── backups/
│   │   │   └── page.jsx
│   │   └── settings/
│   │       └── page.jsx
│   ├── api/
│   │   └── [...]/
│   │       └── route.js
│   ├── layout.jsx
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Table.jsx
│   │   ├── Modal.jsx
│   │   └── Alert.jsx
│   ├── dashboard/
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   └── Stats.jsx
│   └── security/
│       ├── BlockList.jsx
│       ├── ThreatMap.jsx
│       └── AuditLog.jsx
├── lib/
│   ├── api.js
│   ├── auth.js
│   └── utils.js
├── styles/
│   ├── variables.css
│   ├── components/
│   │   ├── button.css
│   │   ├── card.css
│   │   └── table.css
│   └── layouts/
│       ├── dashboard.css
│       └── auth.css
└── public/
    └── assets/
```

Continúo en el siguiente mensaje con el código completo del frontend, infraestructura de hardware, y el script de deployment automatizado...

¿Quieres que continúe con el resto de la documentación?