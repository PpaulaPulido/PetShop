package io.bootify.pet_shop.controller;

import io.bootify.pet_shop.models.User;
import io.bootify.pet_shop.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody User user) {
        User savedUser = authService.registerUser(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Usuario registrado exitosamente. Por favor verifica tu email.");
        response.put("email", savedUser.getEmail());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam String token) {
        boolean verified = authService.verifyEmail(token);
        
        Map<String, String> response = new HashMap<>();
        if (verified) {
            response.put("message", "Email verificado exitosamente. Ya puedes iniciar sesión.");
        } else {
            response.put("message", "Error al verificar el email.");
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(@RequestParam String email) {
        authService.resendVerificationEmail(email);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Email de verificación reenviado.");
        
        return ResponseEntity.ok(response);
    }
}