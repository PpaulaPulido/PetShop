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

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "PetShopApp/1.0 (pulidoibarra15@gmail.com)");
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                AddressValidationResponse validationResponse = parseValidationResponse(response.getBody());
                
                if (!validationResponse.isValid()) {
                    // Modificar la respuesta para que sea válida pero con advertencia
                    validationResponse.setValid(true);
                    validationResponse.setMessage("Dirección aceptada (verificación limitada)");
                    validationResponse.setConfidence(0.3);
                }
                
                return validationResponse;
            }
            
        } catch (Exception e) {
            log.error("Error validando dirección: {}", e.getMessage());
            log.warn("Continuando sin validación debido a error del servicio");
        }
        
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
            
            boolean hasResults = !results.isEmpty();
            validationResponse.setValid(hasResults);
            
            if (hasResults) {
                validationResponse.setMessage("Dirección verificada correctamente");
                validationResponse.setConfidence(0.8);
                
                // Extraer la dirección verificada del primer resultado
                java.util.Map<?, ?> firstResult = (java.util.Map<?, ?>) results.get(0);
                if (firstResult.containsKey("display_name")) {
                    validationResponse.setVerifiedAddress(firstResult.get("display_name").toString());
                }
            } else {
                validationResponse.setMessage("La dirección no pudo ser verificada automáticamente, pero será aceptada");
                validationResponse.setConfidence(0.2);
            }
            
            return validationResponse;
            
        } catch (Exception e) {
            return createFallbackResponse();
        }
    }

    private AddressValidationResponse createFallbackResponse() {
        AddressValidationResponse fallbackResponse = new AddressValidationResponse();
        fallbackResponse.setValid(true);
        fallbackResponse.setMessage("Servicio de validación no disponible - Dirección aceptada");
        fallbackResponse.setConfidence(0.1);
        return fallbackResponse;
    }
}