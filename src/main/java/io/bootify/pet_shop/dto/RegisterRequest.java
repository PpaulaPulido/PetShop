package io.bootify.pet_shop.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato del email no es válido")
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", 
             message = "El email debe tener al menos 3 caracteres antes del @ y un dominio válido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
             message = "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial")
    private String password;

    @NotBlank(message = "La confirmación de contraseña es obligatoria")
    private String confirmPassword;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, message = "El nombre debe tener al menos 3 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]{3,}$", 
             message = "El nombre solo puede contener letras y espacios")
    private String firstName;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(min = 3, message = "El apellido debe tener al menos 3 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]{3,}$", 
             message = "El apellido solo puede contener letras y espacios")
    private String lastName;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^(\\+57|57)?[1-9]\\d{9}$", 
             message = "El teléfono debe ser un número colombiano válido (ej: +573001234567, 573001234567 o 3001234567)")
    private String phone;

    @AssertTrue(message = "Debes aceptar los términos y condiciones")
    private Boolean acceptTerms = false;
}