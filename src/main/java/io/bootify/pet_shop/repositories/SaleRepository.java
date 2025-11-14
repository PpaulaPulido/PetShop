package io.bootify.pet_shop.repositories;

import io.bootify.pet_shop.models.Sale;
import io.bootify.pet_shop.models.SaleStatus;
import io.bootify.pet_shop.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findByUser(User user);

    List<Sale> findByStatus(SaleStatus status);

    Optional<Sale> findByInvoiceNumber(String invoiceNumber);

    @Query("SELECT s FROM Sale s WHERE s.createdAt BETWEEN :startDate AND :endDate")
    List<Sale> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.status = :status")
    Long countByStatus(@Param("status") SaleStatus status);
}