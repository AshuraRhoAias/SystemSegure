/**
 * 🔧 HARDWARE FINGERPRINT SERVICE
 * 
 * Genera fingerprints únicos de hardware para identificación de dispositivos
 * Integrado con Ultra Secure System V3.0
 * 
 * @author Ultra Secure System Team
 * @version 1.0.0
 */

const crypto = require('crypto');
const os = require('os');

class HardwareFingerprintService {
    /**
     * Genera fingerprint único del hardware
     * @param {Object} hardwareData - Datos del hardware del cliente
     * @returns {string} Hash SHA-256 único del hardware
     */
    generate(hardwareData) {
        if (!hardwareData) return null;
        
        // Extraer componentes
        const components = [
            hardwareData.cpuId || '',
            hardwareData.motherboardUuid || '',
            hardwareData.macAddress || '',
            hardwareData.diskSerial || '',
            hardwareData.ramSerial || ''
        ].filter(Boolean); // Eliminar valores vacíos
        
        if (components.length === 0) {
            console.warn('No hardware components provided for fingerprinting');
            return null;
        }
        
        // Crear hash combinado
        const combined = components.join('|');
        const fingerprint = crypto.createHash('sha256').update(combined).digest('hex');
        
        return fingerprint;
    }
    
    /**
     * Genera fingerprint desde múltiples fuentes
     * @param {Object} data - Datos completos del cliente
     * @returns {string} Fingerprint
     */
    generateFromMultipleSources(data) {
        const sources = [
            data.cpu?.id,
            data.motherboard?.uuid,
            data.network?.mac,
            data.disk?.serial,
            data.memory?.serial,
            data.system?.uuid
        ].filter(Boolean);
        
        if (sources.length === 0) return null;
        
        return crypto
            .createHash('sha256')
            .update(sources.join('::'))
            .digest('hex');
    }
    
    /**
     * Recolecta información del hardware en el servidor (limitado)
     * NOTA: En producción, esto debe venir del cliente
     */
    collectServerInfo() {
        const networkInterfaces = os.networkInterfaces();
        const primaryInterface = Object.values(networkInterfaces)
            .flat()
            .find(i => !i.internal && i.mac !== '00:00:00:00:00:00');
        
        return {
            cpuModel: os.cpus()[0]?.model || null,
            cpuCount: os.cpus().length,
            platform: os.platform(),
            arch: os.arch(),
            hostname: os.hostname(),
            macAddress: primaryInterface?.mac || null,
            totalMemory: os.totalmem(),
            // NOTA: Esta información es limitada en el servidor
            // Para fingerprinting real, necesitas un agente en el cliente
            warning: 'Limited server-side fingerprinting. Use client agent for full fingerprint.'
        };
    }
    
    /**
     * Valida que el fingerprint sea válido
     * @param {string} fingerprint - Fingerprint a validar
     * @returns {boolean}
     */
    isValid(fingerprint) {
        if (!fingerprint) return false;
        
        // Debe ser un hash SHA-256 (64 caracteres hexadecimales)
        return /^[a-f0-9]{64}$/i.test(fingerprint);
    }
    
    /**
     * Compara dos fingerprints de forma segura (constant-time)
     * @param {string} fp1 - Primer fingerprint
     * @param {string} fp2 - Segundo fingerprint
     * @returns {boolean}
     */
    compare(fp1, fp2) {
        if (!fp1 || !fp2) return false;
        if (fp1.length !== fp2.length) return false;
        
        try {
            // Constant-time comparison (protege contra timing attacks)
            return crypto.timingSafeEqual(
                Buffer.from(fp1, 'hex'),
                Buffer.from(fp2, 'hex')
            );
        } catch (error) {
            console.error('Error comparing fingerprints:', error);
            return false;
        }
    }
    
    /**
     * Calcula similaridad entre dos fingerprints
     * @param {string} fp1 - Primer fingerprint
     * @param {string} fp2 - Segundo fingerprint
     * @returns {number} Similaridad (0-100)
     */
    calculateSimilarity(fp1, fp2) {
        if (!fp1 || !fp2) return 0;
        if (fp1 === fp2) return 100;
        
        // Calcular distancia de Hamming
        let differences = 0;
        const maxLength = Math.max(fp1.length, fp2.length);
        
        for (let i = 0; i < maxLength; i++) {
            if (fp1[i] !== fp2[i]) {
                differences++;
            }
        }
        
        const similarity = ((maxLength - differences) / maxLength) * 100;
        return Math.round(similarity);
    }
    
