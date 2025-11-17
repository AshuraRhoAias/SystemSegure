# SystemSegure - Versión FREE

## Sistema de Gestión de Licencias con Verificación Automática

Sistema completo de gestión de licencias con backend Node.js/Express, frontend React, y base de datos MySQL. Incluye verificación automática cada 7 días, alertas de vencimiento, y panel administrativo completo.

---

## 📋 Características

### Versión FREE
- ✅ Dashboard básico
- ✅ Reportes básicos
- ✅ 1 usuario máximo
- ✅ 1 dispositivo máximo
- ❌ Gestión de múltiples usuarios
- ❌ Analítica avanzada
- ❌ Acceso API
- ❌ Branding personalizado

### Características Generales
- 🔐 Autenticación segura con JWT
- 🔄 Verificación automática de licencia cada 7 días
- ⚠️ Alertas de vencimiento 7 días antes
- 📊 Panel administrativo con logs y estadísticas
- 🛡️ Registro de intentos de acceso (autorizados y no autorizados)
- 📧 Sistema de notificaciones
- 🔒 Seguridad con helmet, rate limiting, y bcrypt
- 🌐 Soporte multiplataforma (Windows, Linux, macOS)

---

## 🚀 Requisitos del Sistema

### Software Necesario
- **Node.js** 16 o superior
- **npm** 7 o superior
- **MySQL** 5.7 o superior
- **Git** (opcional)

### Sistemas Operativos Soportados
- Windows 10/11
- Linux (Ubuntu 20.04+, Debian 10+, CentOS 8+)
- macOS 11.0+

---

## 📦 Instalación

### Instalación Automática

#### Linux / macOS
```bash
cd scripts
chmod +x install.sh
./install.sh
```

#### Windows
```cmd
cd scripts
install.bat
```

El script de instalación hará lo siguiente:
1. Verificar requisitos del sistema
2. Crear base de datos MySQL
3. Importar schema de base de datos
4. Configurar archivos .env
5. Instalar dependencias del backend y frontend
6. Generar license key
7. Crear scripts de inicio

---

### Instalación Manual

#### 1. Configurar Base de Datos

```bash
# Conectarse a MySQL
mysql -u root -p

# Ejecutar script SQL
source ../../database_schema.sql

# Crear usuario de aplicación
CREATE USER 'license_app'@'localhost' IDENTIFIED BY 'TuPasswordSeguro';
GRANT ALL PRIVILEGES ON license_management.* TO 'license_app'@'localhost';
FLUSH PRIVILEGES;
```

#### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tus configuraciones
nano .env
```

**Configuraciones importantes en .env:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=license_app
DB_PASSWORD=TuPasswordSeguro
DB_NAME=license_management

LICENSE_KEY=FREE-XXXX-XXXX-XXXX-XXXX
JWT_SECRET=tu-secreto-jwt-muy-seguro
```

#### 3. Configurar Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# El archivo .env ya está configurado
# Verificar que la URL del API sea correcta
```

---

## 🎯 Uso

### Iniciar el Sistema

#### Backend
```bash
cd backend
npm start
```
El backend estará disponible en: http://localhost:3000

#### Frontend
```bash
cd frontend
npm start
```
El frontend estará disponible en: http://localhost:3001

### Credenciales por Defecto

**Administrador:**
- Usuario: `admin`
- Password: `Admin123!`
- ⚠️ **IMPORTANTE:** Cambiar estas credenciales inmediatamente después del primer login

### Generar Nueva Licencia

Las licencias se generan automáticamente durante la instalación. Para generar una licencia manualmente:

```bash
# Desde el backend
node -e "
const crypto = require('crypto');
const parts = [];
for (let i = 0; i < 4; i++) {
    parts.push(crypto.randomBytes(2).toString('hex').toUpperCase());
}
console.log('FREE-' + parts.join('-'));
"
```

---

## 🔧 Configuración Avanzada

### Variables de Entorno del Backend

| Variable | Descripción | Por Defecto |
|----------|-------------|-------------|
| `PORT` | Puerto del servidor | 3000 |
| `DB_HOST` | Host de MySQL | localhost |
| `DB_PORT` | Puerto de MySQL | 3306 |
| `DB_NAME` | Nombre de la BD | license_management |
| `LICENSE_KEY` | Clave de licencia | - |
| `JWT_SECRET` | Secreto para JWT | - |
| `JWT_EXPIRES_IN` | Expiración del token | 24h |
| `VERIFICATION_INTERVAL_DAYS` | Días entre verificaciones | 7 |
| `EXPIRATION_WARNING_DAYS` | Días de aviso previo | 7 |

### Configuración de Email (SMTP)

Para habilitar notificaciones por email, configurar en `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
EMAIL_FROM=noreply@systemsegure.com
```

---

## 📊 Estructura del Proyecto

```
free/
├── backend/
│   ├── config/
│   │   ├── database.js          # Configuración de MySQL
│   │   └── logger.js             # Configuración de logs
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js        # Login/Register
│   │   │   └── licenseController.js     # Gestión de licencias
│   │   ├── middleware/
│   │   │   ├── auth.js                  # Autenticación JWT
│   │   │   └── license.js               # Verificación de licencias
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   └── license.routes.js
│   │   └── server.js                    # Servidor principal
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   │   └── AuthContext.js           # Contexto de autenticación
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.js
│   │   │   │   └── Register.js
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.js         # Dashboard de usuario
│   │   │   │   └── LicenseInfo.js
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboard.js    # Panel admin
│   │   │   └── payment/
│   │   │       └── PaymentPage.js
│   │   ├── services/
│   │   │   └── api.js                   # Cliente API
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
├── scripts/
│   ├── install.sh                       # Instalador Linux/Mac
│   └── install.bat                      # Instalador Windows
└── README.md
```

---

## 🔐 Seguridad

### Medidas de Seguridad Implementadas

1. **Autenticación**
   - Passwords hasheados con bcrypt (10 rounds)
   - Tokens JWT con expiración
   - Refresh tokens para renovación

2. **Protección del API**
   - Helmet para headers de seguridad
   - Rate limiting (100 requests/15min)
   - CORS configurado
   - Validación de inputs

3. **Base de Datos**
   - Prepared statements (prevención SQL injection)
   - Usuario de BD con privilegios limitados
   - Triggers para auditoría

4. **Sesiones**
   - Tokens almacenados en localStorage
   - Sesiones con expiración
   - Logout invalida sesión

### Recomendaciones de Seguridad

- ✅ Cambiar credenciales por defecto
- ✅ Usar contraseñas fuertes (mín. 8 caracteres)
- ✅ Configurar HTTPS en producción
- ✅ Mantener Node.js y dependencias actualizadas
- ✅ Hacer backups regulares de la BD
- ✅ Monitorear logs de acceso

---

## 📖 API Documentation

### Endpoints de Autenticación

#### Login de Administrador
```http
POST /api/v1/auth/login/admin
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin123!"
}
```

#### Login de Usuario
```http
POST /api/v1/auth/login/user
Content-Type: application/json

