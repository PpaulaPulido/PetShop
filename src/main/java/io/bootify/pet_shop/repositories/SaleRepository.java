package io.bootify.pet_shop.repositories;

import io.bootify.pet_shop.models.Sale;
import io.bootify.pet_shop.models.SaleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

        Optional<Sale> findByInvoiceNumber(String invoiceNumber);

        List<Sale> findByStatus(SaleStatus status);

        List<Sale> findByUserId(Long userId);

        Page<Sale> findByStatus(SaleStatus status, Pageable pageable);

        @Query("SELECT s FROM Sale s WHERE s.createdAt BETWEEN :startDate AND :endDate")
        List<Sale> findByDateRange(@Param("startDate") LocalDateTime startDate,
                        @Param("startDate") LocalDateTime endDate);

        @Query("SELECT s FROM Sale s WHERE s.createdAt BETWEEN :startDate AND :endDate AND s.status = :status")
        List<Sale> findByDateRangeAndStatus(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("status") SaleStatus status);

        @Query("SELECT COUNT(s) FROM Sale s WHERE s.status = :status")
        Long countByStatus(@Param("status") SaleStatus status);

        @Query("SELECT SUM(s.totalAmount) FROM Sale s WHERE s.status = 'PAID' AND s.createdAt BETWEEN :startDate AND :endDate")
        BigDecimal getTotalRevenueByDateRange(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query("SELECT s FROM Sale s ORDER BY s.createdAt DESC")
        List<Sale> findAllOrderByCreatedAtDesc();

        @Query("SELECT COALESCE(c.name, 'Sin Categoría'), SUM(si.quantity * si.unitPrice) " +
                        "FROM Sale s JOIN s.items si JOIN si.product p LEFT JOIN p.category c " +
                        "WHERE s.createdAt BETWEEN :start AND :end AND s.status = 'PAID' " +
                        "GROUP BY c.name")
        Map<String, BigDecimal> getSalesByCategory(@Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query("SELECT COALESCE(c.name, 'Sin Categoría'), COUNT(DISTINCT s) " +
                        "FROM Sale s JOIN s.items si JOIN si.product p LEFT JOIN p.category c " +
                        "WHERE s.createdAt BETWEEN :start AND :end AND s.status = 'PAID' " +
                        "GROUP BY c.name")
        Map<String, Long> getSalesCountByCategory(@Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);
}