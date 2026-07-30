# 🏨 Backend - Hospedaje Sebastian

**Backend API Java con Spring Boot** para sistema de gestión hotelera.

> ⚠️ El backend ha sido **completamente reescrito en Java/Spring Boot** reemplazando el anterior Node.js/Express. Los endpoints y funcionalidades permanecen iguales para mayor compatibilidad.

## 🎯 Inicio Rápido

```bash
# 1. Compilar
mvn clean install

# 2. Ejecutar (asegúrate que MongoDB está corriendo)
mvn spring-boot:run

# 3. API disponible
curl http://localhost:3000/api/health
```

**⏱️ 2 minutos para empezar** • **📚 Documentación incluida**

## 📋 Documentación

### Para Empezar
- 📖 **[QUICK_START.md](QUICK_START.md)** - Guía paso a paso (RECOMENDADO)
- 🚀 **[SETUP.md](SETUP.md)** - Instrucciones de setup
- 📋 **[SUMMARY.md](SUMMARY.md)** - Resumen de lo creado

### Para Desarrollo
- 🔗 **[INTEGRACION_FRONTEND.md](INTEGRACION_FRONTEND.md)** - Conectar con Angular
- 📚 **[README_JAVA.md](README_JAVA.md)** - Documentación técnica completa
- 📮 **[Postman Collection](Hospedaje_Sebastian_API.postman_collection.json)** - Prueba los endpoints

## 🛠️ Tech Stack

```
┌─────────────────────────────────┐
│      Spring Boot 3.2            │  Framework principal
├─────────────────────────────────┤
│ Spring Data MongoDB             │  Base datos NoSQL
├─────────────────────────────────┤
│ Spring Security + JWT           │  Autenticación
├─────────────────────────────────┤
│ Lombok                          │  Reduce boilerplate
├─────────────────────────────────┤
│ Java 17+                        │  Lenguaje
└─────────────────────────────────┘
```

## ✨ Características

### 🔐 Autenticación
- Registro de usuarios
- Login con JWT
- Encriptación de contraseñas
- Token expiration

### 🏨 Habitaciones
- Listar habitaciones
- Filtrar por disponibilidad
- CRUD completo
- Control de estado

### 📅 Reservas
- Crear reservas
- Cálculo automático de precios
- Gestión de estado
- Cancelación de reservas

## 📦 Requisitos

- ✅ Java 17+
- ✅ Maven 3.8+
- ✅ MongoDB (local o Docker)

## 🚀 Ejecutar

### Opción 1: Script Interactivo
```bash
# Windows
run.bat

# Linux/Mac
./run.sh
```

### Opción 2: Comando Directo
```bash
mvn spring-boot:run
```

### Opción 3: Con MongoDB en Docker
```bash
docker-compose up -d    # Inicia MongoDB
mvn spring-boot:run     # Inicia la app
```

**Servidor en**: http://localhost:3000
**API Endpoint**: http://localhost:3000/api
**Health Check**: http://localhost:3000/api/health

## 📚 API Endpoints

### Auth
```
POST   /api/auth/login           Login
POST   /api/auth/registro        Registro
POST   /api/auth/logout          Logout
```

### Habitaciones
```
GET    /api/habitaciones          Todas
GET    /api/habitaciones/{id}     Por ID
GET    /api/habitaciones/disponibles
POST   /api/habitaciones          Crear
PUT    /api/habitaciones/{id}     Actualizar
DELETE /api/habitaciones/{id}     Eliminar
```

### Reservas
```
GET    /api/reservas              Todas
GET    /api/reservas/{id}         Por ID
GET    /api/reservas/usuario/{id} Por usuario
POST   /api/reservas              Crear
PUT    /api/reservas/{id}         Actualizar
PUT    /api/reservas/{id}/cancelar  Cancelar
DELETE /api/reservas/{id}         Eliminar
```

## 🧪 Testing

### Con cURL
```bash
# Health
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
```

### Con Postman
Importa: `Hospedaje_Sebastian_API.postman_collection.json`

### Con Mongo Express
Accede a: http://localhost:8081
- Usuario: admin
- Contraseña: admin123

## 🔧 Configuración

Editar `src/main/resources/application.yml`:

