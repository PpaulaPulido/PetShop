package io.bootify.pet_shop.services;

import io.bootify.pet_shop.repositories.ProductRepository;
import io.bootify.pet_shop.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Estadísticas de productos
        stats.put("totalProducts", productRepository.count());
        stats.put("activeProducts", productRepository.countActiveProducts());
        stats.put("lowStockProducts", productRepository.countLowStockProducts());
        stats.put("outOfStockProducts", productRepository.findOutOfStockProducts().size());
        
        // Estadísticas de usuarios
        stats.put("totalCustomers", userRepository.countByRole(io.bootify.pet_shop.models.Role.CUSTOMER));
        stats.put("totalManagers", userRepository.countByRole(io.bootify.pet_shop.models.Role.MANAGER));
        
        return stats;
    }
}