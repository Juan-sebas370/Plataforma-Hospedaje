# 🏗️ Arquitectura del Backend

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTE (Angular)                       │
│                  http://localhost:4200                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTP/REST
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 SERVIDOR (Spring Boot)                      │
│                 http://localhost:3000                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              HTTP Controllers                        │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  ✓ AuthController       (POST /auth/*)              │  │
│  │  ✓ HabitacionController (GET/POST /habitaciones)    │  │
│  │  ✓ ReservaController    (GET/POST /reservas)        │  │
│  │  ✓ HealthController     (GET /health)               │  │
│  └────────┬─────────────────────────────────────────────┘  │
│           │                                                 │
│           │ (Llama)                                          │
│           ▼                                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Business Logic (Services)                    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  ✓ AuthService                                       │  │
│  │  ✓ HabitacionService                                 │  │
│  │  ✓ ReservaService                                    │  │
│  └────────┬─────────────────────────────────────────────┘  │
│           │                                                 │
│           │ (Usa)                                            │
│           ▼                                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    Data Access (Spring Data Repositories)            │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  ✓ UsuarioRepository                                 │  │
│  │  ✓ HabitacionRepository                              │  │
│  │  ✓ ReservaRepository                                 │  │
│  └────────┬─────────────────────────────────────────────┘  │
│           │                                                 │
│           │ (Lee/Escribe)                                    │
│           ▼                                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         MongoDB (Persistencia)                       │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Colecciones:                                        │  │
│  │  ✓ usuarios                                          │  │
│  │  ✓ habitaciones                                      │  │
│  │  ✓ reservas                                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│         Seguridad: Spring Security + JWT                   │
├─────────────────────────────────────────────────────────────┤
│         Config: CORS, Error Handlers, Logging               │
└─────────────────────────────────────────────────────────────┘
```

## Flujo de Solicitud HTTP

```
1. CLIENTE (Angular)
   │
   ├─→ POST /api/auth/login
   │   {email, password}
   │
2. SERVIDOR
   │
   ├─→ AuthController.login()
   │
   ├─→ AuthService.login()
   │   - Busca usuario en BD
   │   - Valida contraseña
   │   - Genera JWT
   │
   ├─→ UsuarioRepository.findByEmail()
   │
   ├─→ MongoDB
   │   - Busca documento en usuarios
   │
3. RESPUESTA
   │
   ├─← LoginResponse {token, email, nombre, ...}
   │
4. CLIENTE
   │
   └─→ Guarda token en localStorage
```

## Estructura de Directorios

```
src/main/
├── java/com/hotelsebasitian/
│   │
│   ├── HospedajeApplication.java     ← Punto de entrada
│   │
│   ├── controller/                   ← Endpoints HTTP
│   │   ├── AuthController.java
│   │   ├── HabitacionController.java
│   │   ├── ReservaController.java
│   │   └── HealthController.java
│   │
│   ├── service/                      ← Lógica de negocio
│   │   ├── AuthService.java
│   │   ├── HabitacionService.java
│   │   └── ReservaService.java
│   │
│   ├── repository/                   ← Acceso a datos
│   │   ├── UsuarioRepository.java
│   │   ├── HabitacionRepository.java
│   │   └── ReservaRepository.java
│   │
│   ├── entity/                       ← Modelos de datos
│   │   ├── Usuario.java              ← @Document("usuarios")
│   │   ├── Habitacion.java           ← @Document("habitaciones")
│   │   └── Reserva.java              ← @Document("reservas")
│   │
│   ├── dto/                          ← Transferencia de datos
│   │   ├── UsuarioDTO.java
│   │   ├── LoginRequest.java
│   │   ├── LoginResponse.java
│   │   └── RegistroRequest.java
│   │
│   ├── security/                     ← Autenticación
│   │   └── JwtTokenProvider.java     ← Generación de JWT
│   │
│   └── config/                       ← Configuración
│       ├── CorsConfig.java           ← Configuración CORS
│       └── [Otros configs]
│
└── resources/
    ├── application.yml               ← Configuración principal
    ├── application-dev.yml           ← Config desarrollo
    └── application-prod.yml          ← Config producción
