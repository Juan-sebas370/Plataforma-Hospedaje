# 🏨 Hospedaje Sebastian - Colección Postman

## 📦 Archivos Incluidos

1. **`Hospedaje_Sebastian_API_v2.postman_collection.json`** - Colección completa con todos los endpoints
2. **`Hospedaje_Sebastian_Environment.postman_environment.json`** - Variables de entorno local

---

## 🚀 Instalación

### 1. Importar la Colección

1. Abre **Postman**
2. Click en **Import** (botón superior izquierda)
3. Arrastra el archivo `Hospedaje_Sebastian_API_v2.postman_collection.json`
4. Click en **Import**

### 2. Importar el Entorno

1. Click en **Import** nuevamente
2. Arrastra el archivo `Hospedaje_Sebastian_Environment.postman_environment.json`
3. Click en **Import**
4. Selecciona el entorno **"🏨 Hospedaje Sebastian - Local"** en el dropdown superior derecho

---

## ✨ Características

### 🔐 Autenticación Automática

- Ejecuta **Login** en la carpeta "🔐 Autenticación"
- El token JWT se guarda **automáticamente** en la variable `{{authToken}}`
- Todos los demás requests usan este token automáticamente

### ✅ Tests Automáticos

Cada request incluye tests que verifican:
- ✅ Status code correcto
- ✅ Estructura de respuesta esperada
- ✅ Tiempo de respuesta razonable (< 2s)
- ✅ Variables guardadas correctamente

### 📊 Scripts Pre-Request

Algunos requests incluyen scripts que:
- 🗓️ Calculan fechas automáticamente (reservas)
- 🔍 Validan tokens antes de ejecutar
- 📝 Registran información en consola

### 🎲 Datos Aleatorios

Usamos variables dinámicas de Postman:
- `{{$randomEmail}}` - Email aleatorio
- `{{$randomFirstName}}` - Nombre aleatorio
- `{{$randomLastName}}` - Apellido aleatorio
- `{{$randomPhoneNumber}}` - Teléfono aleatorio
- `{{$randomInt}}` - Número entero aleatorio
- `{{$randomPrice}}` - Precio aleatorio

---

## 📋 Flujo de Uso Recomendado

### 1️⃣ Verificar Servidor

```
💚 Health Check
  └─ 👋 Welcome
  └─ ❤️ Health Check
```

### 2️⃣ Autenticación

```
🔐 Autenticación
  └─ 🔑 Login  ← **EJECUTAR PRIMERO**
```

**Credenciales por defecto:**
```json
{
  "email": "admin@hotel.com",
  "password": "admin123"
}
```

### 3️⃣ Consultar Habitaciones

```
🛏️ Habitaciones
  └─ 📋 Obtener Todas
  └─ ✅ Obtener Disponibles
```

### 4️⃣ Crear Reserva

```
📅 Reservas
  └─ ➕ Crear Reserva  ← Las fechas se calculan automáticamente
```

### 5️⃣ Procesar Pago

```
💳 Pagos
  └─ 💰 Procesar Pago  ← Usa {{reservaId}} automáticamente
```

### 6️⃣ Verificar Reserva

```
📅 Reservas
  └─ 👤 Mis Reservas
  └─ 🔍 Buscar por Código  ← Usa {{codigoConfirmacion}}
```

---

## 🔧 Variables de Entorno

### Variables Automáticas

Estas se guardan automáticamente tras ejecutar requests:

| Variable | Se guarda en | Descripción |
|----------|--------------|-------------|
| `{{authToken}}` | Login | Token JWT para autenticación |
| `{{userId}}` | Login | ID del usuario autenticado |
| `{{userEmail}}` | Login | Email del usuario |
| `{{reservaId}}` | Crear Reserva | ID de última reserva creada |
| `{{codigoConfirmacion}}` | Crear Reserva | Código de 8 caracteres |
| `{{habitacionId}}` | Crear Habitación | ID de última habitación |
| `{{pagoId}}` | Procesar Pago | ID del pago procesado |
| `{{fechaIngreso}}` | Pre-request Reserva | Fecha calculada (hoy + 7 días) |
| `{{fechaSalida}}` | Pre-request Reserva | Fecha calculada (ingreso + 3 días) |

### Variables Configurables

Puedes editar manualmente:

| Variable | Valor Inicial | Descripción |
|----------|---------------|-------------|
| `{{baseUrl}}` | `http://localhost:3000/api` | URL base de la API |

---

## 📁 Estructura de la Colección

```
🏨 Hospedaje Sebastian API - Complete
├─ 💚 Health Check (2 requests)
│  ├─ 👋 Welcome
│  └─ ❤️ Health Check
│
├─ 🔐 Autenticación (5 requests)
│  ├─ 📝 Registro
│  ├─ 🔑 Login ⭐
│  ├─ 🔓 Solicitar Recuperación Contraseña
│  ├─ ✅ Validar Token Reset
│  └─ 🔄 Resetear Contraseña
│
├─ 🛏️ Habitaciones (6 requests)
│  ├─ 📋 Obtener Todas
│  ├─ 🔍 Buscar por ID
│  ├─ ✅ Obtener Disponibles
│  ├─ ➕ Crear Habitación
│  ├─ ✏️ Actualizar Habitación
│  └─ 🗑️ Eliminar Habitación
│
├─ 📅 Reservas (7 requests)
│  ├─ 📋 Obtener Todas
│  ├─ 👤 Mis Reservas
│  ├─ 🔍 Buscar por ID
│  ├─ ➕ Crear Reserva ⭐
│  ├─ ✏️ Actualizar Reserva
│  ├─ ❌ Cancelar Reserva
│  └─ 🔍 Buscar por Código
│
├─ 👥 Usuarios (4 requests)
│  ├─ 👤 Mi Perfil
│  ├─ ✏️ Actualizar Perfil
│  ├─ 🔒 Cambiar Contraseña
│  └─ 📋 Listar Todos (Admin)
│
├─ 💳 Pagos (3 requests)
│  ├─ 💰 Procesar Pago ⭐
│  ├─ 🔍 Consultar Pago
│  └─ 📋 Pagos de Reserva
│
└─ 💬 Chat Soporte (3 requests)
   ├─ 📨 Enviar Mensaje
   ├─ 📬 Mis Mensajes
   └─ ✅ Marcar como Leído
```

