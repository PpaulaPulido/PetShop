package io.bootify.pet_shop.services;

import io.bootify.pet_shop.dto.*;
import io.bootify.pet_shop.models.*;
import io.bootify.pet_shop.repositories.SaleRepository;
import io.bootify.pet_shop.repositories.SaleItemRepository;
import io.bootify.pet_shop.repositories.PaymentRepository;
import io.bootify.pet_shop.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final PaymentRepository paymentRepository;
    private final ProductRepository productRepository;
    private final SecurityService securityService;

    private User getCurrentUser() {
        return securityService.getCurrentUser();
    }

    // ========== MÉTODOS DE CONSULTA ==========

    public List<SaleResponseDTO> getAllSales() {
        User currentUser = getCurrentUser();
        log.info("🛒 SUPER_ADMIN {} consultando todas las ventas", currentUser.getEmail());
        
        return saleRepository.findAllOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Page<SaleResponseDTO> getAllSales(Pageable pageable) {
        User currentUser = getCurrentUser();
        log.info("🛒 SUPER_ADMIN {} consultando ventas paginadas", currentUser.getEmail());
        
        return saleRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    public SaleResponseDTO getSaleById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));
        return convertToDTO(sale);
    }

    public SaleResponseDTO getSaleByInvoiceNumber(String invoiceNumber) {
        Sale sale = saleRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));
        return convertToDTO(sale);
    }

    public List<SaleResponseDTO> getSalesByStatus(SaleStatus status) {
        return saleRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SaleResponseDTO> getSalesByUser(Long userId) {
        return saleRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SaleResponseDTO> getSalesByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        
        return saleRepository.findByDateRange(start, end).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ========== MÉTODOS DE GESTIÓN ==========

    @Transactional
    public SaleResponseDTO updateSaleStatus(Long id, UpdateSaleStatusRequest request) {
        User currentUser = getCurrentUser();
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));

        log.info("✏️ SUPER_ADMIN {} actualizando estado de venta {}: {} -> {}", 
                currentUser.getEmail(), sale.getInvoiceNumber(), sale.getStatus(), request.getStatus());

        // Validaciones de transición de estado
        validateStatusTransition(sale.getStatus(), request.getStatus());

        sale.setStatus(request.getStatus());

        // Si se marca como ENTREGADA, actualizar stock permanentemente
        if (request.getStatus() == SaleStatus.DELIVERED) {
            processDelivery(sale);
        }

        // Si se cancela, liberar stock reservado
        if (request.getStatus() == SaleStatus.CANCELLED) {
            releaseStock(sale);
        }

        Sale updatedSale = saleRepository.save(sale);
        return convertToDTO(updatedSale);
    }

    @Transactional
    public void cancelSale(Long id) {
        User currentUser = getCurrentUser();
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));

        log.info("❌ SUPER_ADMIN {} cancelando venta {}", currentUser.getEmail(), sale.getInvoiceNumber());

        if (sale.getStatus() == SaleStatus.DELIVERED) {
            throw new RuntimeException("No se puede cancelar una venta ya entregada");
        }

        sale.setStatus(SaleStatus.CANCELLED);
        releaseStock(sale);
        saleRepository.save(sale);
    }

    // ========== MÉTODOS DE ESTADÍSTICAS ==========

    public SalesStatsResponse getSalesStats() {
        User currentUser = getCurrentUser();
        log.info("📊 SUPER_ADMIN {} consultando estadísticas de ventas", currentUser.getEmail());

        SalesStatsResponse stats = new SalesStatsResponse();
        
        // Totales por estado
        stats.setTotalSales(saleRepository.count());
        stats.setPendingSales(saleRepository.countByStatus(SaleStatus.PENDING));
        stats.setPaidSales(saleRepository.countByStatus(SaleStatus.PAID));
        stats.setDeliveredSales(saleRepository.countByStatus(SaleStatus.DELIVERED));
        
        // Ingresos
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = LocalDate.now().atTime(LocalTime.MAX);
        
        BigDecimal totalRevenue = saleRepository.getTotalRevenueByDateRange(
            LocalDateTime.of(2020, 1, 1, 0, 0), // Desde el inicio
            LocalDateTime.now()
        );
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        
        BigDecimal todayRevenue = saleRepository.getTotalRevenueByDateRange(todayStart, todayEnd);
        stats.setTodayRevenue(todayRevenue != null ? todayRevenue : BigDecimal.ZERO);
        
        // Productos con stock bajo
        stats.setLowStockProducts(productRepository.countLowStockProducts());
        
        return stats;
    }

    public List<Object[]> getTopSellingProducts() {
        return saleItemRepository.findTopSellingProducts();
    }

    // ========== MÉTODOS PRIVADOS ==========

    private void validateStatusTransition(SaleStatus currentStatus, SaleStatus newStatus) {
        // Lógica de validación de transiciones de estado
        if (currentStatus == SaleStatus.CANCELLED && newStatus != SaleStatus.CANCELLED) {
            throw new RuntimeException("No se puede reactivar una venta cancelada");
        }
        
        if (currentStatus == SaleStatus.DELIVERED && newStatus != SaleStatus.DELIVERED) {
            throw new RuntimeException("No se puede modificar una venta ya entregada");
        }
    }

    private void processDelivery(Sale sale) {
        // Marcar productos como entregados (stock ya fue descontado al crear la venta)
        log.info("📦 Procesando entrega para venta {}", sale.getInvoiceNumber());
    }

    private void releaseStock(Sale sale) {
        // Liberar stock reservado al cancelar una venta
        for (SaleItem item : sale.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }
        log.info("🔄 Stock liberado para venta cancelada {}", sale.getInvoiceNumber());
    }

    private SaleResponseDTO convertToDTO(Sale sale) {
        SaleResponseDTO dto = new SaleResponseDTO();
        dto.setId(sale.getId());
        dto.setInvoiceNumber(sale.getInvoiceNumber());
        dto.setUserId(sale.getUser().getId());
        dto.setUserEmail(sale.getUser().getEmail());
        dto.setUserFullName(sale.getUser().getFullName());
        dto.setTotalAmount(sale.getTotalAmount());
        dto.setStatus(sale.getStatus());
        dto.setPaymentMethod(sale.getPaymentMethod());
        dto.setDeliveryMethod(sale.getDeliveryMethod());
        dto.setCreatedAt(sale.getCreatedAt());
        dto.setUpdatedAt(sale.getUpdatedAt());
        
        // Convertir items
        List<SaleItemResponseDTO> itemDTOs = saleItemRepository.findItemsWithProductBySaleId(sale.getId())
                .stream()
                .map(this::convertItemToDTO)
                .collect(Collectors.toList());
        dto.setItems(itemDTOs);
        
        // Convertir pago si existe
        paymentRepository.findBySaleId(sale.getId()).ifPresent(payment -> {
            dto.setPayment(convertPaymentToDTO(payment));
        });
        
        return dto;
    }

    private SaleItemResponseDTO convertItemToDTO(SaleItem item) {
        SaleItemResponseDTO dto = new SaleItemResponseDTO();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());
        dto.setProductImage(item.getProduct().getDisplayImage());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setSubtotal(item.getSubtotal());
        return dto;
    }

    private PaymentResponseDTO convertPaymentToDTO(Payment payment) {
        PaymentResponseDTO dto = new PaymentResponseDTO();
        dto.setId(payment.getId());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setStatus(payment.getStatus().name());
        dto.setAmount(payment.getAmount());
        dto.setMercadopagoPaymentId(payment.getMercadopagoPaymentId());
        dto.setPaymentUrl(payment.getPaymentUrl());
        dto.setCardLastFour(payment.getCardLastFour());
        dto.setInstallments(payment.getInstallments());
        dto.setCreatedAt(payment.getCreatedAt());
        dto.setPaidAt(payment.getPaidAt());
        return dto;
    }
}