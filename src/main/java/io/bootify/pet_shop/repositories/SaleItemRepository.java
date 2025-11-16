package io.bootify.pet_shop.repositories;

import io.bootify.pet_shop.models.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

    List<SaleItem> findBySaleId(Long saleId);

    List<SaleItem> findByProductId(Long productId);

    @Query("SELECT si.product.id, si.product.name, SUM(si.quantity) FROM SaleItem si " +
           "WHERE si.sale.status = 'PAID' " +
           "GROUP BY si.product.id, si.product.name " +
           "ORDER BY SUM(si.quantity) DESC " +
           "LIMIT 10")
    List<Object[]> findTopSellingProducts();

    @Query("SELECT si FROM SaleItem si WHERE si.sale.id = :saleId")
    List<SaleItem> findItemsWithProductBySaleId(@Param("saleId") Long saleId);
}