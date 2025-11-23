# Imagen directa de Java 21
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copiar el JAR (asumiendo que lo construyes localmente)
COPY target/*.jar app.jar

# Crear usuario no-root
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]