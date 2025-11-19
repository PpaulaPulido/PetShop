class CustomerOrders {
    constructor() {
        this.orders = [];
        this.filteredOrders = [];
        this.stats = {
            totalOrders: 0,
            pendingOrders: 0,
            deliveredOrders: 0,
            cancelledOrders: 0
        };
        this.currentPage = 1;
        this.ordersPerPage = 10;
        this.filters = {
            search: '',
            status: 'ALL',
            date: 'ALL',
            sort: 'NEWEST'
        };
        this.orderToCancel = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadOrderStats();
        await this.loadOrders();
    }

    setupEventListeners() {

        // Filtros
        this.setupFilterListeners();
        
        // Paginación
        this.setupPaginationListeners();
        
        // Modal de cancelación 
        this.setupCancelModalListeners();
    }

    setupFilterListeners() {
        const elements = {
            searchOrders: 'input',
            statusFilter: 'change', 
            dateFilter: 'change',
            sortOrders: 'change'
        };

        Object.entries(elements).forEach(([id, event]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener(event, (e) => {
                    this.filters[id.replace('Filter', '').toLowerCase()] = e.target.value;
                    this.applyFilters();
                });
            }
        });

        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }

        // Búsqueda en tiempo real
        const searchInput = document.getElementById('searchOrders');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.applyFilters();
            });
        }
    }

    setupPaginationListeners() {
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousPage());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextPage());
    }

    setupCancelModalListeners() {
        // IDs actualizados para coincidir con el HTML
        const cancelConfirmBtn = document.getElementById('confirmCancelBtn');
        const cancelCancelBtn = document.getElementById('cancelCancelBtn');
        const closeCancelModal = document.getElementById('closeCancelModal');
        const cancelModalOverlay = document.getElementById('cancelModalOverlay');

        if (cancelConfirmBtn) cancelConfirmBtn.addEventListener('click', () => this.confirmCancelOrder());
        if (cancelCancelBtn) cancelCancelBtn.addEventListener('click', () => this.hideCancelModal());
        if (closeCancelModal) closeCancelModal.addEventListener('click', () => this.hideCancelModal());
        if (cancelModalOverlay) {
            cancelModalOverlay.addEventListener('click', (e) => {
                if (e.target === cancelModalOverlay) this.hideCancelModal();
            });
        }
    }

    async loadOrderStats() {
        try {
            const response = await fetch('/api/customer/orders/stats');
            if (!response.ok) throw new Error('Error al cargar las estadísticas');
            this.stats = await response.json();
            this.updateStatsUI();

        } catch (error) {
            this.stats = { totalOrders: 0, pendingOrders: 0, deliveredOrders: 0, cancelledOrders: 0 };
            this.updateStatsUI();
        }
    }

    async loadOrders() {
        try {
            this.showLoadingState();
            
            const response = await fetch('/api/customer/orders');
            if (!response.ok) throw new Error('Error al cargar las órdenes');

            this.orders = await response.json();
            this.applyFilters();

        } catch (error) {
            this.showErrorState('Error al cargar las órdenes');
        }
    }

    updateStatsUI() {
        this.setTextContent('totalOrders', this.stats.totalOrders);
        this.setTextContent('pendingOrders', this.stats.pendingOrders);
        this.setTextContent('deliveredOrders', this.stats.deliveredOrders);
    }

    applyFilters() {
        let filtered = [...this.orders];

        // Filtro de búsqueda
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filtered = filtered.filter(order =>
                order.invoiceNumber.toLowerCase().includes(searchTerm) ||
                (order.shippingAddress && order.shippingAddress.city.toLowerCase().includes(searchTerm))
            );
        }

        // Filtro de estado
        if (this.filters.status !== 'ALL') {
            filtered = filtered.filter(order => order.status === this.filters.status);
        }

        // Filtro de fecha
        if (this.filters.date !== 'ALL') {
            filtered = this.filterByDate(filtered);
        }

        // Ordenamiento
        filtered.sort((a, b) => this.sortOrders(a, b));

        this.filteredOrders = filtered;
        this.currentPage = 1;
        this.displayOrders();
        this.updatePagination();
    }

    filterByDate(orders) {
        const now = new Date();
        return orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            switch (this.filters.date) {
                case 'TODAY':
                    return orderDate.toDateString() === now.toDateString();
                case 'WEEK':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return orderDate >= weekAgo;
                case 'MONTH':
                    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
                    return orderDate >= monthAgo;
                case 'LAST_MONTH':
                    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    return orderDate >= lastMonth && orderDate < thisMonth;
                default:
                    return true;
            }
        });
    }

    sortOrders(a, b) {
        switch (this.filters.sort) {
            case 'NEWEST':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'OLDEST':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'TOTAL_HIGH':
                return (b.totalAmount || 0) - (a.totalAmount || 0);
            case 'TOTAL_LOW':
                return (a.totalAmount || 0) - (b.totalAmount || 0);
            default:
                return 0;
        }
    }

    displayOrders() {
        const ordersGrid = document.getElementById('ordersGrid');
        const emptyOrders = document.getElementById('emptyOrders');
        const ordersState = document.getElementById('ordersState');

        if (this.filteredOrders.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideStates();
        ordersGrid.style.display = 'grid';

        const startIndex = (this.currentPage - 1) * this.ordersPerPage;
        const endIndex = startIndex + this.ordersPerPage;
        const currentOrders = this.filteredOrders.slice(startIndex, endIndex);

        ordersGrid.innerHTML = currentOrders.map(order => this.createOrderCard(order)).join('');
        this.addOrderCardEventListeners();
    }

    showEmptyState() {
        document.getElementById('ordersGrid').style.display = 'none';
        document.getElementById('emptyOrders').style.display = 'block';
        document.getElementById('ordersState').style.display = 'none';
        document.getElementById('pagination').style.display = 'none';
    }

    hideStates() {
        document.getElementById('ordersState').style.display = 'none';
        document.getElementById('emptyOrders').style.display = 'none';
    }

    createOrderCard(order) {
        const statusClass = `status-${order.status.toLowerCase()}`;
        const statusText = this.getStatusText(order.status);
        const canCancel = order.status === 'PENDING';

        return `
            <div class="order-card ${order.status.toLowerCase()}" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-info">
                        <h3>Pedido #${order.invoiceNumber}</h3>
                        <div class="order-meta">
                            <span>Fecha: ${this.formatDate(order.createdAt)}</span>
                        </div>
                    </div>
                    <div class="order-status ${statusClass}">${statusText}</div>
                </div>
                
                <div class="order-details">
                    <div class="detail-item">
                        <span class="detail-label">Total</span>
                        <span class="detail-value">$${order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Envío</span>
                        <span class="detail-value">${this.getDeliveryMethodText(order.deliveryMethod)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Pago</span>
                        <span class="detail-value">${this.getPaymentMethodText(order.paymentMethod)}</span>
                    </div>
                </div>

                ${this.renderProductsPreview(order)}
                
                <div class="order-actions">
                    <button class="btn btn-outline btn-sm view-order-btn" data-order-id="${order.id}">
                        Ver Detalles
                    </button>
                    ${canCancel ? `
                        <button class="btn btn-danger btn-sm cancel-order-btn" 
                                data-order-id="${order.id}" 
                                data-order-number="${order.invoiceNumber}">
                            Cancelar
                        </button>
                    ` : ''}
                    ${order.status === 'SHIPPED' ? `
                        <button class="btn btn-primary btn-sm track-order-btn" data-order-id="${order.id}">
                            📍Rastrear
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderProductsPreview(order) {
        if (!order.items || order.items.length === 0) return '';

        const previewItems = order.items.slice(0, 3).map(item => `
            <div class="product-preview">
                <div class="product-preview-image">
                    <img src="${item.productImage}" 
                         alt="${item.productName}"
                         onerror="this.src='/images/default-product.png'">
                </div>
                <span class="product-preview-name">${item.productName}</span>
                <span class="product-quantity">x${item.quantity}</span>
            </div>
        `).join('');

        const moreItems = order.items.length > 3 ? 
            `<div class="product-preview"><span>+${order.items.length - 3} más</span></div>` : '';

        return `
            <div class="order-products">
                <div class="products-preview">
                    ${previewItems}
                    ${moreItems}
                </div>
            </div>
        `;
    }

    addOrderCardEventListeners() {
        // Botón ver detalles
        document.querySelectorAll('.view-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.viewOrderDetails(e.target.dataset.orderId);
            });
        });

        // Botón cancelar
        document.querySelectorAll('.cancel-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showCancelModal(e.target.dataset.orderId, e.target.dataset.orderNumber);
            });
        });

        // Botón rastrear
        document.querySelectorAll('.track-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.trackOrder(e.target.dataset.orderId);
            });
        });

        // Clic en la tarjeta completa
        document.querySelectorAll('.order-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.order-actions')) {
                    this.viewOrderDetails(card.dataset.orderId);
                }
            });
        });
    }

    viewOrderDetails(orderId) {
        try {
            window.location.href = `/user/order-details/${orderId}`;
        } catch (error) {
            this.showNotification('Error al acceder a los detalles del pedido', 'error');
        }
    }

    trackOrder(orderId) {
        window.location.href = `/user/order-details/${orderId}`;
    }

    showCancelModal(orderId, orderNumber) {
        this.orderToCancel = orderId;
        document.getElementById('cancelOrderNumber').textContent = orderNumber;
        document.getElementById('cancelModalOverlay').style.display = 'flex';
        
        // Agregar animación de entrada
        setTimeout(() => {
            document.getElementById('cancelModal').style.transform = 'translateY(0) scale(1)';
        }, 10);
    }

    hideCancelModal() {
        this.orderToCancel = null;
        document.getElementById('cancelModalOverlay').style.display = 'none';
        document.getElementById('cancelModal').style.transform = 'translateY(-30px) scale(0.9)';
    }

    async confirmCancelOrder() {
        if (!this.orderToCancel) return;

        try {
            const response = await fetch(`/api/customer/orders/${this.orderToCancel}/cancel`, {
                method: 'POST'
            });

            if (response.ok) {
                this.showNotification('Pedido cancelado exitosamente', 'success');
                this.hideCancelModal();
                await this.loadOrders();
                await this.loadOrderStats(); // Actualizar estadísticas
            } else {
                throw new Error('Error al cancelar el pedido');
            }
        } catch (error) {
            this.showNotification('Error al cancelar el pedido', 'error');
        }
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredOrders.length / this.ordersPerPage);
        const pagination = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }

        pagination.style.display = 'flex';
        document.getElementById('currentPage').textContent = this.currentPage;
        document.getElementById('totalPages').textContent = totalPages;
        
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = this.currentPage === totalPages;
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.displayOrders();
            this.updatePagination();
            this.scrollToTop();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredOrders.length / this.ordersPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.displayOrders();
            this.updatePagination();
            this.scrollToTop();
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: document.querySelector('.orders-list-section').offsetTop - 100,
            behavior: 'smooth'
        });
    }

    clearFilters() {
        this.filters = {
            search: '',
            status: 'ALL',
            date: 'ALL',
            sort: 'NEWEST'
        };

        // Resetear valores de los inputs
        document.getElementById('searchOrders').value = '';
        document.getElementById('statusFilter').value = 'ALL';
        document.getElementById('dateFilter').value = 'ALL';
        document.getElementById('sortOrders').value = 'NEWEST';

        this.applyFilters();
        this.showNotification('Filtros limpiados correctamente', 'success');
    }

    showLoadingState() {
        const ordersState = document.getElementById('ordersState');
        ordersState.style.display = 'block';
        ordersState.innerHTML = `
            <div class="loading-orders">
                <div class="loading-spinner"></div>
                <p>Cargando tus pedidos...</p>
            </div>
        `;
        
        document.getElementById('ordersGrid').style.display = 'none';
        document.getElementById('emptyOrders').style.display = 'none';
        document.getElementById('pagination').style.display = 'none';
    }

    showErrorState(message) {
        const ordersState = document.getElementById('ordersState');
        ordersState.style.display = 'block';
        ordersState.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <h3>${message}</h3>
                <p>Por favor, intenta de nuevo más tarde.</p>
                <button class="btn btn-primary" onclick="customerOrders.loadOrders()">
                    Reintentar
                </button>
            </div>
        `;
        
        document.getElementById('ordersGrid').style.display = 'none';
        document.getElementById('emptyOrders').style.display = 'none';
        document.getElementById('pagination').style.display = 'none';
    }

    // Métodos auxiliares
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

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    setTextContent(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) element.textContent = text;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">×</button>
            </div>
        `;
        
        const container = document.getElementById('notificationContainer');
        if (container) {
            container.appendChild(notification);
            
            // Auto-remover después de 5 segundos
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 5000);
            
            notification.querySelector('.notification-close').addEventListener('click', () => {
                notification.remove();
            });
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.customerOrders = new CustomerOrders();
});