package io.bootify.pet_shop.controller;

import io.bootify.pet_shop.services.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // Dashboard stats - Accesible para SUPER_ADMIN y MANAGER
    @GetMapping("/dashboard-stats")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(reportService.getDashboardStats());
    }

    // Reporte de ventas por fecha
    @GetMapping("/sales")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> getSalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getSalesReport(startDate, endDate));
    }

    // Reporte de inventario
    @GetMapping("/inventory")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> getInventoryReport() {
        return ResponseEntity.ok(reportService.getInventoryReport());
    }

    // Reporte mensual de ventas
    @GetMapping("/monthly-sales")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> getMonthlySalesReport(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(reportService.getMonthlySalesReport(year, month));
    }

    //Datos para gráficos
    @GetMapping("/charts-data")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> getChartsData() {
        return ResponseEntity.ok(reportService.getChartsData());
    }

    //Ventas por categoría
    @GetMapping("/sales-by-category")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> getSalesByCategory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getSalesByCategory(startDate, endDate));
    }

    // Stats rápidas para widgets
    @GetMapping("/quick-stats")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> getQuickStats() {
        Map<String, Object> dashboardStats = reportService.getDashboardStats();
        
        // Extraer solo las stats más importantes para widgets
        Map<String, Object> quickStats = Map.of(
            "totalProducts", dashboardStats.get("totalProducts"),
            "activeProducts", dashboardStats.get("activeProducts"),
            "lowStockProducts", dashboardStats.get("lowStockProducts"),
            "totalSales", dashboardStats.get("totalSales"),
            "todayRevenue", dashboardStats.get("todayRevenue"),
            "pendingSales", dashboardStats.get("pendingSales")
        );
        
        return ResponseEntity.ok(quickStats);
    }
}