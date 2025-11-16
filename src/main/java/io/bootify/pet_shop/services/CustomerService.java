package io.bootify.pet_shop.services;

import io.bootify.pet_shop.dto.CustomerProfileDTO;
import io.bootify.pet_shop.dto.UpdateCustomerProfileRequest;
import io.bootify.pet_shop.models.User;
import io.bootify.pet_shop.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerService {

    private final UserRepository userRepository;
    private final SecurityService securityService;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;

    public CustomerProfileDTO getCustomerProfile() {
        User customer = getCurrentCustomer();
        return convertToProfileDTO(customer);
    }

    @Transactional
    public CustomerProfileDTO updateCustomerProfile(UpdateCustomerProfileRequest request) {
        User customer = getCurrentCustomer();
        
        log.info("👤 Customer {} actualizando perfil", customer.getEmail());

        // Actualizar información básica
        if (request.getFirstName() != null) {
            customer.setFirstName(request.getFirstName().trim());
        }
        if (request.getLastName() != null) {
            customer.setLastName(request.getLastName().trim());
        }
        if (request.getDisplayName() != null) {
            customer.setDisplayName(request.getDisplayName().trim());
        } else {
            customer.setDisplayName(customer.getFirstName() + " " + customer.getLastName());
        }
        
        // Actualizar información de contacto
        if (request.getPhone() != null) {
            customer.setPhone(request.getPhone());
            customer.setPhoneVerified(false); // Requiere re-verificación
        }
        if (request.getAlternatePhone() != null) {
            customer.setAlternatePhone(request.getAlternatePhone());
        }
        
        // Actualizar información personal
        if (request.getDateOfBirth() != null) {
            customer.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) {
            customer.setGender(io.bootify.pet_shop.models.Gender.valueOf(request.getGender()));
        }
        
        // Actualizar preferencias
        if (request.getEmailNotifications() != null) {
            customer.setEmailNotifications(request.getEmailNotifications());
        }
        if (request.getSmsNotifications() != null) {
            customer.setSmsNotifications(request.getSmsNotifications());
        }
        if (request.getNewsletterSubscription() != null) {
            customer.setNewsletterSubscription(request.getNewsletterSubscription());
        }

        // Manejar foto de perfil
        if (request.getProfilePictureFile() != null && !request.getProfilePictureFile().isEmpty()) {
            handleProfilePictureUpload(request.getProfilePictureFile(), customer);
        } else if (request.getProfilePicture() != null && !request.getProfilePicture().isEmpty()) {
            clearUploadedProfilePicture(customer);
            customer.setProfilePicture(request.getProfilePicture());
        }

        User updatedCustomer = userRepository.save(customer);
        return convertToProfileDTO(updatedCustomer);
    }

    @Transactional
    public void changePassword(String currentPassword, String newPassword) {
        User customer = getCurrentCustomer();
        
        if (!passwordEncoder.matches(currentPassword, customer.getPassword())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }
        
        if (currentPassword.equals(newPassword)) {
            throw new RuntimeException("La nueva contraseña debe ser diferente a la actual");
        }
        
        customer.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(customer);
        
        log.info("🔐 Customer {} cambió su contraseña", customer.getEmail());
    }

    @Transactional
    public CustomerProfileDTO updateProfilePicture(MultipartFile profilePictureFile) {
        User customer = getCurrentCustomer();
        
        if (profilePictureFile != null && !profilePictureFile.isEmpty()) {
            handleProfilePictureUpload(profilePictureFile, customer);
        } else {
            clearUploadedProfilePicture(customer);
        }
        
        User updatedCustomer = userRepository.save(customer);
        return convertToProfileDTO(updatedCustomer);
    }

    @Transactional
    public void deleteProfilePicture() {
        User customer = getCurrentCustomer();
        clearUploadedProfilePicture(customer);
        userRepository.save(customer);
        
        log.info("🗑️ Customer {} eliminó su foto de perfil", customer.getEmail());
    }

    public boolean isProfileComplete() {
        User customer = getCurrentCustomer();
        return customer.getEmailVerified() != null && customer.getEmailVerified() &&
               customer.getPhone() != null && !customer.getPhone().isEmpty() &&
               customer.getFirstName() != null && !customer.getFirstName().isEmpty() &&
               customer.getLastName() != null && !customer.getLastName().isEmpty();
    }

    // Métodos privados de ayuda
    private User getCurrentCustomer() {
        User user = securityService.getCurrentUser();
        if (user.getRole() != io.bootify.pet_shop.models.Role.CUSTOMER) {
            throw new RuntimeException("Acceso denegado: Solo los clientes pueden acceder a esta funcionalidad");
        }
        return user;
    }

    private void handleProfilePictureUpload(MultipartFile profilePictureFile, User customer) {
        try {
            // Eliminar foto anterior si existe
            if (customer.getProfilePictureFileName() != null) {
                fileStorageService.deleteProfileFile(customer.getProfilePictureFileName());
            }

            FileStorageService.FileInfo fileInfo = fileStorageService.storeProfilePicture(profilePictureFile, customer.getId());
            customer.setProfilePictureFileName(fileInfo.getFileName());
            customer.setProfilePictureFilePath(fileInfo.getFilePath());
            customer.setProfilePictureFileSize(fileInfo.getFileSize());
            customer.setProfilePicture(null); // Limpiar URL si se sube archivo
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar la foto de perfil: " + e.getMessage());
        }
    }

    private void clearUploadedProfilePicture(User customer) {
        if (customer.getProfilePictureFileName() != null) {
            try {
                fileStorageService.deleteProfileFile(customer.getProfilePictureFileName());
            } catch (IOException e) {
                log.error("Error al eliminar archivo anterior: {}", e.getMessage());
            }
            customer.setProfilePictureFileName(null);
            customer.setProfilePictureFilePath(null);
            customer.setProfilePictureFileSize(null);
        }
        customer.setProfilePicture(null);
    }

    private CustomerProfileDTO convertToProfileDTO(User user) {
        CustomerProfileDTO dto = new CustomerProfileDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setFullName(user.getFullName());
        dto.setDisplayName(user.getDisplayName());
        dto.setPhone(user.getPhone());
        dto.setAlternatePhone(user.getAlternatePhone());
        dto.setDateOfBirth(user.getDateOfBirth());
        dto.setGender(user.getGender() != null ? user.getGender().name() : null);
        dto.setProfilePicture(user.getDisplayProfilePicture());
        dto.setEmailNotifications(user.getEmailNotifications());
        dto.setSmsNotifications(user.getSmsNotifications());
        dto.setNewsletterSubscription(user.getNewsletterSubscription());
        dto.setLastLogin(user.getLastLogin());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}