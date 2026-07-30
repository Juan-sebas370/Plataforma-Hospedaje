# Hospedaje Sebastian - Backend Java

Backend completamente reconstruido en **Spring Boot 3.2** con MongoDB.

## Quick Start

### Opción 1: Usar el script
```bash
# Windows
run.bat

# Linux/Mac
chmod +x run.sh
./run.sh
```

### Opción 2: Comandos directos

```bash
# Compilar
mvn clean install

# Ejecutar
mvn spring-boot:run
```

La app estará en **http://localhost:3000/api**

## Requisitos Previos

- ✅ Java 17+
- ✅ Maven 3.8+
- ✅ MongoDB (local o Atlas)

## Stack Tecnológico

- **Spring Boot 3.2**: Framework principal
- **Spring Data MongoDB**: Acceso a base de datos
- **Spring Security**: Seguridad y JWT
- **Lombok**: Reducir código boilerplate
- **jjwt**: Manejo de tokens JWT

## Estructura

```
src/main/java/com/hotelsebasitian/
├── controller/     # Endpoints REST
├── service/        # Lógica de negocio
├── repository/     # Acceso a datos
├── entity/         # Modelos
├── dto/            # Transferencia de datos
├── security/       # JWT y seguridad
└── config/         # Configuración global
```

## Endpoints Principales

```
POST   /api/auth/login
POST   /api/auth/registro
GET    /api/habitaciones
GET    /api/reservas
POST   /api/reservas
```

Ver [README_JAVA.md](README_JAVA.md) para documentación completa.

## Configuración

Editar `src/main/resources/application.yml`:
- Puerto: 3000
- Base de datos: MongoDB
- JWT Secret: Cambiar en producción

## Build para Producción

```bash
mvn clean package
java -jar target/hospedaje-sebastian-1.0.0.jar
```

## Notas

- El código anterior de Node.js se puede eliminar cuando esté listo
- El frontend continuará funcionando sin cambios si usa los mismos endpoints
- Las credenciales y secretos deben estar en variables de entorno en producción

📖 [Documentación completa →](README_JAVA.md)
