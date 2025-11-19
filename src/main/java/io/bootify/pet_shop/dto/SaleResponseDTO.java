package io.bootify.pet_shop.dto;

import io.bootify.pet_shop.models.DeliveryMethod;
import io.bootify.pet_shop.models.PaymentMethod;
import io.bootify.pet_shop.models.SaleStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SaleResponseDTO {
    private Long id;
    private String invoiceNumber;
    private Long userId;
    private String userEmail;
    private String userFullName;
    private BigDecimal totalAmount;
    private SaleStatus status;
    private PaymentMethod paymentMethod;
    private DeliveryMethod deliveryMethod;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<SaleItemResponseDTO> items;
    private PaymentResponseDTO payment;
    private BigDecimal subtotalAmount;
    private BigDecimal shippingCost;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
}