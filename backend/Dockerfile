# Dockerfile para el backend Spring Boot (Java 17 + MySQL)
# ============================================================

# STAGE 1: BUILD
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copiar solo el pom.xml primero para cachear las dependencias
COPY pom.xml .
RUN mvn -q -B dependency:go-offline

# Copiar el código fuente y compilar el JAR
COPY src ./src
RUN mvn -q -B clean package -DskipTests

# STAGE 2: RUN
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

# Plataformas como Railway/Render/Fly asignan el puerto por la variable PORT;
# application.properties usa server.port=${PORT:8080}, así que ambos casos funcionan.
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget -qO- "http://localhost:${PORT:-8080}/api/health" || exit 1

CMD ["java", "-jar", "app.jar"]
