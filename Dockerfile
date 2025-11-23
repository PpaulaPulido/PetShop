# Fase 1: Construir la aplicación
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copiar archivos de Maven primero (para cache de dependencias)
COPY pom.xml .
COPY src ./src

# Descargar dependencias y empaquetar la aplicación
RUN mvn clean package -DskipTests -Dspring.profiles.active=prod

# Fase 2: Ejecutar la aplicación  
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Instalar dependencias para uploads y crear directorio
RUN apk add --no-cache bash && \
    mkdir -p /app/uploads && \
    chmod 755 /app/uploads

# Copiar solo el JAR
COPY --from=builder /app/target/PetShop-0.0.1-SNAPSHOT.jar app.jar

# Puerto que usa Spring Boot
EXPOSE 8080

# Health check para Render
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/actuator/health || exit 1

# Comando para ejecutar con optimizaciones para producción
ENTRYPOINT ["java", "-jar", \
            "-Djava.security.egd=file:/dev/./urandom", \
            "-Dserver.port=${PORT:-8080}", \
            "app.jar"]