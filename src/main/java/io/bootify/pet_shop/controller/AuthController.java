package io.bootify.pet_shop.controller;

import io.bootify.pet_shop.dto.RegisterRequest;
import io.bootify.pet_shop.models.User;
import io.bootify.pet_shop.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest registerRequest,
            BindingResult bindingResult) {
        Map<String, Object> response = new HashMap<>();

        if (bindingResult.hasErrors()) {
            response.put("success", false);
            response.put("errors", bindingResult.getAllErrors());
            return ResponseEntity.badRequest().body(response);
        }

        try {
            User savedUser = authService.registerUser(registerRequest);

            response.put("success", true);
            response.put("message", "Usuario registrado exitosamente. Por favor verifica tu email.");
            response.put("email", savedUser.getEmail());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(@RequestParam String email) {
        try {
            authService.resendVerificationEmail(email);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Email de verificación reenviado.");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Object>> checkEmail(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();

        boolean available = authService.isEmailAvailable(email);
        boolean valid = authService.isEmailAvailable(email);

        response.put("available", available);
        response.put("valid", valid);

        if (!valid) {
            response.put("message", "El formato del email no es válido");
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-phone")
    public ResponseEntity<Map<String, Object>> checkPhone(@RequestParam String phone) {
        Map<String, Object> response = new HashMap<>();

        boolean available = authService.isPhoneAvailable(phone);
        boolean valid = authService.isPhoneAvailable(phone); // Esto valida el formato también

        response.put("available", available);
        response.put("valid", valid);

        if (!valid) {
            response.put("message", "El formato del teléfono no es válido. Debe ser un número colombiano.");
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-password")
    public ResponseEntity<Map<String, Object>> checkPassword(@RequestParam String password) {
        Map<String, Object> response = new HashMap<>();

        String strength = authService.checkPasswordStrength(password);
        boolean valid = strength.equals("FUERTE");

        response.put("valid", valid);
        response.put("strength", strength);
        response.put("message", strength);

        return ResponseEntity.ok(response);
    }
}