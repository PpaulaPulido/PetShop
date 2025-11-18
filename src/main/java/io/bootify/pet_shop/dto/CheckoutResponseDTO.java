package io.bootify.pet_shop.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import io.bootify.pet_shop.models.PaymentMethod;

@Data
public class CheckoutResponseDTO {
    private CartResponseDTO cart;
    private List<AddressResponseDTO> addresses;
    private BigDecimal shippingCost;
    private BigDecimal taxAmount;
    private BigDecimal finalTotal;
    private List<PaymentMethod> availablePaymentMethods;
}