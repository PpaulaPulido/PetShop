package io.bootify.pet_shop.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/user/addresses")
@RequiredArgsConstructor
public class AddressViewController {

    @GetMapping
    public String addressesList(Model model) {
        model.addAttribute("pageTitle", "Mis Direcciones - PetLuz");
        return "customer/addresses";
    }

    @GetMapping("/new")
    public String newAddress(Model model) {
        model.addAttribute("isEdit", false);
        model.addAttribute("pageTitle", "Nueva Dirección - PetLuz");
        return "customer/address_form";
    }

    @GetMapping("/edit/{id}")
    public String editAddress(@PathVariable Long id, Model model) {
        model.addAttribute("isEdit", true);
        model.addAttribute("addressId", id);
        model.addAttribute("pageTitle", "Editar Dirección - PetLuz");
        return "customer/address_form";
    }
}