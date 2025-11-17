@echo off
setlocal enabledelayedexpansion

REM =====================================================
REM SCRIPT DE INSTALACIÓN SYSTEMSEGURE - FREE VERSION
REM Para Windows
REM =====================================================

echo ========================================================
echo.
echo       SystemSegure - Instalacion FREE Version
echo.
echo ========================================================
echo.

REM Verificar privilegios de administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [WARNING] Se recomienda ejecutar como Administrador
    echo Continuando de todas formas...
    echo.
)

REM =====================================================
REM 1. VERIFICAR REQUISITOS DEL SISTEMA
REM =====================================================

echo.
echo [INFO] Verificando requisitos del sistema...
echo.

REM Verificar Node.js
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Node.js no esta instalado
    echo Por favor, instale Node.js 16 o superior desde https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo [OK] Node.js encontrado: !NODE_VERSION!
)

REM Verificar npm
where npm >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] npm no esta instalado
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
    echo [OK] npm encontrado: !NPM_VERSION!
)

REM Verificar MySQL
where mysql >nul 2>&1
if %errorLevel% neq 0 (
    echo [WARNING] MySQL client no encontrado en PATH
    echo Asegurese de que MySQL Server este instalado y en ejecucion
) else (
    echo [OK] MySQL encontrado
)

REM =====================================================
REM 2. CONFIGURAR BASE DE DATOS
REM =====================================================

echo.
echo [INFO] Configuracion de base de datos...
echo.

set /p install_db="Desea instalar la base de datos ahora? (s/n): "

if /i "!install_db!"=="s" (
    echo.
    set /p db_host="Host de MySQL [localhost]: "
    if "!db_host!"=="" set db_host=localhost

    set /p db_port="Puerto de MySQL [3306]: "
    if "!db_port!"=="" set db_port=3306

    set /p db_root_user="Usuario root de MySQL: "

    REM Ocultar password (limitado en batch)
    set /p db_root_password="Password de root de MySQL: "

    set /p db_name="Nombre de base de datos [license_management]: "
    if "!db_name!"=="" set db_name=license_management

    set /p db_app_user="Usuario de aplicacion [license_app]: "
    if "!db_app_user!"=="" set db_app_user=license_app

    set /p db_app_password="Password para usuario de aplicacion: "

    echo.
    echo [INFO] Creando base de datos...

    REM Crear archivo temporal con comandos SQL
    echo CREATE DATABASE IF NOT EXISTS !db_name! CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; > temp_create_db.sql
    echo CREATE USER IF NOT EXISTS '!db_app_user!'@'localhost' IDENTIFIED BY '!db_app_password!'; >> temp_create_db.sql
    echo CREATE USER IF NOT EXISTS '!db_app_user!'@'%%' IDENTIFIED BY '!db_app_password!'; >> temp_create_db.sql
    echo GRANT ALL PRIVILEGES ON !db_name!.* TO '!db_app_user!'@'localhost'; >> temp_create_db.sql
    echo GRANT ALL PRIVILEGES ON !db_name!.* TO '!db_app_user!'@'%%'; >> temp_create_db.sql
    echo FLUSH PRIVILEGES; >> temp_create_db.sql

    mysql -h !db_host! -P !db_port! -u !db_root_user! -p!db_root_password! < temp_create_db.sql

    if !errorLevel! equ 0 (
        echo [OK] Base de datos creada exitosamente
    ) else (
        echo [ERROR] Error al crear base de datos
        del temp_create_db.sql
        pause
        exit /b 1
    )

    del temp_create_db.sql

    REM Importar schema
    echo [INFO] Importando schema de base de datos...

    set SCRIPT_DIR=%~dp0
    set SQL_FILE=%SCRIPT_DIR%..\..\database_schema.sql

    if exist "!SQL_FILE!" (
        mysql -h !db_host! -P !db_port! -u !db_app_user! -p!db_app_password! !db_name! < "!SQL_FILE!"

        if !errorLevel! equ 0 (
            echo [OK] Schema importado exitosamente
        ) else (
            echo [ERROR] Error al importar schema
            pause
            exit /b 1
        )
    ) else (
        echo [ERROR] Archivo SQL no encontrado: !SQL_FILE!
        pause
        exit /b 1
    )
) else (
    echo [WARNING] Instalacion de base de datos omitida
    echo Recuerde ejecutar el script SQL manualmente
)

