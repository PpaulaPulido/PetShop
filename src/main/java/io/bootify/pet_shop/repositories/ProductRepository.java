package io.bootify.pet_shop.repositories;

import io.bootify.pet_shop.models.Product;
import io.bootify.pet_shop.models.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category")
    List<Product> findAllWithCategory();

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.id = :id")
    Optional<Product> findByIdWithCategory(@Param("id") Long id);

    List<Product> findByActiveTrue();

    List<Product> findByType(ProductType type);

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByNameContainingIgnoreCase(String name);

    @Query("SELECT p FROM Product p WHERE p.stock <= p.minStock AND p.active = true")
    List<Product> findLowStockProducts();

    @Query("SELECT p FROM Product p WHERE p.stock = 0 AND p.active = true")
    List<Product> findOutOfStockProducts();

    List<Product> findByStockLessThanEqual(Integer stock);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.active = true")
    Long countActiveProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.stock > 0 AND p.stock <= p.minStock AND p.active = true")
    Long countLowStockProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId")
    Long countByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.stock = 0 AND p.active = true")
    Long countOutOfStockProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.stock > 0 AND p.stock <= (p.minStock * 0.3) AND p.active = true")
    Long countCriticalStockProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.stock > p.minStock AND p.stock <= (p.minStock * 2) AND p.active = true")
    Long countNormalStockProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.stock > (p.minStock * 2) AND p.active = true")
    Long countExcellentStockProducts();

    @Query("SELECT COALESCE(c.name, 'Sin Categoría'), COUNT(p) FROM Product p LEFT JOIN p.category c WHERE p.active = true GROUP BY c.name")
    List<Object[]> countProductsByCategory();

    @Query("SELECT COALESCE(SUM(p.price * p.stock), 0) FROM Product p WHERE p.active = true")
    BigDecimal getTotalInventoryValue();

    @Query("SELECT p FROM Product p WHERE p.stock > 0 AND p.stock <= (p.minStock * 0.3) AND p.active = true")
    List<Product> findCriticalStockProducts();

    @Query("SELECT p FROM Product p WHERE p.stock > p.minStock AND p.stock <= (p.minStock * 2) AND p.active = true")
    List<Product> findNormalStockProducts();

    @Query("SELECT p FROM Product p WHERE p.stock > (p.minStock * 2) AND p.active = true")
    List<Product> findExcellentStockProducts();

    @Query("SELECT p FROM Product p WHERE p.stock <= p.minStock AND p.active = true")
    List<Product> findByStockLessThanEqualMinStock();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.stock BETWEEN :min AND :max")
    Long countProductsByStockRange(@Param("min") Integer min, @Param("max") Integer max);
}