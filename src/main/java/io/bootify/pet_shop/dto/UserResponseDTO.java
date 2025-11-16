package io.bootify.pet_shop.dto;

import io.bootify.pet_shop.models.Gender;
import io.bootify.pet_shop.models.Role;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UserResponseDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String phone;
    private String alternatePhone;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String profilePicture; 
    private Boolean hasUploadedProfilePicture;
    private Role role;
    private Boolean isActive;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    private Boolean emailVerified;
    private Boolean phoneVerified;
    private Boolean emailNotifications;
    private Boolean smsNotifications;
    private Boolean newsletterSubscription;
    private Integer failedLoginAttempts;
    private Boolean accountLocked;
    private LocalDateTime lockedUntil;
}