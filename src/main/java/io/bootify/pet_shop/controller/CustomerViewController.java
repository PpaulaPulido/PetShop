package io.bootify.pet_shop.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/")
public class CustomerViewController {

    @GetMapping
    public String home(Model model) {
        model.addAttribute("pageTitle", "PetShop - Tienda de Mascotas");
        return "customer/home";
    }

    @GetMapping("/products")
    public String products(Model model) {
        model.addAttribute("pageTitle", "Productos - PetShop");
        return "customer/products";
    }

    @GetMapping("/products/{id}")
    public String productDetails(@PathVariable Long id, Model model) {
        model.addAttribute("pageTitle", "Detalles del Producto - PetShop");
        model.addAttribute("productId", id);
        return "customer/product-details";
    }

    @GetMapping("/about")
    public String about(Model model) {
        model.addAttribute("pageTitle", "Sobre Nosotros - PetShop");
        return "customer/about";
    }

    @GetMapping("/contact")
    public String contact(Model model) {
        model.addAttribute("pageTitle", "Contacto - PetShop");
        return "customer/contact";
    }

    @GetMapping("/faq")
    public String faq(Model model) {
        model.addAttribute("pageTitle", "Preguntas Frecuentes - PetShop");
        return "customer/faq";
    }

    @GetMapping("/terms")
    public String terms(Model model) {
        model.addAttribute("pageTitle", "Términos y Condiciones - PetShop");
        return "customer/terms";
    }

    @GetMapping("/privacy")
    public String privacy(Model model) {
        model.addAttribute("pageTitle", "Política de Privacidad - PetShop");
        return "customer/privacy";
    }
}