package io.bootify.pet_shop.services;

import io.bootify.pet_shop.dto.AddressValidationResponse;
import io.bootify.pet_shop.models.Address;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Service
public class AddressValidationService {

    private final RestTemplate restTemplate;

    public AddressValidationService() {
        this.restTemplate = new RestTemplate();
    }

    public AddressValidationResponse validateAddress(Address address) {
        try {
            // Construir query para Nominatim
            String query = buildAddressQuery(address);
            
            String url = String.format(
                "https://nominatim.openstreetmap.org/search?format=json&q=%s&limit=1&addressdetails=1",
                URLEncoder.encode(query, StandardCharsets.UTF_8)
            );

            // Agregar headers para cumplir con la política de uso de Nominatim
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "PetShopApp/1.0 (pulidoibarra15@gmail.com)");
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseValidationResponse(response.getBody());
            }
            
        } catch (Exception e) {
            log.error("Error validando dirección: {}", e.getMessage());
        }
        
        // En caso de error, considerar la dirección como válida pero loguear el problema
        return createFallbackResponse();
    }

    private String buildAddressQuery(Address address) {
        StringBuilder query = new StringBuilder();
        
        if (address.getAddressLine1() != null) {
            query.append(address.getAddressLine1()).append(", ");
        }
        
        if (address.getCity() != null) {
            query.append(address.getCity()).append(", ");
        }
        
        if (address.getDepartment() != null) {
            query.append(address.getDepartment()).append(", ");
        }
        
        query.append("Colombia");
        
        return query.toString();
    }

    private AddressValidationResponse parseValidationResponse(String responseBody) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            java.util.List<?> results = mapper.readValue(responseBody, java.util.List.class);
            
            AddressValidationResponse validationResponse = new AddressValidationResponse();
            validationResponse.setValid(!results.isEmpty());
            
            if (!results.isEmpty()) {
                validationResponse.setMessage("Dirección verificada correctamente");
                validationResponse.setConfidence(0.8);
                
                // Extraer la dirección verificada del primer resultado
                java.util.Map<?, ?> firstResult = (java.util.Map<?, ?>) results.get(0);
                if (firstResult.containsKey("display_name")) {
                    validationResponse.setVerifiedAddress(firstResult.get("display_name").toString());
                }
            } else {
                validationResponse.setMessage("La dirección no pudo ser verificada. Por favor verifica los datos.");
                validationResponse.setConfidence(0.0);
            }
            
            return validationResponse;
            
        } catch (Exception e) {
            log.error("Error parseando respuesta de validación: {}", e.getMessage());
            return createFallbackResponse();
        }
    }

    private AddressValidationResponse createFallbackResponse() {
        AddressValidationResponse fallbackResponse = new AddressValidationResponse();
        fallbackResponse.setValid(true); // Por defecto aceptamos la dirección
        fallbackResponse.setMessage("No se pudo verificar la dirección automáticamente, pero se aceptará el registro");
        fallbackResponse.setConfidence(0.5);
        return fallbackResponse;
    }
}