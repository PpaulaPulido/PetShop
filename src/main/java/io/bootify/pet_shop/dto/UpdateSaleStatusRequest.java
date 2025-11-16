package io.bootify.pet_shop.dto;

import io.bootify.pet_shop.models.SaleStatus;
import lombok.Data;

@Data
public class UpdateSaleStatusRequest {
    private SaleStatus status;
    private String notes;
}
