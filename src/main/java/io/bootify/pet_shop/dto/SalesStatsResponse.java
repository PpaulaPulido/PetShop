package io.bootify.pet_shop.dto;

import lombok.Data;

import java.math.BigDecimal;

public @Data
class SalesStatsResponse {
    private Long totalSales;
    private Long pendingSales;
    private Long paidSales;
    private Long deliveredSales;
    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private Long lowStockProducts;
}