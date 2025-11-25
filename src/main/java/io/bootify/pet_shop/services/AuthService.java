package io.bootify.pet_shop.services;

import io.bootify.pet_shop.dto.RegisterRequest;
import io.bootify.pet_shop.models.Role;
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
    private final ValidationService validationService;

    @Transactional
    public User registerUser(RegisterRequest registerRequest) {
        // Validaciones adicionales
        if (!validationService.isValidEmail(registerRequest.getEmail())) {
            throw new RuntimeException("El formato del email no es válido");
        }

        if (!validationService.isValidPassword(registerRequest.getPassword())) {
            throw new RuntimeException("La contraseña no cumple con los requisitos de seguridad");
        }

        if (!validationService.isValidName(registerRequest.getFirstName())) {
            throw new RuntimeException("El nombre contiene caracteres no válidos");
        }

        if (!validationService.isValidName(registerRequest.getLastName())) {
            throw new RuntimeException("El apellido contiene caracteres no válidos");
        }

        if (!validationService.isValidColombianPhone(registerRequest.getPhone())) {
            throw new RuntimeException("El teléfono no es un número colombiano válido");
        }

        // Verificar si el email ya existe
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        // Normalizar y verificar teléfono
        String normalizedPhone = validationService.normalizePhone(registerRequest.getPhone());
        if (userRepository.existsByPhone(normalizedPhone)) {
            throw new RuntimeException("El teléfono ya está registrado");
        }

        // Verificar que las contraseñas coincidan
        if (!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
            throw new RuntimeException("Las contraseñas no coinciden");
        }

        // Verificar términos y condiciones
        if (!registerRequest.getAcceptTerms()) {
            throw new RuntimeException("Debes aceptar los términos y condiciones");
        }

        // Crear nuevo usuario
        User user = new User();
        user.setEmail(registerRequest.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFirstName(registerRequest.getFirstName().trim());
        user.setLastName(registerRequest.getLastName().trim());
        user.setPhone(normalizedPhone);
        user.setDisplayName(registerRequest.getFirstName() + " " + registerRequest.getLastName());
        
        // Todos los nuevos registros son CUSTOMER por defecto
        user.setRole(Role.CUSTOMER);
        user.setEmailVerified(true);
        user.setIsActive(true);
        user.setPhoneVerified(false);

        // Generar token de verificación
        // String verificationToken = UUID.randomUUID().toString();
        // user.setVerificationToken(verificationToken);
        // user.setVerificationTokenExpires(LocalDateTime.now().plusHours(24));
        user.setVerificationToken(null);
        user.setVerificationTokenExpires(null);

        // Guardar usuario
        User savedUser = userRepository.save(user);

        // Enviar email de verificación
        // emailService.sendVerificationEmail(savedUser);

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

    public boolean isEmailAvailable(String email) {
        if (!validationService.isValidEmail(email)) {
            return false;
        }
        return !userRepository.existsByEmail(email.toLowerCase().trim());
    }

    public boolean isPhoneAvailable(String phone) {
        if (!validationService.isValidColombianPhone(phone)) {
            return false;
        }
        String normalizedPhone = validationService.normalizePhone(phone);
        return !userRepository.existsByPhone(normalizedPhone);
    }

    // Método para validar fortaleza de contraseña
    public String checkPasswordStrength(String password) {
        if (password.length() < 8) {
            return "DEBIL: Mínimo 8 caracteres";
        }
        
        boolean hasUpper = password.matches(".*[A-Z].*");
        boolean hasLower = password.matches(".*[a-z].*");
        boolean hasDigit = password.matches(".*\\d.*");
        boolean hasSpecial = password.matches(".*[@$!%*?&].*");
        
        int strength = 0;
        if (hasUpper) strength++;
        if (hasLower) strength++;
        if (hasDigit) strength++;
        if (hasSpecial) strength++;
        
        if (strength == 4) return "FUERTE";
        if (strength >= 2) return "MEDIA";
        return "DEBIL: Falta mayúscula, número o carácter especial";
    }
}