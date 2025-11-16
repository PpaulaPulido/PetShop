package io.bootify.pet_shop.controller;

import io.bootify.pet_shop.models.Product;
import io.bootify.pet_shop.models.User;
import io.bootify.pet_shop.repositories.ProductRepository;
import io.bootify.pet_shop.repositories.UserRepository;
import io.bootify.pet_shop.services.FileStorageService; 
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService; 

    @Value("${app.upload.dir:./uploads}")
    private String uploadBaseDir;

    // ========== ENDPOINTS PARA PRODUCTOS ==========

    @GetMapping("/products/{productId}")
    public ResponseEntity<Resource> getProductImage(@PathVariable Long productId) {
        try {
            log.debug("Solicitando imagen para producto ID: {}", productId);

            Optional<Product> productOpt = productRepository.findById(productId);
            if (productOpt.isEmpty()) {
                log.warn("Producto no encontrado con ID: {}", productId);
                return getDefaultProductImage();
            }

            Product product = productOpt.get();

            // Prioridad: archivo subido > URL externa > imagen por defecto
            if (product.getImageFileName() != null && !product.getImageFileName().isEmpty()) {
                return getUploadedProductImage(product);
            } else if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
                log.debug("Producto {} tiene URL externa: {}", productId, product.getImageUrl());
                return getDefaultProductImage();
            } else {
                log.debug("Producto {} no tiene imagen asociada", productId);
                return getDefaultProductImage();
            }

        } catch (Exception e) {
            log.error("Error obteniendo imagen para producto {}: {}", productId, e.getMessage());
            return getDefaultProductImage();
        }
    }

    private ResponseEntity<Resource> getUploadedProductImage(Product product) {
        try {
            // Verificar si el archivo existe usando FileStorageService
            if (fileStorageService.fileExists(product.getImageFileName(), "images/products")) {
                Path filePath = fileStorageService.getFilePath(product.getImageFileName(), "images/products");
                Resource resource = new UrlResource(filePath.toUri());

                if (resource.exists() && resource.isReadable()) {
                    String contentType = determineContentType(product.getImageFileName());
                    log.debug("Sirviendo imagen de producto: {} - Content-Type: {}", product.getImageFileName(), contentType);

                    return ResponseEntity.ok()
                            .contentType(MediaType.parseMediaType(contentType))
                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + product.getImageFileName() + "\"")
                            .body(resource);
                }
            }
            
            log.warn("Archivo de imagen de producto no encontrado: {}", product.getImageFileName());
            return getDefaultProductImage();
            
        } catch (Exception e) {
            log.error("Error cargando imagen de producto: {}", e.getMessage());
            return getDefaultProductImage();
        }
    }

    private ResponseEntity<Resource> getDefaultProductImage() {
        try {
            Path defaultImagePath = Paths.get("src/main/resources/static/images/default-product.png");
            Resource resource = new UrlResource(defaultImagePath.toUri());

            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_PNG)
                        .body(resource);
            } else {
                log.error("Imagen por defecto de producto no encontrada");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error cargando imagen por defecto de producto: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ========== ENDPOINTS PARA USUARIOS ==========

    @GetMapping("/users/{userId}")
    public ResponseEntity<Resource> getUserProfilePicture(@PathVariable Long userId) {
        try {
            log.debug("Solicitando imagen de perfil para usuario ID: {}", userId);
            
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                log.warn("Usuario no encontrado con ID: {}", userId);
                return getDefaultAvatar();
            }

            User user = userOpt.get();
            
            // Verificar si el usuario tiene imagen de perfil subida
            if (user.getProfilePictureFileName() != null && !user.getProfilePictureFileName().isEmpty()) {
                return getUploadedUserImage(user);
            } else if (user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()) {
                log.debug("Usuario {} tiene URL externa: {}", userId, user.getProfilePicture());
                return getDefaultAvatar();
            } else {
                log.debug("Usuario {} no tiene imagen de perfil asociada", userId);
                return getDefaultAvatar();
            }
        } catch (Exception e) {
            log.error("Error obteniendo imagen de perfil para usuario {}: {}", userId, e.getMessage());
            return getDefaultAvatar();
        }
    }

    private ResponseEntity<Resource> getUploadedUserImage(User user) {
        try {
            // Verificar si el archivo existe usando FileStorageService
            if (fileStorageService.fileExists(user.getProfilePictureFileName(), "images/profiles")) {
                Path filePath = fileStorageService.getFilePath(user.getProfilePictureFileName(), "images/profiles");
                Resource resource = new UrlResource(filePath.toUri());

                if (resource.exists() && resource.isReadable()) {
                    String contentType = determineContentType(user.getProfilePictureFileName());
                    log.debug("Sirviendo imagen de perfil: {} - Content-Type: {}", user.getProfilePictureFileName(), contentType);

                    return ResponseEntity.ok()
                            .contentType(MediaType.parseMediaType(contentType))
                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + user.getProfilePictureFileName() + "\"")
                            .body(resource);
                }
            }
            
            log.warn("Archivo de imagen de perfil no encontrado: {}", user.getProfilePictureFileName());
            return getDefaultAvatar();
            
        } catch (Exception e) {
            log.error("Error cargando imagen de perfil: {}", e.getMessage());
            return getDefaultAvatar();
        }
    }

    private ResponseEntity<Resource> getDefaultAvatar() {
        try {
            Path defaultImagePath = Paths.get("src/main/resources/static/images/default-avatar.png");
            Resource resource = new UrlResource(defaultImagePath.toUri());
            
            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_PNG)
                        .body(resource);
            } else {
                log.error("Avatar por defecto no encontrado");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error cargando avatar por defecto: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ========== MÉTODO AUXILIAR COMÚN ==========

    private String determineContentType(String fileName) {
        String lowerFileName = fileName.toLowerCase();

        if (lowerFileName.endsWith(".png")) return "image/png";
        if (lowerFileName.endsWith(".jpg") || lowerFileName.endsWith(".jpeg")) return "image/jpeg";
        if (lowerFileName.endsWith(".gif")) return "image/gif";
        if (lowerFileName.endsWith(".webp")) return "image/webp";
        if (lowerFileName.endsWith(".bmp")) return "image/bmp";

        return MediaType.APPLICATION_OCTET_STREAM_VALUE;
    }
}