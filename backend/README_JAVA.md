# Backend Java - Hospedaje Sebastian

Este es el nuevo backend en **Spring Boot** (Java) para el sistema de gestión hotelera Hospedaje Sebastian.

## Requisitos

- **Java 17+**
- **Maven 3.8+**
- **MongoDB** (ejecutar localmente o usar Atlas)
- **Git**

## Estructura del Proyecto

```
src/
├── main/
│   ├── java/com/hotelsebasitian/
│   │   ├── controller/        # Controladores REST
│   │   ├── service/           # Lógica de negocio
│   │   ├── repository/        # Acceso a datos (MongoDB)
│   │   ├── entity/            # Modelos de datos
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── security/          # Configuración JWT
│   │   ├── config/            # Configuración CORS y otras
│   │   └── HospedajeApplication.java  # Clase principal
│   └── resources/
│       └── application.yml    # Configuración de la aplicación
└── test/                      # Tests unitarios
```

## Instalación y Configuración

### 1. Clonar o descargar el proyecto

```bash
cd Hotel\ Sebastian/backend
```

### 2. Configurar MongoDB

Si tienes MongoDB instalado localmente:
```bash
mongod
```

O usa MongoDB Atlas en la nube. Actualiza `application.yml`:
```yaml
spring.data.mongodb.uri: mongodb+srv://usuario:password@cluster.mongodb.net/hospedaje_db
```

### 3. Instalar dependencias y compilar

```bash
mvn clean install
```

### 4. Ejecutar la aplicación

```bash
mvn spring-boot:run
```

La aplicación estará disponible en: **http://localhost:3000/api**

## Endpoints Disponibles

### Autenticación
- `POST /api/auth/login` - Login
- `POST /api/auth/registro` - Registro de nuevo usuario
- `POST /api/auth/logout` - Logout

### Habitaciones
- `GET /api/habitaciones` - Obtener todas las habitaciones
- `GET /api/habitaciones/{id}` - Obtener habitación por ID
- `GET /api/habitaciones/disponibles` - Obtener habitaciones disponibles
- `POST /api/habitaciones` - Crear nueva habitación
- `PUT /api/habitaciones/{id}` - Actualizar habitación
- `DELETE /api/habitaciones/{id}` - Eliminar habitación

### Reservas
- `GET /api/reservas` - Obtener todas las reservas
- `GET /api/reservas/{id}` - Obtener reserva por ID
- `GET /api/reservas/usuario/{usuarioId}` - Obtener reservas de un usuario
- `POST /api/reservas` - Crear nueva reserva
- `PUT /api/reservas/{id}` - Actualizar reserva
- `PUT /api/reservas/{id}/cancelar` - Cancelar reserva
- `DELETE /api/reservas/{id}` - Eliminar reserva

### Health
- `GET /api/` - Información de bienvenida
- `GET /api/health` - Estado del servidor

## Configuración JWT

El JWT se configura en `application.yml`:
```yaml
jwt:
  secret: tu-clave-secreta-super-segura-cambiar-en-produccion-12345
  expiration: 86400000  # 24 horas en milisegundos
```

⚠️ **Importante**: Cambiar el `secret` en producción con una clave más segura.

## Ejemplo de Solicitudes

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@example.com","password":"password123"}'
```

### Crear Habitación
```bash
curl -X POST http://localhost:3000/api/habitaciones \
  -H "Content-Type: application/json" \
  -d '{
    "numero":"101",
    "tipo":"DOBLE",
    "capacidad":2,
    "precioNoche":50.0,
    "descripcion":"Habitación doble con vista al mar",
    "servicios":["WiFi","TV","Aire acondicionado"],
    "climatizacion":true,
    "television":true,
    "wifi":true
  }'
```

### Crear Reserva
```bash
curl -X POST http://localhost:3000/api/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId":"usuario123",
    "habitacionId":"habitacion456",
    "fechaIngreso":"2026-03-01",
    "fechaSalida":"2026-03-05",
    "huespedes":2,
    "nombreHuesped":"Juan Pérez",
    "telefonoContacto":"+34 666 555 444"
  }'
```

## Desarrollo

### Variables de Entorno

Crear un archivo `.env` o exportar las variables:
```bash
export JWT_SECRET="tu-secreto-muy-seguro-aqui"
```

### Build y Deploy

Para crear un JAR ejecutable:
```bash
mvn clean package
java -jar target/hospedaje-sebastian-1.0.0.jar
```

## Limpieza de la Carpeta del Backend Anterior

Una vez que el nuevo backend está funcionando correctamente, puedes eliminar los archivos antiguos de Node.js:
```bash
rm -f backend/server.js backend/package.json backend/package-lock.json
```

## Próximos Pasos

1. Conectar el frontend Angular con los nuevos endpoints
2. Implementar validaciones adicionales
3. Agregar autenticación y autorización basada en roles
4. Crear tests unitarios e integración
5. Documentar la API con Swagger/OpenAPI

## Documentación

Para más información sobre Spring Boot, visita:
- [Spring Boot Official](https://spring.io/projects/spring-boot)
- [MongoDB Integration](https://spring.io/projects/spring-data-mongodb)
- [JWT en Spring Security](https://spring.io/blog/2015/01/12/spring-and-oauth2)

## Soporte

Para reportar problemas o sugerencias, abre un issue en el repositorio.
