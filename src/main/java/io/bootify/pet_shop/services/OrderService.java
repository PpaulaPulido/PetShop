package io.bootify.pet_shop.services;

import io.bootify.pet_shop.dto.OrderStatsDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    public OrderStatsDTO getOrderStats(Long userId) {
        OrderStatsDTO stats = new OrderStatsDTO();
        stats.setTotalOrders(0);
        stats.setPendingOrders(0);
        stats.setDeliveredOrders(0);
        return stats;
    }
}