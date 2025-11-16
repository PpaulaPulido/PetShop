package io.bootify.pet_shop.dto;

import lombok.Data;

@Data
public class CreateOrderRequest {
    private Long addressId;
    private String paymentMethod;
    private String deliveryMethod;
    private String deliveryInstructions;
}