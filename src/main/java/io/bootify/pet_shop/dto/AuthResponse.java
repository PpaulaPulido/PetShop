package io.bootify.pet_shop.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private String email;
    private String role;
    private String fullName;
    private String message;

    public AuthResponse(String token, String email, String role, String fullName) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.fullName = fullName;
    }

    public AuthResponse(String message) {
        this.message = message;
    }
}