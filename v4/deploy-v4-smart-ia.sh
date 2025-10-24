#!/bin/bash

################################################################################
# 🛡️ ULTRA SECURE SYSTEM V4.0 SMART IA - DEPLOYMENT AUTOMATIZADO
# 
# Este script detecta automáticamente:
# - Tipo de licencia (Basic, Pro, Max, Diamante)
# - Hardware disponible (CPU, RAM, SSD/NVMe, GPU)
# - Conectividad (Ethernet + WiFi)
# - Y configura EVERYTHING automáticamente
#
# Autor: Ultra Secure System Team
# Versión: 4.0.0
# Fecha: 2025
################################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables globales
INSTALL_DIR="/opt/ultra-secure-v4"
LOG_FILE="/var/log/ultra-secure-v4-install.log"
LICENSE_KEY=""
LICENSE_TIER=""
DETECTED_HARDWARE=()
NETWORK_INTERFACES=()

################################################################################
# FUNCIONES DE UTILIDAD
################################################################################

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

print_header() {
    clear
    echo -e "${PURPLE}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║     🛡️  ULTRA SECURE SYSTEM V4.0 - SMART IA                      ║
║                                                                   ║
║     Sistema de Seguridad de Grado Militar                        ║
║     Deployment Automatizado con Detección Inteligente            ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Este script debe ejecutarse como root"
        exit 1
    fi
}

################################################################################
# DETECCIÓN DE LICENCIA
################################################################################

detect_license() {
    log "🔑 Detectando licencia..."
    
    # Buscar archivo de licencia
    if [[ -f "./license.key" ]]; then
        LICENSE_KEY=$(cat "./license.key")
    elif [[ -f "/etc/ultra-secure/license.key" ]]; then
        LICENSE_KEY=$(cat "/etc/ultra-secure/license.key")
    else
        echo ""
        echo -e "${YELLOW}No se encontró archivo de licencia${NC}"
        echo "Por favor ingresa tu clave de licencia:"
        read -r LICENSE_KEY
    fi
    
    # Validar formato de licencia
    if [[ ! $LICENSE_KEY =~ ^USS4-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$ ]]; then
        log_error "Formato de licencia inválido"
        log_error "Formato esperado: USS4-XXXX-XXXX-XXXX-XXXX"
        exit 1
    fi
    
    # Detectar tier de licencia desde el servidor
    log "📡 Validando licencia con servidor central..."
    
    LICENSE_RESPONSE=$(curl -s -X POST https://license.ultrasecure.com/api/v4/validate \
        -H "Content-Type: application/json" \
        -d "{\"license_key\":\"$LICENSE_KEY\"}" \
        2>/dev/null || echo "{\"valid\":false}")
    
    if [[ $(echo "$LICENSE_RESPONSE" | jq -r '.valid') == "true" ]]; then
        LICENSE_TIER=$(echo "$LICENSE_RESPONSE" | jq -r '.tier')
        LICENSE_FEATURES=$(echo "$LICENSE_RESPONSE" | jq -r '.features')
        
        log "${GREEN}✓${NC} Licencia válida detectada: ${CYAN}$LICENSE_TIER${NC}"
        log_info "Características habilitadas:"
        echo "$LICENSE_FEATURES" | jq -r 'to_entries[] | "  • \(.key): \(.value)"' | tee -a "$LOG_FILE"
    else
        log_error "Licencia inválida o expirada"
        log_error "Razón: $(echo "$LICENSE_RESPONSE" | jq -r '.error')"
        exit 1
    fi
    
    # Guardar licencia
    mkdir -p /etc/ultra-secure
    echo "$LICENSE_KEY" > /etc/ultra-secure/license.key
    chmod 600 /etc/ultra-secure/license.key
    echo "$LICENSE_RESPONSE" > /etc/ultra-secure/license-features.json
}

################################################################################
# DETECCIÓN DE HARDWARE
################################################################################

