// En SaleItemRepository.java
package io.bootify.pet_shop.repositories;

import io.bootify.pet_shop.models.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {
    
    @Query("SELECT p.id, p.name, SUM(si.quantity) as totalSold " +
           "FROM SaleItem si " +
           "JOIN si.product p " +
           "GROUP BY p.id, p.name " +
           "ORDER BY totalSold DESC")
    List<Object[]> findTopSellingProducts();
    
    @Query("SELECT si FROM SaleItem si JOIN FETCH si.product WHERE si.sale.id = :saleId")
    List<SaleItem> findItemsWithProductBySaleId(Long saleId);
}