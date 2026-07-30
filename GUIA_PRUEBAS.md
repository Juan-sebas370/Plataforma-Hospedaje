# 🧪 Guía de Pruebas - Sistema de Recuperación de Contraseña

## Prerequisitos
- ✅ Backend compilado (`mvn clean install`)
- ✅ MongoDB corriendo en `localhost:27017`
- ✅ Email configurado en `application.yml`
- ✅ Usuario registrado en la app

---

## 📋 Pasos de Prueba

### Paso 1: Iniciar Servicios
```bash
# Terminal 1 - Backend
cd backend
java -jar target/hospedaje-sebastian-1.0.0.jar

# Terminal 2 - Frontend
cd frontend
npm start
```

Espera a ver:
- Backend: `Started HospedajeApplication` en `http://localhost:3000/api`
- Frontend: `Application bundle generated successfully` en `http://localhost:4200`

---

### Paso 2: Registrar un Usuario de Prueba
1. Abre http://localhost:4200
2. Haz clic en **"Regístrate aquí"**
3. Completa:
   - Email: `test@example.com` (usa un email válido para recibir correos)
   - Contraseña: `Test123!`
   - Nombre: `Juan`
   - Apellido: `Test`
   - Teléfono: `1234567890`
   - Cédula: `12345678`
4. Haz clic en **"Registrar"**
5. Deberías ver confirmación

---

### Paso 3: Olvidar Contraseña
1. Ve a http://localhost:4200/login
2. Haz clic en **"¿Olvidaste tu contraseña?"**
3. Se abrirá http://localhost:4200/forgot-password
4. Ingresa: `test@example.com`
5. Haz clic en **"Enviar Instrucciones"**

**Resultado esperado:**
- ✅ Página muestra "Email Enviado"
- ✅ Recibes email en `test@example.com` con enlace de recuperación

---

### Paso 4: Recuperar Contraseña
1. Abre el email recibido
2. Haz clic en el enlace: `http://localhost:4200/reset-password?token=...`
3. Se abrirá página de reset
4. Ingresa:
   - Nueva Contraseña: `NuevaPass456!`
   - Confirmar: `NuevaPass456!`
5. Haz clic en **"Actualizar Contraseña"**

**Resultado esperado:**
- ✅ Validación de token exitosa
- ✅ Indicador de fortaleza se muestra
- ✅ Mensaje "Contraseña actualizada exitosamente"
- ✅ Auto-redirige a login en 3 segundos
- ✅ Recibes email de confirmación

---

### Paso 5: Login con Nueva Contraseña
1. En http://localhost:4200/login ingresa:
   - Email: `test@example.com`
   - Contraseña: `NuevaPass456!`
2. Haz clic en **"Iniciar Sesión"**

**Resultado esperado:**
- ✅ Login exitoso
- ✅ Redirige a página principal
- ✅ Token guardado

---

## 🔍 Casos de Prueba Avanzados

### ❌ Token Expirado
1. Espera más de 24 horas sin usar el token
2. Intenta acceder: http://localhost:4200/reset-password?token=xxx
3. **Resultado**: Muestra "Token expirado"

### ❌ Email No Registrado
1. En forgot-password ingresa: `noexiste@example.com`
2. **Resultado**: Error "Usuario no encontrado"

### ❌ Contraseñas No Coinciden
1. Nueva Contraseña: `Pass123!`
2. Confirmar: `Pass456!`
3. **Resultado**: Muestra error en rojo, botón deshabilitado

### ✅ Indicador de Fortaleza
- Muy débil: < 6 caracteres (rojo)
- Débil: 6+ caracteres (naranja)
- Regular: mayús + minús (amarillo)
- Buena: + números (verde)
- Muy fuerte: + caracteres especiales (verde oscuro)

---

## 🔧 Troubleshooting

### ❌ No llega el email
**Soluciones:**
1. Verifica carpeta de spam
2. Confirma credenciales en `application.yml`
3. Revisa logs del backend: `MAIL_USERNAME`, `MAIL_PASSWORD`
4. Prueba con contraseña de aplicación (no contraseña normal)

### ❌ Backend no inicia
**Soluciones:**
```bash
# Limpiar cache
mvn clean
# Reinstalar
mvn install
# Probar con logs
mvn spring-boot:run
```

### ❌ Frontend no se conecta
**Soluciones:**
1. Verifica que backend está en `http://localhost:3000`
2. CORS está configurado para `http://localhost:4200`
3. Abre DevTools (F12) → Network → Busca `/forgot-password`

### ❌ MongoDB no está corriendo
```bash
# Iniciar MongoDB
mongod --dbpath "C:\data\db"  # Windows
# o Linux/Mac
mongod
```

---

## 📊 Checklist de Validación

- [ ] Email configurado en `application.yml`
- [ ] Backend compilado sin errores
- [ ] Frontend compilado sin errores
- [ ] MongoDB corriendo
- [ ] Usuario de prueba registrado
- [ ] Forgot-password funciona
- [ ] Email se recibe
- [ ] Reset-password valida token
- [ ] Contraseña se actualiza
- [ ] Login con nueva contraseña funciona
- [ ] Email de confirmación se recibe

---

## 📞 Soporte

Si algo no funciona:
1. Revisa los logs del backend
2. Abre DevTools en frontend (F12)
3. Verifica Network tab para errores HTTP
4. Contacta al equipo de desarrollo

**Versión**: 1.0  
**Fecha**: 2026-02-17
