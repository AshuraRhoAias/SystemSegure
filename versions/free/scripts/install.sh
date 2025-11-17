#!/bin/bash

# =====================================================
# SCRIPT DE INSTALACIÓN SYSTEMSEGURE - FREE VERSION
# Para Linux y macOS
# =====================================================

set -e  # Salir si hay algún error

echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║       SystemSegure - Instalación FREE Version        ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones helper
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Verificar si se ejecuta como root
if [ "$EUID" -eq 0 ]; then
    print_warning "No se recomienda ejecutar como root. Continuando de todas formas..."
fi

# =====================================================
# 1. VERIFICAR REQUISITOS DEL SISTEMA
# =====================================================

echo ""
print_info "Verificando requisitos del sistema..."
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    print_info "Por favor, instale Node.js 16 o superior desde https://nodejs.org/"
    exit 1
else
    NODE_VERSION=$(node -v)
    print_success "Node.js encontrado: $NODE_VERSION"
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
else
    NPM_VERSION=$(npm -v)
    print_success "npm encontrado: $NPM_VERSION"
fi

# Verificar MySQL
if ! command -v mysql &> /dev/null; then
    print_warning "MySQL client no encontrado en PATH"
    print_info "Asegúrese de que MySQL Server esté instalado y en ejecución"
else
    MYSQL_VERSION=$(mysql --version)
    print_success "MySQL encontrado: $MYSQL_VERSION"
fi

# =====================================================
# 2. CONFIGURAR BASE DE DATOS
# =====================================================

echo ""
print_info "Configuración de base de datos..."
echo ""

read -p "¿Desea instalar la base de datos ahora? (s/n): " install_db

if [ "$install_db" == "s" ] || [ "$install_db" == "S" ]; then
    echo ""
    read -p "Host de MySQL [localhost]: " db_host
    db_host=${db_host:-localhost}

    read -p "Puerto de MySQL [3306]: " db_port
    db_port=${db_port:-3306}

    read -p "Usuario root de MySQL: " db_root_user
    read -sp "Password de root de MySQL: " db_root_password
    echo ""

    read -p "Nombre de base de datos [license_management]: " db_name
    db_name=${db_name:-license_management}

    read -p "Usuario de aplicación [license_app]: " db_app_user
    db_app_user=${db_app_user:-license_app}

    read -sp "Password para usuario de aplicación: " db_app_password
    echo ""
    echo ""

    print_info "Creando base de datos..."

    # Crear base de datos y usuario
    mysql -h "$db_host" -P "$db_port" -u "$db_root_user" -p"$db_root_password" <<EOF
CREATE DATABASE IF NOT EXISTS $db_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$db_app_user'@'localhost' IDENTIFIED BY '$db_app_password';
CREATE USER IF NOT EXISTS '$db_app_user'@'%' IDENTIFIED BY '$db_app_password';
GRANT ALL PRIVILEGES ON $db_name.* TO '$db_app_user'@'localhost';
GRANT ALL PRIVILEGES ON $db_name.* TO '$db_app_user'@'%';
FLUSH PRIVILEGES;
EOF

    if [ $? -eq 0 ]; then
        print_success "Base de datos creada exitosamente"
    else
        print_error "Error al crear base de datos"
        exit 1
    fi

    # Importar schema
    print_info "Importando schema de base de datos..."

    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    SQL_FILE="$SCRIPT_DIR/../../database_schema.sql"

    if [ -f "$SQL_FILE" ]; then
        mysql -h "$db_host" -P "$db_port" -u "$db_app_user" -p"$db_app_password" "$db_name" < "$SQL_FILE"

        if [ $? -eq 0 ]; then
            print_success "Schema importado exitosamente"
        else
            print_error "Error al importar schema"
            exit 1
        fi
    else
        print_error "Archivo SQL no encontrado: $SQL_FILE"
        exit 1
    fi
else
    print_warning "Instalación de base de datos omitida"
    print_info "Recuerde ejecutar el script SQL manualmente"
fi

# =====================================================
# 3. CONFIGURAR BACKEND
# =====================================================

echo ""
print_info "Configurando backend..."
echo ""

BACKEND_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../backend" && pwd )"
cd "$BACKEND_DIR"

# Copiar archivo .env de ejemplo
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Archivo .env creado desde .env.example"

        # Solicitar configuración
        echo ""
        read -p "License Key (o presione Enter para generar una): " license_key

        if [ -z "$license_key" ]; then
            license_key="FREE-$(openssl rand -hex 4 | tr '[:lower:]' '[:upper:]')-$(openssl rand -hex 4 | tr '[:lower:]' '[:upper:]')-$(openssl rand -hex 4 | tr '[:lower:]' '[:upper:]')-$(openssl rand -hex 4 | tr '[:lower:]' '[:upper:]')"
            print_success "License key generada: $license_key"
        fi

        # Generar JWT secret
        jwt_secret=$(openssl rand -base64 32)
        jwt_refresh_secret=$(openssl rand -base64 32)

        # Actualizar .env
        if [ "$install_db" == "s" ] || [ "$install_db" == "S" ]; then
            sed -i.bak "s|DB_HOST=.*|DB_HOST=$db_host|" .env
            sed -i.bak "s|DB_PORT=.*|DB_PORT=$db_port|" .env
            sed -i.bak "s|DB_USER=.*|DB_USER=$db_app_user|" .env
            sed -i.bak "s|DB_PASSWORD=.*|DB_PASSWORD=$db_app_password|" .env
            sed -i.bak "s|DB_NAME=.*|DB_NAME=$db_name|" .env
        fi

        sed -i.bak "s|LICENSE_KEY=.*|LICENSE_KEY=$license_key|" .env
        sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=$jwt_secret|" .env
        sed -i.bak "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$jwt_refresh_secret|" .env

        rm .env.bak 2>/dev/null || true

        print_success "Archivo .env configurado"
    else
        print_error "Archivo .env.example no encontrado"
        exit 1
    fi