detect_hardware() {
    log "🖥️  Detectando hardware del sistema..."
    
    # CPU
    CPU_MODEL=$(lscpu | grep "Model name" | cut -d':' -f2 | xargs)
    CPU_CORES=$(nproc)
    CPU_THREADS=$(lscpu | grep "^CPU(s):" | awk '{print $2}')
    
    # Detectar si es AMD Ryzen
    IS_RYZEN=false
    if [[ $CPU_MODEL == *"Ryzen"* ]]; then
        IS_RYZEN=true
        log "${GREEN}✓${NC} CPU AMD Ryzen detectado: $CPU_MODEL"
    else
        log_warning "CPU no es AMD Ryzen: $CPU_MODEL"
        log_warning "Para rendimiento óptimo, se recomienda AMD Ryzen"
    fi
    
    DETECTED_HARDWARE+=("CPU=$CPU_MODEL")
    DETECTED_HARDWARE+=("CORES=$CPU_CORES")
    DETECTED_HARDWARE+=("THREADS=$CPU_THREADS")
    DETECTED_HARDWARE+=("IS_RYZEN=$IS_RYZEN")
    
    # RAM
    TOTAL_RAM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    TOTAL_RAM_GB=$((TOTAL_RAM_KB / 1024 / 1024))
    
    log "  RAM: ${CYAN}${TOTAL_RAM_GB} GB${NC}"
    DETECTED_HARDWARE+=("RAM_GB=$TOTAL_RAM_GB")
    
    # Almacenamiento
    log "  Detectando discos..."
    
    # Detectar NVMe
    NVME_DISKS=$(lsblk -d -o NAME,ROTA | grep "0$" | grep "nvme" | wc -l)
    if [[ $NVME_DISKS -gt 0 ]]; then
        log "${GREEN}✓${NC} Discos NVMe detectados: $NVME_DISKS"
        DETECTED_HARDWARE+=("HAS_NVME=true")
        DETECTED_HARDWARE+=("NVME_COUNT=$NVME_DISKS")
    fi
    
    # Detectar SSD
    SSD_DISKS=$(lsblk -d -o NAME,ROTA | grep "0$" | grep -v "nvme" | wc -l)
    if [[ $SSD_DISKS -gt 0 ]]; then
        log "${GREEN}✓${NC} Discos SSD detectados: $SSD_DISKS"
        DETECTED_HARDWARE+=("HAS_SSD=true")
        DETECTED_HARDWARE+=("SSD_COUNT=$SSD_DISKS")
    fi
    
    # Detectar HDD
    HDD_DISKS=$(lsblk -d -o NAME,ROTA | grep "1$" | wc -l)
    if [[ $HDD_DISKS -gt 0 ]]; then
        log_warning "Discos HDD detectados: $HDD_DISKS (no recomendado para producción)"
        DETECTED_HARDWARE+=("HAS_HDD=true")
        DETECTED_HARDWARE+=("HDD_COUNT=$HDD_DISKS")
    fi
    
    # GPU
    log "  Detectando GPU..."
    
    if command -v nvidia-smi &> /dev/null; then
        GPU_COUNT=$(nvidia-smi --list-gpus | wc -l)
        GPU_MODEL=$(nvidia-smi --query-gpu=gpu_name --format=csv,noheader | head -1)
        
        log "${GREEN}✓${NC} GPU NVIDIA detectada: $GPU_MODEL"
        log "  Cantidad de GPUs: $GPU_COUNT"
        
        DETECTED_HARDWARE+=("HAS_GPU=true")
        DETECTED_HARDWARE+=("GPU_VENDOR=NVIDIA")
        DETECTED_HARDWARE+=("GPU_MODEL=$GPU_MODEL")
        DETECTED_HARDWARE+=("GPU_COUNT=$GPU_COUNT")
    elif command -v rocm-smi &> /dev/null; then
        GPU_COUNT=$(rocm-smi --showid | grep "GPU\[" | wc -l)
        GPU_MODEL=$(rocm-smi --showproductname | grep -v "^=" | head -1)
        
        log "${GREEN}✓${NC} GPU AMD detectada: $GPU_MODEL"
        log "  Cantidad de GPUs: $GPU_COUNT"
        
        DETECTED_HARDWARE+=("HAS_GPU=true")
        DETECTED_HARDWARE+=("GPU_VENDOR=AMD")
        DETECTED_HARDWARE+=("GPU_MODEL=$GPU_MODEL")
        DETECTED_HARDWARE+=("GPU_COUNT=$GPU_COUNT")
    else
        log_warning "No se detectó GPU dedicada"
        DETECTED_HARDWARE+=("HAS_GPU=false")
    fi
    
    # Verificar requisitos mínimos
    log "  Verificando requisitos mínimos..."
    
    REQUIREMENTS_MET=true
    
    if [[ $TOTAL_RAM_GB -lt 8 ]]; then
        log_error "RAM insuficiente: ${TOTAL_RAM_GB}GB (mínimo 8GB)"
        REQUIREMENTS_MET=false
    fi
    
    if [[ $CPU_CORES -lt 4 ]]; then
        log_error "CPU insuficiente: ${CPU_CORES} cores (mínimo 4 cores)"
        REQUIREMENTS_MET=false
    fi
    
    if [[ $NVME_DISKS -eq 0 && $SSD_DISKS -eq 0 ]]; then
        log_error "No se detectaron discos SSD o NVMe (requerido para producción)"
        REQUIREMENTS_MET=false
    fi
    
    if [[ $REQUIREMENTS_MET == false ]]; then
        log_error "El hardware no cumple los requisitos mínimos"
        exit 1
    fi
    
    log "${GREEN}✓${NC} Hardware cumple requisitos mínimos"
}

