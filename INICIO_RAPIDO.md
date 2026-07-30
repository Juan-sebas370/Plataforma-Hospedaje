# 🚀 Inicio Rápido - Hospedaje Sebastian

## Opción 1: Inicio Automático (Recomendado)

Ejecuta este archivo para iniciar **TODO automáticamente**:
```
start-all.bat
```

Esto abrirá 3 ventanas:
- 🍃 **MongoDB** (Base de datos)
- ⚙️ **Backend** - http://localhost:3000/api
- 🎨 **Frontend** - http://localhost:4200

---

## Opción 2: Inicio Manual

### 1️⃣ Iniciar MongoDB
```
start-mongodb.bat
```
O manualmente:
```bash
mongod --dbpath "C:\data\db"
```

### 2️⃣ Iniciar Backend
```
start-backend.bat
```
O manualmente:
```bash
cd backend
java -jar target/hospedaje-sebastian-1.0.0.jar
```

### 3️⃣ Iniciar Frontend
```bash
cd frontend
npm start
```

---

## 📋 Requisitos Previos

✅ **Java 17** instalado
✅ **Node.js 18+** instalado
✅ **MongoDB 6.0+** instalado
✅ **Maven** instalado

---

## 🧪 Probar Recuperación de Contraseña

1. **Configurar Email** (antes de iniciar):
   - Edita: `backend/src/main/resources/application.yml`
   - Configura tu Gmail y contraseña de aplicación

2. **Abrir aplicación**:
   - Ve a http://localhost:4200

3. **Registrar usuario**:
   - Clic en "Regístrate aquí"
   - Usa un email real (para recibir correos)

4. **Probar recuperación**:
   - En login, clic en "¿Olvidaste tu contraseña?"
   - Ingresa tu email
   - Revisa tu correo
   - Clic en el enlace de recuperación
   - Establece nueva contraseña

---

## ❌ Solución de Problemas

### MongoDB no inicia
```bash
# Crea el directorio si no existe
mkdir C:\data\db

# Verifica que MongoDB esté en el PATH
mongod --version
```

### Backend falla al iniciar
```bash
# Verifica que MongoDB esté corriendo
# Recompila el backend
cd backend
mvn clean install
```

### Frontend no compila
```bash
# Reinstala dependencias
cd frontend
npm install
npm start
```

---

## 📁 Archivos Importantes

- `start-all.bat` - Inicia todo automáticamente
- `start-mongodb.bat` - Solo MongoDB
- `start-backend.bat` - Solo Backend (verifica MongoDB primero)
- `GUIA_PRUEBAS.md` - Guía completa de pruebas
- `RECUPERACION_CONTRASEÑA.md` - Documentación del sistema

---

## 🆘 Ayuda

Si algo no funciona:
1. Verifica los logs en cada ventana
2. Asegúrate que los puertos 3000, 4200 y 27017 estén libres
3. Revisa que MongoDB esté corriendo antes del backend

---

**¡Listo!** 🎉 Ejecuta `start-all.bat` y espera a que todo inicie.
