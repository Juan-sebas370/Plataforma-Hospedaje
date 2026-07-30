# 💻 Comandos Útiles para Desarrollo

## Maven - Compilación y Build

### Compilación
```bash
# Compilar y descargar dependencias (primera vez)
mvn clean install

# Solo compilar sin tests
mvn clean compile

# Compilar con tests
mvn clean package
```

### Ejecución
```bash
# Ejecutar con Spring Boot Maven plugin (desarrollo)
mvn spring-boot:run

# Ejecutar JAR compilado
java -jar target/hospedaje-sebastian-1.0.0.jar

# Ejecutar con argumentos VM
java -Dspring.profiles.active=dev \
     -Djwt.secret=mi-secreto \
     -jar target/hospedaje-sebastian-1.0.0.jar
```

### Limpieza
```bash
# Limpiar carpeta target (compilaciones previas)
mvn clean

# Solo eliminar archivos compilados
rm -rf target/

# Limpiar cache de Maven
mvn clean -DremoveSnapshots
```

## Testing

### Tests Unitarios
```bash
# Ejecutar todos los tests
mvn test

# Ejecutar un test específico
mvn test -Dtest=AuthServiceTest

# Ejecutar tests sin parar en fallos
mvn test -DfailIfNoTests=false
```

### Dependencias
```bash
# Ver árbol de dependencias
mvn dependency:tree

# Resolver conflictos de dependencias
mvn dependency:resolve

# Ver dependencias outdated
mvn versions:display-dependency-updates
```

## MongoDB

### Mongo (CLI)
```bash
# Conectarse a MongoDB local
mongosh

# Conectarse a MongoDB Atlas
mongosh "mongodb+srv://usuario:password@cluster.mongodb.net/hospedaje_db"

# Comandos dentro de mongosh
db.usuarios.find()                 # Ver todos los usuarios
db.usuarios.deleteMany({})         # Eliminar todos (CUIDADO)
db.usuarios.findOne()              # Un documento
db.habitaciones.countDocuments()   # Contar documentos
```

### Docker
```bash
# Iniciar MongoDB + Mongo Express
docker-compose up -d

# Ver contenedores corriendo
docker ps

# Ver logs del contenedor
docker logs hospedaje_db

# Parar los contenedores
docker-compose down

# Parar y eliminar volúmenes (BORRA DATOS)
docker-compose down -v

# Ejecutar comando en MongoDB
docker exec -it hospedaje_db mongosh --eval "db.usuarios.countDocuments()"
```

## Desarrollo

### IntelliJ IDEA / VS Code
```bash
# Importar proyecto Maven
# File → Open → Seleccionar carpeta backend → Maven project

# Ejecutar desde IDE
Click en el icono verde ► en HospedajeApplication.java
Ctrl+Shift+F10 (IntelliJ)
```

### Git
```bash
# Clonar repositorio
git clone <repo>

# Crear rama para feature
git checkout -b feature/nueva-funcionalidad

# Hacer commit
git add .
git commit -m "descripción del cambio"

# Subir cambios
git push origin feature/nueva-funcionalidad

# Crear pull request en GitHub
```

## Debugging

### Breakpoints
```bash
# Los breakpoints se ponen en IDEs (IDE)
# Click en la línea → aparece un punto rojo

# Con acceso remoto:
# Correo java con opciones debug:
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005 \
     -jar target/hospedaje-sebastian-1.0.0.jar
```

### Logs
```bash
# En application.yml, cambia el nivel de log
logging:
  level:
    root: DEBUG
    com.hotelsebasitian: TRACE

# Ver logs en tiempo real
tail -f echo "Debug log here"
```

## Herramientas

### cURL - Testing de APIs
```bash
# GET
curl http://localhost:3000/api/health

# POST
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass"}'

# Con token JWT
curl -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..." \
  http://localhost:3000/api/habitaciones

# Guardar respuesta en archivo
curl -o response.json http://localhost:3000/api/habitaciones

# Ver headers de respuesta
curl -i http://localhost:3000/api/health
```