################################################################################
# DETECCIÓN DE RED
################################################################################

detect_network() {
    log "🌐 Detectando interfaces de red..."
    
    # Detectar todas las interfaces
    ALL_INTERFACES=$(ip -o link show | awk -F': ' '{print $2}' | grep -v "lo")
    
    for iface in $ALL_INTERFACES; do
        # Verificar si está activa
        if ip link show "$iface" | grep -q "state UP"; then
            IFACE_TYPE="unknown"
            
            # Detectar tipo
            if [[ $iface == eth* ]] || [[ $iface == enp* ]] || [[ $iface == eno* ]]; then
                IFACE_TYPE="ethernet"
                log "${GREEN}✓${NC} Ethernet detectado: $iface"
            elif [[ $iface == wlan* ]] || [[ $iface == wlp* ]]; then
                IFACE_TYPE="wifi"
                log "${GREEN}✓${NC} WiFi detectado: $iface"
            fi
            
            # Obtener IP
            IFACE_IP=$(ip -4 addr show "$iface" | grep -oP '(?<=inet\s)\d+(\.\d+){3}')
            
            if [[ -n $IFACE_IP ]]; then
                log "  IP: $IFACE_IP"
                NETWORK_INTERFACES+=("$iface:$IFACE_TYPE:$IFACE_IP")
            fi
        fi
    done
    
    if [[ ${#NETWORK_INTERFACES[@]} -eq 0 ]]; then
        log_error "No se detectaron interfaces de red activas"
        exit 1
    fi
    
    # Verificar conectividad a Internet
    log "  Verificando conectividad a Internet..."
    
    if ping -c 3 8.8.8.8 &> /dev/null; then
        log "${GREEN}✓${NC} Conectividad a Internet confirmada"
    else
        log_error "No hay conectividad a Internet"
        log_error "Se requiere Internet para descargar dependencias"
        exit 1
    fi
    
    # Detectar velocidad de red
    for iface_info in "${NETWORK_INTERFACES[@]}"; do
        iface=$(echo "$iface_info" | cut -d':' -f1)
        speed=$(ethtool "$iface" 2>/dev/null | grep "Speed:" | awk '{print $2}')
        
        if [[ -n $speed ]]; then
            log "  Velocidad de $iface: $speed"
        fi
    done
}

################################################################################
# VERIFICACIÓN DE REQUISITOS POR LICENCIA
################################################################################

verify_license_requirements() {
    log "📋 Verificando requisitos según licencia $LICENSE_TIER..."
    
    # Obtener requisitos de la licencia
    MAX_NODES=$(echo "$LICENSE_FEATURES" | jq -r '.max_nodes')
    REQUIRES_GPU=$(echo "$LICENSE_FEATURES" | jq -r '.gpu_acceleration // false')
    MIN_RAM_GB=8
    
    case "$LICENSE_TIER" in
        "global-infiniti-basic")
            MIN_RAM_GB=8
            MIN_CORES=4
            ;;
        "global-infiniti-pro")
            MIN_RAM_GB=16
            MIN_CORES=8
            REQUIRES_NVME=true
            ;;
        "global-infiniti-max")
            MIN_RAM_GB=32
            MIN_CORES=16
            REQUIRES_NVME=true
            REQUIRES_GPU=true
            ;;
        "global-infiniti-diamante")
            MIN_RAM_GB=64
            MIN_CORES=32
            REQUIRES_NVME=true
            REQUIRES_GPU=true
            ;;
    esac
    
    log "  Requisitos para $LICENSE_TIER:"
    log "  • RAM mínima: ${MIN_RAM_GB}GB"
    log "  • CPU mínima: ${MIN_CORES} cores"
    [[ $REQUIRES_NVME == true ]] && log "  • NVMe: Requerido"
    [[ $REQUIRES_GPU == true ]] && log "  • GPU: Requerida"
    
    # Verificar
    MEETS_REQUIREMENTS=true
    
    if [[ $TOTAL_RAM_GB -lt $MIN_RAM_GB ]]; then
        log_error "RAM insuficiente para $LICENSE_TIER: ${TOTAL_RAM_GB}GB < ${MIN_RAM_GB}GB"
        MEETS_REQUIREMENTS=false
    fi
    
    if [[ $CPU_CORES -lt $MIN_CORES ]]; then
        log_error "CPU insuficiente para $LICENSE_TIER: ${CPU_CORES} cores < ${MIN_CORES} cores"
        MEETS_REQUIREMENTS=false
    fi
    
    if [[ $REQUIRES_NVME == true ]] && [[ $NVME_DISKS -eq 0 ]]; then
        log_error "NVMe requerido para $LICENSE_TIER pero no detectado"
        MEETS_REQUIREMENTS=false
    fi
    
    if [[ $REQUIRES_GPU == true ]]; then
        HAS_GPU=$(echo "${DETECTED_HARDWARE[@]}" | grep -o "HAS_GPU=true" || echo "")
        if [[ -z $HAS_GPU ]]; then
            log_error "GPU requerida para $LICENSE_TIER pero no detectada"
            MEETS_REQUIREMENTS=false
        fi
    fi
    
    if [[ $MEETS_REQUIREMENTS == false ]]; then
        log_error "El hardware no cumple los requisitos para la licencia $LICENSE_TIER"
        log_error "Por favor actualiza tu hardware o cambia a una licencia de menor tier"
        exit 1
    fi
    
    log "${GREEN}✓${NC} Hardware cumple requisitos para $LICENSE_TIER"
}

