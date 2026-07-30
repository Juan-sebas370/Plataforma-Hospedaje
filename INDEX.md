# 📚 Índice de Documentación

## 🎯 Por dónde empezar

### 1. **[LEEME_PRIMERO.md](LEEME_PRIMERO.md)** ← COMIENZA AQUÍ
   - Bienvenida y guía de 3 pasos
   - Requisitos mínimos
   - Índice de qué leer

### 2. **[INSTALACION_COMPLETADA.md](INSTALACION_COMPLETADA.md)**
   - Resumen de todo lo creado
   - Cambios vs versión anterior
   - Validación de funcionamiento
   - FAQs

### 3. **[backend/QUICK_START.md](backend/QUICK_START.md)**
   - Instrucciones paso a paso detalladas
   - Requisitos y setup de MongoDB
   - Primeros tests
   - Troubleshooting

---

## 📖 Documentación del Backend

### Generales
- **[backend/README.md](backend/README.md)** - Overview general del backend
- **[backend/SETUP.md](backend/SETUP.md)** - Setup avanzado y configuración
- **[backend/SUMMARY.md](backend/SUMMARY.md)** - Resumen técnico de cambios

### Técnicas
- **[backend/README_JAVA.md](backend/README_JAVA.md)** - Documentación técnica completa
- **[backend/ARQUITECTURA.md](backend/ARQUITECTURA.md)** - Diagramas y estructura del sistema
- **[backend/COMANDOS.md](backend/COMANDOS.md)** - Comandos útiles para desarrollo

### Integración
- **[backend/INTEGRACION_FRONTEND.md](backend/INTEGRACION_FRONTEND.md)** - Conectar con Angular
  - Configuración de environment.ts
  - Ejemplos de servicios Angular
  - Autenticación y tokens JWT
  - Testing con Postman

---

## 🛠️ Archivos de Configuración

- **[backend/pom.xml](backend/pom.xml)** - Dependencias Maven
- **[backend/src/main/resources/application.yml](backend/src/main/resources/application.yml)** - Configuración Spring Boot
- **[backend/docker-compose.yml](backend/docker-compose.yml)** - MongoDB + Mongo Express con Docker
- **[backend/.gitignore](backend/.gitignore)** - Archivos a ignorar en Git
- **[backend/.env.example](backend/.env.example)** - Ejemplo de variables de entorno

---

## 📮 Testing y Herramientas

- **[backend/Hospedaje_Sebastian_API.postman_collection.json](backend/Hospedaje_Sebastian_API.postman_collection.json)**
  - Importar en Postman para testing rápido

- **[backend/run.bat](backend/run.bat)** y **[backend/run.sh](backend/run.sh)**
  - Scripts interactivos para Windows, Linux y Mac

---

## 🗂️ Estructura Java Creada

### Controllers (Endpoints HTTP)
```
src/main/java/com/hotelsebasitian/controller/
├── AuthController.java
├── HabitacionController.java
├── ReservaController.java
└── HealthController.java
```

### Services (Lógica de Negocio)
```
src/main/java/com/hotelsebasitian/service/
├── AuthService.java
├── HabitacionService.java
└── ReservaService.java
```

### Repositories (Acceso a Datos)
```
src/main/java/com/hotelsebasitian/repository/
├── UsuarioRepository.java
├── HabitacionRepository.java
└── ReservaRepository.java
```

### Entities (Modelos)
```
src/main/java/com/hotelsebasitian/entity/
├── Usuario.java
├── Habitacion.java
└── Reserva.java
```

### DTOs (Transferencia de Datos)
```
src/main/java/com/hotelsebasitian/dto/
├── UsuarioDTO.java
├── LoginRequest.java
├── LoginResponse.java
└── RegistroRequest.java
```

### Security & Config
```
src/main/java/com/hotelsebasitian/
├── security/JwtTokenProvider.java
└── config/CorsConfig.java
```

---

## 📊 Estadísticas

