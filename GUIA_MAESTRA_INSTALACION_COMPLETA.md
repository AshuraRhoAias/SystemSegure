# 📚 GUÍA MAESTRA DE INSTALACIÓN COMPLETA
## Ultra Secure System V3.0 + V4.0 Smart IA - Paso a Paso Detallado

---

## 🎯 TABLA DE CONTENIDOS

1. [Introducción y Visión General](#1-introducción-y-visión-general)
2. [Requisitos Previos](#2-requisitos-previos)
3. [Preparación del Sistema](#3-preparación-del-sistema)
4. [Proceso de Instalación](#4-proceso-de-instalación)
5. [Configuración Post-Instalación](#5-configuración-post-instalación)
6. [Verificación y Pruebas](#6-verificación-y-pruebas)
7. [Gestión de Licencias](#7-gestión-de-licencias)
8. [Módulos y Características](#8-módulos-y-características)
9. [Operación Diaria](#9-operación-diaria)
10. [Mantenimiento y Actualizaciones](#10-mantenimiento-y-actualizaciones)
11. [Solución de Problemas](#11-solución-de-problemas)
12. [Mejores Prácticas](#12-mejores-prácticas)

---

## 1. INTRODUCCIÓN Y VISIÓN GENERAL

### 1.1 ¿Qué es Ultra Secure System?

Ultra Secure System es una plataforma de seguridad empresarial de nivel militar que combina:

- **Cifrado Multicapa**: Desde 3 hasta 10 capas de cifrado según la licencia
- **Smart IA**: Sistema de bloqueos inteligentes con aprendizaje automático
- **Request Blocker**: Módulo avanzado de prevención de ataques
- **Gestión de Claves**: Vault seguro con rotación automática
- **Zero-Downtime**: Operaciones sin interrupciones
- **Escalabilidad**: Desde 1 nodo hasta infinitos nodos (licencia Diamante)

### 1.2 Versiones Disponibles

#### **V3.0 - Sistema Base**
- Cifrado triple capa (AES-256-GCM + ChaCha20-Poly1305 + Argon2id)
- Protección de memoria RAM
- Constant-time operations
- Rotación zero-downtime
- Rate limiting distribuido
- Auditoría completa
- Vault MySQL separado

#### **V3.0 + Request Blocker**
- Todo lo de V3.0 +
- Bloqueos temporales (2 horas)
- Bloqueos permanentes (3 strikes)
- Detección por IP + Hardware fingerprint
- Auto-desbloqueo inteligente
- Notificaciones (Email/Slack/PagerDuty)
- Auditoría blockchain-style

#### **V4.0 Smart IA (RECOMENDADO)**
- Todo lo anterior +
- Smart IA con bloqueos variables
- Sistema de licenciamiento Global Infiniti (4 tiers)
- Backups cifrados 10 capas
- Base de datos oculta
- Frontend React + Next.js + CSS puro
- Optimización hardware (AMD Ryzen, GPU)
- Conectividad dual (Ethernet + WiFi)
- Capacidad miles de datos simultáneos
- Sistema recuperación automático
- CORS administrativo granular
- Escalabilidad multi-sistema

### 1.3 Arquitectura General del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE APLICACIÓN                       │
│  Frontend React + Next.js | API REST | Dashboard Admin      │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   CAPA DE SMART IA                           │
│  Machine Learning | Bloqueos Variables | Predicción         │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                 CAPA DE REQUEST BLOCKER                      │
│  Detección IP | Fingerprint | Temporal | Permanente         │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   CAPA DE SEGURIDAD                          │
│  Cifrado 3-10 Capas | Rate Limiting | JWT + TOTP            │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    CAPA DE DATOS                             │
│  Vault DB | Main DB | Hidden Backup DB | Redis Cache        │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 Flujo de Operación Completo

**Paso 1: Solicitud del Cliente**
- Cliente envía request HTTP/HTTPS
- Sistema registra IP, timestamp, headers, fingerprint

**Paso 2: Validación CORS**
- Verifica si el dominio origen está permitido
- Solo dominios administrativos autorizados pueden acceder
- Bases de datos no tienen CORS (acceso interno únicamente)

**Paso 3: Rate Limiting**
- Redis verifica cuántas solicitudes ha hecho la IP
- Compara contra límites según licencia:
  - Basic: 1,000/hora
  - Pro: 5,000/hora
  - Max: 20,000/hora
  - Diamante: Ilimitado
- Si excede, retorna 429 Too Many Requests

**Paso 4: Request Blocker**
- Analiza patrón de comportamiento
- Verifica si IP está bloqueada (temporal o permanente)
- Calcula hardware fingerprint
- Detecta anomalías (múltiples IPs mismo fingerprint, etc.)

**Paso 5: Smart IA (V4.0)**
- Evalúa factores de riesgo:
  - Hora del día (noche = más sospechoso)
  - Día de la semana (fin de semana = +30% riesgo)
  - Historial del usuario
  - Geolocalización
  - Patrón de acceso
- Decide tipo de bloqueo:
  - Manual (administrador)
  - Temporal variable (IA calcula duración: 30min - 8h)
  - Preventivo (predicción de ataque)
- Aprende de cada evento para mejorar futuras predicciones

**Paso 6: Autenticación**
- Valida JWT token en header Authorization
- Verifica que no esté expirado
- Valida firma con JWT_SECRET
- Si requiere 2FA, valida TOTP token

**Paso 7: Autorización por Licencia**
- Verifica características permitidas según licencia
- Ejemplos:
  - Smart IA: Solo Pro, Max, Diamante
  - GPU Acceleration: Solo Max, Diamante
  - 10 Capas Cifrado: Solo Max, Diamante
  - Nodos múltiples: Según tier
- Si intenta usar característica no permitida → SUSPENDE automáticamente

**Paso 8: Obtención de Clave Maestra**
- Conecta al Vault DB (separado del Main DB)
- Autentica con credenciales específicas del Vault
- Obtiene clave maestra activa
- Verifica que la clave no esté marcada para rotación
- Desconecta del Vault inmediatamente

**Paso 9: Cifrado/Descifrado**
- **Si es escritura**:
  - Toma datos en texto plano
  - Aplica cifrado en capas:
    1. Argon2id para derivación de clave
    2. AES-256-GCM (capa 1)
    3. ChaCha20-Poly1305 (capa 2)
    4. Capas adicionales según licencia (hasta 10)
  - Genera metadata (timestamp, user_id, versión)
  - Calcula HMAC para integridad
  - Almacena en Main DB o Hidden Backup DB
  
- **Si es lectura**:
  - Obtiene datos cifrados de DB
  - Verifica HMAC (integridad)
  - Descifra capa por capa (orden inverso)
  - Valida que datos no estén expirados (>24h)
  - Retorna texto plano a aplicación

**Paso 10: Base de Datos**
- **Vault DB**: Solo claves de cifrado
- **Main DB**: Datos de aplicación cifrados
- **Hidden Backup DB**: Backups con 10 capas, invisible para usuarios normales
- **Redis**: Cache en memoria con mlock para proteger contra swap

**Paso 11: Auditoría**
- Registra evento en logs:
  - Tabla afectada
  - Acción (SELECT, INSERT, UPDATE, DELETE)
  - Usuario responsable
  - IP address
  - Timestamp exacto
  - Datos anteriores y nuevos (si aplica)
- Calcula hash blockchain-style para inmutabilidad
- Almacena en tabla audit_logs

**Paso 12: Respuesta al Cliente**
- Formatea respuesta según solicitado (JSON, XML, etc.)
- Agrega headers de seguridad:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Content-Security-Policy
  - Strict-Transport-Security
- Retorna datos al cliente

### 1.5 Componentes Clave del Sistema

#### **1.5.1 Frontend (V4.0)**
- **Tecnología**: React 18 + Next.js 14
- **Styling**: CSS Modules puro (sin librerías externas)
- **Características**:
  - Dashboard administrativo completo
  - Visualización de bloqueos en tiempo real
  - Gestión de usuarios y roles
  - Logs de auditoría interactivos
  - Gestión de backups con descarga
  - Configuración de licencias
  - Análisis de Smart IA con gráficos
  - Panel de métricas (CPU, RAM, disco, red)

#### **1.5.2 Backend API**
- **Tecnología**: Node.js + Express
- **Puerto**: 3000 (configurable)
- **Endpoints Principales**:
  - `/api/auth/login` - Autenticación JWT
  - `/api/auth/register` - Registro de usuarios
  - `/api/users` - Gestión de usuarios (CRUD)
  - `/api/vault/keys` - Gestión de claves (admin only)
  - `/api/vault/rotate` - Rotación manual de claves
  - `/api/blocks` - Gestión de bloqueos
  - `/api/audit/logs` - Consulta de auditoría
  - `/api/backups` - Gestión de backups
  - `/api/health` - Health check del sistema
  - `/metrics` - Métricas Prometheus

#### **1.5.3 Base de Datos Vault**
- **Propósito**: Almacenar ÚNICAMENTE claves de cifrado
- **Motor**: MySQL 8.0+
- **Nombre**: `encryption_vault`
- **Usuario**: `vault_master` (permisos restrictivos)
- **Tablas**:
  - `master_keys` - Claves maestras con versionado
  - `rotation_history` - Historial de rotaciones
  - `key_metadata` - Metadata de claves
- **Seguridad**:
  - Puerto no expuesto públicamente (solo localhost o VPN)
  - Credenciales separadas del Main DB
  - Conexiones con SSL/TLS obligatorio
  - Logs de acceso detallados

#### **1.5.4 Base de Datos Principal**
- **Propósito**: Datos de la aplicación
- **Motor**: MySQL 8.0+
- **Nombre**: `main_app`
- **Usuario**: `app_user` (permisos limitados)
- **Tablas típicas**:
  - `usuarios` - Datos de usuarios (cifrados)
  - `sesiones` - Sesiones JWT
  - `configuracion` - Settings de aplicación
  - `audit_logs` - Logs de auditoría
  - `blocked_ips` - IPs bloqueadas por Request Blocker
  - `ml_training_data` - Datos para entrenar Smart IA

#### **1.5.5 Base de Datos Oculta de Backups (V4.0)**
- **Propósito**: Backups cifrados con 10 capas
- **Motor**: MySQL 8.0+
- **Nombre**: Variable según instalación (aleatorio)
- **Usuario**: Variable según instalación (aleatorio)
- **Características**:
  - Completamente invisible para usuarios normales
  - Solo roles `admin` y `backup_manager` pueden verla
  - Credenciales TOTALMENTE diferentes a Vault y Main
  - Ubicación de servidor puede ser diferente (remoto)
  - Cifrado con 10 algoritmos secuenciales
  - Cada backup tiene su propia clave de descifrado

#### **1.5.6 Redis Cache**
- **Propósito**: Cache en memoria + Rate Limiting
- **Versión**: Redis 7.0+
- **Puerto**: 6379 (configurable)
- **Uso**:
  - Cache de resultados de consultas frecuentes
  - Almacenamiento de contadores para rate limiting
  - Sesiones distribuidas (si multi-nodo)
  - Cola de trabajos para rotación de claves
  - Lock distribuido para operaciones concurrentes
- **Configuración Especial**:
  - `maxmemory-policy`: allkeys-lru
  - `save ""` - Desactivar persistencia a disco
  - `protected-mode yes`
  - Bind solo a localhost (o red interna)

#### **1.5.7 Smart IA Module (V4.0)**
- **Tecnología**: TensorFlow.js (Node.js)
- **Modelos**:
  - Modelo de clasificación binaria (ataque sí/no)
  - Modelo de regresión para calcular duración de bloqueo
  - Modelo de clustering para detectar patrones anómalos
- **Características**:
  - Entrenamiento continuo en background
  - Actualización de pesos cada 1000 eventos
  - Predicción en tiempo real (<5ms)
  - Factores de entrada:
    - Hora del día (0-23)
    - Día de la semana (0-6)
    - Cantidad de requests en última hora
    - Cantidad de requests en último día
    - Cantidad de requests en última semana
    - Países de origen (one-hot encoding)
    - User-Agent
    - Tasa de error (4xx, 5xx)
    - Endpoints accedidos
    - Hardware fingerprint cambios
- **Salida**:
  - Risk score (0-100)
  - Acción recomendada (permitir, bloqueo temporal, bloqueo permanente)
  - Duración de bloqueo (si aplica)
  - Confianza de la predicción (0-1)

#### **1.5.8 Request Blocker Module**
- **Funcionalidad**: Prevención avanzada de ataques
- **Tipos de Detección**:
  - Por IP address
  - Por hardware fingerprint (canvas, WebGL, fonts, etc.)
  - Por combinación IP + Fingerprint
  - Por patrón de comportamiento
- **Tipos de Bloqueo**:
  - **Temporal (2 horas default)**: Después de 5 intentos fallidos en 5 minutos
  - **Permanente**: Después de 3 bloqueos temporales en 7 días
  - **Manual**: Administrador bloquea directamente
  - **Preventivo IA (V4.0)**: Sistema predice ataque inminente
- **Auto-desbloqueo**:
  - Bloqueos temporales se liberan automáticamente
  - Administrador puede desbloquear manualmente
  - Bloqueos permanentes requieren aprobación de 2 administradores
- **Notificaciones**:
  - Email a administradores
  - Webhook a Slack/Discord
  - Alert a PagerDuty (para Max/Diamante)

### 1.6 Comparación Detallada de Versiones

| Característica | V3.0 Base | V3.0 + Request Blocker | V4.0 Smart IA |
|----------------|-----------|------------------------|---------------|
| **Cifrado** | 3 capas | 3 capas | 3-10 capas (según licencia) |
| **Request Blocker** | ❌ | ✅ Fijo | ✅ Variable con IA |
| **Smart IA** | ❌ | ❌ | ✅ |
| **Licenciamiento** | Manual | Manual | Automático 4 tiers |
| **Frontend** | ❌ | ❌ | ✅ React + Next.js |
| **Backups** | Estándar | Estándar | 10 capas + BD oculta |
| **Hardware Optimization** | Genérico | Genérico | AMD Ryzen + GPU |
| **Multi-nodo** | ❌ | ❌ | ✅ (según licencia) |
| **Recovery** | Manual | Manual | Automático |
| **CORS** | Básico | Básico | Granular admin |
| **Precio Estimado** | $5,000 | $12,000 | $9,999-$99,999/año |

---

## 2. REQUISITOS PREVIOS

### 2.1 Requisitos de Hardware

#### **Para V3.0 y V3.0 + Request Blocker:**

**Mínimos:**
- **CPU**: 2 cores (Intel/AMD)
- **RAM**: 4 GB
- **Almacenamiento**: 20 GB disponibles (SSD recomendado)
- **Red**: 100 Mbps

**Recomendados:**
- **CPU**: 4 cores @ 2.0 GHz+
- **RAM**: 8 GB
- **Almacenamiento**: 50 GB SSD
- **Red**: 1 Gbps Ethernet

#### **Para V4.0 Smart IA:**

**Licencia Basic ($9,999/año):**
- **CPU**: AMD Ryzen 5 / Intel Core i5 (4 cores mínimo)
- **RAM**: 8 GB DDR4
- **Almacenamiento**: 100 GB NVMe SSD
- **GPU**: Opcional
- **Red**: 1 Gbps Ethernet + WiFi (dual opcional)

**Licencia Pro ($24,999/año):**
- **CPU**: AMD Ryzen 7 / Intel Core i7 (8 cores mínimo)
- **RAM**: 16 GB DDR4
- **Almacenamiento**: 500 GB NVMe SSD (obligatorio)
- **GPU**: Recomendado (NVIDIA GTX 1650+ o AMD RX 5500+)
- **Red**: 1 Gbps Ethernet (obligatorio) + WiFi (recomendado)

**Licencia Max ($49,999/año):**
- **CPU**: AMD Ryzen 9 / Threadripper / Intel Core i9 (16 cores mínimo)
- **RAM**: 32 GB DDR4
- **Almacenamiento**: 2 TB NVMe SSD (obligatorio)
- **GPU**: Obligatorio (NVIDIA RTX 3060+ o AMD RX 6700+)
- **Red**: 10 Gbps Ethernet + WiFi 6

**Licencia Diamante ($99,999/año):**
- **CPU**: AMD Threadripper Pro / EPYC / Intel Xeon (32+ cores)
- **RAM**: 64 GB+ DDR4 ECC
- **Almacenamiento**: 4 TB+ NVMe RAID 10
- **GPU**: Múltiples GPUs (NVIDIA RTX 4090 / AMD Instinct)
- **Red**: 25 Gbps Ethernet + WiFi 6E + 5G backup

### 2.2 Requisitos de Software

#### **Sistema Operativo:**
- **Linux**: Ubuntu 20.04/22.04 LTS, Debian 11+, CentOS 8+, RHEL 8+, Fedora 35+
- **Windows**: Windows Server 2019/2022, Windows 10/11 Pro (con WSL2)
- **macOS**: macOS 12+ (Monterey o superior) - solo para desarrollo

**Recomendado**: Ubuntu 22.04 LTS (mejor compatibilidad)

#### **Dependencias del Sistema:**
- **Node.js**: 18.x o superior
- **npm**: 9.x o superior
- **MySQL**: 8.0+ (obligatorio)
- **Redis**: 7.0+ (obligatorio)
- **Git**: Para clonar repositorio
- **Curl/Wget**: Para descargar scripts
- **OpenSSL**: 1.1.1+ (para certificados SSL)

#### **Herramientas Adicionales (Opcionales):**
- **Docker**: Para deployment containerizado
- **Nginx**: Para reverse proxy y load balancing
- **Grafana**: Para visualización de métricas
- **Prometheus**: Para recolección de métricas
- **PM2**: Para gestión de procesos Node.js

### 2.3 Requisitos de Red

#### **Puertos que se Utilizarán:**
- **3000**: Aplicación principal (API Backend)
- **3306**: MySQL (solo localhost o red interna)
- **6379**: Redis (solo localhost o red interna)
- **80**: HTTP (redirige a 443)
- **443**: HTTPS (aplicación web)
- **9090**: Prometheus (opcional, solo red interna)
- **3001**: Grafana (opcional, solo red interna)

#### **Configuración de Firewall:**
- Permitir entrada en puertos 80, 443
- Bloquear acceso externo a 3306, 6379
- Configurar fail2ban para protección adicional
- Habilitar rate limiting a nivel de firewall (opcional)

#### **Conectividad (V4.0):**
- Ethernet: Preferido para servidor principal
- WiFi: Como backup o para conexiones adicionales
- El sistema detecta y configura automáticamente ambas interfaces
- Failover automático si Ethernet falla

### 2.4 Requisitos de Licencia

#### **V3.0 y V3.0 + Request Blocker:**
- Licencia perpetua o por proyecto
- Sin sistema de validación automática
- Costo único de compra

#### **V4.0 Smart IA:**
- Licencia anual obligatoria
- Sistema de validación automática
- 4 tiers disponibles:
  - **Basic**: $9,999/año
  - **Pro**: $24,999/año
  - **Max**: $49,999/año
  - **Diamante**: $99,999/año
- Formato de licencia: `USS4-XXXX-XXXX-XXXX-XXXX`
- Archivo `license.key` requerido en instalación

### 2.5 Conocimientos Requeridos

#### **Para Instalador (DevOps/SysAdmin):**
- Conocimientos básicos de Linux/Terminal
- Experiencia con MySQL (instalación y configuración)
- Familiaridad con conceptos de red
- Capacidad de leer documentación técnica

#### **Para Desarrollador:**
- JavaScript/Node.js intermedio-avanzado
- Conocimientos de API REST
- Experiencia con bases de datos SQL
- Familiaridad con React (para frontend V4.0)
- Conceptos de seguridad (cifrado, JWT, etc.)

#### **Para Administrador del Sistema:**
- No requiere conocimientos de programación
- Interfaz web intuitiva (V4.0)
- Documentación paso a paso proporcionada
- Soporte técnico disponible

### 2.6 Checklist Pre-Instalación

Antes de comenzar la instalación, verificar que tengas:

- [ ] Servidor/VPS con recursos adecuados según licencia
- [ ] Sistema operativo soportado instalado y actualizado
- [ ] Acceso root o sudo al servidor
- [ ] Dominio apuntando al servidor (para SSL)
- [ ] Licencia válida (V4.0) o confirmación de compra (V3.0)
- [ ] Backup de datos existentes (si es migración)
- [ ] Credenciales de administrador de MySQL
- [ ] Certificados SSL válidos o capacidad de generarlos (Let's Encrypt)
- [ ] Plan de rollback en caso de problemas
- [ ] Tiempo estimado: 30-60 minutos para instalación completa

---

## 3. PREPARACIÓN DEL SISTEMA

### 3.1 Actualización del Sistema Operativo

**Objetivo**: Asegurar que el sistema operativo está actualizado con los últimos parches de seguridad.

#### **En Ubuntu/Debian:**

**Paso 1**: Conectar al servidor por SSH

**Paso 2**: Actualizar repositorios

**Paso 3**: Instalar actualizaciones disponibles

**Paso 4**: Reiniciar si es necesario (especialmente si se actualizó el kernel)

**Paso 5**: Verificar versión

#### **En CentOS/RHEL/Fedora:**

**Paso 1**: Conectar al servidor por SSH

**Paso 2**: Actualizar sistema

**Paso 3**: Reiniciar si es necesario

**Paso 4**: Verificar versión

### 3.2 Configuración de Zona Horaria

**Objetivo**: Asegurar que los logs y timestamps estén en la zona horaria correcta.

**Paso 1**: Ver zona horaria actual

**Paso 2**: Cambiar a zona horaria deseada (ejemplo: Mexico City)

**Paso 3**: Verificar cambio

**Paso 4**: Sincronizar hora con servidor NTP

### 3.3 Configuración de Hostname

**Objetivo**: Establecer un nombre de host descriptivo para el servidor.

**Paso 1**: Ver hostname actual

**Paso 2**: Cambiar hostname

**Paso 3**: Actualizar archivo /etc/hosts

**Paso 4**: Verificar cambio (cerrar y abrir nueva sesión SSH)

### 3.4 Creación de Usuario del Sistema

**Objetivo**: Crear un usuario específico para ejecutar la aplicación (no usar root).

**Paso 1**: Crear usuario `ultrasecure`

**Paso 2**: Agregar usuario al grupo sudo

**Paso 3**: Cambiar a usuario ultrasecure

**Paso 4**: Configurar directorio home

### 3.5 Configuración de Firewall

**Objetivo**: Configurar firewall para permitir solo tráfico necesario.

#### **Usando UFW (Ubuntu/Debian):**

**Paso 1**: Instalar UFW si no está instalado

**Paso 2**: Permitir SSH (IMPORTANTE: hacer antes de habilitar)

**Paso 3**: Permitir HTTP y HTTPS

**Paso 4**: Habilitar firewall

**Paso 5**: Verificar estado

#### **Usando firewalld (CentOS/RHEL):**

**Paso 1**: Iniciar y habilitar firewalld

**Paso 2**: Permitir servicios

**Paso 3**: Recargar firewall

**Paso 4**: Verificar configuración

### 3.6 Configuración de Límites del Sistema

**Objetivo**: Aumentar límites del sistema para soportar alta concurrencia.

**Paso 1**: Editar archivo `/etc/security/limits.conf`

**Paso 2**: Agregar las siguientes líneas al final del archivo:

```
ultrasecure soft nofile 65536
ultrasecure hard nofile 65536
ultrasecure soft nproc 4096
ultrasecure hard nproc 4096
```

**Explicación**:
- `nofile`: Número máximo de archivos abiertos simultáneamente
- `nproc`: Número máximo de procesos
- `soft`: Límite que puede aumentar el usuario
- `hard`: Límite máximo absoluto

**Paso 3**: Editar `/etc/sysctl.conf` para parámetros del kernel

**Paso 4**: Agregar configuraciones de red optimizadas:

```
# Conexiones máximas
net.core.somaxconn = 65536
net.ipv4.tcp_max_syn_backlog = 8192

# Reutilización rápida de sockets
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15

# Aumentar buffers de red
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 87380 67108864
net.ipv4.tcp_wmem = 4096 65536 67108864

# Protección contra SYN flood
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 8192
```

**Paso 5**: Aplicar cambios

**Paso 6**: Verificar que se aplicaron

### 3.7 Instalación de Dependencias Base

**Objetivo**: Instalar herramientas necesarias antes de la instalación principal.

#### **Ubuntu/Debian:**

**Paso 1**: Instalar herramientas de compilación

**Paso 2**: Instalar dependencias de red

**Paso 3**: Instalar utilidades

#### **CentOS/RHEL:**

**Paso 1**: Instalar herramientas de desarrollo

**Paso 2**: Instalar dependencias

### 3.8 Configuración de Swap (Opcional pero Recomendado)

**Objetivo**: Crear espacio de swap para evitar problemas de memoria.

**¿Cuánto swap crear?**
- RAM ≤ 2GB: Swap = RAM × 2
- RAM 2-8GB: Swap = RAM × 1.5
- RAM > 8GB: Swap = 8-16GB

**Ejemplo para servidor con 16GB RAM (crear 16GB swap):**

**Paso 1**: Crear archivo de swap

**Paso 2**: Formatear como swap

**Paso 3**: Activar swap

**Paso 4**: Hacer permanente (agregar a /etc/fstab)

**Paso 5**: Configurar swappiness (cuándo usar swap)

**Paso 6**: Verificar swap activo

### 3.9 Instalación de Node.js

**Objetivo**: Instalar Node.js versión 18.x o superior.

#### **Método Recomendado - NodeSource:**

**Paso 1**: Agregar repositorio de NodeSource

**Paso 2**: Instalar Node.js

**Paso 3**: Verificar instalación

**Salida esperada**:
```
Node.js: v18.x.x
npm: v9.x.x
```

#### **Método Alternativo - NVM (para desarrollo):**

**Paso 1**: Instalar NVM (Node Version Manager)

**Paso 2**: Instalar Node.js

**Paso 3**: Establecer versión por defecto

### 3.10 Instalación de MySQL 8.0

**Objetivo**: Instalar MySQL 8.0 o superior como motor de base de datos.

#### **Ubuntu/Debian:**

**Paso 1**: Agregar repositorio oficial de MySQL

**Paso 2**: Actualizar repositorios

**Paso 3**: Instalar MySQL Server

**Paso 4**: Durante la instalación, configurar:
- **Root password**: Usar una contraseña fuerte (mínimo 32 caracteres)
- **Plugin de autenticación**: Usar `mysql_native_password` (mejor compatibilidad)
- **Validación de contraseña**: Nivel STRONG

**Paso 5**: Iniciar servicio MySQL

**Paso 6**: Habilitar inicio automático

**Paso 7**: Ejecutar script de seguridad

**Opciones recomendadas**:
- Remove anonymous users: YES
- Disallow root login remotely: YES
- Remove test database: YES
- Reload privilege tables: YES

**Paso 8**: Verificar instalación

**Paso 9**: Configurar MySQL para permitir conexiones locales (archivo `/etc/mysql/mysql.conf.d/mysqld.cnf`):

**Paso 10**: Reiniciar MySQL para aplicar cambios

#### **CentOS/RHEL:**

**Paso 1**: Agregar repositorio MySQL

**Paso 2**: Instalar MySQL Server

**Paso 3**: Iniciar servicio

**Paso 4**: Obtener contraseña temporal

**Paso 5**: Ejecutar script de seguridad

**Paso 6**: Configurar y reiniciar

### 3.11 Instalación de Redis

**Objetivo**: Instalar Redis 7.0+ para cache y rate limiting.

#### **Ubuntu/Debian:**

**Paso 1**: Instalar Redis

**Paso 2**: Iniciar servicio

**Paso 3**: Verificar instalación

#### **CentOS/RHEL:**

**Paso 1**: Habilitar repositorio EPEL

**Paso 2**: Instalar Redis

**Paso 3**: Iniciar servicio

#### **Configuración de Redis:**

**Paso 1**: Editar archivo `/etc/redis/redis.conf`

**Paso 2**: Configuraciones recomendadas:

```
# Escuchar solo en localhost (seguridad)
bind 127.0.0.1

# Puerto por defecto
port 6379

# Establecer contraseña
requirepass TU_CONTRASEÑA_FUERTE_AQUI

# Desactivar persistencia a disco (mejor performance)
save ""

# Máxima memoria
maxmemory 2gb

# Política de expiración
maxmemory-policy allkeys-lru

# Log
loglevel notice
logfile /var/log/redis/redis-server.log
```

**Paso 3**: Reiniciar Redis

**Paso 4**: Verificar configuración

### 3.12 Configuración de Certificados SSL

**Objetivo**: Configurar certificados SSL válidos para HTTPS.

#### **Opción 1: Let's Encrypt (Gratis y Recomendado):**

**Paso 1**: Instalar Certbot

**Paso 2**: Obtener certificado

**Paso 3**: Los certificados se generarán en:
```
/etc/letsencrypt/live/tudominio.com/fullchain.pem
/etc/letsencrypt/live/tudominio.com/privkey.pem
```

**Paso 4**: Configurar renovación automática

#### **Opción 2: Certificado Auto-firmado (Solo Desarrollo):**

**Paso 1**: Generar certificado

**Paso 2**: Los archivos se crearán en `/etc/ssl/certs/` y `/etc/ssl/private/`

**Nota**: Los certificados auto-firmados generarán advertencias en navegadores.

### 3.13 Instalación de Nginx (Opcional pero Recomendado)

**Objetivo**: Usar Nginx como reverse proxy para mejor performance y seguridad.

**Paso 1**: Instalar Nginx

**Paso 2**: Iniciar servicio

**Paso 3**: Crear configuración para Ultra Secure System

**Paso 4**: Crear archivo `/etc/nginx/sites-available/ultrasecure`

**Configuración básica de Nginx**:
```
server {
    listen 80;
    server_name tudominio.com;
    
    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tudominio.com;
    
    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;
    
    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy a aplicación
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Rate limiting a nivel de Nginx (adicional)
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
    limit_req zone=api_limit burst=200 nodelay;
}
```

**Paso 5**: Habilitar sitio

**Paso 6**: Verificar configuración

**Paso 7**: Recargar Nginx

### 3.14 Optimización de MySQL para Alta Concurrencia

**Objetivo**: Optimizar MySQL para manejar miles de conexiones simultáneas.

**Paso 1**: Editar archivo `/etc/mysql/mysql.conf.d/mysqld.cnf`

**Paso 2**: Agregar/modificar configuraciones según RAM disponible:

**Para servidores con 8-16GB RAM:**
```
[mysqld]
# Conexiones
max_connections = 500
max_connect_errors = 100000

# Buffers y cache
innodb_buffer_pool_size = 4G
innodb_log_file_size = 512M
innodb_log_buffer_size = 16M
innodb_flush_log_at_trx_commit = 2

# Query cache (desactivado en MySQL 8+)
query_cache_type = 0
query_cache_size = 0

# Tablas temporales
tmp_table_size = 64M
max_heap_table_size = 64M

# Threads
thread_cache_size = 100
table_open_cache = 4000
table_definition_cache = 2000

# Performance
innodb_flush_method = O_DIRECT
innodb_file_per_table = 1
innodb_io_capacity = 2000
innodb_read_io_threads = 4
innodb_write_io_threads = 4
```

**Para servidores con 32-64GB RAM (Max/Diamante):**
```
innodb_buffer_pool_size = 20G
max_connections = 2000
thread_cache_size = 300
```

**Paso 3**: Reiniciar MySQL

### 3.15 Instalación de Herramientas de Monitoreo (Opcional)

**Objetivo**: Instalar Prometheus y Grafana para monitoreo visual.

#### **Prometheus:**

**Paso 1**: Descargar Prometheus

**Paso 2**: Extraer y mover

**Paso 3**: Crear servicio systemd para Prometheus

**Paso 4**: Configurar archivo `prometheus.yml`

#### **Grafana:**

**Paso 1**: Agregar repositorio

**Paso 2**: Instalar Grafana

**Paso 3**: Iniciar servicio

**Paso 4**: Acceder a Grafana en `http://servidor:3001`

### 3.16 Verificación Final de Preparación

**Checklist antes de proceder a instalación:**

- [ ] Sistema operativo actualizado
- [ ] Zona horaria configurada correctamente
- [ ] Usuario `ultrasecure` creado
- [ ] Firewall configurado (puertos 80, 443 abiertos)
- [ ] Límites del sistema aumentados
- [ ] Swap configurado (si aplica)
- [ ] Node.js 18+ instalado
- [ ] MySQL 8.0+ instalado y seguro
- [ ] Redis 7.0+ instalado y configurado
- [ ] Certificados SSL generados
- [ ] Nginx instalado y configurado (opcional)
- [ ] MySQL optimizado para alta concurrencia
- [ ] Herramientas de monitoreo instaladas (opcional)

**Comando para verificar servicios:**

**Salida esperada**:
```
MySQL:  ● mysql.service - MySQL Community Server - RUNNING
Redis:  ● redis-server.service - Advanced key-value store - RUNNING
Nginx:  ● nginx.service - A high performance web server - RUNNING (si aplica)
```

Si todo está ✅, proceder al siguiente capítulo: **Proceso de Instalación**.

---

## 4. PROCESO DE INSTALACIÓN

### 4.1 Decisión de Versión a Instalar

Antes de comenzar, decidir qué versión instalar según necesidades:

**¿Cuándo elegir V3.0 Base?**
- Proyecto pequeño (1-50 usuarios)
- Presupuesto limitado (licencia única)
- No necesitas bloqueos inteligentes
- No necesitas frontend incluido
- Solo necesitas cifrado robusto básico

**¿Cuándo elegir V3.0 + Request Blocker?**
- Proyecto mediano (50-500 usuarios)
- Necesitas protección contra ataques
- Bloqueos fijos son suficientes (no variables)
- No necesitas frontend incluido
- Presupuesto moderado

**¿Cuándo elegir V4.0 Smart IA? (RECOMENDADO)**
- Cualquier proyecto serio (100+ usuarios)
- Necesitas protección máxima con IA
- Bloqueos variables según patrones
- Frontend administrativo incluido
- Backups 10 capas + BD oculta
- Optimización de hardware
- Escalabilidad multi-nodo
- Licenciamiento anual está dentro de presupuesto

**Comparación rápida de costos:**

| Concepto | V3.0 | V3.0 + RB | V4.0 Basic | V4.0 Pro | V4.0 Max | V4.0 Diamante |
|----------|------|-----------|------------|----------|----------|---------------|
| Licencia | $5K única | $12K única | $10K/año | $25K/año | $50K/año | $100K/año |
| Usuarios | 50 | 500 | 100 | 1,000 | 10,000 | ∞ |
| Nodos | 1 | 1 | 1 | 3 | 10 | ∞ |
| Smart IA | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Frontend | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |

### 4.2 Descarga del Sistema

#### **Opción A: Desde Repositorio Git (Recomendado)**

**Paso 1**: Cambiar a usuario ultrasecure

**Paso 2**: Navegar al directorio home

**Paso 3**: Clonar repositorio

**Repositorios disponibles:**
- V3.0: `https://github.com/ultrasecure/system-v3.git`
- V3.0 + Request Blocker: `https://github.com/ultrasecure/system-v3-rb.git`
- V4.0 Smart IA: `https://github.com/ultrasecure/system-v4.git`

**Paso 4**: Navegar al directorio clonado

#### **Opción B: Descarga Directa de Archivos**

**Paso 1**: Descargar paquete desde portal del cliente

**Paso 2**: Subir al servidor usando SCP/SFTP

**Paso 3**: Extraer archivo

**Paso 4**: Navegar al directorio

### 4.3 Obtención de Licencia (V4.0)

**Solo para V4.0 Smart IA:**

**Paso 1**: Adquirir licencia desde portal:
```
https://ultrasecure.com/licenses/purchase
```

**Paso 2**: Recibirás un email con:
- Clave de licencia (formato: `USS4-XXXX-XXXX-XXXX-XXXX`)
- Archivo `license.key`
- Instrucciones de activación

**Paso 3**: Guardar archivo de licencia en directorio del proyecto

**O crear manualmente**:

**Paso 4**: Verificar contenido

**Nota**: El script de instalación validará automáticamente la licencia y configurará el sistema según el tier (Basic/Pro/Max/Diamante).

### 4.4 Ejecución del Script de Instalación Automatizada

**El script `deploy.sh` (V3.0) o `deploy-v4-smart-ia.sh` (V4.0) realizará TODO automáticamente.**

#### **Para V3.0 y V3.0 + Request Blocker:**

**Paso 1**: Dar permisos de ejecución

**Paso 2**: Ejecutar script

**Paso 3**: Durante la ejecución, se te pedirá:
- Contraseña de root de MySQL
- Contraseña para usuario del Vault
- Contraseña para usuario de aplicación
- Configuración de dominio/IP
- Puerto de la aplicación (default: 3000)

#### **Para V4.0 Smart IA:**

**Paso 1**: Asegurarse que el archivo `license.key` existe

**Paso 2**: Dar permisos de ejecución

**Paso 3**: Ejecutar script

**El script detectará AUTOMÁTICAMENTE:**
- ✅ Licencia y tier (Basic/Pro/Max/Diamante)
- ✅ Hardware (CPU, RAM, SSD, GPU)
- ✅ Red (Ethernet + WiFi)
- ✅ Sistema operativo
- ✅ Versiones de dependencias

**Y configurará TODO según lo detectado:**
- ✅ Instala dependencias faltantes
- ✅ Crea bases de datos (Vault + Main + Hidden Backup)
- ✅ Genera credenciales seguras automáticamente
- ✅ Configura según capacidades de licencia
- ✅ Optimiza para hardware detectado (AMD Ryzen, GPU)
- ✅ Configura red (Ethernet + WiFi simultáneo)
- ✅ Instala y configura frontend React + Next.js
- ✅ Crea servicios systemd
- ✅ Inicia aplicación automáticamente
- ✅ Verifica que todo funcione correctamente

**Paso 4**: Esperar a que termine (puede tomar 5-15 minutos)

**Salida del script mostrará:**
```
========================================
   ULTRA SECURE SYSTEM V4.0 SMART IA
   INSTALLATION SUCCESSFUL
========================================

✓ License Detected: Global Infiniti Pro
✓ Hardware Detected: AMD Ryzen 7, 16GB RAM, NVMe SSD, NVIDIA GTX 1660
✓ Network Detected: Ethernet (1Gbps) + WiFi (802.11ac)
✓ Encryption Layers: 7 (according to license)
✓ Smart IA: Enabled
✓ GPU Acceleration: Enabled
✓ Nodes Allowed: 3

✓ Vault Database: Created and configured
✓ Main Database: Created and configured
✓ Hidden Backup Database: Created and configured (invisible to normal users)
✓ Redis: Configured with mlock
✓ Frontend: React + Next.js installed and built
✓ Services: Created and started

APPLICATION URLs:
- Web Interface: https://tudominio.com
- API Endpoint: https://tudominio.com/api
- Admin Panel: https://tudominio.com/admin
- Health Check: https://tudominio.com/health

DEFAULT CREDENTIALS (CHANGE IMMEDIATELY):
- Username: admin
- Password: [generated password shown here]

VAULT ACCESS (SAVE SECURELY):
- Vault DB Password: [generated password]
- Master Key ID: [key ID]

BACKUP DATABASE (SAVE SECURELY):
- Hidden DB Name: [random name]
- Hidden DB User: [random user]
- Hidden DB Password: [generated password]
- Backup Encryption Key: [encryption key]

NEXT STEPS:
1. Access web interface at https://tudominio.com
2. Login with default credentials
3. CHANGE DEFAULT PASSWORD immediately
4. Configure SSL certificates (if not using Let's Encrypt)
5. Schedule automated backups
6. Configure monitoring (Grafana)
7. Test key rotation
8. Review audit logs

========================================
```

### 4.5 ¿Qué Hace el Script de Instalación Exactamente?

**Entender el proceso ayuda a solucionar problemas. Aquí está el flujo completo:**

#### **Fase 1: Detección y Validación (2-3 minutos)**

**1.1 Detectar Sistema Operativo:**
- Identifica si es Ubuntu, Debian, CentOS, RHEL, Fedora
- Verifica versión del OS
- Ajusta comandos según el sistema

**1.2 Validar Licencia (V4.0 únicamente):**
- Lee archivo `license.key`
- Valida formato: `USS4-XXXX-XXXX-XXXX-XXXX`
- Extrae tier: Basic/Pro/Max/Diamante
- Verifica que no esté expirada
- Si inválida → DETIENE instalación

**1.3 Detectar Hardware:**
- **CPU**: Lee `/proc/cpuinfo`
  - Detecta marca (AMD Ryzen, Intel, etc.)
  - Cuenta cores físicos y lógicos
  - Obtiene frecuencia
  - Verifica si cumple requisitos de licencia
  
- **RAM**: Lee `/proc/meminfo`
  - Obtiene RAM total
  - Verifica si cumple mínimos de licencia
  - Calcula configuraciones óptimas MySQL/Redis
  
- **Almacenamiento**: Usa `lsblk` y `df`
  - Detecta tipo: HDD, SSD, NVMe
  - Verifica espacio disponible (mínimo según licencia)
  - Configura I/O scheduler apropiado
  
- **GPU**: Usa `lspci` y `nvidia-smi` / `rocm-smi`
  - Detecta NVIDIA o AMD
  - Verifica modelo y memoria
  - Solo para licencias Max/Diamante
  - Instala drivers si es necesario

**1.4 Detectar Red:**
- **Interfaces**: Lee `/sys/class/net`
  - Identifica Ethernet (eth*, enp*, eno*)
  - Identifica WiFi (wlan*, wlp*)
  - Obtiene direcciones IP
  - Mide velocidad de cada interfaz
  
- **Configuración**:
  - Configura bonding si hay múltiples Ethernet
  - Failover Ethernet → WiFi
  - Load balancing si licencia lo permite

**1.5 Verificar Dependencias:**
- Node.js versión 18+
- npm versión 9+
- MySQL 8.0+
- Redis 7.0+
- Git, Curl, OpenSSL
- Si falta algo → Instala automáticamente

#### **Fase 2: Instalación de Dependencias (3-5 minutos)**

**2.1 Instalar Dependencias de Sistema:**
- Herramientas de compilación (gcc, g++, make)
- Librerías de desarrollo
- Herramientas de red
- Drivers de GPU (si aplica)

**2.2 Instalar Dependencias de Node.js:**
- Lee `package.json`
- Ejecuta `npm install` en modo production
- Instala dependencias globales necesarias
- Verifica que todo se instaló correctamente

**2.3 Compilar Módulos Nativos:**
- Argon2 (para KDF)
- Crypto++ (para algoritmos adicionales)
- Sharp (para procesamiento de imágenes del frontend)
- node-gyp (para módulos nativos)

#### **Fase 3: Configuración de Bases de Datos (2-4 minutos)**

**3.1 Crear Base de Datos Vault:**

- **Nombre**: `encryption_vault`
- **Usuario**: `vault_master`
- **Password**: Generada criptográficamente (64 caracteres)
- **Permisos**: Solo SELECT, INSERT, UPDATE en tablas específicas

**Tablas creadas:**
- `master_keys`: Claves maestras con versionado
  - Campos: id, key_data (cifrado), version, created_at, expires_at, status
  - Índices: version, status, expires_at
  - Triggers: Antes de borrar → auditoría
  
- `rotation_history`: Historial de rotaciones
  - Campos: id, old_key_id, new_key_id, rotated_at, rotated_by, records_affected
  - Índices: rotated_at, old_key_id
  
- `key_metadata`: Metadata de claves
  - Campos: key_id, algorithm, key_size, created_by, purpose
  - Índices: key_id, created_by

**3.2 Crear Base de Datos Principal:**

- **Nombre**: `main_app`
- **Usuario**: `app_user`
- **Password**: Generada criptográficamente (64 caracteres)
- **Permisos**: SELECT, INSERT, UPDATE, DELETE en tablas de aplicación

**Tablas creadas:**
- `usuarios`: Datos de usuarios
  - Campos: id, username, email (cifrado), password_hash, created_at, last_login
  - Índices: username (único), email
  
- `sesiones`: Sesiones JWT
  - Campos: id, user_id, token_hash, created_at, expires_at, ip_address
  - Índices: token_hash, user_id, expires_at
  
- `configuracion`: Settings generales
  - Campos: key, value (cifrado si sensible), updated_at
  - Índices: key (único)
  
- `audit_logs`: Logs de auditoría
  - Campos: id, tabla, registro_id, accion, user_id, ip_address, timestamp, datos_anteriores, datos_nuevos, hash_anterior
  - Índices: timestamp, user_id, tabla
  - Triggers: Calcular hash blockchain-style
  
- `blocked_ips`: IPs bloqueadas por Request Blocker
  - Campos: id, ip_address, fingerprint, reason, blocked_at, expires_at, type (temporal/permanent), strikes
  - Índices: ip_address, fingerprint, expires_at
  
- `ml_training_data`: Datos para Smart IA
  - Campos: id, timestamp, features (JSON), label, used_for_training
  - Índices: timestamp, used_for_training

**3.3 Crear Base de Datos Oculta de Backups (V4.0 únicamente):**

- **Nombre**: Generado aleatoriamente (ej: `bk_9f7e4c2a`)
- **Usuario**: Generado aleatoriamente (ej: `bkuser_7a3f`)
- **Password**: Generada criptográficamente (128 caracteres)
- **Ubicación**: Puede ser servidor diferente (si configurado)
- **Invisibilidad**:
  - No aparece en listados estándar
  - Solo roles `admin` y `backup_manager` conocen su existencia
  - Credenciales almacenadas SOLO en archivo seguro del servidor
  - No están en variables de entorno visibles

**Tablas creadas:**
- `encrypted_backups`: Backups cifrados con 10 capas
  - Campos: id, backup_name, encrypted_data (BLOB), layer_info (JSON), created_at, size, checksum
  - Índices: backup_name, created_at
  - Cifrado: 10 algoritmos secuenciales
  
- `backup_keys`: Claves de descifrado (cifradas con clave maestra)
  - Campos: backup_id, encrypted_key, created_at
  - Índices: backup_id

#### **Fase 4: Generación de Credenciales Seguras (1 minuto)**

**4.1 Generar Claves de Aplicación:**

- **JWT_SECRET**: 64 bytes aleatorios, codificado en hex
- **TOTP_SECRET**: 32 bytes aleatorios, codificado en base32
- **ENCRYPTION_SALT**: 64 bytes aleatorios, codificado en hex
- **SESSION_SECRET**: 64 bytes aleatorios, codificado en hex

**Método de generación**: `/dev/urandom` del sistema (criptográficamente seguro)

**4.2 Generar Clave Maestra Inicial:**

- Se genera la primera clave maestra
- Se almacena cifrada en Vault DB
- Se marca como activa (status = 'active')
- Se programa primera rotación (7 días después)

**4.3 Crear Archivo .env:**

- Toma plantilla `.env.example`
- Reemplaza todas las variables con valores generados
- Ajusta configuraciones según licencia detectada
- Guarda archivo `.env` con permisos restrictivos (600)

**Ejemplo de .env generado:**
```
# Generated by deploy-v4-smart-ia.sh
# Generated at: 2025-01-15 10:30:00

# LICENSE
LICENSE_KEY=USS4-XXXX-XXXX-XXXX-XXXX
LICENSE_TIER=Pro
LICENSE_EXPIRES=2026-01-15

# APPLICATION
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# VAULT DATABASE
VAULT_DB_HOST=localhost
VAULT_DB_PORT=3306
VAULT_DB_NAME=encryption_vault
VAULT_DB_USER=vault_master
VAULT_DB_PASSWORD=[generated 64-char password]

# MAIN DATABASE
DB_HOST=localhost
DB_PORT=3306
DB_NAME=main_app
DB_USER=app_user
DB_PASSWORD=[generated 64-char password]

# HIDDEN BACKUP DATABASE (V4.0)
BACKUP_DB_HOST=localhost
BACKUP_DB_PORT=3306
BACKUP_DB_NAME=[random name]
BACKUP_DB_USER=[random user]
BACKUP_DB_PASSWORD=[generated 128-char password]

# REDIS
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=[generated password]

# JWT & AUTH
JWT_SECRET=[generated 128-char hex]
JWT_EXPIRES_IN=24h
TOTP_SECRET=[generated base32]

# ENCRYPTION
ENCRYPTION_SALT=[generated 128-char hex]
ENCRYPTION_LAYERS=7
ENCRYPTION_ALGORITHMS=argon2id,aes256gcm,chacha20poly1305,camellia256,twofish256,serpent256,blowfish448

# SMART IA (V4.0)
SMART_IA_ENABLED=true
ML_MODEL_PATH=./models/smart-ia
ML_TRAINING_ENABLED=true
ML_UPDATE_FREQUENCY=1000

# RATE LIMITING
RATE_LIMIT_GLOBAL=5000
RATE_LIMIT_LOGIN=5
RATE_LIMIT_VAULT=10

# HARDWARE OPTIMIZATION
CPU_CORES=8
CPU_GOVERNOR=performance
IO_SCHEDULER=none
GPU_ENABLED=false

# NETWORK
NETWORK_INTERFACES=enp0s3,wlp2s0
NETWORK_FAILOVER=true
NETWORK_BONDING=false

# BACKUPS
BACKUP_ENABLED=true
BACKUP_FREQUENCY=21600
BACKUP_RETENTION=30
BACKUP_ENCRYPTION_LAYERS=7

# CORS
CORS_ENABLED=true
CORS_ALLOWED_ORIGINS=https://admin.company.com

# MONITORING
METRICS_ENABLED=true
METRICS_PORT=9090
GRAFANA_ENABLED=false
```

#### **Fase 5: Instalación del Frontend (V4.0, 3-5 minutos)**

**5.1 Instalar Dependencias de Frontend:**

- Navega a carpeta `frontend/`
- Ejecuta `npm install`
- Instala React 18, Next.js 14, TypeScript
- Instala dependencias de desarrollo

**5.2 Configurar Frontend:**

- Crea archivo `frontend/.env.local`
- Configura URL del backend API
- Configura variables de entorno específicas

**5.3 Build de Producción:**

- Ejecuta `npm run build`
- Genera versión optimizada en `frontend/.next/`
- Minimiza JavaScript y CSS
- Optimiza imágenes
- Genera manifests

**5.4 Verificar Build:**

- Verifica que no haya errores
- Comprueba tamaño de bundles
- Valida que todos los assets se generaron

#### **Fase 6: Optimización del Sistema (2-3 minutos)**

**6.1 Optimizar MySQL:**

- Edita `/etc/mysql/mysql.conf.d/mysqld.cnf`
- Ajusta parámetros según RAM detectada
- Configura InnoDB para máxima performance
- Establece límites de conexiones según licencia
- Reinicia servicio MySQL

**6.2 Optimizar Redis:**

- Edita `/etc/redis/redis.conf`
- Configura maxmemory según RAM disponible
- Establece política de evicción
- Habilita mlock para proteger contra swap
- Reinicia servicio Redis

**6.3 Optimizar Hardware:**

**CPU**:
- Si es AMD Ryzen → Governor = performance
- Si es Intel → Governor = powersave (paradójicamente mejor para servidores Intel)
- Desactiva CPU throttling
- Configura NUMA si aplica

**SSD/NVMe**:
- I/O Scheduler = none (para NVMe)
- I/O Scheduler = mq-deadline (para SSD)
- Aumenta queue depth
- Habilita TRIM

**GPU** (si licencia Max/Diamante):
- Instala drivers NVIDIA CUDA o AMD ROCm
- Configura para modo compute (no display)
- Establece power mode = max performance
- Verifica que TensorFlow puede acceder

**Red**:
- Aumenta buffers TCP
- Habilita TCP fastopen
- Configura TCP BBR (si disponible)
- Optimiza MTU
- Si múltiples interfaces → Configura bonding/teaming

**6.4 Aplicar Optimizaciones:**

- Ejecuta comandos de optimización
- Guarda configuraciones para persistencia
- Verifica que se aplicaron correctamente

#### **Fase 7: Creación de Servicios Systemd (1 minuto)**

**7.1 Crear Servicio para Backend:**

- Crea archivo `/etc/systemd/system/ultrasecure-backend.service`
- Configuración:
  - ExecStart: Inicia aplicación Node.js
  - User: ultrasecure
  - WorkingDirectory: /home/ultrasecure/ultra-secure-system
  - Restart: always (reinicia automáticamente si falla)
  - Environment: Variables de entorno necesarias

**7.2 Crear Servicio para Frontend (V4.0):**

- Crea archivo `/etc/systemd/system/ultrasecure-frontend.service`
- Configuración:
  - ExecStart: `npm run start` en directorio frontend
  - User: ultrasecure
  - WorkingDirectory: /home/ultrasecure/ultra-secure-system/frontend
  - Restart: always

**7.3 Crear Timer para Rotación Automática:**

- Crea archivo `/etc/systemd/system/ultrasecure-rotation.timer`
- Configuración:
  - OnCalendar: Domingos a las 3 AM
  - Persistent: true (ejecuta si estaba apagado)

- Crea archivo `/etc/systemd/system/ultrasecure-rotation.service`
- Configuración:
  - ExecStart: Script de rotación de claves

**7.4 Crear Timer para Backups Automáticos:**

- Crea archivo `/etc/systemd/system/ultrasecure-backup.timer`
- Configuración:
  - OnCalendar: Cada 6 horas
  - Persistent: true

- Crea archivo `/etc/systemd/system/ultrasecure-backup.service`
- Configuración:
  - ExecStart: Script de backup

**7.5 Habilitar e Iniciar Servicios:**

- Recarga configuración de systemd
- Habilita servicios para inicio automático
- Inicia servicios inmediatamente
- Habilita timers
- Verifica que todo esté running

#### **Fase 8: Configuración de Nginx (si está instalado, 1 minuto)**

**8.1 Crear Configuración:**

- Crea `/etc/nginx/sites-available/ultrasecure`
- Configura:
  - Server block para puerto 80 (HTTP)
  - Redirección a HTTPS
  - Server block para puerto 443 (HTTPS)
  - Proxy_pass a backend (puerto 3000)
  - Headers de seguridad
  - Rate limiting adicional
  - Compresión gzip
  - Cache de assets estáticos

**8.2 Habilitar Sitio:**

- Crea symlink en `/etc/nginx/sites-enabled/`
- Verifica configuración de Nginx
- Recarga Nginx

#### **Fase 9: Configuración de Fail2ban (1 minuto)**

**9.1 Instalar Fail2ban:**

- Instala paquete fail2ban
- Inicia servicio

**9.2 Configurar Filtros:**

- Crea filtro `/etc/fail2ban/filter.d/ultrasecure.conf`
- Detecta:
  - Intentos de login fallidos
  - Requests bloqueados por IA
  - Patrones de ataque conocidos

**9.3 Configurar Jail:**

- Crea jail `/etc/fail2ban/jail.d/ultrasecure.conf`
- Configuración:
  - Bantime: 1 hora
  - Findtime: 10 minutos
  - Maxretry: 5 intentos
  - Action: Bloquear IP en firewall

**9.4 Reiniciar Fail2ban:**

- Reinicia servicio
- Verifica que esté monitoreando logs

#### **Fase 10: Verificación Final (2-3 minutos)**

**10.1 Verificar Servicios:**

- Backend: Running y respondiendo
- Frontend: Running (V4.0)
- MySQL: Running
- Redis: Running
- Nginx: Running (si aplica)
- Fail2ban: Running

**10.2 Verificar Conexiones:**

- Backend puede conectar a Vault DB
- Backend puede conectar a Main DB
- Backend puede conectar a Redis
- Backend puede conectar a Hidden Backup DB (V4.0)

**10.3 Verificar Endpoints:**

- GET /health → 200 OK
- GET /api/health → 200 OK
- POST /api/auth/login → Funciona con credenciales de prueba
- GET / → Frontend carga correctamente (V4.0)

**10.4 Verificar Cifrado:**

- Clave maestra se puede obtener del Vault
- Cifrar texto de prueba
- Descifrar y verificar que coincide
- Verificar integridad HMAC

**10.5 Verificar Smart IA (V4.0):**

- Modelo de ML está cargado
- Puede hacer predicciones
- Training data se está recopilando

**10.6 Verificar Request Blocker:**

- Simular múltiples requests desde misma IP
- Verificar que se bloquea después del límite
- Verificar que registro aparece en tabla blocked_ips
- Verificar que desbloqueo automático funciona

**10.7 Verificar Backups (V4.0):**

- Crear backup manual de prueba
- Verificar que se cifra con 10 capas
- Verificar que se almacena en Hidden DB
- Intentar restaurar backup
- Verificar que datos son correctos

**10.8 Generar Reporte:**

- Script genera reporte final
- Muestra:
  - URLs de acceso
  - Credenciales por defecto
  - Información de Vault
  - Información de Hidden Backup DB
  - Próximos pasos recomendados
  - Comandos útiles

**10.9 Guardar Credenciales:**

- Crea archivo seguro `/root/.ultrasecure-credentials`
- Permisos: 600 (solo root puede leer)
- Contiene:
  - Todas las contraseñas generadas
  - Claves de cifrado
  - Información de bases de datos ocultas
  - Tokens de emergencia

#### **Fase 11: Post-Instalación (automático)**

**11.1 Configurar Logs:**

- Crea directorio `/var/log/ultrasecure`
- Configura logrotate para rotar logs diariamente
- Comprime logs antiguos
- Mantiene logs por 30 días

**11.2 Configurar Monitoreo:**

- Si Prometheus está instalado:
  - Configura exporters
  - Agrega targets a prometheus.yml
  
- Si Grafana está instalado:
  - Crea datasource para Prometheus
  - Importa dashboards pre-configurados

**11.3 Programar Mantenimiento:**

- Limpieza de logs antiguos: Diariamente a las 2 AM
- Optimización de bases de datos: Semanalmente domingos 1 AM
- Vacuum de Redis: Mensualmente
- Actualización de dependencias: Notificar si hay disponibles

**11.4 Enviar Notificación (si configurado):**

- Email a administrador con:
  - Resumen de instalación
  - Credenciales (cifradas)
  - Enlaces de acceso
  - Próximos pasos

### 4.6 Tiempo Total de Instalación

**Resumen de tiempos por fase:**

| Fase | Tiempo Estimado |
|------|-----------------|
| 1. Detección y Validación | 2-3 minutos |
| 2. Instalación de Dependencias | 3-5 minutos |
| 3. Configuración de Bases de Datos | 2-4 minutos |
| 4. Generación de Credenciales | 1 minuto |
| 5. Frontend (V4.0) | 3-5 minutos |
| 6. Optimización del Sistema | 2-3 minutos |
| 7. Servicios Systemd | 1 minuto |
| 8. Nginx | 1 minuto |
| 9. Fail2ban | 1 minuto |
| 10. Verificación Final | 2-3 minutos |
| 11. Post-Instalación | 1 minuto |
| **TOTAL** | **15-30 minutos** |

**Factores que afectan el tiempo:**
- Velocidad de internet (descargas)
- Potencia del servidor (compilación)
- Versión instalada (V4.0 toma más que V3.0)
- Si hay que instalar dependencias faltantes

### 4.7 ¿Qué Hacer Mientras se Instala?

**El script es 100% automatizado, pero puedes:**

**Monitorear el progreso:**
- El script muestra output detallado de cada paso
- Muestra ✓ cuando completa una tarea
- Muestra ✗ si algo falla (y detalle del error)

**En otra terminal (SSH adicional):**
- Monitorear recursos: `htop`
- Ver logs en tiempo real: `tail -f /var/log/ultrasecure/install.log`
- Verificar espacio en disco: `df -h`

**Preparar documentación:**
- Tener a mano documentos adicionales
- Preparar lista de usuarios a crear
- Definir roles y permisos
- Planificar estructura de datos

**NO hacer:**
- ❌ Interrumpir el script (Ctrl+C)
- ❌ Reiniciar el servidor
- ❌ Modificar archivos que el script está configurando
- ❌ Detener servicios que el script está instalando

Si el script falla:
- Leer el error detalladamente
- Revisar log: `/var/log/ultrasecure/install.log`
- Ejecutar `./deploy.sh --cleanup` para limpiar instalación parcial
- Volver a ejecutar `./deploy.sh`

---

## 5. CONFIGURACIÓN POST-INSTALACIÓN

Una vez que el script ha terminado exitosamente, hay varios pasos importantes de configuración que debes realizar.

### 5.1 Primer Acceso al Sistema

#### **Paso 1: Obtener Credenciales**

Al finalizar la instalación, el script mostró:
- URL de acceso
- Usuario por defecto (usualmente `admin`)
- Contraseña temporal

Si no las anotaste, están en:

#### **Paso 2: Acceder a la Interfaz Web (V4.0)**

- Abre navegador web
- Navega a: `https://tu-dominio.com` o `https://tu-ip`
- Si es certificado auto-firmado, acepta la advertencia (temporal)
- Aparecerá página de login

#### **Paso 3: Primer Login**

- Ingresa usuario: `admin`
- Ingresa contraseña temporal mostrada por el script
- Click en "Login"
- Sistema te forzará a cambiar contraseña inmediatamente

#### **Paso 4: Cambiar Contraseña**

**IMPORTANTE**: Crear una contraseña FUERTE:
- Mínimo 16 caracteres
- Mayúsculas, minúsculas, números, símbolos
- NO usar palabras del diccionario
- NO reutilizar contraseñas de otros sitios

**Recomendación**: Usar un gestor de contraseñas (1Password, Bitwarden, LastPass)

**Ejemplo de contraseña fuerte**:
```
K7#mP9$zQ2@nR5&wX8
```

#### **Paso 5: Configurar 2FA (Altamente Recomendado)**

- Ir a: Panel → Configuración → Seguridad → 2FA
- Escanear código QR con app:
  - Google Authenticator
  - Authy
  - Microsoft Authenticator
  - 1Password
- Ingresar código de 6 dígitos para verificar
- Guardar códigos de recuperación en lugar seguro
- Cerrar sesión y volver a entrar para probar 2FA

### 5.2 Configuración de Certificados SSL Válidos

Si instalaste con certificado auto-firmado, ahora debes reemplazarlo con uno válido.

#### **Opción A: Let's Encrypt (Recomendado - Gratis)**

**Requisitos**:
- Dominio apuntando al servidor
- Puertos 80 y 443 abiertos
- Certbot instalado

**Pasos**:

**Paso 1**: Detener temporalmente Nginx (si está usando puerto 80)

**Paso 2**: Obtener certificado

**Paso 3**: Los certificados se guardarán en:
```
/etc/letsencrypt/live/tu-dominio.com/fullchain.pem
/etc/letsencrypt/live/tu-dominio.com/privkey.pem
```

**Paso 4**: Actualizar configuración de Nginx

**Paso 5**: Probar configuración y recargar

**Paso 6**: Configurar renovación automática

Certbot crea un timer automático, pero verifica:

**Paso 7**: Probar renovación

#### **Opción B: Certificado de CA Comercial**

Si compraste un certificado:

**Paso 1**: Subir archivos al servidor
- `tu-dominio.crt` (certificado)
- `tu-dominio.key` (clave privada)
- `ca-bundle.crt` (cadena de certificados)

**Paso 2**: Mover a ubicación segura

**Paso 3**: Asegurar permisos

**Paso 4**: Actualizar Nginx

**Paso 5**: Recargar Nginx

### 5.3 Configuración de Variables de Entorno Personalizadas

El archivo `.env` tiene configuración por defecto. Personalízalo según necesidades:

#### **Paso 1**: Hacer backup del .env original

#### **Paso 2**: Editar archivo

#### **Paso 3**: Variables importantes a personalizar:

**Aplicación**:
```
# Cambiar si quieres otro puerto
PORT=3000

# Cambiar a tu dominio real
PUBLIC_URL=https://tu-dominio.com
```

**Sesiones**:
```
# Tiempo de expiración de JWT (default: 24h)
JWT_EXPIRES_IN=8h

# Para mayor seguridad, reducir
JWT_EXPIRES_IN=2h
```

**Rate Limiting** (ajustar según licencia y necesidades):
```
# Requests globales por hora
RATE_LIMIT_GLOBAL=5000

# Login attempts por 5 minutos
RATE_LIMIT_LOGIN=5

# Para APIs públicas, puedes aumentar
RATE_LIMIT_API=10000
```

**Backups**:
```
# Frecuencia en segundos (default: 21600 = 6 horas)
BACKUP_FREQUENCY=21600

# Para backups más frecuentes
BACKUP_FREQUENCY=3600  # 1 hora

# Retención en días
BACKUP_RETENTION=30

# Para mantener más tiempo
BACKUP_RETENTION=90  # 3 meses
```

**Notificaciones** (configurar para recibir alertas):
```
# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alerts@tu-empresa.com
SMTP_PASS=tu-password-app
SMTP_FROM=alerts@tu-empresa.com
SMTP_TO=admin@tu-empresa.com

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx

# PagerDuty (licencias Max/Diamante)
PAGERDUTY_INTEGRATION_KEY=tu-key
```

**Smart IA** (V4.0):
```
# Habilitar/deshabilitar temporalmente
SMART_IA_ENABLED=true

# Frecuencia de re-entrenamiento (en eventos)
ML_UPDATE_FREQUENCY=1000

# Para aprendizaje más rápido
ML_UPDATE_FREQUENCY=500

# Para aprendizaje más conservador
ML_UPDATE_FREQUENCY=5000
```

#### **Paso 4**: Reiniciar servicios para aplicar cambios

### 5.4 Crear Usuarios y Roles

Después del primer acceso, crear usuarios adicionales para tu equipo.

#### **Roles Disponibles:**

- **admin**: Acceso completo, puede hacer TODO
- **operator**: Gestión diaria, no puede cambiar configuración crítica
- **viewer**: Solo lectura, ver dashboards y logs
- **backup_manager**: Solo gestión de backups
- **auditor**: Solo acceso a logs de auditoría

#### **Crear Usuario vía Web (V4.0):**

**Paso 1**: Login como admin

**Paso 2**: Ir a: Panel → Usuarios → Crear Nuevo

**Paso 3**: Llenar formulario:
- Username
- Email
- Password temporal
- Rol
- Permisos adicionales (opcional)

**Paso 4**: Click en "Crear Usuario"

**Paso 5**: Enviar credenciales al usuario de forma segura
- NO por email sin cifrar
- Usar herramienta de passwords compartidos (1Password, Bitwarden)
- O darle contraseña en persona

**Paso 6**: Usuario debe cambiar password en primer login

#### **Crear Usuario vía CLI:**

Si necesitas crear usuarios automáticamente:

**Script de ejemplo**:

### 5.5 Configurar Backups Externos

Los backups locales son buenos, pero tener backups externos es CRÍTICO.

#### **Opción A: Subir a AWS S3**

**Paso 1**: Instalar AWS CLI

**Paso 2**: Configurar credenciales

**Paso 3**: Crear script de backup

**Paso 4**: Programar con cron

#### **Opción B: Subir a Google Cloud Storage**

**Paso 1**: Instalar gcloud CLI

**Paso 2**: Autenticar

**Paso 3**: Crear script

**Paso 4**: Programar con cron

#### **Opción C: Backups en Servidor Remoto (rsync)**

**Paso 1**: Configurar autenticación SSH sin password

**Paso 2**: Crear script

**Paso 3**: Programar con cron

### 5.6 Configurar Monitoreo con Grafana

Si instalaste Grafana, configúralo para visualizar métricas.

#### **Paso 1: Acceder a Grafana**

- URL: `http://servidor:3001`
- Usuario default: `admin`
- Password default: `admin`
- Cambiar password al primer acceso

#### **Paso 2: Agregar Datasource Prometheus**

- Click en "⚙️ Configuration" → "Data Sources"
- Click en "Add data source"
- Seleccionar "Prometheus"
- URL: `http://localhost:9090`
- Click en "Save & Test"

#### **Paso 3: Importar Dashboards**

Ultra Secure System incluye dashboards pre-configurados:

**Para importar**:
- Click en "+" → "Import"
- Subir archivo JSON o pegar ID:
  - Dashboard General: ID `12345` (ejemplo)
  - Dashboard de Seguridad: ID `12346`
  - Dashboard de Performance: ID `12347`
- Click en "Load"
- Seleccionar datasource Prometheus
- Click en "Import"

#### **Paso 4: Configurar Alertas**

- Ir a dashboard
- Click en un panel
- Click en "Edit"
- Tab "Alert"
- Configurar condiciones y notificaciones
- Guardar

### 5.7 Configurar Integración con Sistemas Existentes

#### **Integración con LDAP/Active Directory:**

Si tu empresa usa LDAP para autenticación:

**Paso 1**: Editar `.env`

**Paso 2**: Reiniciar backend

**Paso 3**: Probar login con usuario de LDAP

#### **Integración con SAML/SSO:**

Para Single Sign-On:

**Paso 1**: Configurar proveedor SAML (Okta, Auth0, Azure AD)

**Paso 2**: Agregar a `.env`

**Paso 3**: Configurar metadata

**Paso 4**: Probar flujo SSO

#### **Integración con API Externa:**

Si necesitas que el sistema interactúe con otras APIs:

**Paso 1**: Crear archivo de configuración personalizada

**Paso 2**: Implementar en código (requiere desarrollo)

### 5.8 Configuración de Logs Centralizados (Opcional)

Para empresas grandes, es útil centralizar logs.

#### **Opción A: ELK Stack (Elasticsearch, Logstash, Kibana)**

**Paso 1**: Instalar ELK stack (ver documentación oficial)

**Paso 2**: Configurar Filebeat en servidor Ultra Secure

**Paso 3**: Ver logs en Kibana

#### **Opción B: Graylog**

**Paso 1**: Instalar Graylog (ver documentación oficial)

**Paso 2**: Configurar syslog

**Paso 3**: Ver logs en Graylog

#### **Opción C: Servicio Cloud (Splunk, Datadog, New Relic)**

**Paso 1**: Contratar servicio

**Paso 2**: Instalar agent

**Paso 3**: Configurar forwarding de logs

### 5.9 Programar Mantenimiento Automático

#### **Limpieza de Logs Antiguos:**

Crear script `/usr/local/bin/ultrasecure-cleanup.sh`:

Programar con cron:

#### **Optimización de Bases de Datos:**

Crear script `/usr/local/bin/ultrasecure-optimize-db.sh`:

Programar con cron (semanalmente):

#### **Actualización de Modelos ML (V4.0):**

El sistema lo hace automáticamente, pero puedes forzar:

### 5.10 Configurar Plan de Recuperación ante Desastres

#### **Documentar Procedimientos:**

Crear documento: `/root/ultrasecure-disaster-recovery.md`

**Contenido**:

1. **Contactos de Emergencia**
   - Administrador principal
   - Administrador secundario
   - Soporte técnico
   - Proveedor de hosting

2. **Ubicaciones de Backups**
   - Local: `/var/backups/ultrasecure/`
   - S3: `s3://mi-empresa-backups/ultrasecure/`
   - Servidor remoto: `user@backup-server:/backups/ultra secure/`

3. **Procedimiento de Restauración**
   - Paso por paso para restaurar desde backup
   - Comandos exactos
   - Tiempos estimados

4. **Contactos de Proveedores**
   - Hosting: +1-XXX-XXX-XXXX
   - DNS: support@cloudflare.com
   - SSL: support@letsencrypt.org

5. **Escalamiento**
   - Nivel 1: Reiniciar servicios
   - Nivel 2: Restaurar desde backup
   - Nivel 3: Reinstalación completa
   - Nivel 4: Contactar soporte Ultra Secure

#### **Probar Plan de Recuperación:**

**Al menos una vez cada 3 meses:**

**Paso 1**: Crear servidor de prueba idéntico

**Paso 2**: Simular falla total

**Paso 3**: Seguir procedimiento de recuperación

**Paso 4**: Medir tiempo de recuperación (RTO)

**Paso 5**: Verificar pérdida de datos (RPO)

**Paso 6**: Documentar lecciones aprendidas

**Paso 7**: Actualizar procedimientos si es necesario

### 5.11 Checklist de Configuración Post-Instalación

Antes de poner en producción, verificar que completaste:

- [ ] Cambiaste password de admin
- [ ] Configuraste 2FA para admin
- [ ] Instalaste certificado SSL válido (Let's Encrypt o comercial)
- [ ] Personalizaste variables de entorno (.env)
- [ ] Creaste usuarios adicionales con roles apropiados
- [ ] Configuraste backups externos (S3, GCS, o servidor remoto)
- [ ] Configuraste Grafana y dashboards
- [ ] Integraste con LDAP/SSO (si aplica)
- [ ] Configuraste logs centralizados (si aplica)
- [ ] Programaste mantenimiento automático
- [ ] Documentaste plan de recuperación ante desastres
- [ ] Probaste plan de recuperación
- [ ] Configuraste alertas por email/Slack
- [ ] Verificaste que firewall está bien configurado
- [ ] Probaste acceso desde diferentes dispositivos
- [ ] Capacitaste a equipo en uso del sistema

**Si TODO está ✅, el sistema está listo para producción.**

---

## 6. VERIFICACIÓN Y PRUEBAS

Antes de declarar el sistema como productivo, es fundamental realizar pruebas exhaustivas.

### 6.1 Verificación de Servicios

#### **Paso 1: Verificar que Todos los Servicios Estén Running**

**Comando**:

**Servicios que deben estar activos (●)**:
- `ultrasecure-backend.service`
- `ultrasecure-frontend.service` (V4.0)
- `mysql.service`
- `redis-server.service`
- `nginx.service` (si aplica)
- `fail2ban.service`

**Timers que deben estar activos**:
- `ultrasecure-rotation.timer`
- `ultrasecure-backup.timer`

**Si algún servicio está inactivo (○)**:

#### **Paso 2: Verificar Logs de Servicios**

**Para backend**:

**Para frontend (V4.0)**:

**Buscar errores**:
- Busca líneas con `ERROR`, `FATAL`, `failed`
- Verifica que no haya warnings críticos
- Confirma que servicios iniciaron correctamente

#### **Paso 3: Verificar Conectividad de Bases de Datos**

**Vault DB**:

**Main DB**:

**Hidden Backup DB (V4.0)**:

**Redis**:

**Si alguna conexión falla**:
- Verificar que servicio está running
- Verificar credenciales en `.env`
- Verificar que puertos están abiertos
- Verificar firewall

### 6.2 Pruebas de Funcionalidad Básica

#### **Prueba 1: Health Check**

**Endpoint**: `/health`

**Comando**:

**Respuesta esperada** (código 200):
```json
{
  "status": "ok",
  "uptime": 3600,
  "timestamp": "2025-01-15T10:30:00.000Z",
  "database": {
    "vault": "connected",
    "main": "connected",
    "backup": "connected"
  },
  "redis": "connected",
  "memory": {
    "used": 150000000,
    "total": 8000000000,
    "percentage": 1.87
  },
  "cpu": {
    "cores": 8,
    "usage": 15.4
  }
}
```

**Si falla**:
- Verificar que backend está running
- Revisar logs: `journalctl -u ultrasecure-backend -n 50`

#### **Prueba 2: Login**

**Endpoint**: `/api/auth/login`

**Comando**:

**Respuesta esperada** (código 200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

**Si falla**:
- Verificar credenciales
- Revisar tabla `usuarios` en Main DB
- Verificar que JWT_SECRET está configurado

#### **Prueba 3: Acceso Protegido**

**Endpoint**: `/api/users` (requiere autenticación)

**Comando** (usar token del login anterior):

**Respuesta esperada** (código 200):
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin",
      "created_at": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

**Si falla con 401 Unauthorized**:
- Token expiró o es inválido
- Obtener nuevo token con login
- Verificar que header Authorization está presente

#### **Prueba 4: Frontend (V4.0)**

**Paso 1**: Abrir navegador

**Paso 2**: Navegar a `https://tu-dominio.com`

**Verificar**:
- ✅ Página carga correctamente
- ✅ No hay errores en consola del navegador (F12)
- ✅ Formulario de login aparece
- ✅ Puedes hacer login con credenciales de admin
- ✅ Dashboard carga después del login
- ✅ Puedes navegar entre secciones

**Si falla**:
- Verificar que frontend service está running
- Ver logs: `journalctl -u ultrasecure-frontend -n 50`
- Verificar que puerto 3000 está abierto (o el configurado)
- Verificar configuración de Nginx si aplica

### 6.3 Pruebas de Cifrado

#### **Prueba 5: Cifrar Datos**

**Crear script de prueba** `test-encryption.js`:

**Ejecutar**:

**Salida esperada**:
```
=== ENCRYPTION TEST ===
Original: Este es un mensaje secreto
Encrypted: {"version":"3.0","algorithm":"argon2id+aes256gcm+chacha20poly1305"...}
Decrypted: Este es un mensaje secreto
✓ Encryption working correctly
```

**Si falla**:
- Verificar que Vault DB está accesible
- Verificar que existe clave maestra activa
- Revisar logs de backend

#### **Prueba 6: Verificar Capas de Cifrado**

**Según licencia, verifica cuántas capas usa**:

**Basic**: 3 capas
**Pro**: 7 capas
**Max/Diamante**: 10 capas

**Crear script** `test-layers.js`:

**Ejecutar**:

**Salida esperada**:
```
Encryption layers: 7
Expected layers: 7
✓ Correct number of layers for license tier
```

#### **Prueba 7: Detección de Manipulación**

**Crear script** `test-tampering.js`:

**Ejecutar**:

**Salida esperada**:
```
Original decrypt: Este es un mensaje secreto
Attempting tampered decrypt...
✓ Tampering detected correctly - Error: INTEGRITY COMPROMISED
```

### 6.4 Pruebas de Request Blocker

#### **Prueba 8: Bloqueo Temporal**

**Simular múltiples requests fallidos**:

**Script bash**:

**Ejecutar**:

**Salida esperada**:
```
Attempt 1: 401 Unauthorized
Attempt 2: 401 Unauthorized
Attempt 3: 401 Unauthorized
Attempt 4: 401 Unauthorized
Attempt 5: 401 Unauthorized
Attempt 6: 429 Too Many Requests - IP Blocked
```

**Verificar en base de datos**:

**Debe mostrar**:
```
+----+----------+-------+---------------------+---------------------+----------+
| id | ip_address | type  | blocked_at         | expires_at          | strikes  |
+----+----------+-------+---------------------+---------------------+----------+
|  1 | 1.2.3.4  | temp  | 2025-01-15 10:30:00 | 2025-01-15 12:30:00 | 1        |
+----+----------+-------+---------------------+---------------------+----------+
```

#### **Prueba 9: Auto-Desbloqueo**

**Esperar 2 horas (o cambiar expires_at manualmente para prueba rápida)**:

**Cambiar para prueba inmediata**:

**Intentar login nuevamente**:

**Salida esperada**: `401 Unauthorized` (pero NO 429)

**Verificar en DB que registro fue eliminado**:

#### **Prueba 10: Bloqueo Permanente**

**Simular 3 bloqueos temporales en 7 días**:

**Script**:

**Ejecutar**:

**Salida esperada**:
```
Block 1: 429 Too Many Requests
Block 2: 429 Too Many Requests
Block 3: 403 Forbidden - Permanently Blocked
```

**Verificar en DB**:

**Debe mostrar**:
```
+----+----------+-----------+----------+
| id | ip_address | type    | strikes  |
+----+----------+-----------+----------+
|  1 | 1.2.3.4  | permanent | 3        |
+----+----------+-----------+----------+
```

### 6.5 Pruebas de Smart IA (V4.0)

#### **Prueba 11: Predicción de Bloqueo**

**Simular patrón sospechoso**:

**Script**:

**Ejecutar**:

**Verificar logs**:

**Buscar líneas como**:
```
[SMART_IA] Risk score for 1.2.3.4: 85/100
[SMART_IA] Recommended action: BLOCK_TEMP
[SMART_IA] Predicted duration: 4h 23min
```

#### **Prueba 12: Aprendizaje del Modelo**

**Ver estadísticas de entrenamiento**:

**Endpoint**: `/api/ml/stats`

**Comando**:

**Respuesta esperada**:
```json
{
  "model": {
    "version": "1.0.3",
    "trained_on": 5420,
    "accuracy": 0.94,
    "last_update": "2025-01-15T09:00:00.000Z"
  },
  "predictions": {
    "total": 1234,
    "correct": 1156,
    "false_positives": 45,
    "false_negatives": 33
  }
}
```

### 6.6 Pruebas de Rate Limiting

#### **Prueba 13: Límite Global**

**Según licencia**:
- Basic: 1,000/hora
- Pro: 5,000/hora
- Max: 20,000/hora
- Diamante: Ilimitado

**Para probar (ejemplo con Pro - 5,000/hora)**:

**Script bash**:

**Ejecutar**:

**Salida esperada**:
```
Request 1: 200 OK
Request 2: 200 OK
...
Request 5000: 200 OK
Request 5001: 429 Too Many Requests
```

**Headers en respuesta 429**:
```
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1642248000
Retry-After: 3600
```

#### **Prueba 14: Límite por Endpoint**

**Endpoint de login tiene límite más bajo** (5 intentos / 5 minutos):

**Script**:

**Ejecutar**:

**Salida esperada**:
```
Attempt 1: 401 Unauthorized
Attempt 2: 401 Unauthorized
Attempt 3: 401 Unauthorized
Attempt 4: 401 Unauthorized
Attempt 5: 401 Unauthorized
Attempt 6: 429 Too Many Requests
```

### 6.7 Pruebas de Backups

#### **Prueba 15: Crear Backup Manual**

**Comando**:

**Salida esperada**:
```
Creating backup...
✓ Encrypting with 7 layers...
✓ Storing in hidden database...
✓ Backup created successfully
Backup ID: backup_20250115_103000
Backup Key: 7f9e4a...c2b8d6
Size: 45.2 MB
Location: hidden_backup_db
```

#### **Prueba 16: Listar Backups**

**Comando**:

**Salida esperada**:
```
Available Backups:
+---------------------------+------------+---------------------+
| Backup ID                 | Size       | Created At          |
+---------------------------+------------+---------------------+
| backup_20250115_103000    | 45.2 MB    | 2025-01-15 10:30:00 |
| backup_20250115_040000    | 44.8 MB    | 2025-01-15 04:00:00 |
| backup_20250114_220000    | 44.5 MB    | 2025-01-14 22:00:00 |
+---------------------------+------------+---------------------+
Total: 3 backups, 134.5 MB
```

#### **Prueba 17: Restaurar Backup**

**ADVERTENCIA**: Esto sobrescribirá datos actuales. Solo probar en entorno de prueba.

**Comando**:

**Salida esperada**:
```
WARNING: This will overwrite current data
Are you sure? (yes/no): yes
Restoring backup...
✓ Retrieving from hidden database...
✓ Decrypting layer 7...
✓ Decrypting layer 6...
...
✓ Decrypting layer 1...
✓ Validating integrity...
✓ Restoring to main database...
✓ Backup restored successfully
Restored: 5,420 records
Time: 12.3 seconds
```

#### **Prueba 18: Verificar Integridad de Backup**

**Comando**:

**Salida esperada**:
```
Verifying backup integrity...
✓ Backup exists in hidden database
✓ Encryption layers intact: 7/7
✓ Checksum valid: SHA-256 match
✓ Decryption key valid
✓ No corruption detected
Status: HEALTHY
```

### 6.8 Pruebas de Rotación de Claves

#### **Prueba 19: Rotación Manual**

**Comando**:

**Salida esperada**:
```
Starting key rotation...
✓ Generating new master key...
✓ Activating new key...
✓ Re-encrypting existing data...
  Progress: 100% [====================================] 5420/5420
✓ Verifying re-encryption...
✓ Deactivating old key...
✓ Updating rotation history...
Rotation completed successfully
Duration: 45.2 seconds
Records affected: 5,420
Downtime: < 1ms
```

#### **Prueba 20: Verificar Rotación Automática**

**Verificar que timer está programado**:

**Salida esperada**:
```
NEXT                        LEFT          LAST                        PASSED       UNIT                       ACTIVATES
Sun 2025-01-19 03:00:00 CST 3 days left   Sun 2025-01-12 03:00:00 CST 3 days ago   ultrasecure-rotation.timer ultrasecure-rotation.service
```

**Ver historial de rotaciones en DB**:

**Debe mostrar rotaciones previas**:
```
+----+-------------+-------------+---------------------+------------------+
| id | old_key_id  | new_key_id  | rotated_at          | records_affected |
+----+-------------+-------------+---------------------+------------------+
|  1 | key_v1      | key_v2      | 2025-01-05 03:00:00 | 4820             |
|  2 | key_v2      | key_v3      | 2025-01-12 03:00:00 | 5130             |
+----+-------------+-------------+---------------------+------------------+
```

### 6.9 Pruebas de Performance

#### **Prueba 21: Test de Carga**

**Instalar herramienta de load testing**:

**Ejecutar test de carga**:

**Parámetros**:
- 100 usuarios virtuales
- Durante 60 segundos
- Endpoint `/api/users`

**Métricas a observar**:
- **Throughput**: Requests por segundo
  - Basic: > 100 req/s
  - Pro: > 500 req/s
  - Max: > 2,000 req/s
  - Diamante: > 10,000 req/s
- **Latencia (p95)**: < 100ms
- **Tasa de error**: < 1%

**Interpretar resultados**:

Si performance es baja:
- Verificar recursos de hardware (CPU, RAM)
- Optimizar consultas de DB
- Aumentar workers de Node.js
- Habilitar caching más agresivo

#### **Prueba 22: Test de Cifrado Masivo**

**Objetivo**: Verificar que cifrado no genera cuello de botella.

**Script**:

**Ejecutar**:

**Métricas esperadas**:
- **Tiempo total**: < 10 segundos
- **Ops/segundo**: > 100
- **Sin errores**

### 6.10 Pruebas de Seguridad

#### **Prueba 23: Escaneo de Vulnerabilidades**

**Usar herramientas de seguridad**:

**Nikto** (escáner de vulnerabilidades web):

**Ejecutar**:

**Verificar que NO detecte**:
- Versiones de software expuestas
- Directorios listables
- Vulnerabilidades conocidas
- Configuraciones inseguras

**OWASP ZAP** (escáner de seguridad):

**Ejecutar**:

**Verificar protecciones**:
- SQL Injection: Protegido
- XSS: Protegido
- CSRF: Protegido
- Clickjacking: Protegido

#### **Prueba 24: Penetration Testing**

**Intentar ataques comunes**:

**1. SQL Injection**:

**Debe retornar**: 400 Bad Request o filtrar caracteres

**2. XSS**:

**Debe sanitizar**: Output escapado, no ejecuta script

**3. CSRF**:

**Debe fallar**: 403 Forbidden sin CSRF token válido

**4. Path Traversal**:

**Debe bloquear**: 403 Forbidden

**5. Brute Force**:

**Debe bloquear**: Después de 5 intentos → 429 o 403

#### **Prueba 25: Verificar Headers de Seguridad**

**Comando**:

**Headers que deben estar presentes**:
```
HTTP/2 200
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; ...
Referrer-Policy: strict-origin-when-cross-origin
```

**Si faltan headers**:
- Configurar en Nginx
- O configurar en código de backend

### 6.11 Pruebas de Recuperación ante Desastres

#### **Prueba 26: Simulación de Falla de Base de Datos**

**SOLO EN ENTORNO DE PRUEBA**

**Paso 1**: Detener MySQL

**Paso 2**: Intentar acceder a aplicación

**Resultado esperado**:
- Frontend muestra error de conexión
- Backend logea error y no crashea
- Health check retorna status degraded

**Paso 3**: Reiniciar MySQL

**Paso 4**: Verificar que aplicación se recupera automáticamente

#### **Prueba 27: Simulación de Falla de Redis**

**Paso 1**: Detener Redis

**Paso 2**: Intentar acceder a aplicación

**Resultado esperado**:
- Aplicación funciona pero sin cache (más lento)
- Rate limiting puede no funcionar temporalmente
- Backend logea warnings pero no crashea

**Paso 3**: Reiniciar Redis

**Paso 4**: Verificar que aplicación retoma funcionamiento normal

#### **Prueba 28: Simulación de Crash de Backend**

**Paso 1**: Matar proceso de backend

**Paso 2**: Verificar que systemd lo reinicia automáticamente

**Resultado esperado**:
- Servicio se reinicia en < 5 segundos
- Usuarios experimentan breve interrupción
- No hay pérdida de datos

### 6.12 Checklist de Verificación Final

Antes de declarar el sistema como productivo:

**Servicios**:
- [ ] Backend running y respondiendo
- [ ] Frontend running (V4.0)
- [ ] MySQL running
- [ ] Redis running
- [ ] Nginx running (si aplica)
- [ ] Fail2ban running
- [ ] Timers de rotación y backup activos

**Funcionalidad Básica**:
- [ ] Health check retorna 200 OK
- [ ] Login funciona correctamente
- [ ] Endpoints protegidos requieren autenticación
- [ ] Frontend carga y es navegable (V4.0)

**Cifrado**:
- [ ] Datos se cifran correctamente
- [ ] Datos se descifran correctamente
- [ ] Número de capas según licencia
- [ ] Detección de manipulación funciona

**Request Blocker**:
- [ ] Bloqueo temporal funciona
- [ ] Auto-desbloqueo funciona
- [ ] Bloqueo permanente funciona
- [ ] Registros en BD son correctos

**Smart IA** (V4.0):
- [ ] Modelo está cargado
- [ ] Predicciones funcionan
- [ ] Bloqueos variables funcionan
- [ ] Aprendizaje continuo activo

**Rate Limiting**:
- [ ] Límite global se respeta según licencia
- [ ] Límite por endpoint funciona
- [ ] Headers de rate limit presentes en respuestas

**Backups**:
- [ ] Backups manuales funcionan
- [ ] Backups se cifran con N capas
- [ ] Listar backups funciona
- [ ] Restaurar backup funciona
- [ ] Backups automáticos programados

**Rotación de Claves**:
- [ ] Rotación manual funciona
- [ ] Re-cifrado completo funciona
- [ ] Zero-downtime confirmado
- [ ] Rotación automática programada

**Performance**:
- [ ] Throughput según licencia
- [ ] Latencia < 100ms (p95)
- [ ] Cifrado no genera cuello de botella
- [ ] Sin memory leaks

**Seguridad**:
- [ ] Sin vulnerabilidades críticas detectadas
- [ ] Headers de seguridad presentes
- [ ] Ataques comunes bloqueados
- [ ] Penetration testing pasado

**Recuperación**:
- [ ] Sistema se recupera de falla de MySQL
- [ ] Sistema se recupera de falla de Redis
- [ ] Sistema se recupera de crash de backend
- [ ] Plan de DR documentado y probado

**Si TODO está ✅, el sistema está verificado y listo para producción.**

---

## 7. GESTIÓN DE LICENCIAS

### 7.1 Tipos de Licencias Disponibles

Ultra Secure System usa un sistema de licenciamiento por tiers (niveles).

#### **V3.0 y V3.0 + Request Blocker:**

- **Licencia Perpetua**: Pago único, uso indefinido
- **Licencia por Proyecto**: Pago por proyecto específico
- **Sin validación automática**: Manual por contrato

#### **V4.0 Smart IA - Global Infiniti:**

Sistema de licenciamiento automático y dinámico.

**4 Tiers Disponibles:**

**1. Global Infiniti Basic - $9,999/año**
- 1 nodo
- 100 usuarios concurrentes
- 3 capas de cifrado
- 100 GB storage
- Rate limit: 1,000 requests/hora
- Soporte: Email (respuesta en 24h)
- SLA: 99% uptime

**2. Global Infiniti Pro - $24,999/año**
- 3 nodos sincronizados
- 1,000 usuarios concurrentes
- 7 capas de cifrado
- Smart IA activada ✅
- 500 GB storage
- Rate limit: 5,000 requests/hora
- Soporte: Email prioritario (respuesta en 4h)
- SLA: 99.5% uptime

**3. Global Infiniti Max - $49,999/año**
- 10 nodos sincronizados
- 10,000 usuarios concurrentes
- 10 capas de cifrado
- Smart IA activada ✅
- GPU acceleration ✅
- Quantum-resistant algorithms ✅
- 2 TB storage
- Rate limit: 20,000 requests/hora
- Soporte: Teléfono 24/7
- SLA: 99.9% uptime

**4. Global Infiniti Diamante - $99,999/año**
- ∞ nodos ilimitados
- ∞ usuarios ilimitados
- 10 capas de cifrado
- Smart IA activada ✅
- GPU acceleration ✅
- Quantum-resistant algorithms ✅
- ∞ storage ilimitado
- Rate limit: ∞ ilimitado
- Soporte: Ingeniero dedicado 24/7
- SLA: 99.999% uptime (five nines)

### 7.2 Formato de Licencia

**Licencias V4.0 tienen formato**:
```
USS4-XXXX-XXXX-XXXX-XXXX
```

Donde:
- `USS4`: Ultra Secure System Version 4
- `XXXX-XXXX-XXXX-XXXX`: Código único de 16 caracteres

**Ejemplo de licencia real**:
```
USS4-B4S1-C2K9-M3L7-P6F8
```

Desglose:
- `B4S1`: Tier (Basic)
- `C2K9`: ID de cliente
- `M3L7`: Fecha de expiración codificada
- `P6F8`: Checksum de validación

### 7.3 Cómo Obtener una Licencia

#### **Paso 1: Visitar Portal de Licencias**

URL: `https://ultrasecure.com/licenses`

#### **Paso 2: Seleccionar Tier**

- Comparar características
- Calcular necesidades (usuarios, nodos, storage)
- Elegir tier apropiado

#### **Paso 3: Completar Formulario**

Información requerida:
- Nombre de empresa
- Email de contacto
- Tipo de industria
- Tamaño de empresa
- Uso previsto
- Información de facturación

#### **Paso 4: Pago**

Métodos aceptados:
- Tarjeta de crédito
- Transferencia bancaria
- PayPal (Business)
- Criptomonedas (para Diamante)

#### **Paso 5: Recibir Licencia**

En 2-4 horas recibirás:
- Email de confirmación
- Archivo `license.key` con código de licencia
- Factura
- Instrucciones de activación
- Acceso al portal del cliente

### 7.4 Instalar Licencia

#### **Durante Instalación Inicial:**

**Opción A**: Archivo license.key

- Guardar archivo `license.key` en directorio raíz del proyecto
- Ejecutar script de instalación
- Script detecta y valida licencia automáticamente

**Opción B**: Manual

- Durante instalación, script preguntará por código de licencia
- Ingresar código cuando se solicite
- Script valida y continúa

#### **En Sistema Ya Instalado:**

**Paso 1**: Copiar archivo de licencia al servidor

**Paso 2**: Ejecutar comando de actualización de licencia

**Paso 3**: Reiniciar servicios

**Paso 4**: Verificar nueva licencia

### 7.5 Validación Automática de Licencia

El sistema valida la licencia automáticamente:

**Al iniciar**:
- Lee archivo `license.key`
- Verifica formato
- Valida checksum
- Verifica fecha de expiración
- Contacta servidor de licencias (requiere internet)
- Activa características según tier

**Durante operación**:
- Cada 24 horas verifica validez
- Si expira, envía alertas 30, 15, 7, 3, 1 día(s) antes
- Si detecta uso no autorizado → SUSPENDE automáticamente

**Suspensión automática ocurre si**:
- Licencia expiró
- Excede límites de tier (usuarios, nodos, storage)
- Usa características no incluidas (Smart IA en Basic, GPU sin Max/Diamante)
- Detecta manipulación del archivo de licencia
- No puede conectar con servidor de validación por > 7 días

### 7.6 Actualizar (Upgrade) de Tier

#### **Ejemplo: Basic → Pro**

**Paso 1**: Contactar ventas

Email: `sales@ultrasecure.com`
Asunto: "License Upgrade Request"

**Paso 2**: Pagar diferencia

Pro $24,999 - Basic $9,999 = **$15,000** (prorrateado según tiempo restante)

**Paso 3**: Recibir nueva licencia

**Paso 4**: Instalar nueva licencia

**Paso 5**: Reiniciar servicios

**Paso 6**: Verificar nuevo tier

**Cambios que ocurren automáticamente**:
- Capas de cifrado: 3 → 7
- Smart IA se activa
- Rate limit: 1,000 → 5,000/hora
- Nodos permitidos: 1 → 3
- Storage: 100 GB → 500 GB

**NO requiere reinstalación completa**, solo actualizar licencia.

### 7.7 Degradar (Downgrade) de Tier

**Ejemplo: Pro → Basic**

**NO recomendado durante periodo activo**. Esperar a renovación anual.

**Si es necesario**:

**Paso 1**: Contactar soporte

**Paso 2**: Confirmar que uso actual está dentro de límites de Basic
- ≤ 1 nodo
- ≤ 100 usuarios
- ≤ 100 GB storage

**Paso 3**: Hacer backup completo

**Paso 4**: Recibir nueva licencia Basic

**Paso 5**: Instalar nueva licencia

**ADVERTENCIA**: El sistema automáticamente:
- Desactiva Smart IA
- Reduce capas de cifrado de 7 a 3
- Reduce rate limit a 1,000/hora
- Si tienes > 1 nodo, desactiva nodos adicionales

**Puede causar interrupciones**. Programar en ventana de mantenimiento.

### 7.8 Renovación de Licencia

Las licencias V4.0 son anuales y requieren renovación.

#### **Proceso de Renovación:**

**90 días antes de expiración**:
- Email de recordatorio
- Opción de renovación anticipada con descuento (5%)

**30 días antes**:
- Email de recordatorio urgente
- Alerta en dashboard

**7 días antes**:
- Email diario
- Alerta crítica en dashboard
- Notificación a todos los admins

**1 día antes**:
- Email cada 6 horas
- Banner en toda la interfaz
- Push notification (si configurado)

**Al expirar**:
- Sistema se SUSPENDE automáticamente
- Solo funciones de emergencia disponibles:
  - Ver datos existentes (lectura)
  - Hacer backups
  - Exportar datos
- NO permite:
  - Crear nuevos datos
  - Login de usuarios no-admin
  - Usar APIs

**Renovar**:

**Paso 1**: Acceder a portal del cliente

**Paso 2**: Click en "Renew License"

**Paso 3**: Confirmar tier (o upgrade)

**Paso 4**: Pagar

**Paso 5**: Nueva licencia se envía automáticamente por email

**Paso 6**: Instalar nueva licencia

**Paso 7**: Sistema se reactiva inmediatamente

### 7.9 Licencias para Múltiples Entornos

**¿Necesitas licencias separadas para dev, staging, producción?**

**Sí**, pero hay descuentos:

**Paquete Multi-Entorno**:
- **Producción**: Licencia completa (100%)
- **Staging**: 50% del costo
- **Desarrollo**: 25% del costo

**Ejemplo para Pro**:
- Producción: $24,999
- Staging: $12,500
- Desarrollo: $6,250
- **Total**: $43,749 (vs $74,997 sin descuento)

**Cada entorno tiene su propia licencia**:
```
USS4-PROD-C2K9-M3L7-P6F8  (Producción)
USS4-STAG-C2K9-M3L7-Q7G9  (Staging)
USS4-DEVO-C2K9-M3L7-R8H0  (Desarrollo)
```

**Limitaciones de licencias no-producción**:
- Staging: Solo 10% de usuarios de producción
- Desarrollo: Solo 10 usuarios simultáneos
- Ambas: Watermark "NON-PRODUCTION" en dashboard

### 7.10 Licencias para Múltiples Nodos

**Pro, Max y Diamante permiten múltiples nodos.**

#### **Pro (3 nodos)**:

Costo incluido en $24,999. NO se paga extra por nodo.

**Configuración**:
- Nodo 1 (Principal): Instalación completa
- Nodo 2: Replica sincronizada
- Nodo 3: Replica sincronizada

**Misma licencia en los 3 nodos**:

Cada nodo valida la licencia y verifica que:
- Número total de nodos activos ≤ 3
- Si intentas activar nodo 4 → RECHAZADO

#### **Max (10 nodos)**:

Igual que Pro pero hasta 10 nodos.

#### **Diamante (∞ nodos)**:

Sin límite. Puedes tener tantos nodos como necesites.

**Cada nodo adicional requiere**:
- Hardware según especificaciones
- Conectividad con nodo principal
- Configuración de replicación

**NO requiere**:
- Licencia adicional
- Configuración manual (auto-discovery)

### 7.11 Transferencia de Licencia

**¿Puedes transferir licencia a otro servidor?**

**Sí**, pero con limitaciones:

#### **Transferencia Temporal (Migración):**

**Paso 1**: Contactar soporte con 24h de anticipación

**Paso 2**: Desactivar licencia en servidor original

**Paso 3**: Recibir código de transferencia

**Paso 4**: Activar en nuevo servidor con código

**Límite**: 2 transferencias por año

#### **Transferencia Permanente:**

**Paso 1**: Contactar soporte

**Paso 2**: Pagar fee de transferencia ($500)

**Paso 3**: Desactivar licencia permanentemente en servidor original

**Paso 4**: Activar en nuevo servidor

**Sin límites** después de pagar fee.

#### **Transferencia entre Empresas:**

**No permitido**. Licencia está atada a:
- Nombre de empresa
- Tax ID
- Email de contacto

Para transferir a otra empresa:
- Cancelar licencia actual
- Nueva empresa debe comprar licencia nueva

### 7.12 Auditoría de Licencias

El sistema mantiene log completo de uso de licencia.

**Información auditada**:
- Activaciones
- Desactivaciones
- Intentos de uso no autorizado
- Cambios de tier
- Renovaciones
- Transferencias

**Acceder a log de auditoría**:

**Formato del log**:
```
[2025-01-15 10:00:00] LICENSE_ACTIVATED - Tier: Pro, Server: prod-server-01
[2025-01-15 10:00:01] FEATURES_ENABLED - smart_ia: true, gpu: false, nodes: 3
[2025-01-20 14:23:45] USAGE_CHECK - Users: 234/1000, Nodes: 2/3, Storage: 156GB/500GB
[2025-02-01 08:00:00] RENEWAL_REMINDER - 45 days until expiration
```

**Ultra Secure (empresa) también audita**:
- Servidor de licencias mantiene registro de todas las activaciones
- Detecta uso anómalo (múltiples activaciones simultáneas)
- Alertas de cumplimiento enviadas mensualmente

### 7.13 Problemas Comunes con Licencias

#### **Problema 1: "Invalid License Key"**

**Causas**:
- Código escrito incorrectamente (typo)
- Archivo license.key corrupto
- Licencia no es para V4.0 (es para V3.0)

**Solución**:
- Verificar código letra por letra
- Re-descargar archivo license.key desde portal
- Contactar soporte si persiste

#### **Problema 2: "License Expired"**

**Causas**:
- Licencia venció
- Renovación no procesada

**Solución**:
- Renovar inmediatamente en portal
- Instalar nueva licencia
- Si ya renovaste pero no llegó, contactar soporte urgente

#### **Problema 3: "License Limit Exceeded"**

**Causas**:
- Más usuarios de los permitidos
- Más nodos de los permitidos
- Más storage del permitido

**Solución**:
- Upgrade de tier
- O reducir uso para estar dentro de límites
- Revisar métricas: `/api/license/usage`

#### **Problema 4: "Cannot Connect to License Server"**

**Causas**:
- Sin internet
- Firewall bloqueando
- Servidor de licencias caído

**Solución**:
- Verificar conectividad: `ping license.ultrasecure.com`
- Verificar firewall permite salida al puerto 443
- Gracia de 7 días sin conexión antes de suspender

#### **Problema 5: "License Suspended - Unauthorized Features Detected"**

**Causas**:
- Intentaste usar Smart IA con licencia Basic
- Intentaste usar más nodos de los permitidos
- Intentaste usar GPU sin licencia Max/Diamante

**Solución**:
- Desactivar característica no autorizada
- O upgrade de tier
- Contactar soporte para reactivación

### 7.14 Soporte de Licencias

**Problemas con licencias**:

**Email**: `licensing@ultrasecure.com`
**Teléfono** (Max/Diamante): +1-XXX-XXX-XXXX
**Portal**: `https://ultrasecure.com/support/licensing`
**Chat** (horario laboral): En portal del cliente

**Información a proporcionar**:
- Código de licencia
- Tier actual
- Mensaje de error completo
- Archivo de log: `/var/log/ultrasecure/license.log`

**Tiempos de respuesta**:
- Basic: 24 horas
- Pro: 4 horas
- Max: 1 hora
- Diamante: 15 minutos

---

## 8. MÓDULOS Y CARACTERÍSTICAS

### 8.1 Módulo de Cifrado

**Responsable de toda la criptografía del sistema.**

#### **Algoritmos Utilizados:**

**Capa 1 - Argon2id (KDF - Key Derivation Function)**:
- **Propósito**: Derivar clave de cifrado desde master key
- **Configuración**:
  - Memory cost: 65536 (64 MB)
  - Time cost: 3 iteraciones
  - Parallelism: 4 threads
- **Resistente a**: Ataques GPU, ASIC, rainbow tables

**Capa 2 - AES-256-GCM (AEAD)**:
- **Propósito**: Cifrado simétrico con autenticación
- **Características**:
  - Tamaño de clave: 256 bits
  - Modo: Galois/Counter Mode
  - Tag de autenticación: 128 bits
  - IV: 96 bits aleatorios únicos
- **Ventajas**: Rápido, seguro, detecta manipulación

**Capa 3 - ChaCha20-Poly1305 (AEAD)**:
- **Propósito**: Cifrado alternativo a AES
- **Características**:
  - Tamaño de clave: 256 bits
  - Nonce: 96 bits
  - Tag: 128 bits
- **Ventajas**: Mejor en hardware sin aceleración AES

**Capas Adicionales (Pro/Max/Diamante)**:

4. **Camellia-256-CBC**: Algoritmo japonés, muy seguro
5. **Twofish-256**: Finalista AES, muy robusto
6. **Serpent-256**: Finalista AES, seguridad extrema
7. **Blowfish-448**: Rápido, clave variable hasta 448 bits
8. **CAST-256**: Algoritmo canadiense, muy eficiente
9. **IDEA-128**: Estándar suizo, muy confiable
10. **MARS-256**: Algoritmo de IBM, complejidad alta

#### **Flujo de Cifrado:**

**Entrada**: Texto plano + Master key

**Paso 1**: Derivar sub-claves con Argon2id
```
subkey_1 = Argon2id(master_key, salt_1)
subkey_2 = Argon2id(master_key, salt_2)
...
```

**Paso 2**: Aplicar primera capa (AES-256-GCM)
```
ciphertext_1 = AES-256-GCM.encrypt(plaintext, subkey_1, iv_1)
```

**Paso 3**: Aplicar segunda capa (ChaCha20-Poly1305)
```
ciphertext_2 = ChaCha20-Poly1305.encrypt(ciphertext_1, subkey_2, nonce_2)
```

**Paso 4**: Aplicar capas adicionales (según licencia)
```
ciphertext_3 = Camellia-256.encrypt(ciphertext_2, subkey_3, iv_3)
...hasta capa N
```

**Paso 5**: Generar metadata
```
metadata = {
  version: "4.0",
  layers: N,
  algorithms: ["argon2id", "aes256gcm", ...],
  created_at: timestamp,
  expires_at: timestamp + 24h
}
```

**Paso 6**: Calcular HMAC para integridad
```
hmac = HMAC-SHA256(ciphertext_final, hmac_key)
```

**Salida**: JSON con ciphertext + metadata + HMAC

#### **Flujo de Descifrado:**

**Entrada**: JSON cifrado + Master key

**Paso 1**: Parsear JSON y validar estructura

**Paso 2**: Verificar HMAC (integridad)
```
if HMAC(ciphertext) != hmac_stored:
    throw Error("INTEGRITY COMPROMISED")
```

**Paso 3**: Verificar que no esté expirado
```
if now() > expires_at:
    throw Error("PACKAGE EXPIRED")
```

**Paso 4**: Derivar sub-claves (mismo proceso que cifrado)

**Paso 5**: Descifrar capa por capa (orden inverso)
```
ciphertext_N-1 = Algorithm_N.decrypt(ciphertext_N, subkey_N)
...
ciphertext_1 = ChaCha20-Poly1305.decrypt(ciphertext_2, subkey_2)
plaintext = AES-256-GCM.decrypt(ciphertext_1, subkey_1)
```

**Paso 6**: Validar autenticación de cada capa (AEAD)

**Salida**: Texto plano original

**Si falla cualquier paso**: Error y NO retorna nada (fail-fast)

#### **Uso del Módulo:**

**Cifrar**:

**Descifrar**:

**Rotar clave y re-cifrar**:

### 8.2 Módulo de Gestión de Claves (Vault)

**Responsable de almacenar y rotar claves maestras.**

#### **Arquitectura del Vault:**

**Base de Datos Separada**:
- Nombre: `encryption_vault`
- Usuario específico: `vault_master`
- Permisos mínimos: Solo SELECT, INSERT, UPDATE en tablas de claves
- Puerto no expuesto públicamente

**Tablas Principales**:

**master_keys**:
```
id: INT PRIMARY KEY
key_data: TEXT (cifrado con vault_password)
version: VARCHAR(10) UNIQUE
created_at: TIMESTAMP
expires_at: TIMESTAMP
status: ENUM('active', 'rotating', 'inactive', 'revoked')
```

**rotation_history**:
```
id: INT PRIMARY KEY
old_key_id: INT FOREIGN KEY
new_key_id: INT FOREIGN KEY
rotated_at: TIMESTAMP
rotated_by: VARCHAR(50)
records_affected: INT
duration_seconds: INT
```

**key_metadata**:
```
key_id: INT FOREIGN KEY
algorithm: VARCHAR(20)
key_size: INT
created_by: VARCHAR(50)
purpose: VARCHAR(100)
```

#### **Operaciones del Vault:**

**1. Obtener Clave Activa:**

**2. Crear Nueva Clave:**

**3. Rotar Claves (Zero-Downtime):**

**Proceso de rotación paso a paso**:

**Paso A - Preparación**:
- Crear nueva clave maestra
- Marcar como 'pending'
- NO activar todavía

**Paso B - Fase de Transición (1-2 segundos)**:
- Activar nueva clave
- Mantener vieja clave activa temporalmente
- Sistema puede usar ambas para leer

**Paso C - Re-cifrado en Background**:
- Obtener todos los registros cifrados con clave vieja
- Leer en batches de 100
- Descifrar con clave vieja
- Re-cifrar con clave nueva
- Actualizar en DB
- Repetir hasta completar todos los registros

**Paso D - Finalización**:
- Marcar clave vieja como 'inactive'
- Eliminar de uso activo
- Guardar en historial por auditoría
- Notificar administradores

**Downtime total**: < 1ms (solo el cambio de estado)

**Tiempo de re-cifrado**: Variable según cantidad de datos
- 1,000 registros: ~5 segundos
- 10,000 registros: ~45 segundos
- 100,000 registros: ~7 minutos
- 1,000,000 registros: ~70 minutos

**Durante re-cifrado**:
- Sistema sigue funcionando normalmente
- Lecturas usan ambas claves (vieja y nueva)
- Escrituras usan solo clave nueva
- Usuarios no notan interrupción

#### **Programación de Rotación Automática:**

**Por defecto**: Cada domingo a las 3 AM

**Configurar frecuencia**:

**Desactivar rotación automática** (no recomendado):

### 8.3 Módulo Request Blocker

**Responsable de detectar y bloquear comportamientos sospechosos.**

#### **Tipos de Detección:**

**1. Por IP Address:**
- Registra cada request con IP origen
- Cuenta requests por ventana de tiempo
- Si excede límite → Bloquea

**2. Por Hardware Fingerprint:**
- Recopila características del navegador/dispositivo:
  - Canvas fingerprint
  - WebGL fingerprint
  - Fonts instaladas
  - Plugins del navegador
  - Resolución de pantalla
  - Zona horaria
  - Idioma
- Genera hash único
- Detecta si mismo fingerprint desde múltiples IPs (sospechoso)

**3. Por Patrón de Comportamiento:**
- Endpoints accedidos
- Orden de acceso
- Tiempo entre requests
- User-Agent
- Referrer
- Parámetros en requests

#### **Tipos de Bloqueo:**

**1. Temporal (2 horas default):**

**Trigger**:
- 5+ intentos de login fallidos en 5 minutos
- 100+ requests en 1 minuto (posible DDoS)
- Acceso a endpoints no existentes (escáner de vulnerabilidades)

**Acción**:
- Bloquear IP por 2 horas
- Registrar en tabla `blocked_ips` con type='temp'
- Incrementar strike counter
- Enviar notificación a admins

**Auto-desbloqueo**:
- Después de 2 horas (expires_at)
- Cronjob cada 5 minutos elimina registros expirados

**2. Permanente:**

**Trigger**:
- 3+ bloqueos temporales en 7 días (strikes >= 3)
- Detección de ataque activo (SQL injection, XSS, etc.)
- Bloqueo manual por administrador

**Acción**:
- Bloquear IP permanentemente (expires_at = NULL)
- type='permanent'
- Requiere desbloqueo manual por 2 administradores

**3. Manual:**

**Administrador puede bloquear directamente**:

**Administrador puede desbloquear**:

**4. Preventivo por Smart IA (V4.0):**

**IA predice ataque antes de que ocurra**:
- Analiza patrón de comportamiento
- Compara con ataques conocidos
- Si risk_score > 85 → Bloquea preventivamente

**Acción**:
- Bloqueo temporal preventivo (30 min - 4 horas)
- Duración calculada por IA según factores
- Se aprende del resultado (falso positivo o verdadero ataque)

#### **Tabla de Bloqueos:**

**Estructura**:
```
blocked_ips:
  id: INT PRIMARY KEY
  ip_address: VARCHAR(45)
  fingerprint: VARCHAR(64)
  reason: TEXT
  blocked_at: TIMESTAMP
  expires_at: TIMESTAMP NULL
  type: ENUM('temp', 'permanent', 'manual', 'preventive')
  strikes: INT DEFAULT 1
  false_positive: BOOLEAN DEFAULT false
```

**Índices**:
```
INDEX idx_ip (ip_address)
INDEX idx_fingerprint (fingerprint)
INDEX idx_expires (expires_at)
INDEX idx_type (type)
```

#### **Flujo de Verificación:**

**En cada request**:

**Paso 1**: Extraer IP y fingerprint

**Paso 2**: Consultar tabla blocked_ips

**Paso 3**: Si encontrado:
- Si type='temp' y expires_at > now() → Bloquear (429 Too Many Requests)
- Si type='permanent' → Bloquear (403 Forbidden)
- Si type='temp' y expires_at < now() → Eliminar registro y permitir

**Paso 4**: Si NO bloqueado:
- Registrar request en log
- Analizar patrón con Smart IA (V4.0)
- Verificar rate limits
- Permitir o bloquear según análisis

#### **Notificaciones:**

**Email**:
```
To: admin@empresa.com
Subject: [SECURITY ALERT] IP Blocked - 1.2.3.4
Body:
IP Address: 1.2.3.4
Fingerprint: 7f9e4a...
Reason: Multiple failed login attempts (5 in 2 minutes)
Blocked At: 2025-01-15 10:30:00
Type: Temporary
Expires: 2025-01-15 12:30:00
Action Required: None (auto-unblock)
```

**Slack**:
```
🚨 Security Alert
IP 1.2.3.4 has been blocked
Reason: Multiple failed logins
Duration: 2 hours
View details: https://panel.empresa.com/blocks/12345
```

**PagerDuty** (Max/Diamante):
```
Severity: WARNING
Service: Ultra Secure System
Message: IP 1.2.3.4 blocked - Type: Permanent
Details: 3 strikes in 7 days
Incident ID: #12345
```

### 8.4 Módulo Smart IA (V4.0)

**Responsable de aprendizaje automático y bloqueos inteligentes.**

#### **Arquitectura del ML:**

**Framework**: TensorFlow.js (Node.js)

**Modelos**:
1. **Clasificador Binario**: Ataque vs. Legítimo
2. **Regresor**: Duración de bloqueo óptima
3. **Clustering**: Detectar patrones anómalos

**Datos de Entrenamiento**:
```
ml_training_data:
  id: INT PRIMARY KEY
  timestamp: TIMESTAMP
  features: JSON
  label: ENUM('attack', 'legitimate')
  used_for_training: BOOLEAN
  prediction_correct: BOOLEAN NULL
```

**Features (características) recopiladas**:
```
{
  hour_of_day: 0-23,
  day_of_week: 0-6 (0=domingo),
  requests_last_hour: INT,
  requests_last_day: INT,
  requests_last_week: INT,
  unique_endpoints: INT,
  error_rate: FLOAT (0-1),
  avg_response_time: FLOAT (ms),
  user_agent: STRING,
  country: STRING,
  isp: STRING,
  fingerprint_changes: INT,
  suspicious_params: BOOLEAN,
  known_attack_pattern: BOOLEAN
}
```

#### **Entrenamiento del Modelo:**

**Fase Inicial (primeros 7 días)**:
- Sistema opera en modo "aprendizaje"
- No hace bloqueos automáticos (solo manual/temporal clásico)
- Recopila mínimo 1,000 eventos etiquetados
- Administrador revisa y etiqueta eventos ambiguos

**Fase de Entrenamiento**:
- Cada 1,000 nuevos eventos (configurable)
- O cada 24 horas (lo que ocurra primero)
- Proceso:
  1. Obtener datos etiquetados de DB
  2. Dividir en train (80%) / test (20%)
  3. Entrenar modelo por 50 epochs
  4. Validar accuracy en test set
  5. Si accuracy > 90% → Actualizar modelo en producción
  6. Si accuracy < 90% → Mantener modelo anterior, seguir recopilando datos

**Actualización Continua**:
- Cada predicción se registra
- Resultado real (fue ataque o no) se registra después
- Modelo aprende de errores:
  - Falsos positivos: Ajustar hacia abajo
  - Falsos negativos: Ajustar hacia arriba
- Pesos del modelo se actualizan incrementalmente

#### **Predicción en Tiempo Real:**

**En cada request**:

**Paso 1**: Extraer features

**Paso 2**: Normalizar valores

**Paso 3**: Pasar al modelo

**Paso 4**: Obtener predicción:
```
{
  risk_score: 0-100,
  classification: 'attack' | 'legitimate',
  confidence: 0-1,
  recommended_action: 'allow' | 'block_temp' | 'block_permanent',
  block_duration: 1800-28800 (segundos, si aplica)
}
```

**Paso 5**: Tomar acción según predicción

**Si classification='attack' y confidence > 0.85**:
- Bloquear temporalmente
- Duración = block_duration calculada por modelo
- Registrar para feedback futuro

**Si classification='legitimate' o confidence < 0.85**:
- Permitir
- Si confidence baja (0.5-0.85), marcar para revisión manual

#### **Bloqueos Variables:**

**A diferencia de bloqueos fijos (2 horas siempre), IA calcula duración óptima.**

**Factores que influyen**:

**1. Hora del Día:**
- Noche (00:00-06:00): +50% duración (más sospechoso)
- Horario laboral (09:00-18:00): Duración normal
- Fuera de horario (18:00-23:00): +20% duración

**2. Día de la Semana:**
- Fin de semana: +30% duración (menos tráfico legítimo esperado)
- Días laborales: Duración normal
- Festivos: +40% duración

**3. Historial del Usuario:**
- Primera vez: Duración mínima (30 min)
- Segunda vez: +50%
- Tercera vez: +100%
- Más de 3: Considerar permanente

**4. Severidad del Ataque:**
- Intentos de login fallidos: 1-2 horas
- SQL Injection detectado: 4-8 horas
- DDoS detectado: 12-24 horas
- Combinación de ataques: 24-48 horas

**5. Geolocalización:**
- País conocido y legítimo: Duración normal
- País de alto riesgo: +50%
- País en lista negra: +100%

**6. Variabilidad Aleatoria:**
- ±20% aleatorio
- Evita que atacantes calculen tiempos exactos
- Hace bloqueos impredecibles

**Ejemplos**:

**Caso 1**: Login fallido, martes 14:00, primera vez, España
```
Base: 2 horas (7200s)
Hora: 14:00 → x1.0 (normal)
Día: Martes → x1.0 (normal)
Historial: Primera → x0.5 (mínimo)
País: España → x1.0 (normal)
Aleatorio: x0.92
Total: 7200 * 1.0 * 1.0 * 0.5 * 1.0 * 0.92 = 3312s = 55 minutos
```

**Caso 2**: DDoS, sábado 03:00, tercera vez, China
```
Base: 12 horas (43200s)
Hora: 03:00 → x1.5 (noche)
Día: Sábado → x1.3 (fin de semana)
Historial: Tercera → x2.0 (múltiples intentos)
País: China → x1.5 (alto riesgo)
Aleatorio: x1.15
Total: 43200 * 1.5 * 1.3 * 2.0 * 1.5 * 1.15 = 172,476s = 47.9 horas
```

**Caso 3**: SQL Injection, viernes 20:00, primera vez, EE.UU.
```
Base: 6 horas (21600s)
Hora: 20:00 → x1.2 (fuera de horario)
Día: Viernes → x1.0 (laboral)
Historial: Primera → x0.5 (mínimo)
País: EE.UU. → x1.0 (normal)
Aleatorio: x0.88
Total: 21600 * 1.2 * 1.0 * 0.5 * 1.0 * 0.88 = 11,404s = 3.2 horas
```

**Resultado**: Cada bloqueo tiene duración única e impredecible.

#### **Métricas del Modelo:**

**Accesibles vía API** `/api/ml/stats`:
```
{
  model: {
    version: "1.2.5",
    trained_on: 15420,
    accuracy: 0.94,
    precision: 0.92,
    recall: 0.96,
    f1_score: 0.94,
    last_update: "2025-01-15T09:00:00.000Z"
  },
  predictions: {
    total: 45230,
    correct: 42516,
    false_positives: 1120,
    false_negatives: 1594,
    pending_verification: 320
  },
  blocks: {
    total: 1420,
    temporary: 1250,
    permanent: 85,
    preventive: 85,
    avg_duration: 8340
  }
}
```

### 8.5 Módulo de Backups (V4.0)

**Responsable de backups cifrados multicapa.**

#### **Características:**

**Backups Locales**:
- Frecuencia: Cada 6 horas (configurable)
- Ubicación: `/var/backups/ultrasecure/`
- Formato: SQL dump + metadata
- Cifrado: Según licencia (3-10 capas)
- Retención: 30 días

**Backups en Base de Datos Oculta** (V4.0):
- Base de datos completamente separada
- Nombre aleatorio (ej: `bk_9f7e4c2a`)
- Usuario aleatorio (ej: `bkuser_7a3f`)
- Password: 128 caracteres aleatorios
- Invisible para usuarios normales
- Solo roles `admin` y `backup_manager`

**Cifrado de Backups**:
- Cada backup se cifra con 10 algoritmos secuenciales (Max/Diamante)
- Cada capa usa clave diferente
- Clave de descifrado única por backup
- Almacenada cifrada en Hidden Backup DB

#### **Proceso de Backup:**

**Paso 1 - Dump de Datos**:
- Exporta todas las tablas de Main DB
- Exporta configuraciones
- Exporta logs de auditoría (últimos 30 días)
- Formato: SQL

**Paso 2 - Compresión**:
- Comprimir con gzip
- Nivel: 9 (máxima compresión)
- Reduce tamaño ~70%

**Paso 3 - Cifrado Multicapa**:
```
data_layer_0 = compressed_dump
key_layer_1 = random(32 bytes)
data_layer_1 = AES-256-GCM.encrypt(data_layer_0, key_layer_1)

key_layer_2 = random(32 bytes)
data_layer_2 = ChaCha20-Poly1305.encrypt(data_layer_1, key_layer_2)

... hasta capa N (3-10 según licencia)

data_layer_N = final_ciphertext
```

**Paso 4 - Generar Metadata**:
```
{
  backup_id: "backup_20250115_103000",
  created_at: "2025-01-15T10:30:00.000Z",
  size_original: 450000000,
  size_compressed: 135000000,
  size_encrypted: 136500000,
  layers: 10,
  algorithms: ["aes256gcm", "chacha20", "camellia256", ...],
  checksum_sha256: "7f9e4a...",
  tables_included: ["usuarios", "sesiones", "configuracion", ...],
  records_count: 15420
}
```

**Paso 5 - Almacenar**:
- Guardar en archivo local: `/var/backups/ultrasecure/backup_20250115_103000.enc`
- Guardar en Hidden Backup DB: tabla `encrypted_backups`
- Guardar claves de descifrado cifradas: tabla `backup_keys`

**Paso 6 - Verificar Integridad**:
- Calcular checksum SHA-256
- Comparar con metadata
- Si no coincide → Alertar error

**Paso 7 - Limpieza**:
- Eliminar backups locales > 30 días
- Mantener en Hidden DB indefinidamente (o según configuración)
- Eliminar logs de auditoría > 90 días (si configurado)

#### **Proceso de Restauración:**

**Paso 1 - Obtener Backup**:

**Paso 2 - Validar Integridad**:
- Calcular checksum del archivo
- Comparar con metadata
- Si no coincide → ABORTAR (archivo corrupto)

**Paso 3 - Descifrar Multicapa**:
```
data_layer_N = encrypted_file

Obtener key_layer_N desde backup_keys
data_layer_N-1 = Algorithm_N.decrypt(data_layer_N, key_layer_N)

... hasta capa 1

data_layer_0 = Algorithm_1.decrypt(data_layer_1, key_layer_1)
```

**Paso 4 - Descomprimir**:
- gunzip data_layer_0
- Obtener SQL dump original

**Paso 5 - Aplicar a Base de Datos**:
- ADVERTENCIA: Esto sobrescribe datos actuales
- Crear snapshot antes de aplicar (opcional pero recomendado)
- Importar SQL dump

**Paso 6 - Verificar**:
- Contar registros restaurados
- Comparar con metadata
- Ejecutar queries de prueba
- Confirmar que aplicación funciona

**Paso 7 - Registrar Restauración**:
- Guardar en audit_logs
- Notificar a administradores

**Tiempo total**: 2-15 minutos (según tamaño)

#### **Backups Externos:**

**Además de backups locales y en Hidden DB, se recomienda subir a servicios externos.**

**Configurar Backup a S3**:

**Programar**:
```
0 */6 * * * /usr/local/bin/backup-to-s3.sh
```

**Configurar Backup a Google Cloud**:

**Programar**:
```
30 */6 * * * /usr/local/bin/backup-to-gcs.sh
```

#### **Restauración de Emergencia:**

**Si servidor principal falla completamente:**

**Opción 1 - Desde Backup Local (si disco sobrevivió)**:
```
# Nuevo servidor
sudo ./deploy.sh  # Instalar sistema limpio

# Restaurar
sudo ultrasecure backup restore /path/to/backup.enc --key=DECRYPTION_KEY
```

**Opción 2 - Desde S3/GCS**:
```
# Descargar backup
aws s3 cp s3://bucket/backup.enc /tmp/

# Restaurar
sudo ultrasecure backup restore /tmp/backup.enc --key=DECRYPTION_KEY
```

**Opción 3 - Desde Hidden Backup DB (si accesible)**:
```
# Conectar a Hidden DB desde nuevo servidor
# Requiere credenciales guardadas securely

sudo ultrasecure backup restore --from-hidden-db backup_20250115_103000 --key=DECRYPTION_KEY
```

### 8.6 Módulo de Auditoría

**Responsable de registrar TODAS las acciones en el sistema.**

#### **Tabla de Auditoría:**

```
audit_logs:
  id: BIGINT PRIMARY KEY AUTO_INCREMENT
  timestamp: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  tabla: VARCHAR(50)
  registro_id: INT
  accion: ENUM('SELECT', 'INSERT', 'UPDATE', 'DELETE')
  usuario_id: INT
  usuario_nombre: VARCHAR(100)
  ip_address: VARCHAR(45)
  user_agent: TEXT
  datos_anteriores: JSON NULL
  datos_nuevos: JSON NULL
  hash_anterior: VARCHAR(64)
  hash_actual: VARCHAR(64)
```

**Índices**:
```
INDEX idx_timestamp (timestamp)
INDEX idx_usuario (usuario_id)
INDEX idx_tabla (tabla, registro_id)
INDEX idx_accion (accion)
```

#### **Eventos Auditados:**

**1. Acciones de Usuario:**
- Login exitoso/fallido
- Logout
- Cambio de contraseña
- Cambio de configuración personal
- Acceso a datos sensibles

**2. Acciones Administrativas:**
- Crear/editar/eliminar usuarios
- Cambiar roles y permisos
- Modificar configuración del sistema
- Forzar rotación de claves
- Desbloquear IPs
- Activar/desactivar características

**3. Acciones de Datos:**
- CRUD en todas las tablas principales
- Cifrado/descifrado de datos
- Exportación de datos
- Importación de datos

**4. Acciones del Sistema:**
- Rotación automática de claves
- Backup automático
- Bloqueos por Request Blocker
- Bloqueos por Smart IA
- Errores críticos
- Inicio/detención de servicios

**5. Acciones de Seguridad:**
- Intentos de acceso no autorizado
- Cambios en licencia
- Detección de manipulación
- Vulnerabilidades detectadas

#### **Integridad Blockchain-Style:**

**Cada log tiene hash que incluye hash del log anterior.**

**Cálculo del hash**:
```
hash_actual = SHA-256(
  id +
  timestamp +
  tabla +
  registro_id +
  accion +
  usuario_id +
  datos_anteriores +
  datos_nuevos +
  hash_anterior  ← Del registro anterior
)
```

**Verificación de integridad**:
- Si alguien modifica un log, el hash cambia
- Todos los logs siguientes tendrían hash incorrecto
- Facilita detectar manipulación

**Verificar cadena completa**:

#### **Consultar Logs:**

**Por fecha**:

**Por usuario**:

**Por acción**:

**Por tabla y registro específico**:

**Exportar logs**:

### 8.7 Módulo de Autenticación

**Responsable de login, sesiones y 2FA.**

#### **Flujo de Login:**

**Paso 1 - Usuario envía credenciales**:
```
POST /api/auth/login
{
  username: "admin",
  password: "SecurePass123!",
  totp_token: "123456"  ← Opcional si 2FA habilitado
}
```

**Paso 2 - Verificar rate limit**:
- Máximo 5 intentos por 5 minutos por IP
- Si excede → 429 Too Many Requests

**Paso 3 - Buscar usuario en DB**:

**Paso 4 - Verificar contraseña**:
- Usar Argon2id.verify (constant-time)
- NO usar comparación simple (vulnerable a timing attacks)

**Paso 5 - Verificar TOTP (si 2FA habilitado)**:

**Paso 6 - Generar JWT token**:
```
payload = {
  user_id: user.id,
  username: user.username,
  role: user.role,
  iat: now,
  exp: now + 24h
}
token = JWT.sign(payload, JWT_SECRET, algorithm='HS512')
```

**Paso 7 - Guardar sesión**:

**Paso 8 - Retornar token**:
```
{
  success: true,
  token: "eyJhbGc...",
  expiresIn: "24h",
  user: {
    id: 1,
    username: "admin",
    role: "admin"
  }
}
```

**Paso 9 - Auditar**:

#### **Flujo de Verificación (Request Autenticado):**

**En cada request protegido**:

**Paso 1 - Extraer token del header**:
```
Authorization: Bearer eyJhbGc...
```

**Paso 2 - Verificar token**:

**Paso 3 - Verificar que sesión existe y es válida**:

**Paso 4 - Agregar datos de usuario a request**:
```
req.user = {
  id: decoded.user_id,
  username: decoded.username,
  role: decoded.role
}
```

**Paso 5 - Proceder con endpoint**

#### **2FA con TOTP:**

**Habilitar 2FA**:

**Paso 1**: Generar secreto

**Paso 2**: Generar código QR

**Paso 3**: Usuario escanea con app (Google Authenticator, Authy, etc.)

**Paso 4**: Verificar código de prueba

**Paso 5**: Guardar en DB

**Validar TOTP en login**:

### 8.8 Módulo de Rate Limiting

**Responsable de limitar requests por IP/usuario.**

#### **Implementación con Redis:**

**Estructura de key**:
```
rate_limit:{scope}:{identifier}
```

Ejemplos:
```
rate_limit:global:1.2.3.4
rate_limit:login:1.2.3.4
rate_limit:api:user_123
```

**Algoritmo - Token Bucket**:

**Conceptualmente**:
- Cada usuario tiene un "bucket" (balde) con tokens
- Cada request consume 1 token
- Tokens se rellenan a tasa constante
- Si bucket vacío → Rate limited

**En Redis**:
```
key = rate_limit:global:1.2.3.4
value = {
  tokens: 95,  ← Tokens restantes
  last_refill: 1642246800,  ← Timestamp último relleno
  max_tokens: 100,  ← Máximo permitido
  refill_rate: 100  ← Tokens/hora
}
```

**Verificar límite**:

**Proceso**:
1. Obtener datos de Redis
2. Calcular tokens a agregar desde last_refill
3. Agregar tokens (max = max_tokens)
4. Si tokens >= 1: Consumir 1 token, permitir request
5. Si tokens < 1: Rechazar request, retornar 429

#### **Configuración por Licencia:**

**Global (por hora)**:
- Basic: 1,000 req/h
- Pro: 5,000 req/h
- Max: 20,000 req/h
- Diamante: Ilimitado

**Login (por 5 minutos)**:
- Todos: 5 intentos

**Vault Access (por minuto)**:
- Todos: 10 accesos

**API Calls (por hora)**:
- Según licencia

#### **Headers de Respuesta:**

**En cada respuesta**:
```
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4850
X-RateLimit-Reset: 1642248000
```

**Si rate limited (429)**:
```
HTTP/1.1 429 Too Many Requests
Retry-After: 3600
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1642248000

{
  error: "Too Many Requests",
  message: "Rate limit exceeded. Try again in 1 hour.",
  retryAfter: 3600
}
```

### 8.9 Módulo de Frontend (V4.0)

**Dashboard administrativo completo.**

#### **Tecnologías:**

- **React 18**: Biblioteca UI
- **Next.js 14**: Framework con App Router
- **TypeScript**: Tipado estático
- **CSS Modules**: Estilos aislados (NO Tailwind, NO Bootstrap)

#### **Páginas Principales:**

**1. /login**:
- Formulario de login
- Input username
- Input password
- Input TOTP (si 2FA habilitado)
- Botón "Login"
- Errores inline

**2. /dashboard (post-login)**:
- Resumen de métricas
- Gráfico de requests/hora
- Gráfico de bloqueos
- Estado de servicios
- Alertas recientes

**3. /users**:
- Lista de usuarios
- Crear/editar/eliminar
- Asignar roles
- Ver historial de sesiones
- Forzar logout

**4. /blocks**:
- Lista de IPs bloqueadas
- Filtros (tipo, fecha, razón)
- Desbloquear manualmente
- Ver detalles de bloqueo
- Historial de bloqueos

**5. /audit**:
- Logs de auditoría
- Filtros (usuario, fecha, acción, tabla)
- Exportar logs
- Ver detalles de cambios (diff)
- Verificar integridad de cadena

**6. /backups**:
- Lista de backups disponibles
- Crear backup manual
- Descargar backup
- Restaurar backup (con confirmación)
- Ver detalles de backup
- Programar backups automáticos

**7. /keys**:
- Información de clave maestra activa
- Historial de rotaciones
- Forzar rotación manual
- Ver próxima rotación programada

**8. /ml-stats** (V4.0 Pro+):
- Estadísticas del modelo ML
- Accuracy, precision, recall
- Gráfico de predicciones
- Falsos positivos/negativos
- Reentrenar modelo
- Ver eventos pendientes de etiquetado

**9. /settings**:
- Configuración general
- Configuración de licencia
- Configuración de notificaciones
- Configuración de 2FA
- Cambiar contraseña
- Ver logs del sistema

**10. /license**:
- Información de licencia actual
- Tier
- Fecha de expiración
- Características habilitadas
- Uso actual vs. límites
- Renovar licencia
- Upgrade de tier

#### **Componentes Reutilizables:**

**<Layout>**: Barra lateral, header, footer

**<Card>**: Contenedor de contenido

**<Table>**: Tabla con sort, filtros, paginación

**<Chart>**: Gráficos (líneas, barras, dona)

**<Modal>**: Ventanas modales

**<Form>**: Formularios con validación

**<Alert>**: Alertas y notificaciones

**<Button>**: Botones con variantes (primary, secondary, danger)

#### **Estilos (CSS Puro):**

**Variables CSS globales** (globals.css):
```css
:root {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-bg: #ffffff;
  --color-text: #1e293b;
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'Fira Code', monospace;
  --border-radius: 8px;
  --shadow: 0 1px 3px rgba(0,0,0,0.1);
}

[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-text: #e2e8f0;
}
```

**CSS Modules** (ejemplo Button.module.css):
```css
.button {
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.primary {
  background: var(--color-primary);
  color: white;
}

.primary:hover {
  background: #2563eb;
}

.secondary {
  background: var(--color-secondary);
  color: white;
}

.danger {
  background: var(--color-danger);
  color: white;
}
```

**Responsive**:
```css
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  
  .mobileMenu {
    display: block;
  }
}
```

#### **Comunicación con Backend:**

**Fetch API**:

**Axios (alternativa)**:

**Manejo de errores**:

---

**[CONTINUARÁ EN LA SIGUIENTE SECCIÓN...]**

Este documento es extenso. ¿Quieres que continúe con los capítulos restantes (9-12)?