```

## Modelos de Datos (MongoDB)

### Usuario
```json
{
  "_id": "ObjectId",
  "email": "usuario@example.com",      [unique]
  "password": "hash_bcrypt",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "+34 666 555 444",
  "cedulaIdentidad": "12345678A",
  "rol": "USER",                        [USER | ADMIN]
  "activo": true,
  "fechaRegistro": "2026-02-17T12:00:00",
  "ultimaConexion": "2026-02-17T15:30:00"
}
```

### Habitacion
```json
{
  "_id": "ObjectId",
  "numero": "101",
  "tipo": "DOBLE",
  "capacidad": 2,
  "precioNoche": 50.0,
  "descripcion": "Habitación doble con vista al mar",
  "servicios": ["WiFi", "TV", "Aire acondicionado"],
  "imagenes": ["url1", "url2"],
  "estado": "DISPONIBLE",              [DISPONIBLE | OCUPADA | MANTENIMIENTO]
  "climatizacion": true,
  "television": true,
  "wifi": true,
  "bano": true,
  "minibar": true
}
```

### Reserva
```json
{
  "_id": "ObjectId",
  "usuarioId": "ObjectId",
  "habitacionId": "ObjectId",
  "fechaIngreso": "2026-03-01",
  "fechaSalida": "2026-03-05",
  "noches": 4,
  "precioTotal": 200.0,
  "precioNoche": 50.0,
  "estado": "PENDIENTE",               [PENDIENTE | CONFIRMADA | CANCELADA | COMPLETADA]
  "huespedes": 2,
  "nombreHuesped": "Juan Pérez",
  "telefonoContacto": "+34 666 555 444",
  "observaciones": "Requiere cuna para bebé",
  "fechaCreacion": "2026-02-17T12:00:00",
  "fechaModificacion": "2026-02-17T12:00:00"
}
```

## Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────┐
│                   Usuario no autenticado                 │
│                  Intenta POST /api/auth/login            │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              AuthController.login()                      │
│               (sin autenticación requerida)              │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│             AuthService.login(email, password)          │
│  1. Busca usuario en BD por email                       │
│  2. Valida password con bcrypt                          │
│  3. Genera JWT token                                    │
│  4. Retorna LoginResponse con token                     │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│           Cliente recibe JWT Token                       │
│        Guarda en localStorage: "token"                  │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│         Usuario realiza acción protegida                │
│     GET /api/habitaciones + Authorization header        │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│         Spring Security intercepta solicitud            │
│    Extrae JWT del header Authorization: Bearer ...      │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│           JwtTokenProvider.validateToken()              │
│        Valida firma, expiration, estructura             │
└─────────────────────┬───────────────────────────────────┘
                      │
                  ¿Válido?
                    / \
                   /   \
                YES     NO
                 │       │
                 ▼       ▼
            ┌────┐   ┌──────────┐
            │Ok  │   │401/403   │
            └────┘   │Denied    │
             │       └──────────┘
             │
             ▼
        ┌─────────────────────────────────────────────────────┐
        │    HabitacionController.obtenerTodas()              │
        │         (Usuario AUTENTICADO)                       │
        └─────────────────────┬───────────────────────────────┘
                              │
                              ▼
                         [Retorna datos]
```

## Flujo de Creación de Reserva

```
Cliente (POST /api/reservas)
         │
         ▼
ReservaController.crear(reserva)
         │
         ├─→ ReservaService.crear()
         │   │
         │   ├─→ Valida habitacionId
         │   │   (genera error si no existe)
         │   │
         │   ├─→ Calcula noches
         │   │   fechaSalida - fechaIngreso
         │   │
         │   ├─→ Calcula precioTotal
         │   │   precioNoche * noches
         │   │
         │   ├─→ Establece estado = "PENDIENTE"
         │   │
         │   ├─→ Establece fechaCreacion
         │   │
         │   ├─→ ReservaRepository.save(reserva)
         │   │   → MongoDB
         │   │
         │   └─→ HabitacionRepository.findById() +
         │       save(estado = "OCUPADA")
         │
         └─→ Retorna Reserva creada
```

## Integración con Frontend

```
┌──────────────────────────────────────┐
│   Angular Frontend                   │
│   (http://localhost:4200)            │
└────────────┬─────────────────────────┘
             │
             │ environment.ts:
             │ apiUrl: 'http://localhost:3000/api'
             │
             │ HttpClient + Interceptor JWT
             │
             ▼
┌──────────────────────────────────────┐
│   Spring Boot Backend                │
│   (http://localhost:3000/api)        │
│                                      │
│   CORS habilitado para:              │
│   - http://localhost:4200 (Angular)  │
│   - http://localhost:3000 (Tests)    │
└──────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│   MongoDB                            │
│   (mongodb://localhost:27017)        │
└──────────────────────────────────────┘
```

## Despliege (High-level)

```
DESARROLLO
─────────
PC Local
├── Frontend: ng serve (puerto 4200)
├── Backend: mvn spring-boot:run (puerto 3000)
└── MongoDB: local o docker (puerto 27017)

PRODUCCIÓN
──────────
Servidor (ej: AWS, Azure, Heroku, DigitalOcean)
├── Frontend: Build Angular → Servidor web estático
├── Backend: JAR ejecutable (puerto 8080)
└── MongoDB: Atlas o servidor dedicado
```

---

Este diagrama muestra la arquitectura completa del sistema. Cada componente tiene una responsabilidad clara y se comunica con los demás a través de interfaces bien definidas.
