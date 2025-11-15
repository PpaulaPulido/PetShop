package io.bootify.pet_shop.services;

import io.bootify.pet_shop.dto.CategoryRequestDTO;
import io.bootify.pet_shop.dto.CategoryResponseDTO;
import io.bootify.pet_shop.models.Category;
import io.bootify.pet_shop.models.User;
import io.bootify.pet_shop.repositories.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    // Crear categoría
    @Transactional
    public CategoryResponseDTO createCategory(CategoryRequestDTO request) {
        User currentUser = getCurrentUser();
        System.out.println("📂 SUPER_ADMIN " + currentUser.getEmail() + " creando categoría: " + request.getName());

        if (categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Ya existe una categoría con ese nombre");
        }

        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category savedCategory = categoryRepository.save(category);
        return convertToDTO(savedCategory);
    }

    // Obtener todas las categorías
    public List<CategoryResponseDTO> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Obtener categoría por ID
    public CategoryResponseDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        return convertToDTO(category);
    }

    // Actualizar categoría
    @Transactional
    public CategoryResponseDTO updateCategory(Long id, CategoryRequestDTO request) {
        User currentUser = getCurrentUser();
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        System.out.println("✏️ SUPER_ADMIN " + currentUser.getEmail() + " actualizando categoría: " + category.getName());

        // Verificar si el nombre ya existe (excluyendo la categoría actual)
        if (!category.getName().equals(request.getName()) && 
            categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Ya existe una categoría con ese nombre");
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category updatedCategory = categoryRepository.save(category);
        return convertToDTO(updatedCategory);
    }

    // Eliminar categoría (solo si no tiene productos)
    @Transactional
    public void deleteCategory(Long id) {
        User currentUser = getCurrentUser();
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        System.out.println("🗑️ SUPER_ADMIN " + currentUser.getEmail() + " eliminando categoría: " + category.getName());

        if (!category.getProducts().isEmpty()) {
            throw new RuntimeException("No se puede eliminar la categoría porque tiene productos asociados");
        }

        categoryRepository.delete(category);
    }

    private CategoryResponseDTO convertToDTO(Category category) {
        CategoryResponseDTO dto = new CategoryResponseDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        dto.setProductCount(category.getProducts() != null ? category.getProducts().size() : 0);
        return dto;
    }
}