# 🔐 JWT - Guía de Uso Completa

## 📋 Configuración Actual

```yaml
Clave JWT: HotelSebastian2026-JWTSecureKey-Prod-9f8e7d6c5b4a3210-CHANGE-IN-PRODUCTION
Expiración: 86400000 ms (24 horas)
Algoritmo: HS256 (HMAC-SHA256)
```

---

## 🚀 Cómo Funciona JWT

### 1. Login - Obtener Token

**Endpoint:**
```
POST http://localhost:3000/api/auth/login
```

**Request Body:**
```json
{
  "email": "sebastian@gmail.com",
  "password": "jiampi2018*"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzA4NDM1MjAwLCJleHAiOjE3MDg1MjE2MDB9.signature",
  "usuario": {
    "id": 1,
    "email": "sebastian@gmail.com",
    "nombre": "Juan Sebastián",
    "apellido": "Pérez",
    "rol": "USUARIO"
  }
}
```

### 2. Usar Token en Requests Protegidos

Para acceder a endpoints protegidos, incluye el token en el header `Authorization`:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📡 Ejemplos de Uso

### Curl

```bash
# 1. Login y obtener token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sebastian@gmail.com","password":"jiampi2018*"}' \
  | jq -r '.token')

# 2. Usar token para obtener reservas
curl -X GET http://localhost:3000/api/reservas \
  -H "Authorization: Bearer $TOKEN"
```

### JavaScript/Fetch

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'sebastian@gmail.com',
    password: 'jiampi2018*'
  })
});

const { token, usuario } = await loginResponse.json();

// 2. Guardar token
localStorage.setItem('token', token);

// 3. Usar token en requests
const reservasResponse = await fetch('http://localhost:3000/api/reservas', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const reservas = await reservasResponse.json();
```

### Angular HttpClient

```typescript
import { HttpClient, HttpHeaders } from '@angular/common/http';

// 1. Login
login(email: string, password: string) {
  return this.http.post<LoginResponse>('http://localhost:3000/api/auth/login', {
    email,
    password
  }).subscribe(response => {
    localStorage.setItem('token', response.token);
  });
}

// 2. Request con token
getReservas() {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  
  return this.http.get('http://localhost:3000/api/reservas', { headers });
}
```

### Postman

1. **Login:**
   - Method: `POST`
   - URL: `http://localhost:3000/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "sebastian@gmail.com",
       "password": "jiampi2018*"
     }
     ```
   - Copiar el `token` de la respuesta

2. **Usar Token:**
   - En cualquier request protegido:
   - Tab: **Authorization**
   - Type: **Bearer Token**
   - Token: `pegar-token-aquí`

---

## ⏱️ Configurar Tiempo de Expiración

### Opciones Disponibles

En `application.yml` o `application.properties`:

```yaml
jwt:
  expiration: 3600000    # 1 hora
  # expiration: 7200000    # 2 horas
  # expiration: 43200000   # 12 horas
  # expiration: 86400000   # 24 horas (DEFAULT)
  # expiration: 604800000  # 7 días
  # expiration: 2592000000 # 30 días
```

### Cálculo de Milisegundos

```
Fórmula: tiempo_en_minutos × 60 × 1000

Ejemplos:
- 15 minutos  = 15 × 60 × 1000 = 900000
- 30 minutos  = 30 × 60 × 1000 = 1800000
- 1 hora      = 60 × 60 × 1000 = 3600000
- 2 horas     = 120 × 60 × 1000 = 7200000
- 24 horas    = 1440 × 60 × 1000 = 86400000
```

---

## 🔒 Cambiar Clave Secreta JWT

### En Desarrollo (application.yml)

```yaml
jwt:
  secret: TuNuevaClaveSecretaSuperSegura123456789
```

### En Producción (Variables de Entorno)

```bash
# Linux/Mac
export JWT_SECRET="ClaveSecretaProduccion2026-XyZ123"

# Windows PowerShell
$env:JWT_SECRET="ClaveSecretaProduccion2026-XyZ123"

# Windows CMD
set JWT_SECRET=ClaveSecretaProduccion2026-XyZ123
```

### Generar Clave Segura

```bash
# Usando OpenSSL
openssl rand -base64 64

# Usando Python
python -c "import secrets; print(secrets.token_urlsafe(64))"

# Usando PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Resultado ejemplo:**
```
aB3Cd9Ef2Gh5Ij8Kl1Mn4Op7Qr0St6Uv9Wx2Yz5Ab8Cd1Ef4Gh7Ij0Kl3Mn6Op9Qr2St5Uv8Wx1Yz4
```

