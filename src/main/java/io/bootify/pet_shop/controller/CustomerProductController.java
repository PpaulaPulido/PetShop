package io.bootify.pet_shop.controller;

import io.bootify.pet_shop.dto.ProductResponseDTO;
import io.bootify.pet_shop.services.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductResponseDTO>> searchProducts(@RequestParam String keyword) {
        return ResponseEntity.ok(productService.searchProducts(keyword));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductResponseDTO>> getProductsByCategory(@PathVariable Long categoryId) {
        // Implementar según necesidad
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<ProductResponseDTO>> getProductsByType(@PathVariable String type) {
        // Implementar según necesidad
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ProductResponseDTO>> getFeaturedProducts() {
        // Implementar productos destacados
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/on-sale")
    public ResponseEntity<List<ProductResponseDTO>> getProductsOnSale() {
        // Implementar productos en oferta
        return ResponseEntity.ok(List.of());
    }
}