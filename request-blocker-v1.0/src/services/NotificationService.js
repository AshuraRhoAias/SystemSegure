/**
 * 📧 NOTIFICATION SERVICE
 * 
 * Servicio de notificaciones para alertas de bloqueos
 * Soporta: Email, Slack, PagerDuty, Webhooks
 * 
 * @author Ultra Secure System Team
 * @version 1.0.0
 */

const nodemailer = require('nodemailer');

class NotificationService {
    constructor() {
        this.emailTransporter = null;
        this.initEmailTransporter();
    }
    
    /**
     * Inicializa transporte de email
     */
    initEmailTransporter() {
        if (!process.env.SMTP_HOST) {
            console.warn('⚠️ SMTP not configured, email notifications disabled');
            return;
        }
        
        this.emailTransporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
        
        console.log('✅ Email transporter initialized');
    }
    
    /**
     * Envía alerta de bloqueo
     */
    async sendBlockAlert(data) {
        const {
            ip,
            hardwareFP,
            blockType,
            reason,
            unblockAt,
            isThirdOffense,
            riskScore
        } = data;
        
        const severity = blockType === 'permanent' ? 'CRITICAL' : 'WARNING';
        const emoji = blockType === 'permanent' ? '🚨' : '⚠️';
        
        // Preparar mensaje
        const subject = `${emoji} [${severity}] ${blockType.toUpperCase()} Block Detected`;
        const message = this.buildBlockAlertMessage(data);
        
        // Enviar por todos los canales configurados
        const promises = [];
        
        if (this.emailTransporter && process.env.ADMIN_EMAIL) {
            promises.push(this.sendEmail(process.env.ADMIN_EMAIL, subject, message));
        }
        
        if (process.env.SLACK_WEBHOOK_URL) {
            promises.push(this.sendSlackNotification(subject, message, severity));
        }
        
        if (process.env.WEBHOOK_URL) {
            promises.push(this.sendWebhook(data));
        }
        
        if (blockType === 'permanent' && process.env.PAGERDUTY_KEY) {
            promises.push(this.sendPagerDutyAlert(data));
        }
        
        await Promise.allSettled(promises);
    }
    
    /**
     * Construye mensaje de alerta
     */
    buildBlockAlertMessage(data) {
        const {
            ip,
            hardwareFP,
            blockType,
            reason,
            unblockAt,
            isThirdOffense,
            riskScore
        } = data;
        
        let message = `
========================================
🛡️ REQUEST BLOCKER ALERT
========================================

Tipo de Bloqueo: ${blockType.toUpperCase()}
IP: ${ip}
Hardware Fingerprint: ${hardwareFP || 'N/A'}
Razón: ${reason}
Risk Score: ${riskScore || 0}/100
Fecha: ${new Date().toISOString()}

`;
        
        if (blockType === 'temporary') {
            message += `Desbloqueo automático: ${unblockAt.toISOString()}\n`;
            message += `Duración: ${Math.round((new Date(unblockAt) - new Date()) / 1000 / 60)} minutos\n`;
        } else {
            message += `⚠️ BLOQUEO PERMANENTE - Requiere intervención manual\n`;
            if (isThirdOffense) {
                message += `📊 Tercer bloqueo en 7 días\n`;
            }
        }
        
        message += `\n========================================\n`;
        message += `Acciones recomendadas:\n`;
        message += `1. Revisar logs de auditoría\n`;
        message += `2. Verificar si es ataque legítimo\n`;
        message += `3. Considerar agregar a whitelist si es falso positivo\n`;
        
        if (blockType === 'permanent') {
            message += `4. Para desbloquear: POST /api/admin/unblock\n`;
        }
        
        message += `\nDashboard: ${process.env.ADMIN_DASHBOARD_URL || 'https://admin.example.com'}/blocker\n`;
        
        return message;
    }
    
    /**
     * Envía email
     */
    async sendEmail(to, subject, text) {
        if (!this.emailTransporter) {
            console.warn('Email transporter not configured');
            return;
        }
        
        try {
            await this.emailTransporter.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to,
                subject,
                text,
                html: `<pre>${text}</pre>`
            });
            
            console.log(`✅ Email sent to ${to}`);
        } catch (error) {
            console.error('❌ Failed to send email:', error.message);
        }
    }
    
    /**
     * Envía notificación a Slack
     */
    async sendSlackNotification(title, message, severity) {
        if (!process.env.SLACK_WEBHOOK_URL) return;
        
        const color = severity === 'CRITICAL' ? 'danger' : 'warning';
        
        const payload = {
            attachments: [{
                color,
                title,
                text: message,
                footer: 'Request Blocker',
                ts: Math.floor(Date.now() / 1000)
            }]
        };
        
        try {
            const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                console.log('✅ Slack notification sent');
            } else {
                console.error('❌ Slack notification failed:', response.statusText);
            }
        } catch (error) {
            console.error('❌ Failed to send Slack notification:', error.message);
        }
    }
    
    /**
     * Envía webhook genérico
     */
    async sendWebhook(data) {
        if (!process.env.WEBHOOK_URL) return;
        
        try {
            const response = await fetch(process.env.WEBHOOK_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Webhook-Secret': process.env.WEBHOOK_SECRET || ''
                },
                body: JSON.stringify({
                    event: 'request_blocker.entity_blocked',
                    data,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                console.log('✅ Webhook sent');
            }
        } catch (error) {
            console.error('❌ Failed to send webhook:', error.message);
        }
    }
    
    /**
     * Envía alerta a PagerDuty
     */
    async sendPagerDutyAlert(data) {
        if (!process.env.PAGERDUTY_KEY) return;
        
        const payload = {
            routing_key: process.env.PAGERDUTY_KEY,
            event_action: 'trigger',
            payload: {
                summary: `Permanent block detected: ${data.ip}`,
                severity: 'critical',
                source: 'request-blocker',
                custom_details: data
            }
        };
        
        try {
            const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                console.log('✅ PagerDuty alert sent');
            }
        } catch (error) {
            console.error('❌ Failed to send PagerDuty alert:', error.message);
        }
    }
}

module.exports = NotificationService;
