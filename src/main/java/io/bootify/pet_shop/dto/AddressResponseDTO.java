package io.bootify.pet_shop.dto;

import lombok.Data;

@Data
public class AddressResponseDTO {
    private Long id;
    private String addressLine1;
    private String addressLine2;
    private String landmark;
    private String city;
    private String department;
    private String country;
    private String zipCode;
    private String addressType;
    private Boolean isPrimary;
    private String contactName;
    private String contactPhone;
    private String deliveryInstructions;
    private String fullAddress;
}