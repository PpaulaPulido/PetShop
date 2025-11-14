package io.bootify.pet_shop.dto;

import io.bootify.pet_shop.models.Role;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CreateUserRequestDTO {

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato del email no es válido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String password;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, message = "El nombre debe tener al menos 2 caracteres")
    private String firstName;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(min = 2, message = "El apellido debe tener al menos 2 caracteres")
    private String lastName;

    @NotBlank(message = "El teléfono es obligatorio")
    private String phone;

    private String alternatePhone;
    private LocalDate dateOfBirth;
    private String gender;

    @NotNull(message = "El rol es obligatorio")
    private Role role;
}