**Total: 30 endpoints completamente documentados**

---

## 🧪 Ejecutar Tests

### Opción 1: Request Individual

1. Selecciona un request
2. Click en **Send**
3. Ve a la pestaña **Test Results** (abajo)
4. Verifica que todos los tests pasen ✅

### Opción 2: Collection Runner

1. Click derecho en la colección
2. Selecciona **Run collection**
3. Selecciona los requests a ejecutar
4. Click en **Run Hospedaje Sebastian**
5. Observa los resultados en tiempo real

### Opción 3: Newman (CLI)

```bash
# Instalar Newman
npm install -g newman

# Ejecutar colección
newman run Hospedaje_Sebastian_API_v2.postman_collection.json \
  -e Hospedaje_Sebastian_Environment.postman_environment.json

# Con reporte HTML
newman run Hospedaje_Sebastian_API_v2.postman_collection.json \
  -e Hospedaje_Sebastian_Environment.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export report.html
```

---

## 🎯 Ejemplos de Uso

### Ejemplo 1: Flujo Completo de Reserva

```
1. 🔑 Login
   → Guarda authToken, userId

2. ✅ Obtener Disponibles (Habitaciones)
   → Selecciona una habitación

3. ➕ Crear Reserva
   → Guarda reservaId, codigoConfirmacion
   → Fechas calculadas automáticamente

4. 💰 Procesar Pago
   → Usa reservaId automáticamente

5. 🔍 Buscar por Código (Reservas)
   → Usa codigoConfirmacion para verificar
```

### Ejemplo 2: Gestión de Perfil

```
1. 🔑 Login
   → Autenticación

2. 👤 Mi Perfil
   → Ver datos actuales

3. ✏️ Actualizar Perfil
   → Modificar información

4. 🔒 Cambiar Contraseña
   → Actualizar seguridad
```

### Ejemplo 3: Soporte al Cliente

```
1. 🔑 Login
   → Autenticación

2. 📨 Enviar Mensaje
   → Guarda mensajeId

3. 📬 Mis Mensajes
   → Ver historial

4. ✅ Marcar como Leído
   → Usa mensajeId
```

---

## 🐛 Troubleshooting

### ❌ Error 401: Unauthorized

**Solución:**
1. Ejecuta **Login** primero
2. Verifica que `{{authToken}}` tenga valor en el entorno
3. Revisa que seleccionaste el entorno correcto

### ❌ Error: Cannot read property 'json' of undefined

**Solución:**
1. Verifica que el servidor esté corriendo: `http://localhost:3000`
2. Ejecuta **❤️ Health Check** para verificar conexión

### ❌ Tests fallan

**Solución:**
1. Lee el mensaje de error en **Test Results**
2. Verifica que los datos del body sean correctos
3. Asegúrate de ejecutar requests en orden (Login primero)

### ⚠️ Variables no se guardan

**Solución:**
1. Verifica que seleccionaste el entorno **"🏨 Hospedaje Sebastian - Local"**
2. Los valores deben aparecer en el dropdown de environments
3. Click en el ojo 👁️ para ver variables actuales

---

## 📝 Notas Importantes

1. **Token Expiration**: Los tokens JWT expiran después de cierto tiempo. Si obtienes errores 401, ejecuta Login nuevamente.

2. **Orden de Ejecución**: Algunos requests dependen de otros:
   - `Login` debe ejecutarse antes que cualquier request protegido
   - `Crear Reserva` debe ejecutarse antes de `Procesar Pago`

3. **Datos de Prueba**: Los requests usan datos aleatorios de Postman. Si necesitas datos específicos, edita el body manualmente.

4. **Consola de Postman**: Abre la consola (View → Show Postman Console) para ver logs detallados de cada request.

---

## 🔗 Enlaces Útiles

- **API Base URL**: http://localhost:3000/api
- **Documentación Backend**: Ver `backend/README.md`
- **Postman Learning**: https://learning.postman.com/

---

## 📊 Estadísticas

- **30 endpoints** completamente documentados
- **80+ tests automáticos** ejecutados
- **11 variables** de entorno configuradas
- **5 carpetas** organizadas por funcionalidad
- **100% coverage** de la API REST

---

## 🎉 ¡Listo para usar!

Ahora tienes una colección de Postman **profesional y completa** para probar toda la API de Hospedaje Sebastian.

**¡Feliz testing!** 🚀

---

**Versión:** 2.0.0  
**Última actualización:** 26 de febrero de 2026  
**Autor:** Hospedaje Sebastian Development Team