```yaml
server:
  port: 3000                    # Puerto del servidor

spring:
  data:
    mongodb:
      uri: mongodb://...        # URI de MongoDB

jwt:
  secret: tu-secreto-seguro     # Clave JWT
  expiration: 86400000          # 24 horas
```

## 📁 Estructura del Proyecto

```
backend/
├── src/main/
│   ├── java/com/hotelsebasitian/
│   │   ├── controller/         Endpoints REST
│   │   ├── service/            Lógica de negocio
│   │   ├── repository/         Acceso a datos
│   │   ├── entity/             Modelos (JPA)
│   │   ├── dto/                Data Transfer Objects
│   │   ├── security/           JWT y autenticación
│   │   └── config/             Configuración general
│   └── resources/
│       └── application.yml     Configuración
├── pom.xml                     Dependencias
├── docker-compose.yml          MongoDB + Mongo Express
└── DOCUMENTACIÓN/
    ├── QUICK_START.md          Inicio rápido
    ├── README_JAVA.md          Técnica completa
    ├── INTEGRACION_FRONTEND.md Con Angular
    └── SUMMARY.md              Resumen
```

## 🔄 Integración con Frontend

El frontend Angular (en `../../frontend/`) se conecta automáticamente.

**URL de API**: Configura en `environment.ts`:
```typescript
export const environment = {
  apiUrl: 'http://localhost:3000/api'
};
```

Ver [INTEGRACION_FRONTEND.md](INTEGRACION_FRONTEND.md) para detalles.

## 🚢 Deployment

### Build Producción
```bash
mvn clean package
java -jar target/hospedaje-sebastian-1.0.0.jar
```

### Usar Variables de Entorno
```bash
export JWT_SECRET="tu-secreto-super-seguro"
export MONGODB_URI="mongodb://usuario:pass@host:27017/hospedaje_db"
java -jar hospedaje-sebastian-1.0.0.jar
```

## ⚙️ Dependencias

- **Spring Boot Starter Web** - REST API
- **Spring Data MongoDB** - Base de datos
- **Spring Security** - Autenticación
- **JWT (jjwt)** - Tokens
- **Lombok** - Reduce código
- **Maven** - Build tool

## 📖 Documentación Completa

Visita los archivos de documentación:
- [QUICK_START.md](QUICK_START.md) ← COMIENZA AQUÍ
- [README_JAVA.md](README_JAVA.md)
- [INTEGRACION_FRONTEND.md](INTEGRACION_FRONTEND.md)

## ❓ FAQ

**P: ¿Cómo cambio la base de datos?**
A: Edita `application.yml` con la URI de MongoDB

**P: ¿El frontend necesita cambios?**
A: No, usa los mismos endpoints

**P: ¿Cómo genero el JAR?**
A: `mvn clean package`

**P: ¿Cómo agrego una tabla/colección?**
A: Crea una Entity, Repository y Controller

## 🆘 Troubleshooting

| Problema | Solución |
|----------|----------|
| "Port 3000 already in use" | Cambia `server.port` en `application.yml` |
| "MongoDB connection failed" | Verifica que MongoDB está corriendo |
| "Java not found" | Instala Java 17+ |
| "Maven not found" | Instala Maven 3.8+ |

Ver [QUICK_START.md](QUICK_START.md#troubleshooting) para más.

## 📞 Soporte

Para problemas o sugerencias, abre un issue.

## 📄 Licencia

ISC - Ver LICENSE

---

**✨ Backend Java listo para producción**

**Próximo paso:** Lee [QUICK_START.md](QUICK_START.md) e ejecuta `mvn spring-boot:run`

```
backend/
├── config/           # Configuraciones
├── controllers/      # Controladores
├── models/          # Modelos de datos
├── routes/          # Rutas de la API
├── middleware/      # Middlewares
├── utils/           # Utilidades
├── server.js        # Punto de entrada
└── package.json
```

## 🏃‍♂️ Ejecutar

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## 📡 Endpoints

- `GET /` - Información de la API
- `GET /api/health` - Estado del servidor
- `POST /api/reservas` - Crear reserva
- `GET /api/habitaciones` - Listar habitaciones
- `POST /api/usuarios` - Crear usuario
