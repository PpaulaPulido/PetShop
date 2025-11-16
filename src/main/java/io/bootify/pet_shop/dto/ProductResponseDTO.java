package io.bootify.pet_shop.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductResponseDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private Integer minStock;
    private String imageUrl;
    private Boolean hasUploadedImage;
    private Boolean active;
    private String type;
    private String categoryName;
    private Long categoryId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}