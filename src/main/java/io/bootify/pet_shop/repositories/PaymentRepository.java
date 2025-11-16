package io.bootify.pet_shop.repositories;

import io.bootify.pet_shop.models.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findBySaleId(Long saleId);

    @Query("SELECT p FROM Payment p WHERE p.mercadopagoPaymentId = :mercadopagoPaymentId")
    Optional<Payment> findByMercadopagoPaymentId(@Param("mercadopagoPaymentId") String mercadopagoPaymentId);

    @Query("SELECT p FROM Payment p WHERE p.externalReference = :externalReference")
    Optional<Payment> findByExternalReference(@Param("externalReference") String externalReference);
}