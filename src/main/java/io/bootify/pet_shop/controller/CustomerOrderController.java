package io.bootify.pet_shop.controller;

import io.bootify.pet_shop.dto.CreateOrderRequest;
import io.bootify.pet_shop.dto.CustomerOrderResponseDTO;
import io.bootify.pet_shop.dto.OrderStatsDTO;
import io.bootify.pet_shop.services.CustomerOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerOrderController {

    private final CustomerOrderService customerOrderService;

    @GetMapping
    public ResponseEntity<List<CustomerOrderResponseDTO>> getOrders() {
        return ResponseEntity.ok(customerOrderService.getCustomerOrders());
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<CustomerOrderResponseDTO>> getOrders(Pageable pageable) {
        return ResponseEntity.ok(customerOrderService.getCustomerOrders(pageable));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<CustomerOrderResponseDTO> getOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(customerOrderService.getOrderById(orderId));
    }

    @GetMapping("/invoice/{invoiceNumber}")
    public ResponseEntity<CustomerOrderResponseDTO> getOrderByInvoice(@PathVariable String invoiceNumber) {
        return ResponseEntity.ok(customerOrderService.getOrderByInvoiceNumber(invoiceNumber));
    }

    @GetMapping("/stats")
    public ResponseEntity<OrderStatsDTO> getOrderStats() {
        return ResponseEntity.ok(customerOrderService.getCustomerOrderStats());
    }

    @PostMapping
    public ResponseEntity<CustomerOrderResponseDTO> createOrder(@RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(customerOrderService.createOrderFromCart(request));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long orderId) {
        customerOrderService.cancelOrder(orderId);
        return ResponseEntity.ok().build();
    }
}