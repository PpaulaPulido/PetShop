package io.bootify.pet_shop.services;

import io.bootify.pet_shop.dto.*;
import io.bootify.pet_shop.models.*;
import io.bootify.pet_shop.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerOrderService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final PaymentRepository paymentRepository;
    private final SecurityService securityService;

    public List<CustomerOrderResponseDTO> getCustomerOrders() {
        User customer = getCurrentCustomer();
        log.info("📋 Obteniendo órdenes para el cliente: {}", customer.getEmail());

        try {
            // ✅ USAR el método seguro sin JOIN FETCH múltiples
            List<Sale> sales = saleRepository.findByUserIdOrderByCreatedAtDesc(customer.getId());

            if (sales == null || sales.isEmpty()) {
                log.info("ℹ️ No se encontraron órdenes para el cliente {}", customer.getEmail());
                return List.of();
            }

            log.info("✅ Encontradas {} órdenes para el cliente {}", sales.size(), customer.getEmail());

            // ✅ Cargar las relaciones de forma MANUAL para evitar LazyLoadingException
            return sales.stream()
                    .map(sale -> {
                        // Forzar la carga de las relaciones necesarias
                        try {
                            // Inicializar las colecciones lazy
                            if (sale.getItems() != null) {
                                sale.getItems().size(); // Force initialization
                                for (SaleItem item : sale.getItems()) {
                                    if (item.getProduct() != null) {
                                        item.getProduct().getName(); // Force product loading
                                    }
                                }
                            }
                            return convertToCustomerOrderDTO(sale);
                        } catch (Exception e) {
                            log.error("❌ Error procesando orden {}: {}", sale.getId(), e.getMessage());
                            // Retornar un DTO básico sin relaciones
                            return createBasicOrderDTO(sale);
                        }
                    })
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("❌ Error crítico obteniendo órdenes para el cliente {}: {}", customer.getEmail(), e.getMessage(),
                    e);
            throw new RuntimeException("Error al obtener las órdenes: " + e.getMessage());
        }
    }

    // Método auxiliar para crear DTO básico en caso de error
    private CustomerOrderResponseDTO createBasicOrderDTO(Sale sale) {
        CustomerOrderResponseDTO dto = new CustomerOrderResponseDTO();
        dto.setId(sale.getId());
        dto.setInvoiceNumber(sale.getInvoiceNumber() != null ? sale.getInvoiceNumber() : "N/A");
        dto.setTotalAmount(sale.getTotalAmount() != null ? sale.getTotalAmount() : BigDecimal.ZERO);
        dto.setStatus(sale.getStatus() != null ? sale.getStatus().name() : "UNKNOWN");
        dto.setPaymentMethod(sale.getPaymentMethod() != null ? sale.getPaymentMethod().name() : "UNKNOWN");
        dto.setDeliveryMethod(sale.getDeliveryMethod() != null ? sale.getDeliveryMethod().name() : "UNKNOWN");
        dto.setCreatedAt(sale.getCreatedAt());
        dto.setUpdatedAt(sale.getUpdatedAt());
        dto.setItems(List.of());
        dto.setShippingAddress(null);
        dto.setPaymentInfo(null);
        return dto;
    }

    public Page<CustomerOrderResponseDTO> getCustomerOrders(Pageable pageable) {
        User customer = getCurrentCustomer();
        return saleRepository.findByUserId(customer.getId(), pageable)
                .map(this::convertToCustomerOrderDTO);
    }

    public CustomerOrderResponseDTO getOrderById(Long orderId) {
        User customer = getCurrentCustomer();
        log.info("🔍 Buscando orden {} para el cliente {}", orderId, customer.getEmail());

        Sale sale = saleRepository.findByIdAndUserIdWithDetails(orderId, customer.getId())
                .orElseThrow(() -> {
                    log.error("❌ Orden {} no encontrada para el cliente {}", orderId, customer.getEmail());
                    return new RuntimeException("Pedido no encontrado");
                });

        log.info("✅ Orden {} encontrada para el cliente {}", orderId, customer.getEmail());
        return convertToCustomerOrderDTO(sale);
    }

    public CustomerOrderResponseDTO getOrderByInvoiceNumber(String invoiceNumber) {
        User customer = getCurrentCustomer();

        Sale sale = saleRepository.findByInvoiceNumberAndUserId(invoiceNumber, customer.getId())
                .orElseThrow(() -> {
                    log.error("Pedido no encontrado. Invoice: {}, UserId: {}", invoiceNumber, customer.getId());
                    return new RuntimeException("Pedido no encontrado");
                });

        return convertToCustomerOrderDTO(sale);
    }

    // NUEVO: Método para obtener estadísticas de órdenes
    public OrderStatsDTO getCustomerOrderStats() {
        User customer = getCurrentCustomer();
        log.info("📊 Obteniendo estadísticas de órdenes para el cliente: {}", customer.getEmail());

        OrderStatsDTO stats = new OrderStatsDTO();

        try {
            // Obtener todas las órdenes del cliente
            List<Sale> customerOrders = saleRepository.findByUserId(customer.getId());

            // Calcular estadísticas
            stats.setTotalOrders(customerOrders.size());
            stats.setPendingOrders((int) customerOrders.stream()
                    .filter(order -> order.getStatus() == SaleStatus.PENDING
                            || order.getStatus() == SaleStatus.CONFIRMED)
                    .count());
            stats.setDeliveredOrders((int) customerOrders.stream()
                    .filter(order -> order.getStatus() == SaleStatus.DELIVERED)
                    .count());
            stats.setCancelledOrders((int) customerOrders.stream()
                    .filter(order -> order.getStatus() == SaleStatus.CANCELLED)
                    .count());

            log.info("✅ Estadísticas calculadas - Total: {}, Pendientes: {}, Entregados: {}, Cancelados: {}",
                    stats.getTotalOrders(), stats.getPendingOrders(), stats.getDeliveredOrders(),
                    stats.getCancelledOrders());

        } catch (Exception e) {
            log.error("❌ Error calculando estadísticas para el cliente {}: {}", customer.getEmail(), e.getMessage());
            // En caso de error, devolver estadísticas en cero
            stats.setTotalOrders(0);
            stats.setPendingOrders(0);
            stats.setDeliveredOrders(0);
            stats.setCancelledOrders(0);
        }

        return stats;
    }

    @Transactional
    public CustomerOrderResponseDTO createOrderFromCart(CreateOrderRequest request) {
        User customer = getCurrentCustomer();
        Cart cart = getCartWithItems(customer);

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        // Validar dirección de envío
        Address shippingAddress = addressRepository.findByIdAndUserId(request.getAddressId(), customer.getId())
                .orElseThrow(() -> new RuntimeException("Dirección de envío no válida"));

        // Validar stock y precios
        validateCartItems(cart);

        // Crear la venta
        Sale sale = createSale(customer, shippingAddress, request, cart);
        Sale savedSale = saleRepository.save(sale);

        // Crear items de la venta y actualizar stock
        createSaleItems(savedSale, cart);

        // Procesar pago (simplificado)
        processPayment(savedSale);

        // Vaciar carrito
        clearCart(cart);

        log.info("✅ Customer {} creó pedido {}", customer.getEmail(), savedSale.getInvoiceNumber());

        return convertToCustomerOrderDTO(savedSale);
    }

    @Transactional
    public void cancelOrder(Long orderId) {
        User customer = getCurrentCustomer();
        Sale sale = saleRepository.findByIdAndUserId(orderId, customer.getId())
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if (sale.getStatus() == SaleStatus.DELIVERED || sale.getStatus() == SaleStatus.SHIPPED) {
            throw new RuntimeException("No se puede cancelar un pedido ya enviado o entregado");
        }

        if (sale.getStatus() == SaleStatus.CANCELLED) {
            throw new RuntimeException("El pedido ya está cancelado");
        }

        sale.setStatus(SaleStatus.CANCELLED);
        releaseStock(sale);
        saleRepository.save(sale);

        log.info("❌ Customer {} canceló pedido {}", customer.getEmail(), sale.getInvoiceNumber());
    }

    // Métodos privados de ayuda
    private User getCurrentCustomer() {
        User user = securityService.getCurrentUser();
        if (user.getRole() != Role.CUSTOMER) {
            throw new RuntimeException("Acceso denegado: Solo los clientes pueden acceder a esta funcionalidad");
        }
        return user;
    }

    private Cart getCartWithItems(User customer) {
        return cartRepository.findByUserIdWithItems(customer.getId())
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));
    }

    private void validateCartItems(Cart cart) {
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            if (!product.getActive()) {
                throw new RuntimeException("El producto " + product.getName() + " ya no está disponible");
            }
            if (product.getStock() < item.getQuantity()) {
                throw new RuntimeException("Stock insuficiente para " + product.getName() +
                        ". Disponible: " + product.getStock() + ", Solicitado: " + item.getQuantity());
            }
        }
    }

    private Sale createSale(User customer, Address shippingAddress, CreateOrderRequest request, Cart cart) {
        Sale sale = new Sale();
        sale.setUser(customer);
        sale.setShippingAddress(shippingAddress); // AHORA FUNCIONA
        sale.setStatus(SaleStatus.PENDING);
        sale.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()));
        sale.setDeliveryMethod(DeliveryMethod.valueOf(request.getDeliveryMethod()));
        sale.setDeliveryInstructions(request.getDeliveryInstructions()); // AHORA FUNCIONA
        sale.setTotalAmount(calculateCartTotal(cart));

        // Generar número de factura único
        String invoiceNumber = "INV-" + System.currentTimeMillis() + "-" + customer.getId();
        sale.setInvoiceNumber(invoiceNumber);

        return sale;
    }

    private void createSaleItems(Sale sale, Cart cart) {
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            // Crear item de venta
            SaleItem saleItem = new SaleItem(sale, product, cartItem.getQuantity(), product.getPrice());
            sale.addItem(saleItem);
            saleItemRepository.save(saleItem);

            // Actualizar stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }
    }

    private void processPayment(Sale sale) {
        Payment payment = new Payment();
        payment.setSale(sale);
        payment.setPaymentMethod(sale.getPaymentMethod());
        payment.setAmount(sale.getTotalAmount());
        payment.setStatus(PaymentStatus.PENDING);

        // Para MercadoPago, generar preferencia
        if (sale.getPaymentMethod() == PaymentMethod.MERCADO_PAGO) {
            // Integración con MercadoPago (placeholder)
            payment.setPaymentUrl("https://mercadopago.com/checkout/" + sale.getInvoiceNumber());
        }

        paymentRepository.save(payment);
    }

    private void clearCart(Cart cart) {
        cartItemRepository.deleteByCartId(cart.getId());
        cartRepository.save(cart);
    }

    private void releaseStock(Sale sale) {
        for (SaleItem item : sale.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }
    }

    private BigDecimal calculateCartTotal(Cart cart) {
        return cart.getItems().stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private CustomerOrderResponseDTO convertToCustomerOrderDTO(Sale sale) {
        try {
            log.debug("🔄 Convirtiendo orden {} a DTO", sale.getId());

            CustomerOrderResponseDTO dto = new CustomerOrderResponseDTO();
            dto.setId(sale.getId());
            dto.setInvoiceNumber(sale.getInvoiceNumber() != null ? sale.getInvoiceNumber() : "N/A");
            dto.setTotalAmount(sale.getTotalAmount() != null ? sale.getTotalAmount() : BigDecimal.ZERO);
            dto.setStatus(sale.getStatus() != null ? sale.getStatus().name() : "UNKNOWN");
            dto.setPaymentMethod(sale.getPaymentMethod() != null ? sale.getPaymentMethod().name() : "UNKNOWN");
            dto.setDeliveryMethod(sale.getDeliveryMethod() != null ? sale.getDeliveryMethod().name() : "UNKNOWN");
            dto.setCreatedAt(sale.getCreatedAt());
            dto.setUpdatedAt(sale.getUpdatedAt());

            // ✅ Manejar items con try-catch para LazyLoading
            try {
                if (sale.getItems() != null && Hibernate.isInitialized(sale.getItems())) {
                    List<OrderItemResponseDTO> itemDTOs = sale.getItems().stream()
                            .map(this::convertSaleItemToDTO)
                            .collect(Collectors.toList());
                    dto.setItems(itemDTOs);
                    log.debug("🛍️ {} items convertidos para orden {}", itemDTOs.size(), sale.getId());
                } else {
                    log.warn("⚠️ Items no inicializados para orden {}", sale.getId());
                    dto.setItems(List.of());
                }
            } catch (Exception e) {
                log.warn("⚠️ Error accediendo a items de orden {}: {}", sale.getId(), e.getMessage());
                dto.setItems(List.of());
            }

            // ✅ Manejar dirección de envío
            try {
                if (sale.getShippingAddress() != null && Hibernate.isInitialized(sale.getShippingAddress())) {
                    dto.setShippingAddress(convertAddressToDTO(sale.getShippingAddress()));
                    log.debug("📍 Dirección de envío convertida para orden {}", sale.getId());
                } else {
                    log.warn("⚠️ Dirección no inicializada para orden {}", sale.getId());
                    dto.setShippingAddress(null);
                }
            } catch (Exception e) {
                log.warn("⚠️ Error accediendo a dirección de orden {}: {}", sale.getId(), e.getMessage());
                dto.setShippingAddress(null);
            }

            // ✅ Manejar pago
            try {
                if (sale.getPayment() != null && Hibernate.isInitialized(sale.getPayment())) {
                    dto.setPaymentInfo(convertPaymentToDTO(sale.getPayment()));
                    log.debug("💳 Información de pago convertida para orden {}", sale.getId());
                } else {
                    log.warn("⚠️ Pago no inicializado para orden {}", sale.getId());
                    dto.setPaymentInfo(null);
                }
            } catch (Exception e) {
                log.warn("⚠️ Error accediendo a pago de orden {}: {}", sale.getId(), e.getMessage());
                dto.setPaymentInfo(null);
            }

            log.debug("✅ Conversión exitosa de la orden {}", sale.getId());
            return dto;

        } catch (Exception e) {
            log.error("❌ Error crítico convirtiendo orden {} a DTO: {}", sale != null ? sale.getId() : "null",
                    e.getMessage(), e);
            // En lugar de lanzar excepción, retornar DTO básico
            return createBasicOrderDTO(sale);
        }
    }

    private AddressResponseDTO convertAddressToDTO(Address address) {
        AddressResponseDTO dto = new AddressResponseDTO();
        dto.setId(address.getId());
        dto.setAddressLine1(address.getAddressLine1());
        dto.setAddressLine2(address.getAddressLine2());
        dto.setLandmark(address.getLandmark());
        dto.setCity(address.getCity());
        dto.setDepartment(address.getDepartment());
        dto.setCountry(address.getCountry());
        dto.setZipCode(address.getZipCode());
        dto.setAddressType(address.getAddressType().name());
        dto.setIsPrimary(address.getIsPrimary());
        dto.setContactName(address.getContactName());
        dto.setContactPhone(address.getContactPhone());
        dto.setDeliveryInstructions(address.getDeliveryInstructions());
        dto.setFullAddress(address.getFullAddress());
        return dto;
    }

    private OrderItemResponseDTO convertSaleItemToDTO(SaleItem item) {
        OrderItemResponseDTO dto = new OrderItemResponseDTO();
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
        dto.setMercadopagoPreferenceId(payment.getMercadopagoPreferenceId());
        dto.setPaymentUrl(payment.getPaymentUrl());
        dto.setExternalReference(payment.getExternalReference());
        dto.setCardLastFour(payment.getCardLastFour());
        dto.setInstallments(payment.getInstallments());
        dto.setCreatedAt(payment.getCreatedAt());
        dto.setUpdatedAt(payment.getUpdatedAt());
        dto.setPaidAt(payment.getPaidAt());
        return dto;
    }
}