package io.bootify.pet_shop.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CustomerOrderResponseDTO {
    private Long id;
    private String invoiceNumber;
    private BigDecimal totalAmount;
    private String status;
    private String paymentMethod;
    private String deliveryMethod;
    private AddressResponseDTO shippingAddress;
    private List<OrderItemResponseDTO> items;
    private PaymentResponseDTO paymentInfo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}