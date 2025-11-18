class SaleDetailManager {
    constructor() {
        this.saleId = this.getSaleIdFromContext();
        this.currentSale = null;
        this.init();
    }

    getSaleIdFromContext() {
        console.log('Buscando saleId...');
        
        // 1. Primero intentar desde la variable Thymeleaf
        if (typeof pageSaleId !== 'undefined' && pageSaleId !== null) {
            console.log('SaleId encontrado desde Thymeleaf:', pageSaleId);
            return pageSaleId;
        }
        
        // 2. Intentar desde la URL (para debugging)
        const pathParts = window.location.pathname.split('/');
        const possibleId = pathParts[pathParts.length - 1];
        if (possibleId && !isNaN(possibleId)) {
            console.log('SaleId encontrado desde URL:', possibleId);
            return parseInt(possibleId);
        }
        
        // 3. Intentar desde parámetros GET
        const urlParams = new URLSearchParams(window.location.search);
        const idFromUrl = urlParams.get('id');
        if (idFromUrl && !isNaN(idFromUrl)) {
            console.log('SaleId encontrado desde parámetros:', idFromUrl);
            return parseInt(idFromUrl);
        }
        
        console.log('No se pudo encontrar saleId');
        return null;
    }

    init() {
        console.log('Inicializando SaleDetailManager con saleId:', this.saleId);
        
        if (!this.saleId) {
            this.showError('No se pudo identificar la venta. Verifica que la URL sea correcta.');
            return;
        }

        this.setupEventListeners();
        this.initializeScrollAnimations();
        this.loadSaleDetail();
    }

    setupEventListeners() {
        // Actualizar hora actual
        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 60000);

        // Efectos hover para tarjetas
        this.initializeCardHoverEffects();
    }

    updateCurrentTime() {
        const now = new Date();
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }

    initializeCardHoverEffects() {
        // Los efectos se aplican via CSS
    }

    initializeScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    }

    async loadSaleDetail() {
        try {
            this.showLoading(true);
            console.log('Cargando detalle para saleId:', this.saleId);
            
            const response = await fetch(`/api/super-admin/sales/${this.saleId}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }
            
            const sale = await response.json();
            console.log('Datos recibidos:', sale);
            this.currentSale = sale;
            
            await this.displaySaleDetail(sale);
            this.showLoading(false);
            
        } catch (error) {
            console.error('Error cargando detalle de venta:', error);
            this.showError(`Error al cargar el detalle: ${error.message}`);
            this.showLoading(false);
        }
    }

    async displaySaleDetail(sale) {
        const container = document.getElementById('saleDetail');
        
        container.innerHTML = this.generateSaleDetailHTML(sale);
        container.style.display = 'block';

        // Animar la aparición del contenido
        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);
    }

    generateSaleDetailHTML(sale) {
        return `
            <div class="sale-detail-grid">
                <!-- Información de la Venta -->
                <div class="info-card">
                    <div class="info-card-header primary">
                        <div class="info-card-title">
                            <i class="fas fa-info-circle"></i>
                            <span>Información de la Venta</span>
                        </div>
                    </div>
                    <div class="info-card-body">
                        ${this.generateSaleInfoHTML(sale)}
                    </div>
                </div>

                <!-- Información del Cliente -->
                <div class="info-card">
                    <div class="info-card-header info">
                        <div class="info-card-title">
                            <i class="fas fa-user"></i>
                            <span>Información del Cliente</span>
                        </div>
                    </div>
                    <div class="info-card-body">
                        ${this.generateCustomerInfoHTML(sale)}
                    </div>
                </div>

                <!-- Información de Pago -->
                <div class="info-card">
                    <div class="info-card-header ${sale.payment ? 'success' : 'warning'}">
                        <div class="info-card-title">
                            <i class="fas fa-credit-card"></i>
                            <span>Información de Pago</span>
                        </div>
                    </div>
                    <div class="info-card-body">
                        ${sale.payment ? this.generatePaymentInfoHTML(sale.payment) : this.generateNoPaymentHTML()}
                    </div>
                </div>

                <!-- Acciones -->
                <div class="info-card">
                    <div class="info-card-header dark">
                        <div class="info-card-title">
                            <i class="fas fa-cogs"></i>
                            <span>Acciones</span>
                        </div>
                    </div>
                    <div class="info-card-body">
                        ${this.generateActionsHTML(sale)}
                    </div>
                </div>
            </div>

            <!-- Productos -->
            <div class="products-table-container">
                <div class="info-card-header dark">
                    <div class="info-card-title">
                        <i class="fas fa-boxes"></i>
                        <span>Productos</span>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="products-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Precio Unitario</th>
                                <th>Cantidad</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.generateProductsHTML(sale.items || [])}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="text-end"><strong>Total:</strong></td>
                                <td><strong class="total-amount">${this.formatCurrency(sale.totalAmount || 0)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        `;
    }

    generateSaleInfoHTML(sale) {
        return `
            <div class="info-row">
                <span class="info-label">N° Factura:</span>
                <span class="info-value"><strong>${sale.invoiceNumber || 'N/A'}</strong></span>
            </div>
            <div class="info-row">
                <span class="info-label">Estado:</span>
                <span class="info-value">${this.getStatusBadgeHTML(sale.status)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Fecha:</span>
                <span class="info-value">${this.formatDateTime(sale.createdAt)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Total:</span>
                <span class="info-value"><strong class="text-success">${this.formatCurrency(sale.totalAmount || 0)}</strong></span>
            </div>
            ${sale.paymentMethod ? `
                <div class="info-row">
                    <span class="info-label">Método de Pago:</span>
                    <span class="info-value">
                        <i class="${this.getPaymentMethodIcon(sale.paymentMethod)} me-1"></i>
                        ${this.getPaymentMethodText(sale.paymentMethod)}
                    </span>
                </div>
            ` : ''}
            ${sale.deliveryMethod ? `
                <div class="info-row">
                    <span class="info-label">Método de Entrega:</span>
                    <span class="info-value">
                        <i class="fas fa-truck me-1"></i>
                        ${sale.deliveryMethod}
                    </span>
                </div>
            ` : ''}
        `;
    }

    generateCustomerInfoHTML(sale) {
        return `
            <div class="info-row">
                <span class="info-label">Nombre:</span>
                <span class="info-value">
                    <i class="fas fa-user me-1"></i>
                    <strong>${sale.userFullName || 'N/A'}</strong>
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">
                    <i class="fas fa-envelope me-1"></i>
                    ${sale.userEmail || 'N/A'}
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">ID Usuario:</span>
                <span class="info-value">
                    <i class="fas fa-id-card me-1"></i>
                    ${sale.userId || 'N/A'}
                </span>
            </div>
        `;
    }

    generatePaymentInfoHTML(payment) {
        return `
            <div class="info-row">
                <span class="info-label">Estado:</span>
                <span class="info-value">${this.getPaymentStatusBadgeHTML(payment.status)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Monto:</span>
                <span class="info-value"><strong class="text-success">${this.formatCurrency(payment.amount || 0)}</strong></span>
            </div>
            ${payment.mercadopagoPaymentId ? `
                <div class="info-row">
                    <span class="info-label">ID Mercado Pago:</span>
                    <span class="info-value">
                        <i class="fas fa-receipt me-1"></i>
                        ${payment.mercadopagoPaymentId}
                    </span>
                </div>
            ` : ''}
            ${payment.cardLastFour ? `
                <div class="info-row">
                    <span class="info-label">Tarjeta:</span>
                    <span class="info-value">
                        <i class="fas fa-credit-card me-1"></i>
                        **** ${payment.cardLastFour}
                    </span>
                </div>
            ` : ''}
            ${payment.installments ? `
                <div class="info-row">
                    <span class="info-label">Cuotas:</span>
                    <span class="info-value">
                        <i class="fas fa-calendar-alt me-1"></i>
                        ${payment.installments}
                    </span>
                </div>
            ` : ''}
            ${payment.paidAt ? `
                <div class="info-row">
                    <span class="info-label">Pagado el:</span>
                    <span class="info-value">
                        <i class="fas fa-calendar-check me-1"></i>
                        ${this.formatDateTime(payment.paidAt)}
                    </span>
                </div>
            ` : ''}
        `;
    }

    generateNoPaymentHTML() {
        return `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Sin información de pago</h4>
                <p>No hay datos de pago disponibles para esta venta</p>
            </div>
        `;
    }

    generateActionsHTML(sale) {
        return `
            <div class="actions-grid">
                <button class="btn-action primary action-btn-full" onclick="saleDetailManager.openStatusModal(${sale.id}, '${sale.status}')">
                    <i class="fas fa-edit"></i> Cambiar Estado
                </button>
                ${sale.status !== 'CANCELLED' && sale.status !== 'DELIVERED' ? `
                    <button class="btn-action danger action-btn-full" onclick="saleDetailManager.openCancelModal(${sale.id})">
                        <i class="fas fa-times"></i> Cancelar Venta
                    </button>
                ` : ''}
                <button class="btn-action secondary action-btn-full" onclick="saleDetailManager.printInvoice(${sale.id})">
                    <i class="fas fa-print"></i> Imprimir Factura
                </button>
            </div>
        `;
    }

    generateProductsHTML(items) {
        if (!items || items.length === 0) {
            return `
                <tr>
                    <td colspan="4" class="text-center py-5">
                        <div class="empty-state">
                            <i class="fas fa-inbox"></i>
                            <h4>No hay productos</h4>
                            <p>No se encontraron productos en esta venta</p>
                        </div>
                    </td>
                </tr>
            `;
        }

        return items.map((item, index) => `
            <tr style="animation-delay: ${0.1 * index}s">
                <td>
                    <div class="product-info">
                        <img src="${item.productImage || '/images/default-product.png'}" 
                             alt="${item.productName}" 
                             class="product-image"
                             onerror="this.src='/images/default-product.png'">
                        <div class="product-details">
                            <div class="product-name">${item.productName || 'Producto'}</div>
                            <div class="product-id">ID: ${item.productId || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td>${this.formatCurrency(item.unitPrice || 0)}</td>
                <td><span class="quantity-badge">${item.quantity || 0}</span></td>
                <td><strong>${this.formatCurrency(item.subtotal || 0)}</strong></td>
            </tr>
        `).join('');
    }

    // Métodos de utilidad
    getStatusBadgeHTML(status) {
        const config = {
            'PENDING': { class: 'status-pending', icon: 'fa-clock', text: 'Pendiente' },
            'CONFIRMED': { class: 'status-confirmed', icon: 'fa-check-circle', text: 'Confirmado' },
            'PAID': { class: 'status-paid', icon: 'fa-credit-card', text: 'Pagado' },
            'SHIPPED': { class: 'status-shipped', icon: 'fa-shipping-fast', text: 'Enviado' },
            'DELIVERED': { class: 'status-delivered', icon: 'fa-box-check', text: 'Entregado' },
            'CANCELLED': { class: 'status-cancelled', icon: 'fa-times-circle', text: 'Cancelado' }
        };

        const cfg = config[status] || { class: 'status-pending', icon: 'fa-question', text: status };

        return `
            <span class="status-badge ${cfg.class}">
                <i class="fas ${cfg.icon}"></i>
                ${cfg.text}
            </span>
        `;
    }

    getPaymentStatusBadgeHTML(status) {
        const classes = {
            'PENDING': 'status-pending',
            'APPROVED': 'status-delivered',
            'REJECTED': 'status-cancelled',
            'CANCELLED': 'status-cancelled'
        };

        const classNames = classes[status] || 'status-pending';
        return `<span class="status-badge ${classNames}">${status}</span>`;
    }

    getPaymentMethodIcon(method) {
        const icons = {
            'MERCADO_PAGO': 'fa-credit-card',
            'CREDIT_CARD': 'fa-credit-card',
            'DEBIT_CARD': 'fa-credit-card',
            'PAYPAL': 'fa-paypal',
            'BANK_TRANSFER': 'fa-university',
            'CASH_ON_DELIVERY': 'fa-money-bill-wave'
        };
        return `fas ${icons[method] || 'fa-credit-card'}`;
    }

    getPaymentMethodText(method) {
        const texts = {
            'MERCADO_PAGO': 'Mercado Pago',
            'CREDIT_CARD': 'Tarjeta Crédito',
            'DEBIT_CARD': 'Tarjeta Débito',
            'PAYPAL': 'PayPal',
            'BANK_TRANSFER': 'Transferencia',
            'CASH_ON_DELIVERY': 'Contraentrega'
        };
        return texts[method] || method;
    }

    formatCurrency(amount) {
        const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount);
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(numericAmount || 0);
    }

    formatDateTime(dateString) {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString('es-CO', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Fecha inválida';
        }
    }

    // Métodos de UI
    showLoading(show) {
        const loading = document.getElementById('loadingSpinner');
        const error = document.getElementById('errorMessage');
        const content = document.getElementById('saleDetail');

        if (show) {
            loading.style.display = 'flex';
            error.style.display = 'none';
            content.style.display = 'none';
        } else {
            loading.style.display = 'none';
        }
    }

    showError(message) {
        const error = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        errorText.textContent = message;
        error.style.display = 'flex';
        this.showLoading(false);
    }

    showAlert(message, type = 'success') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alert.style.cssText = 'top: 20px; right: 20px; z-index: 1060; min-width: 300px;';
        
        alert.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alert);

        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    // Métodos de acciones
    openStatusModal(saleId, currentStatus) {
        document.getElementById('currentSaleId').value = saleId;
        
        document.querySelectorAll('.status-radio').forEach(radio => {
            radio.checked = false;
        });
        
        const currentRadio = document.querySelector(`.status-radio[value="${currentStatus}"]`);
        if (currentRadio) {
            currentRadio.checked = true;
        }
        
        const modal = new bootstrap.Modal(document.getElementById('statusModal'));
        modal.show();
    }

    openCancelModal(saleId) {
        document.getElementById('cancelSaleId').value = saleId;
        const modal = new bootstrap.Modal(document.getElementById('cancelModal'));
        modal.show();
    }

    async updateSaleStatus() {
        const saleId = document.getElementById('currentSaleId').value;
        const selectedRadio = document.querySelector('.status-radio:checked');
        
        if (!selectedRadio) {
            this.showAlert('Por favor selecciona un estado', 'warning');
            return;
        }
        
        const newStatus = selectedRadio.value;

        try {
            const response = await fetch(`/api/super-admin/sales/${saleId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus
                })
            });

            if (response.ok) {
                const updatedSale = await response.json();
                bootstrap.Modal.getInstance(document.getElementById('statusModal')).hide();
                this.showAlert('Estado actualizado correctamente', 'success');
                setTimeout(() => this.loadSaleDetail(), 1000);
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Error actualizando estado');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Error actualizando estado: ' + error.message, 'danger');
        }
    }

    async confirmCancelSale() {
        const saleId = document.getElementById('cancelSaleId').value;
        
        try {
            const response = await fetch(`/api/super-admin/sales/${saleId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                bootstrap.Modal.getInstance(document.getElementById('cancelModal')).hide();
                this.showAlert('Venta cancelada correctamente', 'success');
                setTimeout(() => this.loadSaleDetail(), 1000);
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Error cancelando venta');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Error cancelando venta: ' + error.message, 'danger');
        }
    }

    printInvoice(saleId) {
        window.open(`/api/super-admin/sales/${saleId}/invoice`, '_blank');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando SaleDetailManager...');
    window.saleDetailManager = new SaleDetailManager();
});