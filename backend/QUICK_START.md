# 🚀 INSTRUCCIONES DE INICIO RÁPIDO

## Paso 1: Verificar Requisitos

```bash
# Java
java -version  # Debe ser Java 17 o superior

# Maven
mvn -version   # Debe ser Maven 3.8 o superior
```

Si no tienes Java 17:
- Descarga desde: https://www.oracle.com/java/technologies/downloads/
- O usa: `choco install openjdk` (si tienes Chocolatey en Windows)

Si no tienes Maven:
- Descarga desde: https://maven.apache.org/download.cgi
- O usa: `choco install maven` (Windows) o `brew install maven` (Mac)

## Paso 2: Configurar MongoDB

### Opción A: MongoDB Local
```bash
# Windows: Descarga e instala desde https://www.mongodb.com/try/download/community
# Luego abre una terminal y ejecuta:
mongod
```

### Opción B: MongoDB con Docker (Recomendado)
```bash
# Inicia MongoDB con Docker Compose
docker-compose up -d

# Mongo Express estará en: http://localhost:8081
# Usuario: admin | Contraseña: admin123
```

## Paso 3: Compilar el Proyecto

```bash
# En la carpeta backend/
mvn clean install

# O usa el script:
# Windows: run.bat (opción 1)
# Linux/Mac: ./run.sh (opción 1)
```

Esto descargará todas las dependencias y compilará el proyecto.

## Paso 4: Ejecutar la Aplicación

```bash
# Opción A: Comando directo
mvn spring-boot:run

# Opción B: Script interactivo
# Windows: run.bat (opción 2)
# Linux/Mac: ./run.sh (opción 2)

# Opción C: JAR ejecutable
mvn clean package
java -jar target/hospedaje-sebastian-1.0.0.jar
```

La aplicación estará disponible en:
- **Servidor**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health
- **Mongo Express** (si usas Docker): http://localhost:8081

## Paso 5: Probar la API

### Con cURL:
```bash
# Health check
curl http://localhost:3000/api/health

# Registro de usuario
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123",
    "nombre":"Juan",
    "apellido":"Pérez",
    "telefono":"+34 666 555 444",
    "cedulaIdentidad":"12345678A"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123"
  }'
```

### Con Postman:
1. Abre Postman
2. Importa: `Hospedaje_Sebastian_API.postman_collection.json`
3. Cambia la URL `http://localhost:3000/api`
4. Prueba los endpoints

### Con Visual Studio Code:
1. Instala la extensión "REST Client"
2. Crea un archivo `test.http`
3. Escribe tus solicitudes HTTP

## Paso 6: Estructura del Proyecto

```
backend/
├── src/main/
│   ├── java/com/hotelsebasitian/
│   │   ├── controller/      ← Endpoints (GET, POST, PUT, DELETE)
│   │   ├── service/         ← Lógica de negocio
│   │   ├── repository/      ← Acceso a base de datos
│   │   ├── entity/          ← Modelos (Usuario, Habitacion, Reserva)
│   │   ├── dto/             ← Transferencia de datos
│   │   └── security/        ← JWT y autenticación
│   └── resources/
│       └── application.yml  ← Configuración (puerto, BD, JWT)
├── pom.xml                  ← Dependencias Maven
├── docker-compose.yml       ← Configuración MongoDB con Docker
└── README_JAVA.md           ← Documentación completa
```

## Paso 7: Endpoints Disponibles

### Autenticación
- `POST /api/auth/registro` - Crear nueva cuenta
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### Habitaciones
- `GET /api/habitaciones` - Todas las habitaciones
- `GET /api/habitaciones/{id}` - Habitación específica
- `GET /api/habitaciones/disponibles` - Solo disponibles
- `POST /api/habitaciones` - Crear habitación
- `PUT /api/habitaciones/{id}` - Actualizar
- `DELETE /api/habitaciones/{id}` - Eliminar

### Reservas
- `GET /api/reservas` - Todas las reservas
- `GET /api/reservas/{id}` - Reserva específica
- `GET /api/reservas/usuario/{usuarioId}` - Reservas del usuario
- `POST /api/reservas` - Crear reserva
- `PUT /api/reservas/{id}` - Actualizar reserva
- `PUT /api/reservas/{id}/cancelar` - Cancelar
- `DELETE /api/reservas/{id}` - Eliminar

## Troubleshooting

### Error: "Java not found"
```bash
# Windows: Establece la variable JAVA_HOME
set JAVA_HOME=C:\Program Files\Java\jdk-17
# O en el path del sistema
```

### Error: "MongoDB connection refused"
Asegúrate que MongoDB está ejecutándose:
```bash
# Windows
net start MongoDB

# Linux
sudo service mongod start

# Mac
brew services start mongodb-community

# O con Docker
docker-compose up -d
```

### Error: "Port 3000 already in use"
Cambia el puerto en `src/main/resources/application.yml`:
```yaml
server:
  port: 3001  # Cambiar a otro puerto
```

### Build lento
Maven descarga las dependencias la primera vez. Una vez completado será más rápido.

## Próximos Pasos

1. ✅ Compilar y ejecutar la aplicación
2. 📊 Crear datos de prueba en Mongo Express
3. 🔌 Conectar el frontend Angular a los nuevos endpoints
4. 📝 Implementar validaciones adicionales
5. 🔐 Configurar roles y permisos
6. 🧪 Escribir tests unitarios

## Soporte

Para más información:
- Spring Boot: https://spring.io/projects/spring-boot
- MongoDB: https://docs.mongodb.com/
- JWT: https://jwt.io/

¡Listo para empezar! 🎉