################################################################################
# INSTALACIÓN DE DEPENDENCIAS
################################################################################

install_dependencies() {
    log "📦 Instalando dependencias del sistema..."
    
    # Detectar distribución
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
    else
        log_error "No se pudo detectar la distribución del sistema"
        exit 1
    fi
    
    log "  Sistema detectado: $OS $VER"
    
    case "$OS" in
        ubuntu|debian)
            log "  Actualizando repositorios..."
            apt-get update -qq
            
            log "  Instalando paquetes base..."
            apt-get install -y -qq \
                curl wget git build-essential \
                libssl-dev pkg-config \
                jq bc \
                mysql-server redis-server nginx \
                nodejs npm \
                python3 python3-pip \
                ethtool net-tools
            ;;
        centos|rhel|fedora)
            log "  Instalando paquetes base..."
            yum install -y -q \
                curl wget git gcc make \
                openssl-devel pkg-config \
                jq bc \
                mysql-server redis nginx \
                nodejs npm \
                python3 python3-pip \
                ethtool net-tools
            ;;
        *)
            log_error "Distribución no soportada: $OS"
            exit 1
            ;;
    esac
    
    # Instalar Node.js 20 LTS si no está
    NODE_VERSION=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ -z $NODE_VERSION ]] || [[ $NODE_VERSION -lt 18 ]]; then
        log "  Instalando Node.js 20 LTS..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    fi
    
    log "${GREEN}✓${NC} Dependencias instaladas"
}

################################################################################
# CONFIGURACIÓN DE BASES DE DATOS
################################################################################

setup_databases() {
    log "💾 Configurando bases de datos..."
    
    # Generar contraseñas seguras
    VAULT_DB_PASSWORD=$(openssl rand -base64 32)
    HIDDEN_BACKUP_DB_PASSWORD=$(openssl rand -base64 48)
    MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)
    
    # Configurar MySQL
    log "  Configurando MySQL..."
    
    systemctl start mysql
    systemctl enable mysql
    
    # Crear base de datos Vault
    mysql -u root <<EOF
-- Cambiar password de root
ALTER USER 'root'@'localhost' IDENTIFIED BY '$MYSQL_ROOT_PASSWORD';
FLUSH PRIVILEGES;

