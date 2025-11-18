package io.bootify.pet_shop.dto;

import lombok.Data;

@Data
public class AddressValidationResponse {
    private boolean valid;
    private String message;
    private double confidence;
    private String verifiedAddress;
}