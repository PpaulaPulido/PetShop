package io.bootify.pet_shop.services;

import io.bootify.pet_shop.dto.*;
import io.bootify.pet_shop.models.*;
import io.bootify.pet_shop.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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
        return saleRepository.findByUserId(customer.getId())
                .stream()
                .map(this::convertToCustomerOrderDTO)
                .collect(Collectors.toList());
    }

    public Page<CustomerOrderResponseDTO> getCustomerOrders(Pageable pageable) {
        User customer = getCurrentCustomer();
        return saleRepository.findByUserId(customer.getId(), pageable)
                .map(this::convertToCustomerOrderDTO);
    }

    public CustomerOrderResponseDTO getOrderById(Long orderId) {
        User customer = getCurrentCustomer();
        Sale sale = saleRepository.findByIdAndUserId(orderId, customer.getId())
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        return convertToCustomerOrderDTO(sale);
    }

    public CustomerOrderResponseDTO getOrderByInvoiceNumber(String invoiceNumber) {
        User customer = getCurrentCustomer();
        Sale sale = saleRepository.findByInvoiceNumberAndUserId(invoiceNumber, customer.getId())
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        return convertToCustomerOrderDTO(sale);
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
        CustomerOrderResponseDTO dto = new CustomerOrderResponseDTO();
        dto.setId(sale.getId());
        dto.setInvoiceNumber(sale.getInvoiceNumber());
        dto.setTotalAmount(sale.getTotalAmount());
        dto.setStatus(sale.getStatus().name());
        dto.setPaymentMethod(sale.getPaymentMethod().name());
        dto.setDeliveryMethod(sale.getDeliveryMethod().name());
        dto.setCreatedAt(sale.getCreatedAt());
        dto.setUpdatedAt(sale.getUpdatedAt());

        // Convertir dirección - AHORA FUNCIONA
        if (sale.getShippingAddress() != null) {
            dto.setShippingAddress(convertAddressToDTO(sale.getShippingAddress()));
        }

        // Convertir items
        List<OrderItemResponseDTO> itemDTOs = saleItemRepository.findBySaleId(sale.getId())
                .stream()
                .map(this::convertSaleItemToDTO)
                .collect(Collectors.toList());
        dto.setItems(itemDTOs);

        // Convertir información de pago
        Optional<Payment> payment = paymentRepository.findBySaleId(sale.getId());
        if (payment.isPresent()) {
            dto.setPaymentInfo(convertPaymentToDTO(payment.get()));
        }

        return dto;
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