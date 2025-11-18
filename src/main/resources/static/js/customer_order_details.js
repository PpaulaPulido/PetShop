class CustomerOrderDetails {
    constructor() {
        this.order = null;
        this.orderId = this.getOrderIdFromUrl();
        this.init();
    }

    getOrderIdFromUrl() {
        const path = window.location.pathname;
        const match = path.match(/\/user\/order-details\/(\d+)/);
        return match ? match[1] : null;
    }

    async init() {
        if (!this.orderId) {
            this.showError('No se pudo identificar el pedido');
            return;
        }

        this.setupEventListeners();
        await this.loadOrderDetails();
    }

    setupEventListeners() {
        // Botón imprimir
        const printBtn = document.getElementById('printOrderBtn');
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printOrder());
        }

        // Modal de cancelación
        const cancelConfirmBtn = document.getElementById('confirmCancelBtn');
        if (cancelConfirmBtn) {
            cancelConfirmBtn.addEventListener('click', () => this.confirmCancelOrder());
        }

        const cancelCancelBtn = document.getElementById('cancelCancelBtn');
        if (cancelCancelBtn) {
            cancelCancelBtn.addEventListener('click', () => this.hideCancelModal());
        }

        const closeCancelModal = document.getElementById('closeCancelModal');
        if (closeCancelModal) {
            closeCancelModal.addEventListener('click', () => this.hideCancelModal());
        }

        // Cerrar modal al hacer clic fuera
        const cancelModalOverlay = document.getElementById('cancelModalOverlay');
        if (cancelModalOverlay) {
            cancelModalOverlay.addEventListener('click', (e) => {
                if (e.target === cancelModalOverlay) {
                    this.hideCancelModal();
                }
            });
        }
    }

    async loadOrderDetails() {
        try {
            this.showLoadingState();

            console.log(`🔄 Cargando detalles del pedido ${this.orderId}...`);
            const response = await fetch(`/api/customer/orders/${this.orderId}`);

            if (!response.ok) {
                throw new Error('Error al cargar los detalles del pedido');
            }

            this.order = await response.json();
            console.log('✅ Detalles del pedido cargados:', this.order);

            this.renderOrderDetails();

        } catch (error) {
            console.error('❌ Error loading order details:', error);
            this.showError('Error al cargar los detalles del pedido');
        }
    }

    renderOrderDetails() {
        if (!this.order) return;

        // Actualizar información básica
        this.updateBasicInfo();
        
        // Renderizar componentes
        this.renderOrderTimeline();
        this.renderOrderProducts();
        this.renderShippingInfo();
        this.renderOrderSummary();
        this.renderPaymentInfo();
        this.renderOrderActions();

        // Ocultar estado de carga
        this.hideLoadingState();
    }

    updateBasicInfo() {
        // Header y subtítulo
        document.getElementById('orderSubtitle').textContent = 
            `Pedido #${this.order.invoiceNumber} - ${this.getStatusText(this.order.status)}`;

        // Tarjetas de resumen
        document.getElementById('orderNumber').textContent = this.order.invoiceNumber;
        document.getElementById('orderDate').textContent = this.formatDate(this.order.createdAt);
        document.getElementById('orderTotal').textContent = `$${this.order.totalAmount.toFixed(2)}`;
        
        const statusElement = document.getElementById('orderStatus');
        statusElement.textContent = this.getStatusText(this.order.status);
        statusElement.className = `summary-value status-badge ${this.order.status.toLowerCase()}`;
    }

    renderOrderTimeline() {
        const timeline = document.getElementById('orderTimeline');
        const status = this.order.status;
        
        const timelineSteps = [
            {
                id: 'PENDING',
                title: 'Pedido Recibido',
                description: 'Hemos recibido tu pedido y lo estamos procesando',
                completed: ['PENDING', 'CONFIRMED', 'PAID', 'SHIPPED', 'DELIVERED'].includes(status),
                current: status === 'PENDING',
                date: this.order.createdAt
            },
            {
                id: 'CONFIRMED',
                title: 'Pedido Confirmado',
                description: 'Tu pedido ha sido confirmado y está siendo preparado',
                completed: ['CONFIRMED', 'PAID', 'SHIPPED', 'DELIVERED'].includes(status),
                current: status === 'CONFIRMED',
                date: this.order.updatedAt
            },
            {
                id: 'PAID',
                title: 'Pago Confirmado',
                description: 'El pago ha sido procesado exitosamente',
                completed: ['PAID', 'SHIPPED', 'DELIVERED'].includes(status),
                current: status === 'PAID',
                date: this.order.paymentInfo?.paidAt || this.order.updatedAt
            },
            {
                id: 'SHIPPED',
                title: 'Enviado',
                description: 'Tu pedido ha sido enviado y está en camino',
                completed: ['SHIPPED', 'DELIVERED'].includes(status),
                current: status === 'SHIPPED',
                date: this.order.updatedAt
            },
            {
                id: 'DELIVERED',
                title: 'Entregado',
                description: 'Tu pedido ha sido entregado exitosamente',
                completed: status === 'DELIVERED',
                current: status === 'DELIVERED',
                date: this.order.updatedAt
            }
        ];

        timeline.innerHTML = timelineSteps.map(step => `
            <div class="timeline-item">
                <div class="timeline-icon ${step.completed ? 'completed' : ''} ${step.current ? 'current' : ''}">
                    ${this.getTimelineIcon(step.id)}
                </div>
                <div class="timeline-content">
                    <div class="timeline-title">${step.title}</div>
                    <div class="timeline-description">${step.description}</div>
                    ${step.completed && step.date ? `
                        <div class="timeline-date">${this.formatDateTime(step.date)}</div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    renderOrderProducts() {
        const productsContainer = document.getElementById('orderProducts');
        const itemsCount = document.getElementById('itemsCount');
        
        if (!this.order.items || this.order.items.length === 0) {
            productsContainer.innerHTML = `
                <div class="empty-state">
                    <p>No hay productos en este pedido</p>
                </div>
            `;
            itemsCount.textContent = '0 productos';
            return;
        }

        itemsCount.textContent = `${this.order.items.length} producto${this.order.items.length > 1 ? 's' : ''}`;

        productsContainer.innerHTML = this.order.items.map(item => `
            <div class="order-product-item">
                <div class="product-image">
                    <img src="${item.productImage}" 
                         alt="${item.productName}"
                         onerror="this.src='/images/default-product.png'">
                </div>
                <div class="product-details">
                    <div class="product-name">${item.productName}</div>
                    <div class="product-meta">
                        <span class="product-quantity">Cantidad: ${item.quantity}</span>
                        <span class="product-price">Precio: $${item.unitPrice.toFixed(2)}</span>
                    </div>
                </div>
                <div class="product-subtotal">
                    $${item.subtotal.toFixed(2)}
                </div>
            </div>
        `).join('');
    }

    renderShippingInfo() {
        const shippingContainer = document.getElementById('shippingInfo');
        
        if (!this.order.shippingAddress) {
            shippingContainer.innerHTML = `
                <div class="empty-state">
                    <p>No hay información de envío disponible</p>
                </div>
            `;
            return;
        }

        const address = this.order.shippingAddress;
        shippingContainer.innerHTML = `
            <div class="address-details">
                <div><strong>${address.addressLine1}</strong></div>
                ${address.addressLine2 ? `<div>${address.addressLine2}</div>` : ''}
                <div>${address.city}, ${address.department}</div>
                <div>${address.country} - ${address.zipCode}</div>
                ${address.contactName ? `<div><strong>Contacto:</strong> ${address.contactName}</div>` : ''}
                ${address.contactPhone ? `<div><strong>Teléfono:</strong> ${address.contactPhone}</div>` : ''}
                ${this.order.deliveryInstructions ? `
                    <div class="delivery-instructions">
                        <strong>Instrucciones de entrega:</strong> ${this.order.deliveryInstructions}
                    </div>
                ` : ''}
                <div style="margin-top: 1rem;">
                    <strong>Método de envío:</strong> ${this.getDeliveryMethodText(this.order.deliveryMethod)}
                </div>
            </div>
        `;
    }

    renderOrderSummary() {
        const summaryContainer = document.getElementById('orderSummary');
        const subtotal = this.order.totalAmount;
        const shipping = 0; // Podrías calcular esto basado en el método de envío
        const tax = 0; // Podrías calcular impuestos
        const total = subtotal + shipping + tax;

        summaryContainer.innerHTML = `
            <div class="summary-row">
                <span>Subtotal</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Envío</span>
                <span>${shipping > 0 ? `$${shipping.toFixed(2)}` : 'Gratis'}</span>
            </div>
            <div class="summary-row">
                <span>Impuestos</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="summary-row total">
                <span>Total</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        `;
    }

    renderPaymentInfo() {
        const paymentContainer = document.getElementById('paymentInfo');
        
        if (!this.order.paymentInfo) {
            paymentContainer.innerHTML = `
                <div class="empty-state">
                    <p>No hay información de pago disponible</p>
                </div>
            `;
            return;
        }

        const payment = this.order.paymentInfo;
        paymentContainer.innerHTML = `
            <div class="payment-details">
                <div class="payment-row">
                    <span class="payment-label">Método de pago:</span>
                    <span class="payment-value">${this.getPaymentMethodText(this.order.paymentMethod)}</span>
                </div>
                <div class="payment-row">
                    <span class="payment-label">Estado:</span>
                    <span class="payment-status ${payment.status.toLowerCase()}">
                        ${this.getPaymentStatusText(payment.status)}
                    </span>
                </div>
                <div class="payment-row">
                    <span class="payment-label">Monto:</span>
                    <span class="payment-value">$${payment.amount.toFixed(2)}</span>
                </div>
                ${payment.mercadopagoPaymentId ? `
                    <div class="payment-row">
                        <span class="payment-label">Referencia:</span>
                        <span class="payment-value">${payment.mercadopagoPaymentId}</span>
                    </div>
                ` : ''}
                ${payment.paidAt ? `
                    <div class="payment-row">
                        <span class="payment-label">Pagado el:</span>
                        <span class="payment-value">${this.formatDateTime(payment.paidAt)}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderOrderActions() {
        const actionsContainer = document.getElementById('orderActions');
        const canCancel = this.order.status === 'PENDING' || this.order.status === 'CONFIRMED';
        const canTrack = this.order.status === 'SHIPPED';

        let actionsHTML = '';

        if (canCancel) {
            actionsHTML += `
                <button class="btn btn-danger btn-block" onclick="customerOrderDetails.showCancelModal()">
                    🗑️ Cancelar Pedido
                </button>
            `;
        }

        if (canTrack) {
            actionsHTML += `
                <button class="btn btn-primary btn-block" onclick="customerOrderDetails.trackPackage()">
                    📍 Rastrear Paquete
                </button>
            `;
        }

        actionsHTML += `
            <button class="btn btn-outline btn-block" onclick="customerOrderDetails.contactSupport()">
                💬 Contactar Soporte
            </button>
            <button class="btn btn-outline btn-block" onclick="customerOrderDetails.downloadInvoice()">
                📄 Descargar Factura
            </button>
        `;

        actionsContainer.innerHTML = actionsHTML;
    }

    // Métodos de acciones
    showCancelModal() {
        document.getElementById('cancelOrderNumber').textContent = this.order.invoiceNumber;
        document.getElementById('cancelModalOverlay').style.display = 'flex';
    }

    hideCancelModal() {
        document.getElementById('cancelModalOverlay').style.display = 'none';
        document.getElementById('cancelReason').value = '';
    }

    async confirmCancelOrder() {
        const reason = document.getElementById('cancelReason').value;
        
        try {
            const response = await fetch(`/api/customer/orders/${this.orderId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason })
            });

            if (response.ok) {
                this.showNotification('Pedido cancelado exitosamente', 'success');
                this.hideCancelModal();
                // Recargar los detalles del pedido
                await this.loadOrderDetails();
            } else {
                throw new Error('Error al cancelar el pedido');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            this.showNotification('Error al cancelar el pedido', 'error');
        }
    }

    trackPackage() {
        // Aquí integrarías con el servicio de tracking
        this.showNotification('Funcionalidad de rastreo en desarrollo', 'info');
    }

    contactSupport() {
        window.location.href = '/contact?order=' + this.order.invoiceNumber;
    }

    downloadInvoice() {
        // Aquí generarías/descargarías la factura
        this.showNotification('Descarga de factura en desarrollo', 'info');
    }

    printOrder() {
        window.print();
    }

    // Métodos auxiliares
    getTimelineIcon(stepId) {
        const icons = {
            'PENDING': '📥',
            'CONFIRMED': '✅',
            'PAID': '💰',
            'SHIPPED': '🚚',
            'DELIVERED': '📦'
        };
        return icons[stepId] || '●';
    }

    getStatusText(status) {
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

    getPaymentMethodText(method) {
        const methods = {
            'MERCADO_PAGO': 'Mercado Pago',
            'CREDIT_CARD': 'Tarjeta de Crédito',
            'DEBIT_CARD': 'Tarjeta de Débito',
            'CASH_ON_DELIVERY': 'Pago Contra Entrega',
            'BANK_TRANSFER': 'Transferencia Bancaria'
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

    getPaymentStatusText(status) {
        const statuses = {
            'PENDING': 'Pendiente',
            'APPROVED': 'Aprobado',
            'AUTHORIZED': 'Autorizado',
            'IN_PROCESS': 'En Proceso',
            'REJECTED': 'Rechazado',
            'CANCELLED': 'Cancelado'
        };
        return statuses[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showLoadingState() {
        document.body.style.cursor = 'wait';
    }

    hideLoadingState() {
        document.body.style.cursor = 'default';
    }

    showError(message) {
        const mainContent = document.querySelector('.order-main-content');
        mainContent.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>${message}</h3>
                <p>Por favor, intenta de nuevo más tarde.</p>
                <button class="btn btn-primary" onclick="customerOrderDetails.loadOrderDetails()">
                    Reintentar
                </button>
            </div>
        `;
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

// Funciones globales para los botones
function contactSupport() {
    window.customerOrderDetails.contactSupport();
}

function trackPackage() {
    window.customerOrderDetails.trackPackage();
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.customerOrderDetails = new CustomerOrderDetails();
});