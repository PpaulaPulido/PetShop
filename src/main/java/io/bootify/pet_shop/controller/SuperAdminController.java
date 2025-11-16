package io.bootify.pet_shop.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/super-admin")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@RequiredArgsConstructor
public class SuperAdminController {

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("pageTitle", "Panel de Super Admin - PetShop");
        return "super-admin/dashboard";
    }

    @GetMapping("/products")
    public String manageProducts(Model model) {
        model.addAttribute("pageTitle", "Gestión de Productos - PetShop");
        return "super-admin/products";
    }

    @GetMapping("/product-form")
    public String productForm(Model model, @RequestParam(required = false) Long id) {
        if (id != null) {
            model.addAttribute("pageTitle", "Editar Producto - PetShop");
            model.addAttribute("productId", id);
        } else {
            model.addAttribute("pageTitle", "Nuevo Producto - PetShop");
        }
        return "super-admin/product-form";
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

    @GetMapping("/sales")
    public String manageSales(Model model) {
        model.addAttribute("pageTitle", "Gestión de Ventas - PetShop");
        return "super-admin/sales";
    }

    @GetMapping("/sales/{id}")
    public String viewSaleDetail(@PathVariable Long id, Model model) {
        model.addAttribute("pageTitle", "Detalle de Venta - PetShop");
        model.addAttribute("saleId", id);
        return "super-admin/sale-detail";
    }

    @GetMapping("/reports")
    public String viewReports(Model model) {
        model.addAttribute("pageTitle", "Reportes y Estadísticas - PetShop");
        return "super-admin/reports";
    }
}