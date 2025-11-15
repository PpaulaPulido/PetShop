package io.bootify.pet_shop.repositories;

import io.bootify.pet_shop.models.Product;
import io.bootify.pet_shop.models.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByActiveTrue();

    List<Product> findByType(ProductType type);

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByNameContainingIgnoreCase(String name);

    @Query("SELECT p FROM Product p WHERE p.stock <= p.minStock AND p.active = true")
    List<Product> findByStockLessThanEqualAndActiveTrue();

    @Query("SELECT p FROM Product p WHERE p.stock = 0 AND p.active = true")
    List<Product> findOutOfStockProducts();

    List<Product> findByStockLessThanEqual(Integer stock);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.active = true")
    Long countActiveProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.stock <= p.minStock AND p.active = true")
    Long countLowStockProducts();
}