-- Crear base de datos Vault
CREATE DATABASE IF NOT EXISTS encryption_vault;

-- Crear usuario Vault
CREATE USER IF NOT EXISTS 'vault_master'@'localhost' 
IDENTIFIED BY '$VAULT_DB_PASSWORD';

GRANT ALL PRIVILEGES ON encryption_vault.* TO 'vault_master'@'localhost';

-- Crear base de datos OCULTA para backups
CREATE DATABASE IF NOT EXISTS hidden_backups_vault;

-- Crear usuario especial para backups (diferentes credenciales)
CREATE USER IF NOT EXISTS 'backup_admin'@'localhost' 
IDENTIFIED BY '$HIDDEN_BACKUP_DB_PASSWORD';

GRANT SELECT, INSERT ON hidden_backups_vault.* TO 'backup_admin'@'localhost';

FLUSH PRIVILEGES;
EOF
    
    # Guardar credenciales
    mkdir -p /etc/ultra-secure/credentials
    cat > /etc/ultra-secure/credentials/mysql.env <<EOF
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
VAULT_DB_PASSWORD=$VAULT_DB_PASSWORD
HIDDEN_BACKUP_DB_PASSWORD=$HIDDEN_BACKUP_DB_PASSWORD
EOF
    chmod 600 /etc/ultra-secure/credentials/mysql.env
    
    log "${GREEN}✓${NC} Bases de datos configuradas"
    
    # Configurar Redis
    log "  Configurando Redis..."
    
    REDIS_PASSWORD=$(openssl rand -base64 32)
    
    # Configurar Redis con password
    sed -i "s/# requirepass.*/requirepass $REDIS_PASSWORD/" /etc/redis/redis.conf
    
    systemctl restart redis
    systemctl enable redis
    
    echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> /etc/ultra-secure/credentials/redis.env
    chmod 600 /etc/ultra-secure/credentials/redis.env
    
    log "${GREEN}✓${NC} Redis configurado"
}

################################################################################
# INSTALACIÓN DE LA APLICACIÓN
################################################################################