    /**
     * Extrae componentes individuales de hardware
     * @param {Object} hardwareData - Datos crudos del hardware
     * @returns {Object} Componentes separados
     */
    extractComponents(hardwareData) {
        return {
            cpu: {
                id: hardwareData.cpuId || null,
                model: hardwareData.cpuModel || null,
                cores: hardwareData.cpuCores || null
            },
            motherboard: {
                uuid: hardwareData.motherboardUuid || null,
                manufacturer: hardwareData.motherboardManufacturer || null,
                model: hardwareData.motherboardModel || null
            },
            network: {
                mac: hardwareData.macAddress || null,
                interfaces: hardwareData.networkInterfaces || []
            },
            disk: {
                serial: hardwareData.diskSerial || null,
                model: hardwareData.diskModel || null,
                size: hardwareData.diskSize || null
            },
            memory: {
                serial: hardwareData.ramSerial || null,
                size: hardwareData.ramSize || null
            }
        };
    }
    
    /**
     * Genera hash de componente individual
     * @param {string} component - Componente a hashear
     * @returns {string} Hash del componente
     */
    hashComponent(component) {
        if (!component) return null;
        
        return crypto
            .createHash('sha256')
            .update(String(component))
            .digest('hex');
    }
    
    /**
     * Detecta si el hardware es una VM o emulador
     * @param {Object} hardwareData - Datos del hardware
     * @returns {Object} Resultado de detección
     */
    detectVirtualization(hardwareData) {
        const indicators = {
            isVirtual: false,
            confidence: 0,
            reasons: []
        };
        
        // Detectar strings comunes de VMs
        const vmStrings = [
            'virtualbox',
            'vmware',
            'qemu',
            'kvm',
            'xen',
            'hyperv',
            'parallels',
            'bochs'
        ];
        
        const dataString = JSON.stringify(hardwareData).toLowerCase();
        
        vmStrings.forEach(vmString => {
            if (dataString.includes(vmString)) {
                indicators.isVirtual = true;
                indicators.confidence += 20;
                indicators.reasons.push(`Detected ${vmString} signature`);
            }
        });
        
        // Verificar CPU model
        if (hardwareData.cpuModel?.toLowerCase().includes('virtual')) {
            indicators.isVirtual = true;
            indicators.confidence += 15;
            indicators.reasons.push('Virtual CPU detected');
        }
        
        // Verificar MAC address patterns (algunos VMs usan rangos específicos)
        const mac = hardwareData.macAddress?.toLowerCase();
        if (mac) {
            const vmMacPrefixes = ['08:00:27', '00:0c:29', '00:50:56', '00:1c:42'];
            if (vmMacPrefixes.some(prefix => mac.startsWith(prefix))) {
                indicators.isVirtual = true;
                indicators.confidence += 25;
                indicators.reasons.push('VM MAC address pattern detected');
            }
        }
        
        indicators.confidence = Math.min(100, indicators.confidence);
        
        return indicators;
    }
    
    /**
     * Genera reporte completo del hardware
     * @param {Object} hardwareData - Datos del hardware
     * @returns {Object} Reporte completo
     */
    generateReport(hardwareData) {
        const fingerprint = this.generate(hardwareData);
        const components = this.extractComponents(hardwareData);
        const virtualization = this.detectVirtualization(hardwareData);
        
        return {
            fingerprint,
            isValid: this.isValid(fingerprint),
            components,
            virtualization,
            generatedAt: new Date().toISOString(),
            metadata: {
                componentCount: Object.values(components)
                    .filter(c => c && Object.values(c).some(v => v !== null))
                    .length,
                hasAllComponents: this.hasAllRequiredComponents(hardwareData)
            }
        };
    }
    
    /**
     * Verifica si tiene todos los componentes requeridos
     * @param {Object} hardwareData - Datos del hardware
     * @returns {boolean}
     */
    hasAllRequiredComponents(hardwareData) {
        const required = ['cpuId', 'motherboardUuid', 'macAddress'];
        return required.every(field => hardwareData[field]);
    }
}

module.exports = HardwareFingerprintService;
