package io.bootify.pet_shop.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @GetMapping("")
    public String adminHome() {
        // Redirigir según el rol del usuario
        return "redirect:/admin/dashboard";
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'SUPER_ADMIN', 'MANAGER')")
    public String adminDashboard(Model model) {
        model.addAttribute("pageTitle", "Panel de Administración - PetShop");
        return "admin/dashboard";
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    public String manageOrders(Model model) {
        model.addAttribute("pageTitle", "Gestión de Pedidos - PetShop");
        return "admin/orders";
    }
}