install_application() {
    log "🚀 Instalando Ultra Secure System V4.0..."
    
    # Crear directorio
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    # Clonar repositorio o copiar archivos
    log "  Descargando código fuente..."
    
    if [[ -d "/tmp/ultra-secure-v4" ]]; then
        cp -r /tmp/ultra-secure-v4/* "$INSTALL_DIR/"
    else
        # Descargar desde servidor
        curl -L "https://releases.ultrasecure.com/v4/latest.tar.gz" \
            -o /tmp/ultra-secure-v4.tar.gz
        tar -xzf /tmp/ultra-secure-v4.tar.gz -C "$INSTALL_DIR"
    fi
    
    # Instalar dependencias npm
    log "  Instalando dependencias Node.js..."
    npm install --production
    
    # Construir frontend si existe
    if [[ -d "$INSTALL_DIR/frontend" ]]; then
        log "  Construyendo frontend React + Next.js..."
        cd "$INSTALL_DIR/frontend"
        npm install
        npm run build
        cd "$INSTALL_DIR"
    fi
    
    log "${GREEN}✓${NC} Aplicación instalada"
}

################################################################################
# CONFIGURACIÓN SEGÚN LICENCIA
################################################################################

configure_by_license() {
    log "⚙️  Configurando sistema según licencia $LICENSE_TIER..."
    
    # Crear archivo .env
    cat > "$INSTALL_DIR/.env" <<EOF
# Ultra Secure System V4.0 - Auto-generated Configuration
# License: $LICENSE_TIER
# Generated: $(date)

# License
LICENSE_KEY=$LICENSE_KEY
LICENSE_TIER=$LICENSE_TIER

# Database - Vault
VAULT_DB_HOST=localhost
VAULT_DB_PORT=3306
VAULT_DB_NAME=encryption_vault
VAULT_DB_USER=vault_master
VAULT_DB_PASSWORD=$VAULT_DB_PASSWORD

# Database - Hidden Backups
HIDDEN_BACKUP_DB_HOST=localhost
HIDDEN_BACKUP_DB_PORT=3306
HIDDEN_BACKUP_DB_NAME=hidden_backups_vault
HIDDEN_BACKUP_DB_USER=backup_admin
HIDDEN_BACKUP_DB_PASSWORD=$HIDDEN_BACKUP_DB_PASSWORD

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD

# Encryption
ENCRYPTION_LAYERS=$(echo "$LICENSE_FEATURES" | jq -r '.encryption_layers')
VAULT_PASSWORD=$(openssl rand -base64 64)
JWT_SECRET=$(openssl rand -base64 64)
ENCRYPTION_SALT=$(openssl rand -base64 64)
TOTP_SECRET=$(openssl rand -base32 32)

# Smart IA
SMART_IA_ENABLED=$(echo "$LICENSE_FEATURES" | jq -r '.smart_ia')
PREDICTIVE_BLOCKING=true
VARIABLE_BLOCK_DURATION=true

# Hardware
HAS_GPU=$(echo "${DETECTED_HARDWARE[@]}" | grep -o "HAS_GPU=[^[:space:]]*" | cut -d'=' -f2)
GPU_ACCELERATION=$(echo "$LICENSE_FEATURES" | jq -r '.gpu_acceleration // false')
CPU_CORES=$CPU_CORES
TOTAL_RAM_GB=$TOTAL_RAM_GB

# Network
PRIMARY_INTERFACE=$(echo "${NETWORK_INTERFACES[0]}" | cut -d':' -f1)
PRIMARY_IP=$(echo "${NETWORK_INTERFACES[0]}" | cut -d':' -f3)

# Limits (según licencia)
MAX_NODES=$(echo "$LICENSE_FEATURES" | jq -r '.max_nodes')
MAX_USERS=$(echo "$LICENSE_FEATURES" | jq -r '.max_users')
API_RATE_LIMIT=$(echo "$LICENSE_FEATURES" | jq -r '.api_rate_limit')
STORAGE_GB=$(echo "$LICENSE_FEATURES" | jq -r '.storage_gb')

# CORS (solo admin)
CORS_ALLOWED_ORIGINS=https://admin.yourdomain.com
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE
CORS_ALLOW_CREDENTIALS=true

# Monitoring
ENABLE_MONITORING=true
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000

# Logging
LOG_LEVEL=info
AUDIT_LOG_ENABLED=true

# Backup
BACKUP_10_LAYER_ENCRYPTION=true
BACKUP_RETENTION_DAYS=$(echo "$LICENSE_FEATURES" | jq -r '.backup_retention_days')
AUTO_BACKUP_ENABLED=true
AUTO_BACKUP_SCHEDULE="0 2 * * *"

# Support
SUPPORT_LEVEL=$(echo "$LICENSE_FEATURES" | jq -r '.support_level')
EOF
    
    chmod 600 "$INSTALL_DIR/.env"
    
    log "${GREEN}✓${NC} Configuración creada"
    
    # Ejecutar migraciones de BD
    log "  Ejecutando migraciones de base de datos..."
    
    mysql -u vault_master -p"$VAULT_DB_PASSWORD" encryption_vault < "$INSTALL_DIR/database/migrations/001_initial.sql"
    mysql -u backup_admin -p"$HIDDEN_BACKUP_DB_PASSWORD" hidden_backups_vault < "$INSTALL_DIR/database/migrations/002_hidden_backups.sql"
    
    log "${GREEN}✓${NC} Migraciones ejecutadas"
    
    # Deshabilitar módulos no incluidos en la licencia
    ENABLED_MODULES=$(echo "$LICENSE_FEATURES" | jq -r '.modules')
    
    if [[ $ENABLED_MODULES != "all" ]]; then
        log "  Configurando módulos habilitados..."
        echo "$ENABLED_MODULES" | jq -r '.[]' | while read -r module; do
            log "    ✓ Módulo habilitado: $module"
        done
    fi
}

################################################################################
# CONFIGURACIÓN DE SERVICIOS
################################################################################

setup_services() {
    log "🔧 Configurando servicios del sistema..."
    
    # Crear servicio systemd
    cat > /etc/systemd/system/ultra-secure-v4.service <<EOF
[Unit]
Description=Ultra Secure System V4.0 Smart IA
After=network.target mysql.service redis.service
Requires=mysql.service redis.service

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/node $INSTALL_DIR/src/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=ultra-secure-v4

# Limites de recursos
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
EOF
    
    # Recargar systemd
    systemctl daemon-reload
    systemctl enable ultra-secure-v4.service
    
    log "${GREEN}✓${NC} Servicio configurado"
    
    # Configurar Nginx como reverse proxy
    log "  Configurando Nginx..."
    
    cat > /etc/nginx/sites-available/ultra-secure-v4 <<'EOF'
server {
    listen 80;
    server_name _;
    
    # Redirect to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name _;
    
    # SSL (usar certificados reales en producción)
    ssl_certificate /etc/ultra-secure/ssl/cert.pem;
    ssl_certificate_key /etc/ultra-secure/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    limit_req zone=api burst=20 nodelay;
}
EOF
    
    ln -sf /etc/nginx/sites-available/ultra-secure-v4 /etc/nginx/sites-enabled/
    
    # Generar certificados SSL auto-firmados (temporales)
    mkdir -p /etc/ultra-secure/ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:4096 \
        -keyout /etc/ultra-secure/ssl/key.pem \
        -out /etc/ultra-secure/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=UltraSecure/CN=localhost" \
        2>/dev/null
    
    nginx -t && systemctl restart nginx
    
    log "${GREEN}✓${NC} Nginx configurado"
}

################################################################################
# OPTIMIZACIÓN DE HARDWARE
################################################################################

optimize_hardware() {
    log "⚡ Optimizando configuración de hardware..."
    
    # Optimizar para AMD Ryzen
    if [[ $IS_RYZEN == true ]]; then
        log "  Aplicando optimizaciones para AMD Ryzen..."
        
        # Configurar CPU governor
        for cpu in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor; do
            echo "performance" > "$cpu" 2>/dev/null || true
        done
        
        log "    ✓ CPU governor: performance"
    fi
    
    # Optimizar I/O para NVMe
    if [[ $NVME_DISKS -gt 0 ]]; then
        log "  Optimizando I/O para NVMe..."
        
        for nvme in /sys/block/nvme*/queue/scheduler; do
            echo "none" > "$nvme" 2>/dev/null || true
        done
        
        log "    ✓ Scheduler NVMe: none (mejor para NVMe)"
    fi
    
    # Configurar GPU si está disponible
    HAS_GPU=$(echo "${DETECTED_HARDWARE[@]}" | grep -o "HAS_GPU=[^[:space:]]*" | cut -d'=' -f2)
    
    if [[ $HAS_GPU == "true" ]] && [[ $(echo "$LICENSE_FEATURES" | jq -r '.gpu_acceleration') == "true" ]]; then
        log "  Configurando aceleración por GPU..."
        
        GPU_VENDOR=$(echo "${DETECTED_HARDWARE[@]}" | grep -o "GPU_VENDOR=[^[:space:]]*" | cut -d'=' -f2)
        
        if [[ $GPU_VENDOR == "NVIDIA" ]]; then
            # Configurar NVIDIA CUDA
            log "    ✓ NVIDIA CUDA habilitado"
            echo "GPU_COMPUTE_MODE=CUDA" >> "$INSTALL_DIR/.env"
        elif [[ $GPU_VENDOR == "AMD" ]]; then
            # Configurar AMD ROCm
            log "    ✓ AMD ROCm habilitado"
            echo "GPU_COMPUTE_MODE=ROCM" >> "$INSTALL_DIR/.env"
        fi
    fi
    
    # Optimizar Redis
    log "  Optimizando Redis..."
    
    # Deshabilitar swap para Redis
    sysctl vm.swappiness=1
    echo "vm.swappiness=1" >> /etc/sysctl.conf
    
    # Aumentar max connections
    sysctl net.core.somaxconn=65535
    echo "net.core.somaxconn=65535" >> /etc/sysctl.conf
    
    log "${GREEN}✓${NC} Hardware optimizado"
}

