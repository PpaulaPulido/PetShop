package io.bootify.pet_shop.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;

@Data
public class ProductRequestDTO {
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private Integer minStock;
    private String imageUrl; 
    private MultipartFile imageFile;
    private String type;
    private Long categoryId;
    private Boolean active; 
}