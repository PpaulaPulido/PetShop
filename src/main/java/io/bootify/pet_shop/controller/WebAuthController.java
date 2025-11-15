package io.bootify.pet_shop.controller;

import io.bootify.pet_shop.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
public class WebAuthController {

    private final AuthService authService;

    @GetMapping("/auth/register")
    public String showRegisterForm(Model model) {
        model.addAttribute("pageTitle", "Registrarse - PetShop");
        return "register";
    }

    @GetMapping("/auth/login")
    public String showLoginForm(@RequestParam(value = "error", required = false) String error,
                               @RequestParam(value = "logout", required = false) String logout,
                               @RequestParam(value = "verified", required = false) String verified,
                               Model model) {
        if (error != null) {
            model.addAttribute("errorMessage", "Email o contraseña incorrectos.");
        }
        if (logout != null) {
            model.addAttribute("logoutMessage", "Has cerrado sesión exitosamente.");
        }
        if (verified != null) {
            model.addAttribute("successMessage", "¡Email verificado exitosamente! Ya puedes iniciar sesión.");
        }
        model.addAttribute("pageTitle", "Iniciar Sesión - PetShop");
        return "login";
    }

    @GetMapping("/auth/term")
    public String showTerm(Model model) {
        model.addAttribute("pageTitle", "Términos y condiciones - PetShop");
        return "term";
    }

    @GetMapping("/auth/verify-email")
    public String verifyEmail(@RequestParam String token, Model model) {
        try {
            
            boolean verified = authService.verifyEmail(token);
            
            if (verified) {
                return "redirect:/auth/login?verified=true";
            } else {
                model.addAttribute("pageTitle", "Error de Verificación - PetShop");
                model.addAttribute("error", "Error al verificar el email.");
                return "login";
            }
            
        } catch (RuntimeException e) {
            model.addAttribute("pageTitle", "Error de Verificación - PetShop");
            model.addAttribute("error", e.getMessage());
            return "login";
        }
    }

    @GetMapping("/auth/verification-sent")
    public String showVerificationSent(Model model) {
        model.addAttribute("pageTitle", "Verificación Enviada - PetShop");
        return "verification-sent";
    }
}