REM =====================================================
REM 3. CONFIGURAR BACKEND
REM =====================================================

echo.
echo [INFO] Configurando backend...
echo.

set BACKEND_DIR=%SCRIPT_DIR%..\backend
cd /d "%BACKEND_DIR%"

REM Copiar archivo .env de ejemplo
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
        echo [OK] Archivo .env creado desde .env.example

        REM Solicitar configuración
        echo.
        set /p license_key="License Key (o presione Enter para generar una): "

        if "!license_key!"=="" (
            REM Generar license key simple
            set "license_key=FREE-%RANDOM%%RANDOM%-%RANDOM%%RANDOM%-%RANDOM%%RANDOM%-%RANDOM%%RANDOM%"
            echo [OK] License key generada: !license_key!
        )

        REM Actualizar .env
        if /i "!install_db!"=="s" (
            powershell -Command "(gc .env) -replace 'DB_HOST=.*', 'DB_HOST=!db_host!' | Out-File -encoding ASCII .env"
            powershell -Command "(gc .env) -replace 'DB_PORT=.*', 'DB_PORT=!db_port!' | Out-File -encoding ASCII .env"
            powershell -Command "(gc .env) -replace 'DB_USER=.*', 'DB_USER=!db_app_user!' | Out-File -encoding ASCII .env"
            powershell -Command "(gc .env) -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=!db_app_password!' | Out-File -encoding ASCII .env"
            powershell -Command "(gc .env) -replace 'DB_NAME=.*', 'DB_NAME=!db_name!' | Out-File -encoding ASCII .env"
        )

        powershell -Command "(gc .env) -replace 'LICENSE_KEY=.*', 'LICENSE_KEY=!license_key!' | Out-File -encoding ASCII .env"

        echo [OK] Archivo .env configurado
    ) else (
        echo [ERROR] Archivo .env.example no encontrado
        pause
        exit /b 1
    )
) else (
    echo [WARNING] Archivo .env ya existe, no se sobrescribira
)

REM Instalar dependencias del backend
echo [INFO] Instalando dependencias del backend...
call npm install

if !errorLevel! equ 0 (
    echo [OK] Dependencias del backend instaladas
) else (
    echo [ERROR] Error al instalar dependencias del backend
    pause
    exit /b 1
)

REM =====================================================
REM 4. CONFIGURAR FRONTEND
REM =====================================================

echo.
echo [INFO] Configurando frontend...
echo.

set FRONTEND_DIR=%SCRIPT_DIR%..\frontend

if exist "%FRONTEND_DIR%" (
    cd /d "%FRONTEND_DIR%"

    REM Instalar dependencias del frontend
    if exist "package.json" (
        echo [INFO] Instalando dependencias del frontend...
        call npm install

        if !errorLevel! equ 0 (
            echo [OK] Dependencias del frontend instaladas
        ) else (
            echo [ERROR] Error al instalar dependencias del frontend
        )
    ) else (
        echo [WARNING] package.json no encontrado en frontend
    )
) else (
    echo [WARNING] Directorio frontend no encontrado
)

REM =====================================================
REM 5. CREAR SCRIPTS DE INICIO
REM =====================================================

echo.
echo [INFO] Creando scripts de inicio...
echo.

REM Script para iniciar backend
echo @echo off > "%BACKEND_DIR%\start.bat"
echo echo Iniciando SystemSegure Backend... >> "%BACKEND_DIR%\start.bat"
echo npm start >> "%BACKEND_DIR%\start.bat"

echo [OK] Script de inicio del backend creado

REM Script para iniciar frontend
if exist "%FRONTEND_DIR%" (
    echo @echo off > "%FRONTEND_DIR%\start.bat"
    echo echo Iniciando SystemSegure Frontend... >> "%FRONTEND_DIR%\start.bat"
    echo npm start >> "%FRONTEND_DIR%\start.bat"

    echo [OK] Script de inicio del frontend creado
)

