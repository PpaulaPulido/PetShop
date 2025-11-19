// order_confirmation.js
class OrderConfirmation {
    constructor() {
        this.orderData = null;
        this.orderId = this.getOrderIdFromURL();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadOrderData();
    }

    getOrderIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('orderId') || this.getOrderIdFromLocalStorage();
    }

    getOrderIdFromLocalStorage() {
        return localStorage.getItem('lastOrderId');
    }

    setupEventListeners() {
        document.getElementById('downloadInvoiceBtn')?.addEventListener('click', () => {
            this.downloadInvoice();
        });

        document.getElementById('trackOrderBtn')?.addEventListener('click', () => {
            this.trackOrder();
        });
    }

    async loadOrderData() {
        try {
            if (!this.orderId) {
                this.showErrorState('No se encontró información del pedido');
                return;
            }
            
            const response = await fetch(`/api/customer/orders/${this.orderId}`);
            
            if (!response.ok) {
                throw new Error('Error al cargar los datos del pedido');
            }

            this.orderData = await response.json();
            this.displayOrderData();
            
        } catch (error) {
            console.error('Error loading order data:', error);
            this.showErrorState('Error al cargar los datos del pedido');
        }
    }

    displayOrderData() {
        if (!this.orderData) return;

        // Información básica del pedido
        this.setTextContent('orderNumber', this.orderData.invoiceNumber || 'N/A');
        this.setTextContent('orderDate', this.formatDate(this.orderData.createdAt));
        this.setTextContent('orderTotal', `$${this.orderData.totalAmount?.toFixed(2) || '0.00'}`);
        this.setTextContent('paymentMethod', this.getPaymentMethodText(this.orderData.paymentMethod));
        this.setTextContent('deliveryMethod', this.getDeliveryMethodText(this.orderData.deliveryMethod));

        // Estado del pedido
        this.updateOrderStatus(this.orderData.status);

        // Productos del pedido
        this.displayOrderProducts();

        // Información de envío
        this.displayShippingInfo();

        // Información de pago
        this.displayPaymentInfo();

        // Actualizar timeline
        this.updateTimeline();

        // Actualizar tiempo de preparación estimado
        this.updatePreparationTime();
    }

    displayOrderProducts() {
        const productsList = document.getElementById('productsList');
        if (!productsList || !this.orderData.items) return;

        productsList.innerHTML = this.orderData.items.map(item => `
            <div class="product-item">
                <div class="product-image">
                    <img src="${item.productImage}" 
                         alt="${item.productName}"
                         onerror="this.src='/images/default-product.png'">
                </div>
                <div class="product-info">
                    <h4 class="product-name">${item.productName}</h4>
                    <div class="product-details">
                        <span class="product-quantity">Cantidad: ${item.quantity}</span>
                        <span class="product-price">$${item.unitPrice?.toFixed(2) || '0.00'}</span>
                        <span class="product-subtotal">Subtotal: $${item.subtotal?.toFixed(2) || '0.00'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    displayShippingInfo() {
        const shippingDetails = document.getElementById('shippingDetails');
        if (!shippingDetails || !this.orderData.shippingAddress) return;

        const address = this.orderData.shippingAddress;
        shippingDetails.innerHTML = `
            <div class="address-line"><strong>${address.addressLine1}</strong></div>
            ${address.addressLine2 ? `<div class="address-line">${address.addressLine2}</div>` : ''}
            ${address.landmark ? `<div class="address-line">Punto de referencia: ${address.landmark}</div>` : ''}
            <div class="address-line">${address.city}, ${address.department}</div>
            <div class="address-line">${address.country} - ${address.zipCode}</div>
            <div class="address-contact">
                ${address.contactName ? `<div><strong>Contacto:</strong> ${address.contactName}</div>` : ''}
                ${address.contactPhone ? `<div><strong>Teléfono:</strong> ${address.contactPhone}</div>` : ''}
                ${this.orderData.deliveryInstructions ? `
                    <div class="delivery-instructions">
                        <strong>Instrucciones:</strong> ${this.orderData.deliveryInstructions}
                    </div>
                ` : ''}
            </div>
        `;
    }

    displayPaymentInfo() {
        const paymentDetails = document.getElementById('paymentDetails');
        const paymentInfoSection = document.getElementById('paymentInfoSection');
        
        if (!paymentDetails || !this.orderData.paymentInfo) {
            paymentInfoSection.style.display = 'none';
            return;
        }

        const payment = this.orderData.paymentInfo;
        paymentDetails.innerHTML = `
            <div class="payment-method">
                <strong>Método:</strong> ${this.getPaymentMethodText(this.orderData.paymentMethod)}
            </div>
            <div class="payment-amount">
                <strong>Monto:</strong> $${payment.amount?.toFixed(2) || this.orderData.totalAmount?.toFixed(2) || '0.00'}
            </div>
            <div class="payment-status">
                <span class="status-icon">${this.getPaymentStatusIcon(payment.status)}</span>
                <span>${this.getPaymentStatusText(payment.status)}</span>
            </div>
            ${payment.mercadopagoPaymentId ? `
                <div class="payment-reference">
                    <strong>Referencia MP:</strong> ${payment.mercadopagoPaymentId}
                </div>
            ` : ''}
            ${payment.paidAt ? `
                <div class="payment-date">
                    <strong>Pagado el:</strong> ${this.formatDateTime(payment.paidAt)}
                </div>
            ` : ''}
        `;
    }

    updateOrderStatus(status) {
        const statusElement = document.getElementById('orderStatus');
        if (!statusElement) return;

        statusElement.className = 'status-badge';
        
        const statusClasses = {
            'PENDING': 'pending',
            'CONFIRMED': 'confirmed',
            'PAID': 'confirmed',
            'SHIPPED': 'shipped',
            'DELIVERED': 'confirmed',
            'CANCELLED': 'pending'
        };

        const statusClass = statusClasses[status] || 'pending';
        statusElement.classList.add(statusClass);
        statusElement.textContent = this.getOrderStatusText(status);
    }

    updateTimeline() {
        if (!this.orderData) return;

        const status = this.orderData.status;
        const steps = document.querySelectorAll('.step-item');

        steps.forEach(step => {
            step.classList.remove('completed', 'active');
        });

        switch (status) {
            case 'PENDING':
                steps[0].classList.add('completed');
                steps[1].classList.add('active');
                break;
            case 'CONFIRMED':
            case 'PAID':
                steps[0].classList.add('completed');
                steps[1].classList.add('completed');
                steps[2].classList.add('active');
                break;
            case 'SHIPPED':
                steps[0].classList.add('completed');
                steps[1].classList.add('completed');
                steps[2].classList.add('completed');
                steps[3].classList.add('active');
                break;
            case 'DELIVERED':
                steps.forEach(step => step.classList.add('completed'));
                break;
            default:
                steps[0].classList.add('completed');
                steps[1].classList.add('active');
        }
    }

    updatePreparationTime() {
        const preparationTimeElement = document.getElementById('preparationTime');
        const deliveryEstimateElement = document.getElementById('deliveryEstimate');

        if (!this.orderData) return;

        let preparationTime = '24-48 horas';
        let deliveryEstimate = 'Calculando...';

        switch (this.orderData.deliveryMethod) {
            case 'EXPRESS_SHIPPING':
                preparationTime = '12-24 horas';
                deliveryEstimate = this.calculateDeliveryDate(2);
                break;
            case 'STANDARD_SHIPPING':
                preparationTime = '24-48 horas';
                deliveryEstimate = this.calculateDeliveryDate(5);
                break;
            case 'STORE_PICKUP':
                preparationTime = '4-8 horas';
                deliveryEstimate = 'Recoger en tienda';
                break;
            default:
                preparationTime = '24-48 horas';
                deliveryEstimate = this.calculateDeliveryDate(5);
        }

        if (preparationTimeElement) {
            preparationTimeElement.textContent = `Tiempo estimado: ${preparationTime}`;
        }

        if (deliveryEstimateElement) {
            deliveryEstimateElement.textContent = deliveryEstimate;
        }
    }

    calculateDeliveryDate(businessDays) {
        const createdDate = new Date(this.orderData.createdAt);
        let count = 0;
        
        while (count < businessDays) {
            createdDate.setDate(createdDate.getDate() + 1);
            if (createdDate.getDay() !== 0 && createdDate.getDay() !== 6) {
                count++;
            }
        }
        
        return createdDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    async downloadInvoice() {
        try {
            if (!this.orderId) {
                this.showNotification('No se puede generar la factura', 'error');
                return;
            }

            this.showNotification('Generando factura...', 'info');

            setTimeout(() => {
                this.showNotification('Factura generada exitosamente', 'success');
            }, 2000);

        } catch (error) {
            console.error('Error generating invoice:', error);
            this.showNotification('Error al generar la factura', 'error');
        }
    }

    trackOrder() {
        if (!this.orderId) {
            this.showNotification('No se puede rastrear el pedido', 'error');
            return;
        }

        window.location.href = `/user/order-details/${this.orderId}`;
    }

    // Métodos auxiliares
    getPaymentMethodText(method) {
        const methods = {
            'MERCADO_PAGO': 'Mercado Pago',
            'CREDIT_CARD': 'Tarjeta de Crédito',
            'DEBIT_CARD': 'Tarjeta de Débito',
            'CASH_ON_DELIVERY': 'Pago Contra Entrega',
            'BANK_TRANSFER': 'Transferencia Bancaria',
            'PAYPAL': 'PayPal'
        };
        return methods[method] || method;
    }

    getDeliveryMethodText(method) {
        const methods = {
            'STANDARD_SHIPPING': 'Envío Estándar',
            'EXPRESS_SHIPPING': 'Envío Express',
            'STORE_PICKUP': 'Recoger en Tienda',
            'SAME_DAY_DELIVERY': 'Entrega el Mismo Día'
        };
        return methods[method] || method;
    }

    getOrderStatusText(status) {
        const statuses = {
            'PENDING': 'Pendiente',
            'CONFIRMED': 'Confirmado',
            'PAID': 'Pagado',
            'SHIPPED': 'Enviado',
            'DELIVERED': 'Entregado',
            'CANCELLED': 'Cancelado'
        };
        return statuses[status] || status;
    }

    getPaymentStatusText(status) {
        const statuses = {
            'PENDING': 'Pendiente',
            'APPROVED': 'Aprobado',
            'AUTHORIZED': 'Autorizado',
            'IN_PROCESS': 'En Proceso',
            'REJECTED': 'Rechazado',
            'CANCELLED': 'Cancelado',
            'REFUNDED': 'Reembolsado'
        };
        return statuses[status] || status;
    }

    getPaymentStatusIcon(status) {
        const icons = {
            'PENDING': '⏳',
            'APPROVED': '✅',
            'AUTHORIZED': '🔒',
            'IN_PROCESS': '🔄',
            'REJECTED': '❌',
            'CANCELLED': '🚫',
            'REFUNDED': '💸'
        };
        return icons[status] || '❓';
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatDateTime(dateString) {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    setTextContent(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    showErrorState(message) {
        const mainContent = document.querySelector('.confirmation-main');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h2>${message}</h2>
                    <p>Por favor, verifica que el pedido exista o contacta a soporte.</p>
                    <div class="error-actions">
                        <a href="/user/orders" class="btn btn-primary">Ver Mis Pedidos</a>
                        <a href="/customer/products" class="btn btn-outline">Seguir Comprando</a>
                    </div>
                </div>
            `;
        }

        document.querySelector('.confirmation-sidebar').style.display = 'none';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notificationContainer');
        if (container) {
            container.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.orderConfirmation = new OrderConfirmation();
    } catch (error) {
        console.error('Error initializing order confirmation:', error);
    }
});

window.addEventListener('error', (event) => {
    console.error('Error no capturado:', event.error);
});