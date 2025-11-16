package io.bootify.pet_shop.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentInfoDTO {
    private Long id;
    private String paymentMethod;
    private String status;
    private BigDecimal amount;
    private String mercadopagoPaymentId;
    private String paymentUrl;
    private String cardLastFour;
    private Integer installments;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}