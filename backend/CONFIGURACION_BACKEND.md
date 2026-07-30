# ⚙️ CONFIGURACIÓN DEL BACKEND - Hotel Sebastian

## 📋 Requisitos Previos

- Java 17+
- Maven 3.6+
- MySQL 8.0+
- Puerto 3000 disponible

---

## 🚀 Configuración Rápida (5 minutos)

### PASO 1: Base de Datos MySQL

```bash
# Iniciar MySQL
mysql -u root -p

# La base de datos se crea automáticamente al iniciar la aplicación
# Nombre: hotel_sebastian
```

### PASO 2: Verificar Configuración

Revisa el archivo de configuración:
- **Opción A:** `application.yml` (por defecto)
- **Opción B:** `application.properties` (alternativo)

**Configuración actual:**
```yaml
Base de datos: hotel_sebastian
Usuario MySQL: root
Contraseña MySQL: root
Puerto servidor: 3000
Context path: /api
```

### PASO 3: Compilar y Ejecutar

```bash
# Desde la carpeta backend/
mvn clean install
mvn spring-boot:run
```

O usar el script:
```bash
# Windows
run.bat

# Linux/Mac
./run.sh
```

### PASO 4: Insertar Usuario de Prueba

```bash
mysql -u root -p hotel_sebastian < src/main/resources/db/usuarios_prueba.sql
```

### PASO 5: Verificar

Abre en el navegador:
```
http://localhost:3000/api/health
```

Deberías ver:
```json
{
  "status": "UP",
  "timestamp": "2026-02-20T..."
}
```

---

## 🔧 Configuración Detallada

### Cambiar Puerto del Servidor

En `application.yml`:
```yaml
server:
  port: 8080  # Cambiar a tu puerto preferido
```

En `application.properties`:
```properties
server.port=8080
```

### Cambiar Credenciales MySQL

En `application.yml`:
```yaml
spring:
  datasource:
    username: tu_usuario
    password: tu_contraseña
```

En `application.properties`:
```properties
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña
```

### Configurar Email (Recuperación de Contraseña)

```bash
# Variables de entorno
export MAIL_USERNAME=tu-email@gmail.com
export MAIL_PASSWORD=tu-app-password

# Windows PowerShell
$env:MAIL_USERNAME="tu-email@gmail.com"
$env:MAIL_PASSWORD="tu-app-password"
```

### Configurar JWT Secret

```bash
# Variable de entorno
export JWT_SECRET=tu-clave-super-secreta-cambiar-en-produccion

# Windows PowerShell
$env:JWT_SECRET="tu-clave-super-secreta-cambiar-en-produccion"
```

---

## 📊 Endpoints Principales

**Base URL:** `http://localhost:3000/api`

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/registro` - Registrar usuario
- `POST /auth/logout` - Cerrar sesión
- `POST /auth/forgot-password` - Recuperar contraseña

### Habitaciones
- `GET /habitaciones` - Listar habitaciones
- `POST /habitaciones` - Crear habitación
- `GET /habitaciones/{id}` - Obtener habitación

### Reservas
- `GET /reservas` - Listar reservas
- `POST /reservas` - Crear reserva
- `GET /reservas/{id}` - Obtener reserva

### Pagos
- `GET /pagos` - Listar pagos
- `POST /pagos` - Crear pago
- `GET /pagos/reserva/{id}` - Pagos por reserva

### Contacto
- `GET /contactos` - Listar mensajes
- `POST /contactos` - Enviar mensaje

### Health Check
- `GET /health` - Estado del servidor

---

## 🧪 Testing con Postman

Importa la colección Postman:
```
backend/Hospedaje_Sebastian_API.postman_collection.json
```

---

## 🐛 Solución de Problemas

### Error: "Access denied for user"
```bash
# Verifica credenciales MySQL
mysql -u root -p

# Actualiza application.yml con las credenciales correctas
```

### Error: Puerto 3000 en uso
```bash
# Windows: Ver qué usa el puerto
netstat -ano | findstr :3000

# Cambia el puerto en application.yml
server.port: 8080
```

### Error: Base de datos no existe
```bash
# Crear manualmente
mysql -u root -p
CREATE DATABASE hotel_sebastian;
```

### Error: Tabla usuarios no existe
```bash
# Ejecutar esquema
mysql -u root -p hotel_sebastian < src/main/resources/db/schema.sql
```

---

## 📝 Scripts Disponibles

### Windows
- `run.bat` - Ejecutar aplicación
- `start-mysql.bat` - Iniciar MySQL
- `start-backend.bat` - Compilar y ejecutar

### Linux/Mac
- `run.sh` - Ejecutar aplicación
- `test-endpoints.sh` - Probar endpoints

---

## 🔐 Credenciales de Prueba

```
Email:       sebastian@gmail.com
Contraseña:  jiampi2018*
```

Más información en: `CREDENCIALES_INICIO_RAPIDO.md`

---

## 📚 Documentación Adicional

- `ARQUITECTURA.md` - Arquitectura del sistema
- `COMANDOS.md` - Comandos útiles
- `INTEGRACION_FRONTEND.md` - Integración con Angular

---

**Última actualización:** 2026-02-20
