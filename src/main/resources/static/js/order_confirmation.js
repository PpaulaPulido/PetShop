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
        // Obtener orderId de la URL (ej: /user/order-confirmation?orderId=123)
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('orderId') || this.getOrderIdFromLocalStorage();
    }

    getOrderIdFromLocalStorage() {
        // Intentar obtener el último orderId del localStorage
        return localStorage.getItem('lastOrderId');
    }

    setupEventListeners() {
        // Botón de descargar factura
        document.getElementById('downloadInvoiceBtn')?.addEventListener('click', () => {
            this.downloadInvoice();
        });

        // Botón de seguir pedido
        document.getElementById('trackOrderBtn')?.addEventListener('click', () => {
            this.trackOrder();
        });

        // Clic en productos recomendados
        document.getElementById('recommendationsGrid')?.addEventListener('click', (e) => {
            const productCard = e.target.closest('.recommendation-card');
            if (productCard) {
                const productId = productCard.dataset.productId;
                this.viewProductDetails(productId);
            }
        });
    }

    async loadOrderData() {
        try {
            if (!this.orderId) {
                this.showErrorState('No se encontró información del pedido');
                return;
            }

            console.log('Cargando datos del pedido:', this.orderId);
            
            const response = await fetch(`/api/customer/orders/${this.orderId}`);
            
            if (!response.ok) {
                throw new Error('Error al cargar los datos del pedido');
            }

            this.orderData = await response.json();
            this.displayOrderData();
            this.loadRecommendations();
            
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

        // Remover todas las clases de estado
        statusElement.className = 'status-badge';
        
        // Agregar clase según el estado
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

        // Reset all steps
        steps.forEach(step => {
            step.classList.remove('completed', 'active');
        });

        // Update based on current status
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

        // Tiempo de preparación basado en el método de envío
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
            // Saltar fines de semana
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

    async loadRecommendations() {
        try {
            const response = await fetch('/api/customer/products?size=4');
            if (response.ok) {
                const products = await response.json();
                this.displayRecommendations(products);
            }
        } catch (error) {
            console.error('Error loading recommendations:', error);
            // Ocultar sección de recomendaciones si hay error
            document.querySelector('.recommendations-section').style.display = 'none';
        }
    }

    displayRecommendations(products) {
        const recommendationsGrid = document.getElementById('recommendationsGrid');
        if (!recommendationsGrid || !products || products.length === 0) {
            document.querySelector('.recommendations-section').style.display = 'none';
            return;
        }

        recommendationsGrid.innerHTML = products.map(product => `
            <div class="recommendation-card" data-product-id="${product.id}">
                <div class="recommendation-image">
                    <img src="${product.imageUrl || product.displayImage || '/images/default-product.png'}" 
                         alt="${product.name}"
                         onerror="this.src='/images/default-product.png'">
                </div>
                <div class="recommendation-info">
                    <h4 class="recommendation-name">${product.name}</h4>
                    <div class="recommendation-price">$${product.price?.toFixed(2) || '0.00'}</div>
                    <p class="recommendation-category">${product.type || 'Producto'}</p>
                </div>
            </div>
        `).join('');
    }

    async downloadInvoice() {
        try {
            if (!this.orderId) {
                this.showNotification('No se puede generar la factura', 'error');
                return;
            }

            this.showNotification('Generando factura...', 'info');

            // Simular generación de PDF (aquí integrarías con tu servicio de PDF)
            setTimeout(() => {
                this.showNotification('Factura generada exitosamente', 'success');
                
                // En un caso real, aquí descargarías el PDF
                // window.open(`/api/customer/orders/${this.orderId}/invoice`, '_blank');
                
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

        // Redirigir a la página de seguimiento
        window.location.href = `/user/order-details/${this.orderId}`;
    }

    viewProductDetails(productId) {
        window.location.href = `/customer/products/${productId}`;
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

        // Ocultar sidebar
        document.querySelector('.confirmation-sidebar').style.display = 'none';
        document.querySelector('.recommendations-section').style.display = 'none';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            color: white;
            z-index: 2000;
            font-weight: 500;
            max-width: 300px;
            transition: all 0.3s ease;
        `;
        
        if (type === 'success') {
            notification.style.background = '#28a745';
        } else if (type === 'error') {
            notification.style.background = '#dc3545';
        } else {
            notification.style.background = '#17a2b8';
        }
        
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

// Manejar errores no capturados
window.addEventListener('error', (event) => {
    console.error('Error no capturado:', event.error);
});