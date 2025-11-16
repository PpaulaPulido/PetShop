package io.bootify.pet_shop.controller;

import io.bootify.pet_shop.dto.UserResponseDTO;
import io.bootify.pet_shop.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/profile")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerProfileController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserResponseDTO> getProfile() {
        // El UserService ya tiene lógica para obtener el usuario actual
        Long currentUserId = userService.getCurrentUser().getId();
        return ResponseEntity.ok(userService.getUserById(currentUserId));
    }

    // Para customer, solo puede actualizar su propio perfil
    @PutMapping
    public ResponseEntity<UserResponseDTO> updateProfile(@RequestBody UserResponseDTO request) {
        Long currentUserId = userService.getCurrentUser().getId();
        // Necesitarías crear un método específico en UserService para actualización de customer
        // Por ahora usaremos el existente
        return ResponseEntity.ok(userService.updateUser(currentUserId, convertToUpdateRequest(request)));
    }

    // Método helper para convertir UserResponseDTO a UpdateUserRequestDTO
    private io.bootify.pet_shop.dto.UpdateUserRequestDTO convertToUpdateRequest(UserResponseDTO dto) {
        io.bootify.pet_shop.dto.UpdateUserRequestDTO request = new io.bootify.pet_shop.dto.UpdateUserRequestDTO();
        request.setFirstName(dto.getFirstName());
        request.setLastName(dto.getLastName());
        request.setPhone(dto.getPhone());
        request.setAlternatePhone(dto.getAlternatePhone());
        request.setDateOfBirth(dto.getDateOfBirth());
        request.setGender(dto.getGender());
        // No permitir cambiar rol desde customer
        request.setRole(userService.getCurrentUser().getRole());
        return request;
    }
}