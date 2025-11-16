package io.bootify.pet_shop.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/user")
@PreAuthorize("hasAnyRole('CUSTOMER', 'MANAGER', 'SUPER_ADMIN', 'SYSTEM_ADMIN')")
public class UserController {

    @GetMapping("/dashboard")
    public String userDashboard(Model model) {
        model.addAttribute("pageTitle", "Mi Cuenta - PetShop");
        model.addAttribute("userRole", "CUSTOMER");
        return "customer/dashboard";
    }

    @GetMapping("/profile")
    public String userProfile(Model model) {
        model.addAttribute("pageTitle", "Mi Perfil - PetShop");
        return "customer/profile";
    }

    @GetMapping("/orders")
    public String userOrders(Model model) {
        model.addAttribute("pageTitle", "Mis Pedidos - PetShop");
        return "customer/orders";
    }
}