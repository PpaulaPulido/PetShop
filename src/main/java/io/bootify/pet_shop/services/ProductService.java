package io.bootify.pet_shop.services;

import io.bootify.pet_shop.dto.ProductRequestDTO;
import io.bootify.pet_shop.dto.ProductResponseDTO;
import io.bootify.pet_shop.dto.StockUpdateRequestDTO;
import io.bootify.pet_shop.models.Category;
import io.bootify.pet_shop.models.Product;
import io.bootify.pet_shop.models.ProductType;
import io.bootify.pet_shop.models.User;
import io.bootify.pet_shop.repositories.CategoryRepository;
import io.bootify.pet_shop.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    // Crear producto
    @Transactional
    public ProductResponseDTO createProduct(ProductRequestDTO request) {
        User currentUser = getCurrentUser();
        System.out.println("🛍️ SUPER_ADMIN " + currentUser.getEmail() + " creando producto: " + request.getName());

        // Validar categoría si se proporciona
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        }

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setMinStock(request.getMinStock() != null ? request.getMinStock() : 10);
        product.setImageUrl(request.getImageUrl());
        product.setType(ProductType.valueOf(request.getType()));
        product.setCategory(category);
        product.setActive(true);

        Product savedProduct = productRepository.save(product);
        return convertToDTO(savedProduct);
    }

    // Obtener todos los productos
    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Obtener producto por ID
    public ProductResponseDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return convertToDTO(product);
    }

    // Actualizar producto
    @Transactional
    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO request) {
        User currentUser = getCurrentUser();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        System.out.println("✏️ SUPER_ADMIN " + currentUser.getEmail() + " actualizando producto: " + product.getName());

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setMinStock(request.getMinStock());
        product.setImageUrl(request.getImageUrl());
        product.setType(ProductType.valueOf(request.getType()));
        product.setCategory(category);

        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }

    // Gestionar stock
    @Transactional
    public ProductResponseDTO updateStock(Long id, StockUpdateRequestDTO request) {
        User currentUser = getCurrentUser();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        System.out.println("📦 SUPER_ADMIN " + currentUser.getEmail() + 
                " actualizando stock de " + product.getName() + ": " + request.getOperation() + 
                " " + request.getQuantity());

        switch (request.getOperation().toUpperCase()) {
            case "ADD":
                product.setStock(product.getStock() + request.getQuantity());
                break;
            case "SUBTRACT":
                if (product.getStock() < request.getQuantity()) {
                    throw new RuntimeException("Stock insuficiente");
                }
                product.setStock(product.getStock() - request.getQuantity());
                break;
            case "SET":
                product.setStock(request.getQuantity());
                break;
            default:
                throw new RuntimeException("Operación no válida: " + request.getOperation());
        }

        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }

    // Activar/Desactivar producto
    @Transactional
    public ProductResponseDTO toggleProductStatus(Long id) {
        User currentUser = getCurrentUser();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        product.setActive(!product.getActive());
        Product updatedProduct = productRepository.save(product);

        String status = product.getActive() ? "activado" : "desactivado";
        System.out.println("🔘 SUPER_ADMIN " + currentUser.getEmail() + " " + status + " producto: " + product.getName());

        return convertToDTO(updatedProduct);
    }

    // Obtener productos con stock bajo
    public List<ProductResponseDTO> getLowStockProducts() {
        return productRepository.findByStockLessThanEqualAndActiveTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Buscar productos por nombre
    public List<ProductResponseDTO> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ProductResponseDTO convertToDTO(Product product) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setMinStock(product.getMinStock());
        dto.setImageUrl(product.getImageUrl());
        dto.setActive(product.getActive());
        dto.setType(product.getType().name());
        dto.setCategoryName(product.getCategory() != null ? product.getCategory().getName() : null);
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        return dto;
    }
}