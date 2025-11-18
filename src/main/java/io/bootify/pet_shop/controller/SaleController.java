package io.bootify.pet_shop.controller;

import io.bootify.pet_shop.dto.SaleResponseDTO;
import io.bootify.pet_shop.dto.SalesStatsResponse;
import io.bootify.pet_shop.dto.UpdateSaleStatusRequest;
import io.bootify.pet_shop.models.SaleStatus;
import io.bootify.pet_shop.services.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/super-admin/sales")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SaleController {

    private final SaleService saleService;

    @GetMapping
    public ResponseEntity<List<SaleResponseDTO>> getAllSales() {
        return ResponseEntity.ok(saleService.getAllSales());
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<SaleResponseDTO>> getAllSales(Pageable pageable) {
        return ResponseEntity.ok(saleService.getAllSales(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SaleResponseDTO> getSaleById(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.getSaleById(id));
    }

    @GetMapping("/invoice/{invoiceNumber}")
    public ResponseEntity<SaleResponseDTO> getSaleByInvoiceNumber(@PathVariable String invoiceNumber) {
        return ResponseEntity.ok(saleService.getSaleByInvoiceNumber(invoiceNumber));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<SaleResponseDTO>> getSalesByStatus(@PathVariable SaleStatus status) {
        return ResponseEntity.ok(saleService.getSalesByStatus(status));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SaleResponseDTO>> getSalesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(saleService.getSalesByUser(userId));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<SaleResponseDTO>> getSalesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(saleService.getSalesByDateRange(startDate, endDate));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SaleResponseDTO> updateSaleStatus(
            @PathVariable Long id,
            @RequestBody UpdateSaleStatusRequest request) {
        return ResponseEntity.ok(saleService.updateSaleStatus(id, request));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelSale(@PathVariable Long id) {
        saleService.cancelSale(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<SalesStatsResponse> getSalesStats() {
        return ResponseEntity.ok(saleService.getSalesStats());
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<Object[]>> getTopSellingProducts() {
        return ResponseEntity.ok(saleService.getTopSellingProducts());
    }

    @GetMapping("/filtered")
    public ResponseEntity<Page<SaleResponseDTO>> getSalesWithFilters(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) SaleStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        return ResponseEntity.ok(saleService.getSalesWithFilters(search, status, startDate, endDate, pageable));
    }
}