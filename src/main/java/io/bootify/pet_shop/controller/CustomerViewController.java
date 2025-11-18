package io.bootify.pet_shop.controller;

import io.bootify.pet_shop.services.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/customer")
@RequiredArgsConstructor
public class CustomerViewController {

    private final CartService cartService;

    @GetMapping("/products")
    public String products(Model model) {
        model.addAttribute("pageTitle", "Productos - PetLuz");
        model.addAttribute("cartItemCount", cartService.getCartItemCount());
        return "customer/products";
    }

    @GetMapping("/products/{id}")
    public String productDetails(@PathVariable Long id, Model model) {
        model.addAttribute("pageTitle", "Detalles del Producto - PetLuz");
        model.addAttribute("productId", id);
        model.addAttribute("cartItemCount", cartService.getCartItemCount());
        return "customer/product-details";
    }


    @GetMapping("/terms")
    public String terms(Model model) {
        model.addAttribute("pageTitle", "Términos y Condiciones - PetLuz");
        model.addAttribute("cartItemCount", cartService.getCartItemCount());
        return "customer/terms";
    }

}