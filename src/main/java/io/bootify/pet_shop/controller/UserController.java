package io.bootify.pet_shop.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    @GetMapping("/cart")
    public String userCart(Model model) {
        model.addAttribute("pageTitle", "Mi Carrito - PetShop");
        return "customer/cart";
    }

    @GetMapping("/addresses")
    public String userAddresses(Model model) {
        model.addAttribute("pageTitle", "Mis Direcciones - PetShop");
        return "customer/addresses";
    }

    @GetMapping("/checkout")
    public String checkout(Model model) {
        model.addAttribute("pageTitle", "Finalizar Compra - PetShop");
        return "customer/checkout";
    }

    @GetMapping("/order-confirmation")
    public String orderConfirmation(Model model) {
        model.addAttribute("pageTitle", "Confirmación de Pedido - PetShop");
        return "customer/order-confirmation";
    }

    @GetMapping("/order-details/{id}")
    public String orderDetails(@PathVariable Long id, Model model) {
        model.addAttribute("pageTitle", "Detalles del Pedido - PetShop");
        model.addAttribute("orderId", id);
        return "customer/order-details";
    }
}