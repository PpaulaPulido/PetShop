package io.bootify.pet_shop.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:./uploads}")
    private String uploadBaseDir; // Cambiado a directorio base

    private final String PRODUCTS_SUBDIR = "images/products";
    private final String PROFILES_SUBDIR = "images/profiles";

    // ========== MÉTODOS PÚBLICOS ==========

    /**
     * Guardar imagen de producto
     */
    public FileInfo storeProductImage(MultipartFile file, Long productId) throws IOException {
        return storeFileInSubdirectory(file, productId, PRODUCTS_SUBDIR, "product");
    }

    /**
     * Guardar foto de perfil de usuario
     */
    public FileInfo storeProfilePicture(MultipartFile file, Long userId) throws IOException {
        return storeFileInSubdirectory(file, userId, PROFILES_SUBDIR, "user");
    }

    /**
     * Eliminar archivo de producto
     */
    public void deleteProductFile(String fileName) throws IOException {
        deleteFile(fileName, PRODUCTS_SUBDIR);
    }

    /**
     * Eliminar archivo de perfil
     */
    public void deleteProfileFile(String fileName) throws IOException {
        deleteFile(fileName, PROFILES_SUBDIR);
    }

    // ========== MÉTODOS PRIVADOS ==========

    /**
     * Método principal para guardar archivos en subdirectorios
     */
    private FileInfo storeFileInSubdirectory(MultipartFile file, Long entityId, String subdirectory, String entityType) throws IOException {
        Path uploadPath = Paths.get(uploadBaseDir).resolve(subdirectory);
        ensureUploadDirExists(uploadPath);

        if (file.isEmpty()) {
            throw new RuntimeException("El archivo está vacío");
        }

        // Validar tipo de archivo
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Solo se permiten archivos de imagen. Tipo recibido: " + contentType);
        }

        // Validar tamaño del archivo (10MB máximo)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException("El archivo es demasiado grande. Tamaño máximo: 10MB");
        }

        // Generar nombre único para el archivo
        String originalFileName = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFileName);
        
        String fileName = generateFileName(entityType, entityId, fileExtension);
        Path targetLocation = uploadPath.resolve(fileName);

        // Copiar archivo al directorio de destino
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return new FileInfo(fileName, targetLocation.toString(), file.getSize(), subdirectory);
    }

    /**
     * Crear directorio si no existe
     */
    private void ensureUploadDirExists(Path uploadPath) throws IOException {
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
    }

    /**
     * Eliminar archivo específico
     */
    private void deleteFile(String fileName, String subdirectory) throws IOException {
        if (fileName != null && !fileName.isEmpty()) {
            Path filePath = Paths.get(uploadBaseDir).resolve(subdirectory).resolve(fileName);
            Files.deleteIfExists(filePath);
        }
    }

    /**
     * Obtener extensión del archivo
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return ".jpg"; // Extensión por defecto
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }

    /**
     * Generar nombre único para el archivo
     */
    private String generateFileName(String entityType, Long entityId, String fileExtension) {
        return String.format("%s_%d_%s%s", 
            entityType, 
            entityId, 
            UUID.randomUUID(), 
            fileExtension.toLowerCase());
    }

    /**
     * Obtener ruta completa del archivo
     */
    public Path getFilePath(String fileName, String subdirectory) {
        return Paths.get(uploadBaseDir).resolve(subdirectory).resolve(fileName);
    }

    /**
     * Verificar si un archivo existe
     */
    public boolean fileExists(String fileName, String subdirectory) {
        if (fileName == null || fileName.isEmpty()) {
            return false;
        }
        Path filePath = getFilePath(fileName, subdirectory);
        return Files.exists(filePath) && Files.isReadable(filePath);
    }

    // ========== CLASE INTERNA FILEINFO ==========

    public static class FileInfo {
        private final String fileName;
        private final String filePath;
        private final long fileSize;
        private final String subdirectory;

        public FileInfo(String fileName, String filePath, long fileSize, String subdirectory) {
            this.fileName = fileName;
            this.filePath = filePath;
            this.fileSize = fileSize;
            this.subdirectory = subdirectory;
        }

        public String getFileName() {
            return fileName;
        }

        public String getFilePath() {
            return filePath;
        }

        public long getFileSize() {
            return fileSize;
        }

        public String getSubdirectory() {
            return subdirectory;
        }

        /**
         * Obtener ruta relativa para almacenar en BD
         */
        public String getRelativePath() {
            return subdirectory + "/" + fileName;
        }

        /**
         * Obtener URL para acceder al archivo
         */
        public String getFileUrl(String baseUrl) {
            if ("images/products".equals(subdirectory)) {
                return baseUrl + "/api/images/products/" + fileName;
            } else if ("images/profiles".equals(subdirectory)) {
                return baseUrl + "/api/images/users/" + fileName;
            }
            return baseUrl + "/api/images/" + fileName;
        }
    }
}