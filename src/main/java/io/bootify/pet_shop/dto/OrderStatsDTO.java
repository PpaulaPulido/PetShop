package io.bootify.pet_shop.dto;

import lombok.Data;

@Data
public class OrderStatsDTO {
    private Integer totalOrders;
    private Integer pendingOrders;
    private Integer deliveredOrders;
    private Integer cancelledOrders;
    
    public OrderStatsDTO() {
        this.totalOrders = 0;
        this.pendingOrders = 0;
        this.deliveredOrders = 0;
        this.cancelledOrders = 0;
    }
    
    public OrderStatsDTO(Integer totalOrders, Integer pendingOrders, Integer deliveredOrders, Integer cancelledOrders) {
        this.totalOrders = totalOrders;
        this.pendingOrders = pendingOrders;
        this.deliveredOrders = deliveredOrders;
        this.cancelledOrders = cancelledOrders;
    }
}