{
  "username": "usuario",
  "password": "password",
  "license_key": "FREE-XXXX-XXXX-XXXX-XXXX"
}
```

#### Registrar Administrador
```http
POST /api/v1/auth/register/admin
Content-Type: application/json

{
  "username": "nuevo_admin",
  "email": "admin@example.com",
  "password": "Password123!",
  "full_name": "Nombre Completo"
}
```

### Endpoints de Licencia

#### Verificar Licencia
```http
POST /api/v1/license/verify
Content-Type: application/json

{
  "license_key": "FREE-XXXX-XXXX-XXXX-XXXX"
}
```

#### Obtener Información de Licencia
```http
GET /api/v1/license/info
Authorization: Bearer {token}
```

#### Renovar Licencia (Admin)
```http
POST /api/v1/license/renew
Authorization: Bearer {token}
Content-Type: application/json

{
  "license_id": 1,
  "amount": 0.00,
  "payment_method": "free",
  "payment_reference": "RENEWAL-2025"
}
```

---

## 🐛 Troubleshooting

### Problemas Comunes

#### Error de Conexión a la Base de Datos

```bash
# Verificar que MySQL esté corriendo
sudo systemctl status mysql

# Verificar credenciales en .env
cat backend/.env | grep DB_
```

#### Puerto ya en uso

```bash
# Backend (puerto 3000)
lsof -ti:3000 | xargs kill -9

# Frontend (puerto 3001)
lsof -ti:3001 | xargs kill -9
```

#### Licencia Expirada

```sql
-- Actualizar fecha de expiración en MySQL
UPDATE licenses
SET expiration_date = DATE_ADD(CURDATE(), INTERVAL 1 YEAR),
    status = 'active'
WHERE license_key = 'TU-LICENSE-KEY';
```

#### Error en npm install

```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## 📝 Logs

Los logs se guardan en:
- **Backend:** `backend/logs/`
  - `error.log` - Solo errores
  - `combined.log` - Todos los logs
  - `http.log` - Requests HTTP

- **Base de Datos:**
  - Tabla `system_logs` - Logs de aplicación
  - Tabla `access_attempts` - Intentos de acceso
  - Tabla `audit_trail` - Auditoría de cambios

---

## 🔄 Actualizaciones

### Actualizar el Sistema

```bash
# Backend
cd backend
npm update

# Frontend
cd frontend
npm update
```

### Migrar Base de Datos

```bash
# Hacer backup antes de migrar
mysqldump -u license_app -p license_management > backup_$(date +%Y%m%d).sql

# Ejecutar nuevas migraciones
mysql -u license_app -p license_management < migrations/nueva_migracion.sql
```

---

## 📞 Soporte

Para soporte técnico:
- **Email:** soporte@systemsegure.com
- **Documentación:** https://docs.systemsegure.com
- **Issues:** https://github.com/systemsegure/issues

---

## 📄 Licencia

Copyright © 2025 SystemSegure. Todos los derechos reservados.

---

## 🎓 Guía Rápida de Uso

### Para Administradores

1. **Primer Login**
   - Acceder a http://localhost:3001
   - Seleccionar pestaña "Administrador"
   - Usuario: `admin`, Password: `Admin123!`
   - Cambiar password inmediatamente

2. **Monitorear el Sistema**
   - Ver logs de acceso
   - Revisar intentos fallidos
   - Verificar sesiones activas
   - Generar reportes

3. **Gestionar Licencias**
   - Ver estado de licencias
   - Renovar licencias
   - Configurar alertas

### Para Usuarios

1. **Acceder al Sistema**
   - Usuario, password y license key
   - Ver dashboard personal
   - Revisar estado de licencia

2. **Personalizar Dashboard**
   - Configurar widgets
   - Ajustar preferencias
   - Ver notificaciones

---

## ✨ Próximas Versiones

Considere actualizar a:

- **BASIC** - 5 usuarios, gestión de usuarios
- **PROFESSIONAL** - 20 usuarios, analítica avanzada, API
- **ENTERPRISE** - Usuarios ilimitados, branding personalizado

Contacte a ventas@systemsegure.com para más información.

---

¡Gracias por usar SystemSegure FREE! 🎉
