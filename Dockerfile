# Usar una imagen base de Java
FROM openjdk:17-jdk-slim

# Instalar Maven y crear un usuario no-root
RUN apt-get update && apt-get install -y --no-install-recommends \
    maven \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r spring && useradd -r -g spring spring

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos del proyecto
COPY . .
RUN chown -R spring:spring /app

# Cambiar al usuario no-root
USER spring

# Compilar la aplicación
RUN ./mvnw clean package -DskipTests

# Exponer el puerto
EXPOSE 8080

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "target/*.jar"]