---

## 🛡️ Seguridad - Mejores Prácticas

### ✅ Hacer

1. **Almacenar token en localStorage o sessionStorage**
   ```javascript
   localStorage.setItem('token', token);
   ```

2. **Incluir token en cada request protegido**
   ```javascript
   headers: { 'Authorization': `Bearer ${token}` }
   ```

3. **Manejar expiración del token**
   ```javascript
   if (response.status === 401) {
     // Token expirado, redirigir a login
     localStorage.removeItem('token');
     window.location.href = '/login';
   }
   ```

4. **Logout - Eliminar token**
   ```javascript
   localStorage.removeItem('token');
   ```

### ❌ No Hacer

1. ❌ Exponer la clave secreta en el código frontend
2. ❌ Usar la misma clave en desarrollo y producción
3. ❌ Tokens sin expiración o con expiración muy larga
4. ❌ Enviar tokens en URL query params
5. ❌ Almacenar información sensible en el payload del JWT

---

## 🔍 Decodificar JWT (Solo para Debug)

Visita: https://jwt.io/

Pega tu token para ver el payload. **Nota:** Esto es solo para debugging, nunca compartas tu token real.

**Estructura del Token:**

```
Header.Payload.Signature

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9    <- Header (Base64)
.
eyJzdWIiOiIxIiwiaWF0IjoxNzA4NDM1MjAwfQ  <- Payload (Base64)
.
signature-hash                             <- Firma (HMAC-SHA256)
```

**Payload decodificado:**
```json
{
  "sub": "1",              // User ID
  "email": "sebastian@gmail.com",
  "iat": 1708435200,       // Issued At
  "exp": 1708521600        // Expiration
}
```

---

## 📊 Endpoints que Usan JWT

### Protegidos (Requieren Token)

```
GET    /api/reservas
POST   /api/reservas
GET    /api/reservas/{id}
PUT    /api/reservas/{id}
DELETE /api/reservas/{id}

GET    /api/pagos
POST   /api/pagos
GET    /api/pagos/{id}

GET    /api/usuarios/perfil
PUT    /api/usuarios/perfil
```

### Públicos (No Requieren Token)

```
POST   /api/auth/login
POST   /api/auth/registro
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

GET    /api/habitaciones
GET    /api/habitaciones/{id}

POST   /api/contactos
```

---

## 🧪 Testing JWT

### Test 1: Login Exitoso

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sebastian@gmail.com","password":"jiampi2018*"}'
```

**Resultado esperado:** Status 200 + token

### Test 2: Login con Credenciales Incorrectas

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@email.com","password":"wrongpass"}'
```

**Resultado esperado:** Status 401 Unauthorized

### Test 3: Acceso sin Token

```bash
curl -X GET http://localhost:3000/api/reservas
```

**Resultado esperado:** Status 401 o 403

### Test 4: Acceso con Token Válido

```bash
curl -X GET http://localhost:3000/api/reservas \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Resultado esperado:** Status 200 + datos

### Test 5: Token Expirado

Espera 24 horas o cambia la expiración a 1 minuto para probar.

**Resultado esperado:** Status 401 + mensaje "Token expirado"

---

## 🐛 Solución de Problemas

### Error: "Token no válido" o "Unauthorized"

**Causas:**
1. Token expirado (más de 24 horas)
2. Token incorrecto o manipulado
3. Falta el prefijo "Bearer " en el header
4. Clave JWT cambió en el servidor

**Solución:**
```javascript
// 1. Verificar formato del header
Authorization: Bearer eyJhbGciOiJ...

// 2. Hacer login nuevamente para obtener token fresco
// 3. Verificar que no haya espacios extras
const token = localStorage.getItem('token').trim();
```

### Error: "Missing Authorization Header"

**Causa:** No se está enviando el header de autorización

**Solución:**
```javascript
fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### Error: CORS al hacer requests

**Solución:** Verificar que el frontend esté en `http://localhost:4200` (ya configurado en CORS del backend)

---

## 📝 Resumen Quick Start

```bash
# 1. Login
POST /api/auth/login
Body: { "email": "sebastian@gmail.com", "password": "jiampi2018*" }

# 2. Guardar token del response
token = response.token

# 3. Usar en requests
Header: Authorization: Bearer {token}

# 4. Token expira en 24 horas
# 5. Logout: eliminar token del localStorage
```

---

**Última actualización:** 2026-02-20