################################################################################
# VERIFICACIÓN FINAL
################################################################################

final_verification() {
    log "✅ Ejecutando verificación final..."
    
    # Verificar servicios
    log "  Verificando servicios..."
    
    systemctl is-active --quiet mysql && log "    ✓ MySQL activo" || log_error "MySQL no activo"
    systemctl is-active --quiet redis && log "    ✓ Redis activo" || log_error "Redis no activo"
    systemctl is-active --quiet nginx && log "    ✓ Nginx activo" || log_error "Nginx no activo"
    
    # Iniciar aplicación
    log "  Iniciando Ultra Secure System..."
    systemctl start ultra-secure-v4
    
    sleep 5
    
    if systemctl is-active --quiet ultra-secure-v4; then
        log "${GREEN}    ✓ Ultra Secure System iniciado correctamente${NC}"
    else
        log_error "Error al iniciar Ultra Secure System"
        journalctl -u ultra-secure-v4 -n 50 --no-pager
        exit 1
    fi
    
    # Verificar conectividad
    log "  Verificando conectividad..."
    
    if curl -k -s https://localhost/health | grep -q "ok"; then
        log "${GREEN}    ✓ Aplicación respondiendo correctamente${NC}"
    else
        log_error "Aplicación no responde correctamente"
    fi
    
    log "${GREEN}✅ Verificación completada exitosamente${NC}"
}

