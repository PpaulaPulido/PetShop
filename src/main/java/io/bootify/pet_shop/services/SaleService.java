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
import org.springframework.data.domain.PageImpl;
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

    @Transactional(readOnly = true)
    public List<SaleResponseDTO> getAllSales() {
        User currentUser = getCurrentUser();
        log.info("🛒 SUPER_ADMIN {} consultando todas las ventas", currentUser.getEmail());

        return saleRepository.findAllOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<SaleResponseDTO> getAllSales(Pageable pageable) {
        User currentUser = getCurrentUser();
        log.info("🛒 SUPER_ADMIN {} consultando ventas paginadas", currentUser.getEmail());

        return saleRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public SaleResponseDTO getSaleById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));
        return convertToDTO(sale);
    }

    @Transactional(readOnly = true)
    public SaleResponseDTO getSaleByInvoiceNumber(String invoiceNumber) {
        Sale sale = saleRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));
        return convertToDTO(sale);
    }

    @Transactional(readOnly = true)
    public List<SaleResponseDTO> getSalesByStatus(SaleStatus status) {
        return saleRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SaleResponseDTO> getSalesByUser(Long userId) {
        return saleRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SaleResponseDTO> getSalesByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        return saleRepository.findByDateRange(start, end).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<SaleResponseDTO> getSalesWithFilters(String search, SaleStatus status,
            LocalDate startDate, LocalDate endDate,
            Pageable pageable) {
        User currentUser = getCurrentUser();
        log.info("🛒 SUPER_ADMIN {} consultando ventas con filtros", currentUser.getEmail());

        // Si hay búsqueda por texto, buscar por número de factura o email de usuario
        if (search != null && !search.trim().isEmpty()) {
            return saleRepository.findByInvoiceNumberContainingIgnoreCaseOrUserEmailContainingIgnoreCase(
                    search.trim(), pageable).map(this::convertToDTO);
        }

        // Si hay filtro por estado
        if (status != null) {
            return saleRepository.findByStatus(status, pageable).map(this::convertToDTO);
        }

        // Si hay filtro por fecha
        if (startDate != null && endDate != null) {
            LocalDateTime start = startDate.atStartOfDay();
            LocalDateTime end = endDate.atTime(LocalTime.MAX);
            List<Sale> sales = saleRepository.findByDateRange(start, end);
            // Convertir List a Page manualmente
            return new PageImpl<>(sales, pageable, sales.size()).map(this::convertToDTO);
        }

        // Sin filtros, devolver todo paginado
        return saleRepository.findAll(pageable).map(this::convertToDTO);
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

    @Transactional(readOnly = true)
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
                LocalDateTime.now());
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);

        BigDecimal todayRevenue = saleRepository.getTotalRevenueByDateRange(todayStart, todayEnd);
        stats.setTodayRevenue(todayRevenue != null ? todayRevenue : BigDecimal.ZERO);

        // Productos con stock bajo
        stats.setLowStockProducts(productRepository.countLowStockProducts());

        return stats;
    }

    @Transactional(readOnly = true)
    public List<Object[]> getTopSellingProducts() {
        return saleItemRepository.findTopSellingProducts();
    }

    // ========== MÉTODOS PRIVADOS ==========

    private void validateStatusTransition(SaleStatus currentStatus, SaleStatus newStatus) {
        // Lógica de validación de transiciones de estado
        if (currentStatus == SaleStatus.CANCELLED) {
            throw new RuntimeException("No se puede modificar una venta cancelada");
        }

        if (currentStatus == SaleStatus.DELIVERED) {
            throw new RuntimeException("No se puede modificar una venta ya entregada");
        }

        // No se puede cancelar una venta ya entregada
        if (newStatus == SaleStatus.CANCELLED && currentStatus == SaleStatus.DELIVERED) {
            throw new RuntimeException("No se puede cancelar una venta ya entregada");
        }

        switch (currentStatus) {
            case PENDING:
                // Desde PENDING se puede ir a CONFIRMED o CANCELLED libremente
                // Pero no directamente a PAID, SHIPPED o DELIVERED
                if (newStatus != SaleStatus.CONFIRMED && newStatus != SaleStatus.CANCELLED) {
                    throw new RuntimeException("Desde PENDIENTE solo se puede cambiar a CONFIRMADO o CANCELADO");
                }
                break;

            case CONFIRMED:
                // Desde CONFIRMED se puede ir a PENDING, PAID o CANCELLED
                if (newStatus != SaleStatus.PENDING && newStatus != SaleStatus.PAID
                        && newStatus != SaleStatus.CANCELLED) {
                    throw new RuntimeException(
                            "Desde CONFIRMADO solo se puede cambiar a PENDIENTE, PAGADO o CANCELADO");
                }
                break;

            case PAID:
                // Desde PAID solo se puede avanzar a SHIPPED o CANCELLED 
                if (newStatus != SaleStatus.SHIPPED && newStatus != SaleStatus.CANCELLED) {
                    throw new RuntimeException("Desde PAGADO solo se puede avanzar a ENVIADO o CANCELADO");
                }
                break;

            case SHIPPED:
                // Desde SHIPPED solo se puede avanzar a DELIVERED o CANCELLED 
                if (newStatus != SaleStatus.DELIVERED && newStatus != SaleStatus.CANCELLED) {
                    throw new RuntimeException("Desde ENVIADO solo se puede avanzar a ENTREGADO o CANCELADO");
                }
                break;

            default:
                break;
        }

    }

    private boolean isStatusDowngrade(SaleStatus current, SaleStatus newStatus) {
        // Definir el orden de los estados
        SaleStatus[] statusOrder = {
                SaleStatus.PENDING,
                SaleStatus.CONFIRMED,
                SaleStatus.PAID,
                SaleStatus.SHIPPED,
                SaleStatus.DELIVERED
        };

        int currentIndex = -1;
        int newIndex = -1;

        for (int i = 0; i < statusOrder.length; i++) {
            if (statusOrder[i] == current)
                currentIndex = i;
            if (statusOrder[i] == newStatus)
                newIndex = i;
        }

        return currentIndex != -1 && newIndex != -1 && newIndex < currentIndex;
    }

    private void processDelivery(Sale sale) {
        // Marcar productos como entregados (stock ya fue descontado al crear la venta)
        log.info("📦 Procesando entrega para venta {}", sale.getInvoiceNumber());
        // Aquí podrías agregar lógica adicional como enviar notificaciones, etc.
    }

    private void releaseStock(Sale sale) {
        // Liberar stock reservado al cancelar una venta
        for (SaleItem item : sale.getItems()) {
            Product product = item.getProduct();
            int newStock = product.getStock() + item.getQuantity();
            product.setStock(newStock);
            productRepository.save(product);
            log.info("🔄 Stock liberado: producto {} +{} unidades",
                    product.getName(), item.getQuantity());
        }
        log.info("🔄 Stock liberado para venta cancelada {}", sale.getInvoiceNumber());
    }

    @Transactional(readOnly = true)
    private SaleResponseDTO convertToDTO(Sale sale) {
        SaleResponseDTO dto = new SaleResponseDTO();
        dto.setId(sale.getId());
        dto.setInvoiceNumber(sale.getInvoiceNumber());

        // Acceder al usuario dentro de la transacción
        User user = sale.getUser();
        dto.setUserId(user.getId());
        dto.setUserEmail(user.getEmail());
        dto.setUserFullName(user.getFullName());

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

    @Transactional(readOnly = true)
    private SaleItemResponseDTO convertItemToDTO(SaleItem item) {
        SaleItemResponseDTO dto = new SaleItemResponseDTO();
        dto.setId(item.getId());

        // Acceder al producto dentro de la transacción
        Product product = item.getProduct();
        dto.setProductId(product.getId());
        dto.setProductName(product.getName());
        dto.setProductImage(product.getDisplayImage());

        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setSubtotal(item.getSubtotal());
        return dto;
    }

    @Transactional(readOnly = true)
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