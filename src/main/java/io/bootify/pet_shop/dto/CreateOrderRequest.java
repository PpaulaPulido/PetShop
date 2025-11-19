package io.bootify.pet_shop.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateOrderRequest {
    private Long addressId;
    private String paymentMethod;
    private String deliveryMethod;
    private String deliveryInstructions;
    private BigDecimal subtotal;
    private BigDecimal shippingCost;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
}