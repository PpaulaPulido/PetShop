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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;
    private final SecurityService securityService;

    private User getCurrentUser() {
        return securityService.getCurrentUser();
    }

    @Transactional
    public ProductResponseDTO createProduct(ProductRequestDTO request) {
        User currentUser = getCurrentUser();

        if (productRepository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Ya existe un producto con el nombre: " + request.getName());
        }

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
        product.setMinStock(request.getMinStock() != null ? request.getMinStock() : 5);
        product.setType(ProductType.valueOf(request.getType()));
        product.setCategory(category);
        product.setActive(true);

        Product savedProduct = productRepository.save(product);

        if (request.getImageFile() != null && !request.getImageFile().isEmpty()) {
            handleImageUpload(request.getImageFile(), savedProduct);
            savedProduct = productRepository.save(savedProduct);
        } else if (request.getImageUrl() != null && !request.getImageUrl().isEmpty()) {
            savedProduct.setImageUrl(request.getImageUrl());
            savedProduct = productRepository.save(savedProduct);
        }

        return convertToDTO(savedProduct);
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAllWithCategory()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponseDTO getProductById(Long id) {
        Product product = productRepository.findByIdWithCategory(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return convertToDTO(product);
    }

    @Transactional
    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO request) {
        User currentUser = getCurrentUser();
        Product product = productRepository.findByIdWithCategory(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (productRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new RuntimeException("Ya existe otro producto con el nombre: " + request.getName());
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setMinStock(request.getMinStock());
        product.setType(ProductType.valueOf(request.getType()));
        product.setCategory(category);

        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }

        if (request.getImageFile() != null && !request.getImageFile().isEmpty()) {
            // Si se sube nueva imagen
            handleImageUpload(request.getImageFile(), product);
        } else if (request.getImageUrl() != null && !request.getImageUrl().isEmpty()) {
            // Si se proporciona nueva URL
            clearUploadedImage(product);
            product.setImageUrl(request.getImageUrl());
        }

        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }

    @Transactional
    public ProductResponseDTO updateStock(Long id, StockUpdateRequestDTO request) {
        User currentUser = getCurrentUser();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

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

    @Transactional
    public ProductResponseDTO toggleProductStatus(Long id) {
        User currentUser = getCurrentUser();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        product.setActive(!product.getActive());
        Product updatedProduct = productRepository.save(product);

        String status = product.getActive() ? "activado" : "desactivado";
        System.out
                .println("🔘 SUPER_ADMIN " + currentUser.getEmail() + " " + status + " producto: " + product.getName());

        return convertToDTO(updatedProduct);
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private void handleImageUpload(MultipartFile imageFile, Product product) {
        try {
            if (product.getImageFileName() != null) {
                fileStorageService.deleteProductFile(product.getImageFileName());
            }

            FileStorageService.FileInfo fileInfo = fileStorageService.storeProductImage(imageFile, product.getId());
            product.setImageFileName(fileInfo.getFileName());
            product.setImageFilePath(fileInfo.getFilePath());
            product.setImageFileSize(fileInfo.getFileSize());
            product.setImageUrl(null);
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar la imagen: " + e.getMessage());
        }
    }

    private void clearUploadedImage(Product product) {
        if (product.getImageFileName() != null) {
            try {
                fileStorageService.deleteProductFile(product.getImageFileName());
            } catch (IOException e) {
                System.err.println("Error al eliminar archivo anterior: " + e.getMessage());
            }
            product.setImageFileName(null);
            product.setImageFilePath(null);
            product.setImageFileSize(null);
        }
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getLowStockProducts() {
        return productRepository.findByStockLessThanEqualMinStock()
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
        dto.setImageUrl(product.getDisplayImage());
        dto.setHasUploadedImage(product.getImageFileName() != null);
        dto.setActive(product.getActive());
        dto.setType(product.getType().name());

        if (product.getCategory() != null) {
            dto.setCategoryName(product.getCategory().getName());
            dto.setCategoryId(product.getCategory().getId());
        } else {
            dto.setCategoryName(null);
            dto.setCategoryId(null);
        }

        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getProductsWithFilters(
            String search,
            List<Long> category,
            List<ProductType> type,
            Double minPrice,
            Double maxPrice,
            Boolean inStock,
            String sort,
            int page,
            int size) {


        List<Product> products;

        if (search != null && !search.trim().isEmpty()) {
            // Si hay búsqueda, usar el método existente
            products = productRepository.findByNameContainingIgnoreCase(search);
        } else {
            // Si no hay búsqueda, obtener todos los productos activos
            products = productRepository.findByActiveTrue();
        }

        // Aplicar filtros básicos
        List<Product> filteredProducts = products.stream()
                .filter(product -> {
                    // Filtro por categoría
                    if (category != null && !category.isEmpty()) {
                        if (product.getCategory() == null)
                            return false;
                        return category.contains(product.getCategory().getId());
                    }
                    return true;
                })
                .filter(product -> {
                    // Filtro por tipo
                    if (type != null && !type.isEmpty()) {
                        return type.contains(product.getType());
                    }
                    return true;
                })
                .filter(product -> {
                    // Filtro por precio mínimo
                    if (minPrice != null) {
                        return product.getPrice().compareTo(BigDecimal.valueOf(minPrice)) >= 0;
                    }
                    return true;
                })
                .filter(product -> {
                    // Filtro por precio máximo
                    if (maxPrice != null) {
                        return product.getPrice().compareTo(BigDecimal.valueOf(maxPrice)) <= 0;
                    }
                    return true;
                })
                .filter(product -> {
                    // Filtro por stock
                    if (inStock != null && inStock) {
                        return product.getStock() > 0;
                    }
                    return true;
                })
                .collect(Collectors.toList());

        // Aplicar ordenamiento
        filteredProducts = applySorting(filteredProducts, sort);

        // Aplicar paginación (básica)
        int start = page * size;
        int end = Math.min(start + size, filteredProducts.size());

        if (start > filteredProducts.size()) {
            return List.of();
        }

        return filteredProducts.subList(start, end)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private List<Product> applySorting(List<Product> products, String sort) {
        switch (sort) {
            case "price_asc":
                return products.stream()
                        .sorted(Comparator.comparing(Product::getPrice))
                        .collect(Collectors.toList());
            case "price_desc":
                return products.stream()
                        .sorted(Comparator.comparing(Product::getPrice).reversed())
                        .collect(Collectors.toList());
            case "newest":
                return products.stream()
                        .sorted(Comparator.comparing(Product::getCreatedAt).reversed())
                        .collect(Collectors.toList());
            case "name":
            default:
                return products.stream()
                        .sorted(Comparator.comparing(Product::getName))
                        .collect(Collectors.toList());
        }
    }
}