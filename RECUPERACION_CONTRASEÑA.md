# 🔐 Sistema de Recuperación de Contraseña

## Descripción
Sistema completo de recuperación de contraseña para la aplicación Hospedaje Sebastian. Permite a los usuarios recuperar acceso a sus cuentas de forma segura mediante un correo electrónico.

## Características Implementadas

### ✅ Backend (Java Spring Boot)
1. **Nuevos Campos en Usuario**
   - `resetToken`: Token único para recuperación
   - `resetTokenExpiry`: Fecha de expiración del token (24 horas)

2. **Nuevos Endpoints**
   - `POST /api/auth/forgot-password` - Solicitar recuperación de contraseña
   - `GET /api/auth/validate-reset-token/{token}` - Validar token
   - `POST /api/auth/reset-password` - Actualizar contraseña

3. **Servicios**
   - **EmailService**: Envía correos de recuperación
   - **AuthService**: Gestiona la lógica de recuperación

4. **Dependencias Agregadas**
   - Spring Boot Mail (spring-boot-starter-mail)

### ✅ Frontend (Angular)
1. **Componentes Nuevos**
   - `ForgotPassword`: Formulario para solicitar recuperación
   - `ResetPassword`: Formulario para establecer nueva contraseña

2. **Nuevas Rutas**
   - `/forgot-password` - Página de recuperación
   - `/reset-password?token=xxx` - Página de reset con token

3. **Servicio**
   - `AuthService`: Comunica con el backend

## Configuración Necesaria

### 1. Backend - application.yml
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME:tu-email@gmail.com}
    password: ${MAIL_PASSWORD:tu-contraseña-app}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
```

### 2. Variables de Entorno (Backend)
```bash
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-contraseña-app
JWT_SECRET=tu-clave-secreta
```

### 3. Usar Gmail con Autenticación de Aplicación
1. Habilita Verificación en dos pasos en tu cuenta de Google
2. Ve a https://myaccount.google.com/apppasswords
3. Genera una contraseña de aplicación
4. Usa esa contraseña en `MAIL_PASSWORD`

### 4. Frontend - Configuración de CORS
El backend ya tiene configurado CORS para:
- `http://localhost:4200` (desarrollo Angular)
- `http://localhost:3000` (desarrollo Node)

## Flujo de Uso

### Para el Usuario:
1. **En la página de login**: Hace clic en "¿Olvidaste tu contraseña?"
2. **En forgot-password**: Ingresa su email
3. **Recibe correo**: Con un enlace de recuperación válido por 24 horas
4. **En reset-password**: Ingresa y confirma su nueva contraseña
5. **Confirmación**: Recibe otro correo confirmando el cambio
6. **Redirige**: Automáticamente al login

### Para el Desarrollador:
#### Probar el Flujo Local:
```bash
# 1. Terminal 1 - Backend
cd backend
./run.sh  # o run.bat en Windows

# 2. Terminal 2 - Frontend
cd frontend
npm start

# 3. Abre http://localhost:4200
# 4. Haz clic en "¿Olvidaste tu contraseña?"
# 5. Ingresa un email registrado
```

## Archivos Modificados/Creados

### Backend
- ✏️ `pom.xml` - Agregada dependencia de Mail
- ✏️ `Usuario.java` - Campos de recuperación
- ✏️ `AuthService.java` - Métodos de recuperación
- ✏️ `AuthController.java` - Nuevos endpoints
- ✏️ `UsuarioRepository.java` - Método findByResetToken
- ✏️ `application.yml` - Configuración de email
- ✨ `EmailService.java` - Nuevo servicio de email
- ✨ `PasswordResetRequest.java` - DTO
- ✨ `PasswordResetTokenValidation.java` - DTO
- ✨ `ResetTokenResponse.java` - DTO

### Frontend
- ✏️ `app.routes.ts` - Nuevas rutas
- ✏️ `app.config.ts` - Agregado HttpClient
- ✏️ `login.html` - Vinculado routerLink
- ✨ `forgot-password/` - Nuevo componente
- ✨ `reset-password/` - Nuevo componente
- ✨ `services/auth.service.ts` - Nuevo servicio

## Seguridad Implementada

✅ Tokens únicos con UUID  
✅ Expiración de 24 horas  
✅ Validación de contraseñas coincidentes  
✅ Longitud mínima de 6 caracteres  
✅ Indicador de fortaleza de contraseña  
✅ Contraseña hasheada con BCrypt  
✅ CORS configurado  
✅ Correos de confirmación  

## Próximas Mejoras (Opcional)

- [ ] Rate limiting en solicitudes de recuperación
- [ ] Notificationes SMS como alternativa
- [ ] Autenticación de dos factores (2FA)
- [ ] Historial de cambios de contraseña
- [ ] Preguntas de seguridad como backup
- [ ] OAuth con Google/Facebook
- [ ] WebHooks para eventos de seguridad

## Troubleshooting

### ❌ Error: "Error al enviar correo"
**Solución**: Verifica credenciales en `application.yml`

### ❌ Error: "Token inválido o expirado"
**Solución**: El token tiene 24 horas de validez. Solicita uno nuevo.

### ❌ No llega el correo
**Solución**: 
- Revisa carpeta de spam
- Verifica que el usuario está registrado
- Prueba con una dirección Gmail

### ❌ Frontend no conecta con backend
**Solución**: 
- Verifica que backend está en `http://localhost:3000`
- Verifica que CORS está configurado

## Pruebas

Para probar sin enviar correos realmente, puedes:
1. Comentar la línea `mailSender.send(message)` en EmailService
2. Hacer log del resetToken y usarlo directamente en la URL

## Contacto/Soporte
Para problemas o mejoras, contacta al equipo de desarrollo.

---
**Versión**: 1.0  
**Fecha**: 2026-02-17  
**Estado**: ✅ Productivo
