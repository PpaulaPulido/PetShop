package io.bootify.pet_shop.controller;

import io.bootify.pet_shop.dto.CustomerProfileDTO;
import io.bootify.pet_shop.dto.UpdateCustomerProfileRequest;
import io.bootify.pet_shop.services.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/customer/profile")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerProfileController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<CustomerProfileDTO> getProfile() {
        return ResponseEntity.ok(customerService.getCustomerProfile());
    }

    @PutMapping
    public ResponseEntity<CustomerProfileDTO> updateProfile(@ModelAttribute UpdateCustomerProfileRequest request) {
        return ResponseEntity.ok(customerService.updateCustomerProfile(request));
    }

    @PostMapping("/password")
    public ResponseEntity<Void> changePassword(
            @RequestParam String currentPassword,
            @RequestParam String newPassword) {
        customerService.changePassword(currentPassword, newPassword);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/profile-picture")
    public ResponseEntity<CustomerProfileDTO> updateProfilePicture(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(customerService.updateProfilePicture(file));
    }

    @DeleteMapping("/profile-picture")
    public ResponseEntity<Void> deleteProfilePicture() {
        customerService.deleteProfilePicture();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/complete")
    public ResponseEntity<Boolean> isProfileComplete() {
        return ResponseEntity.ok(customerService.isProfileComplete());
    }
}