// super_sales.js
class SalesManager {
    constructor() {
        this.currentPage = 0;
        this.totalPages = 0;
        this.currentFilters = {};
        this.debouncedLoadSales = debounce(() => this.loadSales(), ADMIN_CONFIG.DEBOUNCE_DELAY);
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDates();
        this.loadSalesStats();
        this.loadSales();

        // Actualizar cada 60 segundos
        setInterval(() => {
            this.loadSalesStats();
            this.loadSales();
        }, 60000);
    }

    setupEventListeners() {
        // Animaciones para elementos interactivos
        const cards = document.querySelectorAll('.stat-card, .action-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 15px 40px rgba(106, 47, 180, 0.25)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 8px 30px rgba(106, 47, 180, 0.15)';
            });
        });

        // Inicializar animaciones de scroll
        initializeScrollAnimations();
    }

    setDefaultDates() {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        document.getElementById('startDateFilter').valueAsDate = startDate;
        document.getElementById('endDateFilter').valueAsDate = endDate;
    }

    async loadSalesStats() {
        try {
            console.log('Cargando estadísticas de ventas...');
            const response = await fetch('/api/super-admin/sales/stats');

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const stats = await response.json();
            console.log('Estadísticas recibidas:', stats);

            this.updateSalesStats(stats);

        } catch (error) {
            console.error('Error cargando estadísticas de ventas:', error);
            this.showError('Error al cargar las estadísticas de ventas');
        }
    }

    updateSalesStats(stats) {
        // Calcular ventas enviadas (si no viene en el DTO)
        const shippedSales = (stats.totalSales || 0) -
            (stats.pendingSales || 0) -
            (stats.paidSales || 0) -
            (stats.deliveredSales || 0);

        const elementsMap = {
            'total-sales': stats.totalSales || 0,
            'total-revenue': this.formatCurrency(stats.totalRevenue || 0),
            'pending-sales': stats.pendingSales || 0,
            'shipped-sales': shippedSales, // Calculado
            'sales-trend': this.calculateSalesTrend(stats),
            'revenue-trend': this.calculateRevenueTrend(stats)
        };

        Object.entries(elementsMap).forEach(([elementId, value]) => {
            const element = document.getElementById(elementId);
            if (element) {
                if (elementId.includes('trend')) {
                    element.textContent = value;
                } else if (elementId === 'total-revenue') {
                    element.textContent = value;
                } else {
                    this.animateValue(element, 0, parseInt(value) || 0, ADMIN_CONFIG.ANIMATION_DURATION);
                }
            }
        });

        // Actualizar badge de productos con stock bajo si existe
        const lowStockBadge = document.getElementById('low-stock-badge');
        if (lowStockBadge && stats.lowStockProducts !== undefined) {
            lowStockBadge.textContent = `${stats.lowStockProducts} productos`;
        }
    }

    calculateSalesTrend(stats) {
        // Lógica simple para calcular tendencia
        const total = stats.totalSales || 0;
        const delivered = stats.deliveredSales || 0;

        if (total === 0) return 0;
        return Math.round((delivered / total) * 100);
    }

    calculateRevenueTrend(stats) {
        // Lógica simple para tendencia de ingresos
        const totalRevenue = stats.totalRevenue ? parseFloat(stats.totalRevenue) : 0;
        const todayRevenue = stats.todayRevenue ? parseFloat(stats.todayRevenue) : 0;

        if (totalRevenue === 0) return '0%';

        const dailyAverage = totalRevenue / 30; // Promedio mensual
        if (dailyAverage === 0) return '0%';

        const trend = ((todayRevenue - dailyAverage) / dailyAverage) * 100;
        return `${trend > 0 ? '+' : ''}${Math.round(trend)}%`;
    }

    async loadSales(page = 0) {
        try {
            this.currentPage = page;
            const filters = this.getCurrentFilters();

            let url;
            const params = new URLSearchParams();

            // Estrategia: usar endpoints existentes según los filtros
            if (filters.status) {
                // Usar endpoint por estado
                url = `/api/super-admin/sales/status/${filters.status}`;
            } else if (filters.startDate && filters.endDate) {
                // Usar endpoint por rango de fechas
                url = `/api/super-admin/sales/date-range?startDate=${filters.startDate}&endDate=${filters.endDate}`;
            } else if (filters.search) {
                // Para búsqueda, usar endpoint paginado y filtrar en frontend
                url = `/api/super-admin/sales/paginated?page=${page}&size=10&sort=createdAt,desc`;
            } else {
                // Sin filtros, usar endpoint paginado normal
                url = `/api/super-admin/sales/paginated?page=${page}&size=10&sort=createdAt,desc`;
            }

            this.showLoading(true);
            console.log('Cargando ventas desde:', url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            let data = await response.json();
            console.log('Ventas recibidas:', data);

            // Si hay búsqueda, filtrar en el frontend
            if (filters.search && Array.isArray(data)) {
                data = this.filterSalesBySearch(data, filters.search);
            }

            this.displaySales(data);

        } catch (error) {
            console.error('Error cargando ventas:', error);
            this.showError('Error al cargar las ventas: ' + error.message);

            // Fallback: cargar sin filtros
            this.loadSalesWithoutFilters(page);
        } finally {
            this.showLoading(false);
        }
    }

    // Método auxiliar para filtrar por búsqueda en frontend
    filterSalesBySearch(sales, searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        return sales.filter(sale =>
            (sale.invoiceNumber && sale.invoiceNumber.toLowerCase().includes(term)) ||
            (sale.userEmail && sale.userEmail.toLowerCase().includes(term)) ||
            (sale.userFullName && sale.userFullName.toLowerCase().includes(term))
        );
    }

    // Método de fallback
    async loadSalesWithoutFilters(page = 0) {
        try {
            const url = `/api/super-admin/sales/paginated?page=${page}&size=10&sort=createdAt,desc`;
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                this.displaySales(data);
            }
        } catch (error) {
            console.error('Error en fallback:', error);
        }
    }

    getCurrentFilters() {
        return {
            status: document.getElementById('statusFilter').value,
            startDate: document.getElementById('startDateFilter').value,
            endDate: document.getElementById('endDateFilter').value,
            search: document.getElementById('searchFilter').value
        };
    }

    displaySales(data) {
        const tbody = document.getElementById('salesTableBody');
        const salesCount = document.getElementById('salesCount');
        const paginationContainer = document.getElementById('paginationContainer');

        let sales = [];
        let totalElements = 0;
        let totalPages = 0;

        // Manejar tanto Page como List response
        if (data.content && Array.isArray(data.content)) {
            // Es una Page de Spring
            sales = data.content;
            totalElements = data.totalElements || 0;
            totalPages = data.totalPages || 1;
        } else if (Array.isArray(data)) {
            // Es una List directa
            sales = data;
            totalElements = data.length;
            totalPages = 1;
        }

        this.totalPages = totalPages;
        this.updatePagination(totalElements);

        if (!sales || sales.length === 0) {
            tbody.innerHTML = this.getEmptyStateHTML();
            salesCount.textContent = '0 ventas';
            paginationContainer.style.display = 'none';
            return;
        }

        salesCount.textContent = `${totalElements} venta${totalElements !== 1 ? 's' : ''}`;
        paginationContainer.style.display = 'flex';

        tbody.innerHTML = sales.map((sale, index) => `
            <tr class="fade-in" style="animation-delay: ${index * 0.1}s">
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas fa-receipt text-primary me-2"></i>
                        <div>
                            <strong class="d-block">${sale.invoiceNumber || 'N/A'}</strong>
                            <small class="text-muted">ID: ${sale.id}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas fa-user-circle text-secondary me-2"></i>
                        <div>
                            <strong class="d-block">${sale.userFullName || 'Cliente'}</strong>
                            <small class="text-muted">${sale.userEmail || ''}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <strong class="text-success">${this.formatCurrency(sale.totalAmount || 0)}</strong>
                </td>
                <td>
                    ${this.getStatusBadge(sale.status)}
                </td>
                <td>
                    <small>${this.getPaymentMethodText(sale.paymentMethod)}</small>
                </td>
                <td>
                    <small class="d-block">${this.formatDate(sale.createdAt)}</small>
                    <small class="text-muted">${this.formatTime(sale.createdAt)}</small>
                </td>
                <td>
                    <div class="actions-group">
                        <a href="/super-admin/sales/${sale.id}" class="action-btn view" title="Ver detalle">
                            <i class="fas fa-eye"></i>
                        </a>
                        <button class="action-btn edit" onclick="salesManager.openStatusModal(${sale.id}, '${sale.status}')" title="Cambiar estado">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${sale.status !== 'CANCELLED' && sale.status !== 'DELIVERED' ?
                `<button class="action-btn cancel" onclick="salesManager.openCancelModal(${sale.id})" title="Cancelar venta">
                    <i class="fas fa-times"></i>
                </button>` : ''}
                    </div>
                </td>
            </tr>
        `).join('');

        // Animar filas
        setTimeout(() => {
            const rows = tbody.querySelectorAll('tr');
            rows.forEach((row, index) => {
                setTimeout(() => {
                    row.style.opacity = '1';
                    row.style.transform = 'translateX(0)';
                }, index * 100);
            });
        }, 100);
    }

    getEmptyStateHTML() {
        return `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <h4>No se encontraron ventas</h4>
                        <p class="text-muted">Intenta ajustar los filtros de búsqueda</p>
                        <button class="btn-action secondary mt-3" onclick="salesManager.clearFilters()">
                            <i class="fas fa-times"></i> Limpiar Filtros
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    updatePagination(totalElements) {
        document.getElementById('currentPage').textContent = this.currentPage + 1;
        document.getElementById('totalPages').textContent = this.totalPages;

        document.getElementById('prevPage').disabled = this.currentPage === 0;
        document.getElementById('nextPage').disabled = this.currentPage >= this.totalPages - 1;
    }

    changePage(direction) {
        const newPage = this.currentPage + direction;
        if (newPage >= 0 && newPage < this.totalPages) {
            this.loadSales(newPage);
        }
    }

    // En super_sales.js - modifica estos métodos:

    openStatusModal(saleId, currentStatus) {
        document.getElementById('currentSaleId').value = saleId;

        // Desmarcar todos los radios primero
        document.querySelectorAll('.status-radio').forEach(radio => {
            radio.checked = false;
        });

        // Marcar el radio del estado actual
        const currentRadio = document.querySelector(`.status-radio[value="${currentStatus}"]`);
        if (currentRadio) {
            currentRadio.checked = true;
        }

        const modal = new bootstrap.Modal(document.getElementById('statusModal'));
        modal.show();
    }

    // Nuevo método para abrir modal de cancelación
    openCancelModal(saleId) {
        document.getElementById('cancelSaleId').value = saleId;
        const modal = new bootstrap.Modal(document.getElementById('cancelModal'));
        modal.show();
    }

    // Método para confirmar la cancelación
    async confirmCancelSale() {
        const saleId = document.getElementById('cancelSaleId').value;

        try {
            const response = await fetch(`/api/super-admin/sales/${saleId}/cancel`, {
                method: 'POST',
                headers: getHeaders()
            });

            if (response.ok) {
                bootstrap.Modal.getInstance(document.getElementById('cancelModal')).hide();
                this.loadSales(this.currentPage);
                this.loadSalesStats();
                showAlert('Venta cancelada correctamente', 'success');
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Error cancelando venta');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error cancelando venta: ' + error.message, 'danger');
        }
    }

    // Modifica el método updateSaleStatus para usar los radios
    async updateSaleStatus() {
        const saleId = document.getElementById('currentSaleId').value;
        const selectedRadio = document.querySelector('.status-radio:checked');

        if (!selectedRadio) {
            showAlert('Por favor selecciona un estado', 'warning');
            return;
        }

        const newStatus = selectedRadio.value;

        try {
            const response = await fetch(`/api/super-admin/sales/${saleId}/status`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({
                    status: newStatus
                    // Se eliminó el campo notes
                })
            });

            if (response.ok) {
                const updatedSale = await response.json();
                bootstrap.Modal.getInstance(document.getElementById('statusModal')).hide();
                this.loadSales(this.currentPage);
                this.loadSalesStats();
                showAlert('Estado actualizado correctamente', 'success');
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Error actualizando estado');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error actualizando estado: ' + error.message, 'danger');
        }
    }

    // Modifica la función cancelSale para usar el modal
    async cancelSale(saleId) {
        this.openCancelModal(saleId);
    }

    clearFilters() {
        document.getElementById('statusFilter').value = '';
        document.getElementById('startDateFilter').value = '';
        document.getElementById('endDateFilter').value = '';
        document.getElementById('searchFilter').value = '';
        this.setDefaultDates();
        this.loadSales(0);
    }

    async exportSales() {
        try {
            const filters = this.getCurrentFilters();
            let url = '/api/super-admin/sales/export';

            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.search) params.append('search', filters.search);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            showAlert('Generando archivo de exportación...', 'info');

            const response = await fetch(url);

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `ventas_${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                showAlert('Archivo exportado correctamente', 'success');
            } else {
                throw new Error('Error generando exportación');
            }
        } catch (error) {
            console.error('Error exportando ventas:', error);
            showAlert('La funcionalidad de exportación está en desarrollo', 'info');
        }
    }

    // Utilidades de formato
    formatCurrency(amount) {
        // Manejar tanto números como BigDecimal strings
        const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount);
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(numericAmount || 0);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return 'Fecha inválida';
        }
    }

    formatTime(dateString) {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return '';
        }
    }

    getStatusBadge(status) {
        const statusConfig = {
            'PENDING': { class: 'status-pending', icon: 'fa-clock', text: 'Pendiente' },
            'CONFIRMED': { class: 'status-confirmed', icon: 'fa-check-circle', text: 'Confirmado' },
            'PAID': { class: 'status-paid', icon: 'fa-credit-card', text: 'Pagado' },
            'SHIPPED': { class: 'status-shipped', icon: 'fa-shipping-fast', text: 'Enviado' },
            'DELIVERED': { class: 'status-delivered', icon: 'fa-box-check', text: 'Entregado' },
            'CANCELLED': { class: 'status-cancelled', icon: 'fa-times-circle', text: 'Cancelado' }
        };

        const config = statusConfig[status] || { class: 'status-pending', icon: 'fa-question', text: status };

        return `
            <span class="status-badge ${config.class}">
                <i class="fas ${config.icon}"></i>
                ${config.text}
            </span>
        `;
    }

    getPaymentMethodText(method) {
        const methods = {
            'MERCADO_PAGO': 'Mercado Pago',
            'CREDIT_CARD': 'Tarjeta Crédito',
            'DEBIT_CARD': 'Tarjeta Débito',
            'PAYPAL': 'PayPal',
            'BANK_TRANSFER': 'Transferencia',
            'CASH_ON_DELIVERY': 'Contraentrega'
        };
        return methods[method] || method || 'N/A';
    }

    animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value.toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    showLoading(show) {
        const tbody = document.getElementById('salesTableBody');
        if (show) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <div class="loading-content">
                            <div class="loading-spinner large"></div>
                            <p class="mt-3">Buscando ventas...</p>
                        </div>
                    </td>
                </tr>
            `;
        }
    }

    showError(message) {
        showAlert(message, 'warning');
    }
}

// Funciones globales para compatibilidad
function debouncedLoadSales() {
    if (window.salesManager) {
        window.salesManager.debouncedLoadSales();
    }
}

function clearFilters() {
    if (window.salesManager) {
        window.salesManager.clearFilters();
    }
}

function changePage(direction) {
    if (window.salesManager) {
        window.salesManager.changePage(direction);
    }
}

function openStatusModal(saleId, currentStatus) {
    if (window.salesManager) {
        window.salesManager.openStatusModal(saleId, currentStatus);
    }
}

function updateSaleStatus() {
    if (window.salesManager) {
        window.salesManager.updateSaleStatus();
    }
}

function cancelSale(saleId) {
    if (window.salesManager) {
        window.salesManager.cancelSale(saleId);
    }
}

function exportSales() {
    if (window.salesManager) {
        window.salesManager.exportSales();
    }
}

// Inicializar sales manager cuando se carga la página
document.addEventListener('DOMContentLoaded', function () {
    console.log('Inicializando Sales Manager...');
    window.salesManager = new SalesManager();
});