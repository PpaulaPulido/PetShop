package io.bootify.pet_shop.dto;

import io.bootify.pet_shop.models.Role;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.web.multipart.MultipartFile;

@Data
public class UserDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String displayName;
    private String phone;
    private String alternatePhone;
    private LocalDate dateOfBirth;
    private String gender;
    private Role role;
    private Boolean isActive;
    private LocalDateTime lastLogin;
    private Boolean emailVerified;
    private Boolean phoneVerified;
    private LocalDateTime createdAt;
    private MultipartFile profilePictureFile;
    private String profilePicture; 
}
