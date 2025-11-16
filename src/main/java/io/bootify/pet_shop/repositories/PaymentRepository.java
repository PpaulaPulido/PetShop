package io.bootify.pet_shop.repositories;

import io.bootify.pet_shop.models.Payment;
import io.bootify.pet_shop.models.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    Optional<Payment> findBySaleId(Long saleId);
    
    List<Payment> findByStatus(PaymentStatus status);
    
    Optional<Payment> findByMercadopagoPaymentId(String mercadopagoPaymentId);
    
    Optional<Payment> findByMercadopagoPreferenceId(String mercadopagoPreferenceId);
}