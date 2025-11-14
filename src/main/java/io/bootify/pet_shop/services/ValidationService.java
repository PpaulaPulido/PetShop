package io.bootify.pet_shop.services;

import org.springframework.stereotype.Service;
import java.util.regex.Pattern;

@Service
public class ValidationService {

    // Validación de email más estricta
    public boolean isValidEmail(String email) {
        String emailRegex = "^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return Pattern.matches(emailRegex, email);
    }

    // Validación de contraseña
    public boolean isValidPassword(String password) {
        // Al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial
        String passwordRegex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        return Pattern.matches(passwordRegex, password);
    }

    // Validación de nombre/apellido
    public boolean isValidName(String name) {
        String nameRegex = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]{3,}$";
        return Pattern.matches(nameRegex, name);
    }

    // Validación de teléfono colombiano
    public boolean isValidColombianPhone(String phone) {
        // Acepta: +573001234567, 573001234567, 3001234567
        String phoneRegex = "^(\\+57|57)?[1-9]\\d{9}$";
        return Pattern.matches(phoneRegex, phone);
    }

    // Normalizar teléfono a formato estándar
    public String normalizePhone(String phone) {
        if (phone == null) return null;
        
        // Remover espacios y caracteres especiales
        String cleaned = phone.replaceAll("[\\s\\-\\(\\)]", "");
        
        // Si empieza con +57, mantenerlo
        if (cleaned.startsWith("+57")) {
            return cleaned;
        }
        // Si empieza con 57 pero no tiene +, agregar +
        else if (cleaned.startsWith("57") && cleaned.length() == 12) {
            return "+" + cleaned;
        }
        // Si tiene 10 dígitos (sin código de país), agregar +57
        else if (cleaned.matches("^[1-9]\\d{9}$")) {
            return "+57" + cleaned;
        }
        
        return cleaned;
    }
}