### Postman
```bash
# Importar colección
File → Import → Hospedaje_Sebastian_API.postman_collection.json

# Variables de entorno
Environments → Crear environment → base_url, token, etc.

# Pre-request script (ejecuta antes de cada request)
# Guardar token automáticamente
# Tests (verificar respuestas)
```

### HTTPie (alternativa a cURL)
```bash
# GET
http http://localhost:3000/api/health

# POST
http POST http://localhost:3000/api/auth/login \
  email=test@example.com password=pass

# Con autenticación Bearer
http GET http://localhost:3000/api/habitaciones \
  "Authorization: Bearer TOCKEN_AQUI"
```

## Productividad

### Maven shortcuts
```bash
# Alias útiles (agregar a .bashrc o .zshrc)
alias mvn-run="mvn clean compile spring-boot:run"
alias mvn-build="mvn clean package"
alias mvn-test="mvn test"

# Windows (crear script .bat)
REM mvn-run.bat
mvn clean compile spring-boot:run %*
```

### Scripts personalizados
```bash
#!/bin/bash
# dev.sh - Script para desarrollo rápido

# Limpiar, compilar y ejecutar
mvn clean && mvn compile && mvn spring-boot:run

# O en Windows:
# dev.bat
@echo off
mvn clean && mvn compile && mvn spring-boot:run
```

## Problemas Comunes

### Puerto ya en uso
```bash
# Encontrar qué proceso usa puerto 3000
lsof -i :3000          # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Matar el proceso
kill -9 <PID>          # Mac/Linux
taskkill /PID <PID> /F # Windows
```

### Dependencias desactualizadas
```bash
# Ver cuáles están outdated
mvn versions:display-dependency-updates

# Ver plugins outdated
mvn versions:display-plugin-updates

# Actualizar a última versión (con cuidado)
mvn versions:use-latest-versions
```

### Cache/Dependencias rotas
```bash
# Limpiar repositorio local Maven
rm -rf ~/.m2/repository/*

# O versión específica
rm -rf ~/.m2/repository/com/hotelsebasitian

# Limpiar IntelliJ IDEA
File → Invalidate Caches... → Invalidate and Restart
```

## Performance

### Análisis de dependencias
```bash
# Tamaño del JAR
du -h target/hospedaje-sebastian-1.0.0.jar

# Qué está dentro del JAR
jar tf target/hospedaje-sebastian-1.0.0.jar

# Profiling de memoria
java -Xmx512m -Xms256m -jar target/hospedaje-sebastian-1.0.0.jar
```

### Múltiples perfiles
```bash
# application-prod.yml
# application-dev.yml
# application-test.yml

# Ejecutar con perfil específico
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=prod"

# O variable de entorno
export SPRING_PROFILES_ACTIVE=prod
mvn spring-boot:run
```

## Seguridad

### Generar nueva clave JWT
```bash
# Usando Java
# En cualquier IDE, ejecuta:
System.out.println(Base64.getEncoder().encodeToString("tu-secreto-super-seguro-aqui-minimo-30-caracteres".getBytes()));

# Copiar el resultado y usar en application.yml
```

### Cambiar contraseña de admin (en mongosh)
```bash
# Buscar usuario
db.usuarios.findOne({email: "admin@example.com"})

# Actualizar (nota: necesitas hash bcrypt)
# Mejor usar la API de registro/cambio de contraseña
```

---

## Resumen Rápido

| Acción | Comando |
|--------|---------|
| Empezar desarrollo | `mvn spring-boot:run` |
| Compilar | `mvn clean package` |
| Tests | `mvn test` |
| Limpiar | `mvn clean` |
| Ver dependencias | `mvn dependency:tree` |
| MongoDB local | `mongod` |
| MongoDB Docker | `docker-compose up -d` |
| Health Check | `curl http://localhost:3000/api/health` |

---

**Tip**: Copia los comandos más usados en un archivo `COMANDOS.sh` o `COMANDOS.bat` en la carpeta del proyecto para acceso rápido.
