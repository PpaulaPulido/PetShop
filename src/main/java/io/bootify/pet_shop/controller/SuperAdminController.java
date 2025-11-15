package io.bootify.pet_shop.controller;

import io.bootify.pet_shop.services.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/super-admin")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@RequiredArgsConstructor
public class SuperAdminController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("pageTitle", "Panel de Super Admin - PetShop");
        
        // Agregar estadísticas al modelo
        model.addAttribute("dashboardStats", reportService.getDashboardStats());
        
        return "super-admin/dashboard";
    }

    @GetMapping("/products")
    public String manageProducts(Model model) {
        model.addAttribute("pageTitle", "Gestión de Productos - PetShop");
        return "super-admin/products";
    }

    @GetMapping("/categories")
    public String manageCategories(Model model) {
        model.addAttribute("pageTitle", "Gestión de Categorías - PetShop");
        return "super-admin/categories";
    }

    @GetMapping("/inventory")
    public String manageInventory(Model model) {
        model.addAttribute("pageTitle", "Gestión de Inventario - PetShop");
        return "super-admin/inventory";
    }

}