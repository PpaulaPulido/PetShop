package io.bootify.pet_shop.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/manager")
@PreAuthorize("hasRole('MANAGER')")
@RequiredArgsConstructor
public class ManagerController {

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("pageTitle", "Panel de Manager - PetShop");
        return "manager/dashboard";
    }

    @GetMapping("/sales")
    public String manageSales(Model model) {
        model.addAttribute("pageTitle", "Gestión de Ventas - PetShop");
        return "manager/sales";
    }

    @GetMapping("/reports")
    public String viewReports(Model model) {
        model.addAttribute("pageTitle", "Reportes - PetShop");
        return "manager/reports";
    }

    @GetMapping("/inventory")
    public String viewInventory(Model model) {
        model.addAttribute("pageTitle", "Estado de Inventario - PetShop");
        return "manager/inventory";
    }
}