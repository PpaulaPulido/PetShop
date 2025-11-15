package io.bootify.pet_shop.services;

import io.bootify.pet_shop.dto.CreateUserRequestDTO;
import io.bootify.pet_shop.dto.UpdateUserRequestDTO;
import io.bootify.pet_shop.dto.UserResponseDTO;
import io.bootify.pet_shop.models.Gender;
import io.bootify.pet_shop.models.Role;
import io.bootify.pet_shop.models.User;
import io.bootify.pet_shop.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Método para obtener el usuario actual autenticado
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Usuario no autenticado");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public List<UserResponseDTO> getAllUsers() {
        // Obtener usuario actual para logging (opcional)
        User currentUser = getCurrentUser();
        System.out.println("🔍 SYSTEM_ADMIN " + currentUser.getEmail() + " está listando usuarios");

        return userRepository.findAllExceptSystemAdmin()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // SYSTEM_ADMIN no puede acceder a otros SYSTEM_ADMIN
        if (user.getRole() == Role.SYSTEM_ADMIN) {
            throw new RuntimeException("No tiene permisos para acceder a este usuario");
        }

        return convertToDTO(user);
    }

    @Transactional
    public UserResponseDTO createUser(CreateUserRequestDTO request) {
        User currentUser = getCurrentUser();
        System.out.println("➕ SYSTEM_ADMIN " + currentUser.getEmail() + " está creando usuario: " + request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        // SYSTEM_ADMIN no puede crear otros SYSTEM_ADMIN
        if (request.getRole() == Role.SYSTEM_ADMIN) {
            throw new RuntimeException("No tiene permisos para crear usuarios SYSTEM_ADMIN");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setDisplayName(request.getFirstName() + " " + request.getLastName());
        user.setPhone(request.getPhone());
        user.setAlternatePhone(request.getAlternatePhone());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender() != null ? Gender.valueOf(request.getGender()) : null);
        user.setRole(request.getRole());
        user.setIsActive(true);
        user.setEmailVerified(false);
        user.setPhoneVerified(false);
        user.setCreatedBy(currentUser.getEmail()); // Registrar quién creó el usuario

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    @Transactional
    public UserResponseDTO updateUser(Long id, UpdateUserRequestDTO request) {
        User currentUser = getCurrentUser();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        System.out.println("✏️ SYSTEM_ADMIN " + currentUser.getEmail() + " está editando usuario: " + user.getEmail());

        // SYSTEM_ADMIN no puede modificar otros SYSTEM_ADMIN
        if (user.getRole() == Role.SYSTEM_ADMIN) {
            throw new RuntimeException("No tiene permisos para modificar usuarios SYSTEM_ADMIN");
        }

        // SYSTEM_ADMIN no puede asignar rol SYSTEM_ADMIN
        if (request.getRole() == Role.SYSTEM_ADMIN) {
            throw new RuntimeException("No tiene permisos para asignar rol SYSTEM_ADMIN");
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setDisplayName(request.getFirstName() + " " + request.getLastName());
        user.setPhone(request.getPhone());
        user.setAlternatePhone(request.getAlternatePhone());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
        user.setRole(request.getRole());

        // CORREGIDO: Actualizar todos los campos
        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }

        if (request.getEmailVerified() != null) {
            user.setEmailVerified(request.getEmailVerified());
        }

        if (request.getPhoneVerified() != null) {
            user.setPhoneVerified(request.getPhoneVerified());
        }

        if (request.getEmailNotifications() != null) {
            user.setEmailNotifications(request.getEmailNotifications());
        }

        if (request.getSmsNotifications() != null) {
            user.setSmsNotifications(request.getSmsNotifications());
        }

        if (request.getNewsletterSubscription() != null) {
            user.setNewsletterSubscription(request.getNewsletterSubscription());
        }

        user.setUpdatedBy(currentUser.getEmail());

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    @Transactional
    public UserResponseDTO toggleUserStatus(Long id) {
        User currentUser = getCurrentUser();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        System.out
                .println("🔘 SYSTEM_ADMIN " + currentUser.getEmail() + " está cambiando estado de: " + user.getEmail());

        // SYSTEM_ADMIN no puede desactivar otros SYSTEM_ADMIN
        if (user.getRole() == Role.SYSTEM_ADMIN) {
            throw new RuntimeException("No tiene permisos para desactivar usuarios SYSTEM_ADMIN");
        }

        // SYSTEM_ADMIN no puede auto-desactivarse
        if (user.getId().equals(currentUser.getId())) {
            throw new RuntimeException("No puede desactivar su propia cuenta");
        }

        user.setIsActive(!user.getIsActive());
        user.setUpdatedBy(currentUser.getEmail());

        User updatedUser = userRepository.save(user);

        String action = user.getIsActive() ? "activado" : "desactivado";
        System.out.println("✅ Usuario " + user.getEmail() + " " + action + " por " + currentUser.getEmail());

        return convertToDTO(updatedUser);
    }

    @Transactional
    public UserResponseDTO updateUserRole(Long id, Role newRole) {
        User currentUser = getCurrentUser();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        System.out.println("🎭 SYSTEM_ADMIN " + currentUser.getEmail() + " está cambiando rol de " +
                user.getEmail() + " a " + newRole);

        // SYSTEM_ADMIN no puede modificar otros SYSTEM_ADMIN
        if (user.getRole() == Role.SYSTEM_ADMIN) {
            throw new RuntimeException("No tiene permisos para modificar usuarios SYSTEM_ADMIN");
        }

        // SYSTEM_ADMIN no puede asignar rol SYSTEM_ADMIN
        if (newRole == Role.SYSTEM_ADMIN) {
            throw new RuntimeException("No tiene permisos para asignar rol SYSTEM_ADMIN");
        }

        user.setRole(newRole);
        user.setUpdatedBy(currentUser.getEmail());

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    public List<UserResponseDTO> getUsersByRole(Role role) {
        // SYSTEM_ADMIN no puede listar otros SYSTEM_ADMIN
        if (role == Role.SYSTEM_ADMIN) {
            throw new RuntimeException("No tiene permisos para listar usuarios SYSTEM_ADMIN");
        }

        return userRepository.findByRole(role)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private UserResponseDTO convertToDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setAlternatePhone(user.getAlternatePhone());
        dto.setDateOfBirth(user.getDateOfBirth());
        dto.setGender(user.getGender());
        dto.setRole(user.getRole());
        dto.setIsActive(user.getIsActive());
        dto.setLastLogin(user.getLastLogin());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setCreatedBy(user.getCreatedBy());
        dto.setUpdatedBy(user.getUpdatedBy());
        dto.setEmailVerified(user.getEmailVerified());
        dto.setPhoneVerified(user.getPhoneVerified());
        dto.setEmailNotifications(user.getEmailNotifications());
        dto.setSmsNotifications(user.getSmsNotifications());
        dto.setNewsletterSubscription(user.getNewsletterSubscription());
        dto.setFailedLoginAttempts(user.getFailedLoginAttempts());
        dto.setAccountLocked(user.getAccountLocked());
        dto.setLockedUntil(user.getLockedUntil());
        return dto;
    }
}