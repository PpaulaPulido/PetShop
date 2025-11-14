package io.bootify.pet_shop.services;

import io.bootify.pet_shop.models.User;
import io.bootify.pet_shop.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Transactional
    public User registerUser(User user) {
        // Verificar si el email ya existe
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        // Codificar password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Generar token de verificación
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpires(LocalDateTime.now().plusHours(24));
        user.setEmailVerified(false);
        user.setRole(user.getRole() != null ? user.getRole() : io.bootify.pet_shop.models.Role.CUSTOMER);

        // Guardar usuario
        User savedUser = userRepository.save(user);

        // Enviar email de verificación
        emailService.sendVerificationEmail(savedUser);

        return savedUser;
    }

    @Transactional
    public boolean verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Token de verificación inválido"));

        // Verificar que el token no haya expirado
        if (user.getVerificationTokenExpires().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El token de verificación ha expirado");
        }

        // Activar la cuenta
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpires(null);
        userRepository.save(user);

        return true;
    }

    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getEmailVerified()) {
            throw new RuntimeException("El email ya está verificado");
        }

        // Generar nuevo token
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpires(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        // Reenviar email
        emailService.sendVerificationEmail(user);
    }
}