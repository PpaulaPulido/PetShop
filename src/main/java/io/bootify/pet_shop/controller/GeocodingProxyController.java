package io.bootify.pet_shop.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/geocoding")
@CrossOrigin(origins = "*")
public class GeocodingProxyController {

    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private final String LOCATIONIQ_API_KEY = "pk.4a43d61148070597d01d02e2ab9248ee"; 
    
    @GetMapping("/search")
    public ResponseEntity<?> searchAddress(
            @RequestParam String query,
            @RequestParam(defaultValue = "5") int limit) {

        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Query parameter is required"));
        }

        try {
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            
            String url = String.format(
                "https://us1.locationiq.com/v1/search?key=%s&q=%s&format=json&limit=%d&countrycodes=co&addressdetails=1",
                LOCATIONIQ_API_KEY, encodedQuery, limit);

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = createHeaders();

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            return ResponseEntity.ok(response.getBody());

        } catch (Exception e) {
            return fallbackToOpenStreetMap(query, limit, e);
        }
    }

    @GetMapping("/reverse")
    public ResponseEntity<?> reverseGeocode(
            @RequestParam String lat,
            @RequestParam String lon) {
        try {
            double latitude = Double.parseDouble(lat.replace(',', '.'));
            double longitude = Double.parseDouble(lon.replace(',', '.'));
            
            String url = String.format(
                "https://us1.locationiq.com/v1/reverse?key=%s&lat=%.6f&lon=%.6f&format=json&addressdetails=1",
                LOCATIONIQ_API_KEY, latitude, longitude);


            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = createHeaders();

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            return ResponseEntity.ok(response.getBody());

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error en geocoding inverso: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    private ResponseEntity<?> fallbackToOpenStreetMap(String query, int limit, Exception originalError) {
        try {
            
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = String.format(
                "https://nominatim.openstreetmap.org/search?format=json&q=%s&limit=%d&addressdetails=1&countrycodes=co",
                encodedQuery, limit);

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = createHeaders();

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            return ResponseEntity.ok(response.getBody());

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Todos los servicios de geocoding fallaron");
            error.put("locationiq_error", originalError.getMessage());
            error.put("fallback_error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "PetShopApp/1.0 (pulidoibarra15@gmail.com)");
        headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));
        return headers;
    }
}