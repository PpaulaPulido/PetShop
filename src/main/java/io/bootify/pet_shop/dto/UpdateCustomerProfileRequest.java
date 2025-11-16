package io.bootify.pet_shop.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;

@Data
public class UpdateCustomerProfileRequest {
    private String firstName;
    private String lastName;
    private String displayName;
    private String phone;
    private String alternatePhone;
    private LocalDate dateOfBirth;
    private String gender;
    private MultipartFile profilePictureFile;
    private String profilePicture; // URL externa
    private Boolean emailNotifications;
    private Boolean smsNotifications;
    private Boolean newsletterSubscription;
}