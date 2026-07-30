# 🎉 BIENVENIDO - Tu Backend Java ya está listo

## ⚡ Para empezar en 3 pasos

### 1️⃣ Asegúrate que tienes Java
```bash
java -version    # Debe ser Java 17 o superior
```

Si no lo tienes, descargalo de: https://www.oracle.com/java/technologies/downloads/

### 2️⃣ Inicia MongoDB (elige una opción)

**Opción A: Local**
```bash
mongod
```

**Opción B: Docker (Recomendado)**
```bash
docker-compose up -d
# Mongo Express en: http://localhost:8081
```

### 3️⃣ Ejecuta el backend
```bash
mvn spring-boot:run
```

✅ **¡Listo!** La API está en: **http://localhost:3000/api**

---

## 📚 ¿Qué leer primero?

### 🚀 Quiero empezar YA
→ Abre [QUICK_START.md](QUICK_START.md)

### 📖 Quiero entender todo
→ Abre [README_JAVA.md](README_JAVA.md)

### 🔗 Voy a conectar con Angular
→ Abre [INTEGRACION_FRONTEND.md](INTEGRACION_FRONTEND.md)

### 📋 Quiero ver un resumen
→ Abre [SUMMARY.md](SUMMARY.md)

### ⚙️ Tengo preguntas de setup
→ Abre [SETUP.md](SETUP.md)

---

## 🗂️ Archivos principales

```
backend/
├── README.md                      ← Documentación general
├── QUICK_START.md                 ← COMIENZA AQUÍ
├── README_JAVA.md                 ← Documentación técnica
├── INTEGRACION_FRONTEND.md        ← Para conectar Angular
├── SETUP.md                       ← Setup avanzado
├── SUMMARY.md                     ← Resumen de cambios
├── pom.xml                        ← Dependencias Maven
├── run.bat / run.sh               ← Scripts de ejecución
├── docker-compose.yml             ← MongoDB con Docker
├── Hospedaje_Sebastian_API.postman_collection.json  ← Tests
└── src/main/java/...             ← Código fuente
```

---

## 🎯 Checklist

- [ ] He instalado Java 17+
- [ ] He instaldo Maven (o viene con Java)
- [ ] MongoDB está corriendo
- [ ] Ejecuté `mvn spring-boot:run`
- [ ] Probé `curl http://localhost:3000/api/health`
- [ ] Leí [QUICK_START.md](QUICK_START.md)
- [ ] Conecté el frontend con los nuevos endpoints

---

## ❌ ¿Problemas?

### "Port 3000 already in use"
Edita `src/main/resources/application.yml` y cambia el puerto.

### "Java not found"
Instala Java 17+ desde https://www.oracle.com/java/technologies/downloads/

### "MongoDB connection refused"
Asegúrate que MongoDB está corriendo (`mongod` o `docker-compose up -d`)

Ver [QUICK_START.md](QUICK_START.md#troubleshooting) para más problemas.

---

## 🎁 Extras

- **Postman Collection**: Importa `Hospedaje_Sebastian_API.postman_collection.json`
- **Mongo Express**: Acceso en `http://localhost:8081` (user: admin, pass: admin123)
- **Scripts de ayuda**: `run.bat` (Windows) o `run.sh` (Linux/Mac)
- **Docker Compose**: `docker-compose.yml` para MongoDB automático

---

## 🚀 Comandos Útiles

```bash
# Compilar
mvn clean install

# Ejecutar
mvn spring-boot:run

# Build JAR para producción
mvn clean package
java -jar target/hospedaje-sebastian-1.0.0.jar

# Ver dependencias
mvn dependency:tree

# Limpiar compilaciones
mvn clean
```

---

## 📞 Resumen de lo que cambió

✅ **Node.js/Express** → ✅ **Java/Spring Boot**
- Mismo puerto: 3000
- Mismos endpoints
- Mejor performance
- Mejor seguridad
- Mejor tipado
- Mejor escalabilidad

El frontend NO necesita cambios (usa los mismos endpoints).

---

## 🎉 ¡Ya casi estás listo!

**Próximo paso:**
1. Abre [QUICK_START.md](QUICK_START.md)
2. Sigue los pasos
3. ¡Disfruta de tu nuevo backend! 🚀

---

**Preguntas?** Revisa la documentación en los archivos .md o abre un issue en el repositorio.
