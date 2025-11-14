package io.bootify.pet_shop.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "addresses")
@Getter
@Setter
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Información de la dirección
    @NotBlank
    @Column(name = "address_line1", nullable = false)
    private String addressLine1; // Calle y número

    @Column(name = "address_line2")
    private String addressLine2; // Barrio, complemento

    @Column(name = "landmark")
    private String landmark; // Punto de referencia

    @NotBlank
    @Column(nullable = false)
    private String city; // Ciudad/Municipio

    @NotBlank
    @Column(name = "department", nullable = false)
    private String department; // Departamento

    @NotBlank
    @Column(nullable = false)
    private String country = "Colombia"; // Siempre Colombia

    @NotBlank
    @Column(name = "zip_code", nullable = false)
    private String zipCode; // Código postal

    // Tipo de dirección
    @Enumerated(EnumType.STRING)
    @Column(name = "address_type", nullable = false)
    private AddressType addressType = AddressType.HOME;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    // Información de contacto en esta dirección
    @Column(name = "contact_name")
    private String contactName;

    @Column(name = "contact_phone")
    private String contactPhone;

    // Instrucciones de entrega
    @Column(name = "delivery_instructions", length = 500)
    private String deliveryInstructions;

    // Auditoría
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructores
    public Address() {}

    public Address(User user, String addressLine1, String city, String department, String zipCode) {
        this.user = user;
        this.addressLine1 = addressLine1;
        this.city = city;
        this.department = department;
        this.zipCode = zipCode;
        this.country = "Colombia";
    }

    // Método para obtener dirección completa
    public String getFullAddress() {
        StringBuilder sb = new StringBuilder();
        sb.append(addressLine1);
        if (addressLine2 != null && !addressLine2.isEmpty()) {
            sb.append(", ").append(addressLine2);
        }
        sb.append(", ").append(city);
        sb.append(", ").append(department);
        sb.append(", ").append(country);
        sb.append(" - ").append(zipCode);
        return sb.toString();
    }
}