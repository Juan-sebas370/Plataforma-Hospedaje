# 🔐 Credenciales de Prueba - Hotel Sebastian

## Usuario Principal

**Email:** sebastian@gmail.com  
**Contraseña:** jiampi2018*

### Información Adicional
- **Nombre:** Juan Sebastián Pérez
- **Teléfono:** +57 300 123 4567
- **Documento:** CC 1234567890
- **País:** Colombia
- **Ciudad:** Medellín
- **Rol:** USUARIO

---

## 📝 Cómo Usar

### 1. Insertar Usuario en Base de Datos

Ejecutar el script SQL:
```bash
mysql -u root -p hotel_sebastian < backend/src/main/resources/db/usuarios_prueba.sql
```

O en MySQL CLI:
```sql
SOURCE backend/src/main/resources/db/usuarios_prueba.sql;
```

### 2. Verificar Usuario Creado

```sql
SELECT id, email, nombre, rol, activo FROM usuarios WHERE email = 'sebastian@gmail.com';
```

### 3. Usar en la Aplicación

- Ir a `/login`
- Ingresa el **email**: `sebastian@gmail.com`
- Ingresa la **contraseña**: `jiampi2018*`
- Click en "Iniciar Sesión"

---

## 🔒 Notas de Seguridad

⚠️ **IMPORTANTE:** Las contraseñas en el archivo están hasheadas con **BCrypt**.

- Hash BCrypt: `$2a$10$N9qo8uLOickgx2ZMQbicOeEwNl.9Kx8WPdqxEj/Jb8Z8l7dVJ1xDi`
- Algoritmo: BCrypt (costo: 10)
- En producción, **NUNCA** compartir contraseñas en texto plano

---

## 📊 Otros Usuarios de Prueba Disponibles

Puedes crear usuarios adicionales duplicando la estructura en `usuarios_prueba.sql` con distintos emails y roles.

Roles disponibles:
- `USUARIO` - Usuario regular
- `ADMIN` - Administrador (si está implementado)
- `STAFF` - Personal del hotel (si está implementado)

---

Últimas actualización: 2026-02-20
