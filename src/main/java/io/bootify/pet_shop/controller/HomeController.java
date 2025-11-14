package io.bootify.pet_shop.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/home")
    public String homePage() {
        return "redirect:/";
    }

    @GetMapping("/register")
    public String register() {
        return "redirect:/auth/register";
    }

    @GetMapping("/login")
    public String login() {
        return "redirect:/auth/login";
    }

    @GetMapping("/term")
    public String term() {
        return "redirect:/auth/term";
    }
}