################################################################################
# RESUMEN FINAL
################################################################################

print_summary() {
    clear
    echo -e "${GREEN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   ✅ INSTALACIÓN COMPLETADA EXITOSAMENTE                         ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    echo -e "${CYAN}📋 RESUMEN DE INSTALACIÓN${NC}"
    echo ""
    echo -e "  ${GREEN}✓${NC} Licencia: ${CYAN}$LICENSE_TIER${NC}"
    echo -e "  ${GREEN}✓${NC} Hardware detectado:"
    echo -e "    • CPU: $CPU_MODEL ($CPU_CORES cores)"
    echo -e "    • RAM: ${TOTAL_RAM_GB}GB"
    [[ $NVME_DISKS -gt 0 ]] && echo -e "    • NVMe: $NVME_DISKS discos"
    [[ $HAS_GPU == "true" ]] && echo -e "    • GPU: Sí"
    echo -e "  ${GREEN}✓${NC} Red configurada: ${#NETWORK_INTERFACES[@]} interfaces"
    echo ""
    
    echo -e "${CYAN}🌐 ACCESO${NC}"
    echo ""
    echo -e "  URL: ${GREEN}https://$(echo "${NETWORK_INTERFACES[0]}" | cut -d':' -f3)${NC}"
    echo -e "  Usuario inicial: ${CYAN}admin@ultrasecure.com${NC}"
    echo -e "  Password inicial: ${CYAN}$(openssl rand -base64 12)${NC} (cambiar en primer acceso)"
    echo ""
    
    echo -e "${CYAN}📁 UBICACIONES${NC}"
    echo ""
    echo -e "  Instalación: $INSTALL_DIR"
    echo -e "  Configuración: /etc/ultra-secure/"
    echo -e "  Logs: /var/log/ultra-secure-v4-install.log"
    echo -e "  Credenciales: /etc/ultra-secure/credentials/"
    echo ""
    
    echo -e "${CYAN}🔧 COMANDOS ÚTILES${NC}"
    echo ""
    echo -e "  Iniciar:    systemctl start ultra-secure-v4"
    echo -e "  Detener:    systemctl stop ultra-secure-v4"
    echo -e "  Reiniciar:  systemctl restart ultra-secure-v4"
    echo -e "  Estado:     systemctl status ultra-secure-v4"
    echo -e "  Logs:       journalctl -u ultra-secure-v4 -f"
    echo ""
    
    echo -e "${YELLOW}⚠️  IMPORTANTE${NC}"
    echo ""
    echo -e "  1. Cambia las contraseñas por defecto"
    echo -e "  2. Configura certificados SSL válidos"
    echo -e "  3. Revisa /etc/ultra-secure/credentials/"
    echo -e "  4. Configura backups automáticos"
    echo -e "  5. Lee la documentación completa"
    echo ""
    
    echo -e "${CYAN}📚 DOCUMENTACIÓN${NC}"
    echo ""
    echo -e "  Docs: $INSTALL_DIR/docs/"
    echo -e "  Support: support@ultrasecure.com"
    echo ""
    
    echo -e "${GREEN}🎉 ¡Sistema listo para usar!${NC}"
    echo ""
}

################################################################################
# MAIN
################################################################################

main() {
    print_header
    check_root
    
    log "🚀 Iniciando instalación de Ultra Secure System V4.0..."
    log ""
    
    detect_license
    detect_hardware
    detect_network
    verify_license_requirements
    
    install_dependencies
    setup_databases
    install_application
    configure_by_license
    setup_services
    optimize_hardware
    
    final_verification
    print_summary
    
    log ""
    log "${GREEN}✅ Instalación completada exitosamente en $(date)${NC}"
}

# Ejecutar
main "$@"