- **Lenguaje**: Java 17
- **Framework**: Spring Boot 3.2
- **Base de Datos**: MongoDB 7.0
- **Build Tool**: Maven 3.8+
- **Archivos Java**: 18
- **Controladores**: 4
- **Servicios**: 3
- **Repositorios**: 3
- **Entidades**: 3
- **DTOs**: 4
- **Configuraciones**: 2
- **Seguridad**: JWT
- **API Endpoints**: 20+

---

## 🎯 Rutas de Aprendizaje

### Para Principiantes
1. Lee: [LEEME_PRIMERO.md](LEEME_PRIMERO.md)
2. Lee: [INSTALACION_COMPLETADA.md](INSTALACION_COMPLETADA.md)
3. Lee: [backend/QUICK_START.md](backend/QUICK_START.md)
4. Ejecuta: `mvn spring-boot:run`

### Para Desarrolladores
1. Lee: [backend/README_JAVA.md](backend/README_JAVA.md)
2. Lee: [backend/ARQUITECTURA.md](backend/ARQUITECTURA.md)
3. Explora: El código en `src/main/java`
4. Aprende: [backend/INTEGRACION_FRONTEND.md](backend/INTEGRACION_FRONTEND.md)

### Para DevOps/Deployment
1. Lee: [backend/README.md](backend/README.md) - Sección Deployment
2. Lee: [backend/SETUP.md](backend/SETUP.md)
3. Usa: [backend/docker-compose.yml](backend/docker-compose.yml) para produción

### Para Testing/QA
1. Importa: [backend/Hospedaje_Sebastian_API.postman_collection.json](backend/Hospedaje_Sebastian_API.postman_collection.json) en Postman
2. Lee: [backend/COMANDOS.md](backend/COMANDOS.md)
3. Testing: Con cURL, Postman o HTTPie

---

## 🔗 Enlaces Rápidos

### Locales (cuando está corriendo)
- API: http://localhost:3000/api
- Health: http://localhost:3000/api/health
- Mongo Express: http://localhost:8081

### Documentación Externa
- Spring Boot: https://spring.io/projects/spring-boot
- MongoDB: https://docs.mongodb.com/
- Maven: https://maven.apache.org/
- JWT: https://jwt.io/

### Herramientas
- Java Download: https://www.oracle.com/java/technologies/downloads/
- Maven Download: https://maven.apache.org/download.cgi
- Postman: https://www.postman.com/
- Docker: https://www.docker.com/get-started

---

## 🆘 Necesito Ayuda

| Necesito... | Dónde buscar |
|------------|-------------|
| Empezar ahora | [QUICK_START.md](backend/QUICK_START.md) |
| Solucionar problemas | [QUICK_START.md - Troubleshooting](backend/QUICK_START.md#troubleshooting) |
| Entender la arquitectura | [ARQUITECTURA.md](backend/ARQUITECTURA.md) |
| Comandos útiles | [COMANDOS.md](backend/COMANDOS.md) |
| Conectar frontend | [INTEGRACION_FRONTEND.md](backend/INTEGRACION_FRONTEND.md) |
| Configurar todo | [SETUP.md](backend/SETUP.md) |
| Información técnica | [README_JAVA.md](backend/README_JAVA.md) |

---

## ✅ Checklist de Lectura

- [ ] LEEME_PRIMERO.md
- [ ] INSTALACION_COMPLETADA.md
- [ ] backend/README.md
- [ ] backend/QUICK_START.md
- [ ] backend/README_JAVA.md (si profundizas)
- [ ] backend/INTEGRACION_FRONTEND.md (si usas Angular)
- [ ] backend/ARQUITECTURA.md (si quieres entender el diseño)

---

## 📞 Contacto y Soporte

Para reportar issues o hacer sugerencias:
1. Revisa primero la documentación
2. Consulta [QUICK_START.md - Troubleshooting](backend/QUICK_START.md#troubleshooting)
3. Si persiste, abre un issue en GitHub

---

**Last Updated**: 17-Feb-2026
**Version**: Backend Java 1.0.0
**Status**: ✅ Ready for Production

---

**¿Por dónde empezar?** ➡️ Abre [LEEME_PRIMERO.md](LEEME_PRIMERO.md)
