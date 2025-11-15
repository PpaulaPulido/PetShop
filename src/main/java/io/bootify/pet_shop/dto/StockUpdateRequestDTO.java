package io.bootify.pet_shop.dto;

import lombok.Data;
@Data
public class StockUpdateRequestDTO {
    private Integer quantity;
    private String operation; // ADD, SUBTRACT, SET
    private String reason;
}