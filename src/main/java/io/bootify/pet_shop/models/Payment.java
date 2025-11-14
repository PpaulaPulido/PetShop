package io.bootify.pet_shop.models;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "sale_id", nullable = false)
    private Sale sale;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(precision = 10, scale = 2)
    private BigDecimal amount;

    // Campos específicos de Mercado Pago
    @Column(name = "mercadopago_payment_id")
    private String mercadopagoPaymentId;

    @Column(name = "mercadopago_preference_id")
    private String mercadopagoPreferenceId;

    @Column(name = "payment_url")
    private String paymentUrl;

    @Column(name = "external_reference")
    private String externalReference;

    // Información de tarjeta (si aplica)
    @Column(name = "card_last_four")
    private String cardLastFour;

    @Column(name = "installments")
    private Integer installments;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    // Constructores
    public Payment() {
    }

    public Payment(Sale sale, PaymentMethod paymentMethod, BigDecimal amount) {
        this.sale = sale;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Sale getSale() {
        return sale;
    }

    public void setSale(Sale sale) {
        this.sale = sale;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getMercadopagoPaymentId() {
        return mercadopagoPaymentId;
    }

    public void setMercadopagoPaymentId(String mercadopagoPaymentId) {
        this.mercadopagoPaymentId = mercadopagoPaymentId;
    }

    public String getMercadopagoPreferenceId() {
        return mercadopagoPreferenceId;
    }

    public void setMercadopagoPreferenceId(String mercadopagoPreferenceId) {
        this.mercadopagoPreferenceId = mercadopagoPreferenceId;
    }

    public String getPaymentUrl() {
        return paymentUrl;
    }

    public void setPaymentUrl(String paymentUrl) {
        this.paymentUrl = paymentUrl;
    }

    public String getExternalReference() {
        return externalReference;
    }

    public void setExternalReference(String externalReference) {
        this.externalReference = externalReference;
    }

    public String getCardLastFour() {
        return cardLastFour;
    }

    public void setCardLastFour(String cardLastFour) {
        this.cardLastFour = cardLastFour;
    }

    public Integer getInstallments() {
        return installments;
    }

    public void setInstallments(Integer installments) {
        this.installments = installments;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
}