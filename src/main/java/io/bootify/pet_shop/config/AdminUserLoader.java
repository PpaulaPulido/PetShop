package io.bootify.pet_shop.config;

import io.bootify.pet_shop.models.Role;
import io.bootify.pet_shop.models.User;
import io.bootify.pet_shop.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AdminUserLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Crear usuario SYSTEM_ADMIN si no existe
        Optional<User> existingAdmin = userRepository.findByEmail("system@petshop.com");
        if (existingAdmin.isEmpty()) {
            User systemAdmin = new User();
            systemAdmin.setEmail("system@petshop.com");
            systemAdmin.setPassword(passwordEncoder.encode("Admin123!"));
            systemAdmin.setFirstName("System");
            systemAdmin.setLastName("Administrator");
            systemAdmin.setPhone("+573113304050");
            systemAdmin.setRole(Role.SYSTEM_ADMIN);
            systemAdmin.setEmailVerified(true);
            systemAdmin.setDisplayName("System Admin");
            
            userRepository.save(systemAdmin);
        }
    }
}