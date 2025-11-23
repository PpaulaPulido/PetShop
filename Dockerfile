# Fase 1: Construir la aplicación
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copiar todo el proyecto
COPY . .

# Compilar y crear el JAR
RUN mvn clean package -DskipTests

# Fase 2: Ejecutar la aplicación  
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copiar solo el JAR (no todo el código)
COPY --from=builder /app/target/PetShop-0.0.1-SNAPSHOT.jar app.jar

# Puerto que usa Spring Boot
EXPOSE 8080

# Comando para ejecutar
ENTRYPOINT ["java", "-jar", "app.jar"]