package io.bootify.pet_shop.services;

import io.bootify.pet_shop.dto.CreateUserRequestDTO;
import io.bootify.pet_shop.dto.UpdateUserRequestDTO;
import io.bootify.pet_shop.dto.UserResponseDTO;
import io.bootify.pet_shop.models.Gender;
import io.bootify.pet_shop.models.Role;
import io.bootify.pet_shop.models.User;
import io.bootify.pet_shop.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;
    private final SecurityService securityService;

    // Método para obtener el usuario actual autenticado
    private User getCurrentUser() {
        return securityService.getCurrentUser();
    }

    @Transactional
    public UserResponseDTO createUser(CreateUserRequestDTO request) {
        User currentUser = getCurrentUser();

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
        user.setCreatedBy(currentUser.getEmail());

        // Guardar usuario primero para obtener el ID
        User savedUser = userRepository.save(user);

        // Manejar subida de foto de perfil
        if (request.getProfilePictureFile() != null && !request.getProfilePictureFile().isEmpty()) {
            handleProfilePictureUpload(request.getProfilePictureFile(), savedUser);
            savedUser = userRepository.save(savedUser);
        } else if (request.getProfilePicture() != null && !request.getProfilePicture().isEmpty()) {
            user.setProfilePicture(request.getProfilePicture());
            savedUser = userRepository.save(savedUser);
        }

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

        // Actualizar campos booleanos
        if (request.getIsActive() != null) user.setIsActive(request.getIsActive());
        if (request.getEmailVerified() != null) user.setEmailVerified(request.getEmailVerified());
        if (request.getPhoneVerified() != null) user.setPhoneVerified(request.getPhoneVerified());
        if (request.getEmailNotifications() != null) user.setEmailNotifications(request.getEmailNotifications());
        if (request.getSmsNotifications() != null) user.setSmsNotifications(request.getSmsNotifications());
        if (request.getNewsletterSubscription() != null) user.setNewsletterSubscription(request.getNewsletterSubscription());

        // Manejar subida de foto de perfil - NUEVO
        if (request.getProfilePictureFile() != null && !request.getProfilePictureFile().isEmpty()) {
            handleProfilePictureUpload(request.getProfilePictureFile(), user);
        } else if (request.getProfilePicture() != null && !request.getProfilePicture().isEmpty()) {
            clearUploadedProfilePicture(user);
            user.setProfilePicture(request.getProfilePicture());
        }

        user.setUpdatedBy(currentUser.getEmail());

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    // Método para manejar subida de foto de perfil
    private void handleProfilePictureUpload(MultipartFile profilePictureFile, User user) {
        try {
            // Eliminar foto anterior si existe
            if (user.getProfilePictureFileName() != null) {
                fileStorageService.deleteProfileFile(user.getProfilePictureFileName());
            }

            FileStorageService.FileInfo fileInfo = fileStorageService.storeProfilePicture(profilePictureFile, user.getId());
            user.setProfilePictureFileName(fileInfo.getFileName());
            user.setProfilePictureFilePath(fileInfo.getFilePath());
            user.setProfilePictureFileSize(fileInfo.getFileSize());
            user.setProfilePicture(null); // Limpiar URL si se sube archivo
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar la foto de perfil: " + e.getMessage());
        }
    }

    //Método para limpiar foto de perfil subida
    private void clearUploadedProfilePicture(User user) {
        if (user.getProfilePictureFileName() != null) {
            try {
                fileStorageService.deleteProfileFile(user.getProfilePictureFileName());
            } catch (IOException e) {
                System.err.println("Error al eliminar archivo anterior: " + e.getMessage());
            }
            user.setProfilePictureFileName(null);
            user.setProfilePictureFilePath(null);
            user.setProfilePictureFileSize(null);
        }
    }

    public List<UserResponseDTO> getAllUsers() {
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
        if (user.getRole() == Role.SYSTEM_ADMIN) {
            throw new RuntimeException("No tiene permisos para acceder a este usuario");
        }
        return convertToDTO(user);
    }

    @Transactional
    public UserResponseDTO toggleUserStatus(Long id) {
        User currentUser = getCurrentUser();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        System.out.println("🔘 SYSTEM_ADMIN " + currentUser.getEmail() + " está cambiando estado de: " + user.getEmail());

        if (user.getRole() == Role.SYSTEM_ADMIN) {
            throw new RuntimeException("No tiene permisos para desactivar usuarios SYSTEM_ADMIN");
        }
        if (user.getId().equals(currentUser.getId())) {
            throw new RuntimeException("No puede desactivar su propia cuenta");
        }

        user.setIsActive(!user.getIsActive());
        user.setUpdatedBy(currentUser.getEmail());

        User updatedUser = userRepository.save(user);
        String action = user.getIsActive() ? "activado" : "desactivado";

        return convertToDTO(updatedUser);
    }

    @Transactional
    public UserResponseDTO updateUserRole(Long id, Role newRole) {
        User currentUser = getCurrentUser();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getRole() == Role.SYSTEM_ADMIN || newRole == Role.SYSTEM_ADMIN) {
            throw new RuntimeException("No tiene permisos para modificar usuarios SYSTEM_ADMIN");
        }

        user.setRole(newRole);
        user.setUpdatedBy(currentUser.getEmail());

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    public List<UserResponseDTO> getUsersByRole(Role role) {
        if (role == Role.SYSTEM_ADMIN) {
            throw new RuntimeException("No tiene permisos para listar usuarios SYSTEM_ADMIN");
        }
        return userRepository.findByRole(role)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
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
        dto.setProfilePicture(user.getDisplayProfilePicture()); // NUEVO: Usar método de display
        dto.setHasUploadedProfilePicture(user.getProfilePictureFileName() != null); // NUEVO
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