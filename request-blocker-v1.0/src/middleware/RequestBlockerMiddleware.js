/**
 * 🛡️ REQUEST BLOCKER MIDDLEWARE
 * 
 * Middleware de Express para bloqueo de peticiones múltiples
 * Integrado con Ultra Secure System V3.0
 * 
 * @author Ultra Secure System Team
 * @version 1.0.0
 */

class RequestBlockerMiddleware {
    constructor(blockerService) {
        this.blocker = blockerService;
    }
    
    /**
     * Middleware principal para Express
     * @returns {Function} Express middleware
     */
    middleware() {
        return async (req, res, next) => {
            const startTime = Date.now();
            
            try {
                // Extraer información de la petición
                const ip = this.getClientIP(req);
                const userAgent = req.headers['user-agent'] || 'Unknown';
                const hardwareData = this.extractHardwareData(req);
                
                // Verificar si debe ser bloqueado
                const result = await this.blocker.checkRequest(ip, userAgent, hardwareData);
                
                if (result.blocked) {
                    // Registrar tiempo de respuesta
                    const responseTime = Date.now() - startTime;
                    
                    // Agregar headers informativos
                    res.setHeader('X-Request-Blocked', 'true');
                    res.setHeader('X-Block-Type', result.blockType);
                    res.setHeader('X-Response-Time', `${responseTime}ms`);
                    
                    return this.sendBlockedResponse(res, result);
                }
                
                // Adjuntar información a la petición para uso posterior
                req.clientInfo = {
                    ip,
                    userAgent,
                    hardwareFingerprint: hardwareData 
                        ? this.blocker.hardwareFP.generate(hardwareData) 
                        : null,
                    whitelisted: result.whitelisted || false,
                    checkTime: Date.now() - startTime
                };
                
                // Continuar al siguiente middleware
                next();
                
            } catch (error) {
                console.error('❌ Error en RequestBlockerMiddleware:', error);
                
                // En caso de error, permitir la petición pero loguear
                req.clientInfo = {
                    ip: this.getClientIP(req),
                    error: true,
                    errorMessage: error.message
                };
                
                // No bloquear en caso de error del sistema
                next();
            }
        };
    }
    
    /**
     * Obtiene la IP real del cliente (considerando proxies y load balancers)
     * @param {Object} req - Request de Express
     * @returns {string} IP del cliente
     */
    getClientIP(req) {
        // Orden de prioridad para obtener la IP real
        const ipSources = [
            // CloudFlare
            req.headers['cf-connecting-ip'],
            
            // Proxies estándar
            req.headers['x-forwarded-for']?.split(',')[0].trim(),
            req.headers['x-real-ip'],
            
            // AWS ELB
            req.headers['x-cluster-client-ip'],
            
            // Otros
            req.headers['x-client-ip'],
            req.headers['forwarded']?.match(/for=([^;]+)/)?.[1],
            
            // Fallbacks
            req.connection?.remoteAddress,
            req.socket?.remoteAddress,
            req.connection?.socket?.remoteAddress,
            req.ip
        ];
        
        // Retornar la primera IP válida encontrada
        for (const ip of ipSources) {
            if (ip && this.isValidIP(ip)) {
                // Limpiar IPv6 wrapping
                return ip.replace(/^::ffff:/, '');
            }
        }
        
        return '0.0.0.0'; // Fallback
    }
    
    /**
     * Valida si una string es una IP válida
     * @param {string} ip - IP a validar
     * @returns {boolean}
     */
    isValidIP(ip) {
        // IPv4
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        
        // IPv6
        const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
        
        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    }
    
    /**
     * Extrae datos de hardware del cliente (si están presentes)
     * El cliente debe enviar esto en un header personalizado
     * @param {Object} req - Request de Express
     * @returns {Object|null} Datos del hardware o null
     */
    extractHardwareData(req) {
        // Header personalizado: X-Hardware-Fingerprint
        // Formato: Base64 JSON
        const hwHeader = req.headers['x-hardware-fingerprint'];
        
        if (!hwHeader) {
            return null;
        }
        
        try {
            // Decodificar desde Base64
            const decoded = Buffer.from(hwHeader, 'base64').toString('utf8');
            const hardwareData = JSON.parse(decoded);
            
            // Validar estructura mínima
            if (!hardwareData || typeof hardwareData !== 'object') {
                console.warn('Invalid hardware fingerprint format');
                return null;
            }
            
            return hardwareData;
            
        } catch (error) {
            console.warn('Failed to parse hardware fingerprint header:', error.message);
            return null;
        }
    }
    
