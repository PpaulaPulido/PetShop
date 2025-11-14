package io.bootify.pet_shop.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @GetMapping("/system-dashboard")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public String systemDashboard(Model model) {
        model.addAttribute("pageTitle", "Panel de Sistema - PetShop");
        model.addAttribute("userRole", "SYSTEM_ADMIN");
        return "admin/system-dashboard";
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SYSTEM_ADMIN')")
    public String adminDashboard(Model model) {
        model.addAttribute("pageTitle", "Panel de Administración - PetShop");
        model.addAttribute("userRole", "SUPER_ADMIN");
        return "admin/dashboard";
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'SUPER_ADMIN')")
    public String manageUsers(Model model) {
        model.addAttribute("pageTitle", "Gestión de Usuarios - PetShop");
        return "admin/users";
    }

    @GetMapping("/products")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'SUPER_ADMIN')")
    public String manageProducts(Model model) {
        model.addAttribute("pageTitle", "Gestión de Productos - PetShop");
        return "admin/products";
    }

    // Asegúrate de tener también la ruta básica de admin
    @GetMapping("")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'SUPER_ADMIN')")
    public String adminHome() {
        return "redirect:/admin/dashboard";
    }
}