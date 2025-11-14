package io.bootify.pet_shop.repositories;

import io.bootify.pet_shop.models.Product;
import io.bootify.pet_shop.models.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
// import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByActiveTrue();

    List<Product> findByType(ProductType type);

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByStockLessThan(Integer stock);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.stock > 0")
    List<Product> findAvailableProducts();

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')) AND p.active = true")
    List<Product> findByNameContainingIgnoreCase(@Param("name") String name);
}