    /**
     * Envía respuesta de bloqueo al cliente
     * @param {Object} res - Response de Express
     * @param {Object} result - Resultado del bloqueo
     */
    sendBlockedResponse(res, result) {
        const response = {
            error: 'ACCESS_BLOCKED',
            message: 'Tu acceso ha sido bloqueado por múltiples peticiones',
            blocked: true,
            blockType: result.blockType,
            reason: result.reason,
            blockedAt: result.blockedAt,
            timestamp: new Date().toISOString()
        };
        
        // Agregar información de tiempo restante si es bloqueo temporal
        if (result.blockType === 'temporary' && result.remainingTime !== null) {
            const hours = Math.floor(result.remainingTime / 3600);
            const minutes = Math.floor((result.remainingTime % 3600) / 60);
            const seconds = Math.floor(result.remainingTime % 60);
            
            response.remainingTime = {
                seconds: Math.floor(result.remainingTime),
                formatted: hours > 0 
                    ? `${hours}h ${minutes}m`
                    : minutes > 0
                        ? `${minutes}m ${seconds}s`
                        : `${seconds}s`,
                unblockAt: new Date(Date.now() + result.remainingTime * 1000).toISOString()
            };
            
            response.message += `. Se reestablecerá automáticamente en ${response.remainingTime.formatted}`;
            
            // Header Retry-After (estándar HTTP)
            res.setHeader('Retry-After', Math.floor(result.remainingTime));
            
        } else if (result.blockType === 'permanent') {
            response.message += '. Bloqueo permanente. Contacta al administrador para más información.';
            response.contact = process.env.ADMIN_EMAIL || 'support@example.com';
        }
        
        // Headers adicionales
        res.setHeader('X-Block-ID', result.blockId || 'unknown');
        res.setHeader('X-Block-Source', result.source || 'request_blocker');
        
        // Enviar respuesta 403 Forbidden
        res.status(403).json(response);
    }
    
    /**
     * Middleware específico para endpoints de alta seguridad
     * Más restrictivo que el middleware estándar
     * @returns {Function} Express middleware
     */
    strictMiddleware() {
        return async (req, res, next) => {
            const startTime = Date.now();
            
            try {
                const ip = this.getClientIP(req);
                const userAgent = req.headers['user-agent'] || 'Unknown';
                const hardwareData = this.extractHardwareData(req);
                
                // Verificar bloqueo estándar
                const result = await this.blocker.checkRequest(ip, userAgent, hardwareData);
                
                if (result.blocked) {
                    return this.sendBlockedResponse(res, result);
                }
                
                // VERIFICACIÓN ADICIONAL: Requiere hardware fingerprint
                if (!hardwareData) {
                    return res.status(403).json({
                        error: 'HARDWARE_FINGERPRINT_REQUIRED',
                        message: 'Este endpoint requiere verificación de hardware',
                        requiredHeader: 'X-Hardware-Fingerprint'
                    });
                }
                
                // VERIFICACIÓN ADICIONAL: Detectar VPN/Proxy (más estricto)
                // Esta lógica se puede agregar según necesidades
                
                req.clientInfo = {
                    ip,
                    userAgent,
                    hardwareFingerprint: this.blocker.hardwareFP.generate(hardwareData),
                    strictMode: true,
                    checkTime: Date.now() - startTime
                };
                
                next();
                
            } catch (error) {
                console.error('❌ Error en strictMiddleware:', error);
                
                // En modo estricto, bloquear en caso de error
                res.status(500).json({
                    error: 'SECURITY_CHECK_FAILED',
                    message: 'No se pudo verificar tu identidad'
                });
            }
        };
    }
    
    /**
     * Middleware para endpoints públicos (más permisivo)
     * Solo bloquea en casos extremos
     * @returns {Function} Express middleware
     */
    lenientMiddleware() {
        return async (req, res, next) => {
            try {
                const ip = this.getClientIP(req);
                const hardwareData = this.extractHardwareData(req);
                
                // Solo verificar si está bloqueado permanentemente
                const blockStatus = await this.blocker.getBlockStatus(ip, hardwareData);
                
                if (blockStatus.blocked && blockStatus.blockType === 'permanent') {
                    return this.sendBlockedResponse(res, blockStatus);
                }
                
                // Permitir todo lo demás (incluso bloqueos temporales)
                req.clientInfo = {
                    ip,
                    lenientMode: true
                };
                
                next();
                
            } catch (error) {
                console.error('❌ Error en lenientMiddleware:', error);
                next(); // Permitir en caso de error
            }
        };
    }
    
    /**
     * Middleware para monitoreo (no bloquea, solo registra)
     * @returns {Function} Express middleware
     */
    monitoringMiddleware() {
        return async (req, res, next) => {
            try {
                const ip = this.getClientIP(req);
                const userAgent = req.headers['user-agent'] || 'Unknown';
                const hardwareData = this.extractHardwareData(req);
                
                // Registrar pero no bloquear
                await this.blocker.logRequest(ip, userAgent, hardwareData);
                
                req.clientInfo = {
                    ip,
                    userAgent,
                    monitoringOnly: true
                };
                
                next();
                
            } catch (error) {
                console.error('❌ Error en monitoringMiddleware:', error);
                next();
            }
        };
    }
}

module.exports = RequestBlockerMiddleware;