REM =====================================================
REM 6. INSERTAR LICENCIA EN BASE DE DATOS
REM =====================================================

if /i "!install_db!"=="s" (
    echo.
    echo [INFO] Insertando licencia en base de datos...

    REM Calcular fecha de expiracion (1 año)
    for /f "tokens=1-3 delims=/ " %%a in ('date /t') do (
        set /a year=%%c+1
        set month=%%a
        set day=%%b
    )
    set EXPIRATION_DATE=!year!-!month!-!day!

    REM Crear archivo temporal con INSERT
    echo INSERT INTO licenses ( > temp_insert_license.sql
    echo     license_key, license_type, company_name, contact_email, >> temp_insert_license.sql
    echo     purchase_date, activation_date, expiration_date, >> temp_insert_license.sql
    echo     status, is_paid, payment_status, max_users, max_devices, features >> temp_insert_license.sql
    echo ^) VALUES ( >> temp_insert_license.sql
    echo     '!license_key!', >> temp_insert_license.sql
    echo     'free', >> temp_insert_license.sql
    echo     'Mi Empresa', >> temp_insert_license.sql
    echo     'admin@miempresa.com', >> temp_insert_license.sql
    echo     CURDATE^(^), >> temp_insert_license.sql
    echo     CURDATE^(^), >> temp_insert_license.sql
    echo     '!EXPIRATION_DATE!', >> temp_insert_license.sql
    echo     'active', >> temp_insert_license.sql
    echo     TRUE, >> temp_insert_license.sql
    echo     'free', >> temp_insert_license.sql
    echo     1, >> temp_insert_license.sql
    echo     1, >> temp_insert_license.sql
    echo     JSON_OBJECT^( >> temp_insert_license.sql
    echo         'dashboard', true, >> temp_insert_license.sql
    echo         'basic_reports', true, >> temp_insert_license.sql
    echo         'user_management', false, >> temp_insert_license.sql
    echo         'advanced_analytics', false, >> temp_insert_license.sql
    echo         'api_access', false, >> temp_insert_license.sql
    echo         'custom_branding', false >> temp_insert_license.sql
    echo     ^) >> temp_insert_license.sql
    echo ^) ON DUPLICATE KEY UPDATE license_key=license_key; >> temp_insert_license.sql

    mysql -h !db_host! -P !db_port! -u !db_app_user! -p!db_app_password! !db_name! < temp_insert_license.sql

    if !errorLevel! equ 0 (
        echo [OK] Licencia insertada en base de datos
    ) else (
        echo [WARNING] Error al insertar licencia ^(puede que ya exista^)
    )

    del temp_insert_license.sql
)

REM =====================================================
REM 7. RESUMEN DE INSTALACIÓN
REM =====================================================

echo.
echo ========================================================
echo.
echo          Instalacion completada con exito!
echo.
echo ========================================================
echo.

echo [OK] SystemSegure FREE Version instalado correctamente
echo.

echo [INFO] Informacion de la instalacion:
echo.
echo   License Key: !license_key!
echo   Base de datos: !db_name!
echo   Backend: %BACKEND_DIR%
echo   Frontend: %FRONTEND_DIR%
echo.

echo [INFO] Proximos pasos:
echo.
echo   1. Para iniciar el backend:
echo      cd "%BACKEND_DIR%"
echo      npm start
echo.
echo   2. Para iniciar el frontend:
echo      cd "%FRONTEND_DIR%"
echo      npm start
echo.
echo   3. Acceder a la aplicacion:
echo      Backend API: http://localhost:3000
echo      Frontend: http://localhost:3001
echo.

echo [INFO] Credenciales por defecto ^(admin^):
echo   Usuario: admin
echo   Password: Admin123!
echo   ^(Cambielo despues del primer login^)
echo.

echo [WARNING] IMPORTANTE:
echo   - Asegurese de cambiar las credenciales por defecto
echo   - Configure SMTP en .env para notificaciones por email
echo   - En produccion, use HTTPS y certificados SSL
echo.

echo [OK] Gracias por usar SystemSegure!
echo.

pause
