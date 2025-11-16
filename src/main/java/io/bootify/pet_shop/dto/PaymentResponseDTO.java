package io.bootify.pet_shop.dto;

import io.bootify.pet_shop.models.PaymentMethod;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentResponseDTO {
    private Long id;
    private PaymentMethod paymentMethod;
    private String status;
    private BigDecimal amount;
    private String mercadopagoPaymentId;
    private String mercadopagoPreferenceId;
    private String paymentUrl;
    private String externalReference; 
    private String cardLastFour;
    private Integer installments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime paidAt;
}