else
    print_warning "Archivo .env ya existe, no se sobrescribirá"
fi

# Instalar dependencias del backend
print_info "Instalando dependencias del backend..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependencias del backend instaladas"
else
    print_error "Error al instalar dependencias del backend"
    exit 1
fi

# =====================================================
# 4. CONFIGURAR FRONTEND
# =====================================================

echo ""
print_info "Configurando frontend..."
echo ""

FRONTEND_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../frontend" && pwd )"

if [ -d "$FRONTEND_DIR" ]; then
    cd "$FRONTEND_DIR"

    # Instalar dependencias del frontend
    if [ -f "package.json" ]; then
        print_info "Instalando dependencias del frontend..."
        npm install

        if [ $? -eq 0 ]; then
            print_success "Dependencias del frontend instaladas"
        else
            print_error "Error al instalar dependencias del frontend"
        fi
    else
        print_warning "package.json no encontrado en frontend"
    fi
else
    print_warning "Directorio frontend no encontrado"
fi

# =====================================================
# 5. CREAR SCRIPTS DE INICIO
# =====================================================

echo ""
print_info "Creando scripts de inicio..."
echo ""

# Script para iniciar backend
cat > "$BACKEND_DIR/start.sh" <<'EOF'
#!/bin/bash
echo "Iniciando SystemSegure Backend..."
npm start
EOF

chmod +x "$BACKEND_DIR/start.sh"
print_success "Script de inicio del backend creado"

# Script para iniciar frontend (si existe)
if [ -d "$FRONTEND_DIR" ]; then
    cat > "$FRONTEND_DIR/start.sh" <<'EOF'
#!/bin/bash
echo "Iniciando SystemSegure Frontend..."
npm start
EOF

    chmod +x "$FRONTEND_DIR/start.sh"
    print_success "Script de inicio del frontend creado"
fi

# =====================================================
# 6. INSERTAR LICENCIA EN BASE DE DATOS
# =====================================================

if [ "$install_db" == "s" ] || [ "$install_db" == "S" ]; then
    echo ""
    print_info "Insertando licencia en base de datos..."

    # Obtener license key del .env
    source "$BACKEND_DIR/.env"

    EXPIRATION_DATE=$(date -d "+1 year" +%Y-%m-%d)

    mysql -h "$db_host" -P "$db_port" -u "$db_app_user" -p"$db_app_password" "$db_name" <<EOF
INSERT INTO licenses (
    license_key, license_type, company_name, contact_email,
    purchase_date, activation_date, expiration_date,
    status, is_paid, payment_status, max_users, max_devices, features
) VALUES (
    '$LICENSE_KEY',
    'free',
    'Mi Empresa',
    'admin@miempresa.com',
    CURDATE(),
    CURDATE(),
    '$EXPIRATION_DATE',
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
) ON DUPLICATE KEY UPDATE license_key=license_key;
EOF

    if [ $? -eq 0 ]; then
        print_success "Licencia insertada en base de datos"
    else
        print_warning "Error al insertar licencia (puede que ya exista)"
    fi
fi

# =====================================================
# 7. RESUMEN DE INSTALACIÓN
# =====================================================

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║          ¡Instalación completada con éxito!          ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

print_success "SystemSegure FREE Version instalado correctamente"
echo ""

print_info "Información de la instalación:"
echo ""
echo "  License Key: $LICENSE_KEY"
echo "  Base de datos: $db_name"
echo "  Backend: $BACKEND_DIR"
echo "  Frontend: $FRONTEND_DIR"
echo ""

print_info "Próximos pasos:"
echo ""
echo "  1. Para iniciar el backend:"
echo "     cd $BACKEND_DIR"
echo "     npm start"
echo ""
echo "  2. Para iniciar el frontend:"
echo "     cd $FRONTEND_DIR"
echo "     npm start"
echo ""
echo "  3. Acceder a la aplicación:"
echo "     Backend API: http://localhost:3000"
echo "     Frontend: http://localhost:3001"
echo ""

print_info "Credenciales por defecto (admin):"
echo "  Usuario: admin"
echo "  Password: Admin123!"
echo "  (Cámbielo después del primer login)"
echo ""

print_warning "IMPORTANTE:"
echo "  - Asegúrese de cambiar las credenciales por defecto"
echo "  - Configure SMTP en .env para notificaciones por email"
echo "  - En producción, use HTTPS y certificados SSL"
echo ""

print_success "¡Gracias por usar SystemSegure!"
echo ""
