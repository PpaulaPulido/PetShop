package io.bootify.pet_shop.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/manager")
@PreAuthorize("hasRole('MANAGER')")
public class ManagerController {

    @GetMapping("/dashboard")
    public String managerDashboard(Model model) {
        model.addAttribute("pageTitle", "Panel de Gerente - PetShop");
        model.addAttribute("userRole", "MANAGER");
        return "manager/dashboard";
    }

    @GetMapping("/orders")
    public String manageOrders(Model model) {
        model.addAttribute("pageTitle", "Gestión de Pedidos - PetShop");
        return "manager/orders";
    }

    @GetMapping("/reports")
    public String viewReports(Model model) {
        model.addAttribute("pageTitle", "Reportes - PetShop");
        return "manager/reports";
    }
}