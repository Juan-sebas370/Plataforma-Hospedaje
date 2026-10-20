# 🚀 INICIO RÁPIDO - Credenciales de Prueba

## Configuración Rápida (3 pasos)

### PASO 1: Insertar Usuario en MySQL

Abre MySQL y ejecuta:

```sql
SOURCE backend/src/main/resources/db/usuarios_prueba.sql;
```

O mediante línea de comandos:
```bash
mysql -u root -p hotel_sebastian < backend/src/main/resources/db/usuarios_prueba.sql
```

### PASO 2: Verificar Inserción

```sql
USE hotel_sebastian;
SELECT * FROM usuarios WHERE email = 'sebastian@gmail.com';
```

Deberías ver 1 fila con los datos del usuario.

### PASO 3: Usar en la Aplicación

**Endpoint de Login (Backend):**
```
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "sebastian@gmail.com",
  "password": "<PASSWORD_CONFIGURADO>"
}
```

**En la Aplicación Web:**
1. La autenticación ha sido **deshabilitada** en esta versión
2. Puedes acceder directamente a todas las páginas sin login
3. El usuario de prueba está disponible para futura integración

---

## 📋 Credenciales Resumidas

```
Email:       sebastian@gmail.com
Contraseña: definir una contraseña local segura
Nombre:      Juan Sebastián Pérez
Teléfono:    +57 300 123 4567
Documento:   CC 1234567890
País:        Colombia
```

---

## 🔧 Endpoint API para Testing

**URL Base:** `http://localhost:3000`

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sebastian@gmail.com",
    "password": "<PASSWORD_CONFIGURADO>"
  }'
```

**Respuesta Esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "email": "sebastian@gmail.com",
    "nombre": "Juan Sebastián",
    "apellido": "Pérez",
    "rol": "USUARIO"
  }
}
```

---

## ✅ Verificación

- ✓ Usuario creado en BD
- ✓ Credenciales documentadas
- ✓ Endpoint de login disponible
- ✓ Test credentials listos

**Última actualización:** 2026-02-20

