// reports.js - Gestión de reportes y estadísticas
class ReportsManager {
    constructor() {
        this.charts = {
            salesByStatus: null,
            inventoryStatus: null,
            salesTrend: null,
            topProducts: null
        };
        this.currentReportData = null;
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.setDefaultDates();
        this.loadQuickStats();
        this.loadChartsData();
        this.initializeScrollAnimations();
        
        this.isInitialized = true;
                
        // Actualizar cada 60 segundos
        setInterval(() => {
            this.loadQuickStats();
            this.loadChartsData();
        }, 60000);
    }

    setupEventListeners() {
        try {
            const reportType = document.getElementById('reportType');
            if (reportType) {
                reportType.addEventListener('change', () => {
                    this.toggleDateFilters();
                    this.setDefaultDates();
                });
            }

            // Event listeners para filtros de fecha
            ['startDate', 'endDate', 'month'].forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.addEventListener('change', () => this.debouncedLoadReport());
                }
            });

        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    debouncedLoadReport = this.debounce(() => {
        this.loadReport();
    }, 500);

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    setDefaultDates() {
        try {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            const formatDate = (date) => date.toISOString().split('T')[0];
            
            const startDate = document.getElementById('startDate');
            const endDate = document.getElementById('endDate');
            const month = document.getElementById('month');
            
            if (startDate) startDate.value = formatDate(firstDay);
            if (endDate) endDate.value = formatDate(lastDay);
            if (month) month.value = today.toISOString().substring(0, 7);

        } catch (error) {
            console.error('Error setting default dates:', error);
        }
    }

    toggleDateFilters() {
        try {
            const reportType = document.getElementById('reportType').value;
            const dateGroup = document.getElementById('startDateGroup');
            const endDateGroup = document.getElementById('endDateGroup');
            const monthGroup = document.getElementById('monthGroup');

            if (reportType === 'monthly') {
                if (dateGroup) dateGroup.style.display = 'none';
                if (endDateGroup) endDateGroup.style.display = 'none';
                if (monthGroup) monthGroup.style.display = 'block';
            } else {
                if (dateGroup) dateGroup.style.display = 'block';
                if (endDateGroup) endDateGroup.style.display = 'block';
                if (monthGroup) monthGroup.style.display = 'none';
            }
        } catch (error) {
            console.error('Error toggling date filters:', error);
        }
    }

    async loadQuickStats() {
        try {
            this.showLoading(true, 'Cargando estadísticas...');
            const response = await fetch('/api/reports/quick-stats');
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const stats = await response.json();
            this.displayQuickStats(stats);
            
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            this.displayQuickStats(this.getDefaultStats());
            this.showAlert('Error al cargar las estadísticas rápidas', 'warning');
        } finally {
            this.showLoading(false);
        }
    }

    async loadChartsData() {
        try {
            const response = await fetch('/api/reports/charts-data');
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const chartsData = await response.json();
            this.createAllCharts(chartsData);
            
        } catch (error) {
            this.createAllCharts(this.getDefaultChartsData());
        }
    }

    getDefaultStats() {
        return {
            totalSales: 0,
            totalRevenue: 0,
            totalProducts: 0,
            activeProducts: 0,
            lowStockProducts: 0,
            outOfStockProducts: 0,
            pendingSales: 0
        };
    }

    getDefaultChartsData() {
        const currentDate = new Date();
        const months = [];
        
        // Generar últimos 6 meses
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
            months.push(`${monthName} ${date.getFullYear()}`);
        }

        const monthlySales = {};
        months.forEach(month => {
            monthlySales[month] = 0;
        });

        return {
            stockDistribution: {
                "Sin Stock": 0,
                "Stock Crítico": 0,
                "Stock Bajo": 0,
                "Stock Normal": 0,
                "Stock Excelente": 0
            },
            monthlySalesTrend: monthlySales,
            productsByCategory: {
                "Sin Categoría": 0
            },
            productStatus: {
                "Activos": 0,
                "Inactivos": 0
            },
            salesByStatus: {
                "PENDING": 0,
                "CONFIRMED": 0,
                "PAID": 0,
                "DELIVERED": 0,
                "CANCELLED": 0
            },
            topProducts: []
        };
    }

    displayQuickStats(stats) {
        const container = document.getElementById('quickStats');
        if (!container) {
            console.error('Quick stats container not found');
            return;
        }
        
        const statsData = [
            {
                icon: 'shopping-cart',
                value: stats.totalSales || 0,
                label: 'Ventas Totales',
                type: 'primary'
            },
            {
                icon: 'dollar-sign',
                value: `$${this.formatCurrency(stats.totalRevenue || 0)}`,
                label: 'Ingresos Totales',
                type: 'success'
            },
            {
                icon: 'box',
                value: stats.totalProducts || 0,
                label: 'Total Productos',
                type: 'info'
            },
            {
                icon: 'check-circle',
                value: stats.activeProducts || 0,
                label: 'Productos Activos',
                type: 'success'
            },
            {
                icon: 'exclamation-triangle',
                value: stats.lowStockProducts || 0,
                label: 'Stock Bajo',
                type: 'warning'
            },
            {
                icon: 'times-circle',
                value: stats.outOfStockProducts || 0,
                label: 'Sin Stock',
                type: 'danger'
            }
        ];

        container.innerHTML = statsData.map(stat => `
            <div class="stat-card fade-in">
                <div class="stat-icon ${stat.type}">
                    <i class="fas fa-${stat.icon}"></i>
                </div>
                <div class="stat-content">
                    <h3 class="stat-number">${stat.value}</h3>
                    <p class="stat-label">${stat.label}</p>
                </div>
            </div>
        `).join('');

        // Animar la aparición
        setTimeout(() => {
            document.querySelectorAll('.fade-in').forEach((el, index) => {
                setTimeout(() => {
                    el.classList.add('visible');
                }, index * 100);
            });
        }, 100);
    }

    createAllCharts(chartsData) {
        this.createSalesByStatusChart(chartsData);
        this.createInventoryStatusChart(chartsData);
        this.createSalesTrendChart(chartsData);
        this.createTopProductsChart(chartsData);
    }

    createSalesByStatusChart(chartsData) {
        const canvas = document.getElementById('salesByStatusChart');
        if (!canvas) {
            console.warn('Sales by status chart canvas not found');
            return;
        }

        // Destruir chart anterior si existe
        if (this.charts.salesByStatus) {
            this.charts.salesByStatus.destroy();
        }

        const salesData = chartsData.salesByStatus || {};

        const labels = ['Pendientes', 'Confirmadas', 'Pagadas', 'Entregadas', 'Canceladas'];
        const data = [
            salesData.PENDING || 0,
            salesData.CONFIRMED || 0,
            salesData.PAID || 0,
            salesData.DELIVERED || 0,
            salesData.CANCELLED || 0
        ];

        // Verificar si hay datos para mostrar
        const hasData = data.some(value => value > 0);

        if (hasData) {
            const ctx = canvas.getContext('2d');
            this.charts.salesByStatus = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: [
                            '#ffc107', '#17a2b8', '#007bff', '#28a745', '#dc3545'
                        ],
                        borderWidth: 3,
                        borderColor: '#fff',
                        hoverBorderWidth: 4,
                        hoverBorderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                font: {
                                    size: 11
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    },
                    cutout: '60%',
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    }
                }
            });
        } else {
            this.showNoDataMessage(canvas, 'No hay datos de ventas disponibles');
        }
    }

    createInventoryStatusChart(chartsData) {
        const canvas = document.getElementById('inventoryStatusChart');
        if (!canvas) {
            console.warn('Inventory status chart canvas not found');
            return;
        }

        if (this.charts.inventoryStatus) {
            this.charts.inventoryStatus.destroy();
        }

        // Obtener datos del dashboard stats en lugar de chartsData
        const inventoryData = [
            chartsData.totalProducts || 0,  // Total de productos
            chartsData.activeProducts || 0, // Productos activos
            chartsData.lowStockProducts || 0, // Stock bajo
            chartsData.outOfStockProducts || 0 // Sin stock
        ];

        const hasData = inventoryData.some(value => value > 0);

        if (hasData) {
            const ctx = canvas.getContext('2d');
            this.charts.inventoryStatus = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Total', 'Activos', 'Stock Bajo', 'Sin Stock'],
                    datasets: [{
                        label: 'Cantidad de Productos',
                        data: inventoryData,
                        backgroundColor: [
                            '#6A2FB4', '#4CAF50', '#FF9800', '#f44336'
                        ],
                        borderColor: [
                            '#5A2A9D', '#45a049', '#f57c00', '#e53935'
                        ],
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                precision: 0
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeOutQuart'
                    }
                }
            });
        } else {
            this.showNoDataMessage(canvas, 'No hay datos de inventario disponibles');
        }
    }

    createSalesTrendChart(chartsData) {
        const canvas = document.getElementById('salesTrendChart');
        if (!canvas) {
            console.warn('Sales trend chart canvas not found');
            return;
        }

        if (this.charts.salesTrend) {
            this.charts.salesTrend.destroy();
        }

        const monthlySales = chartsData.monthlySalesTrend || {};
        const labels = Object.keys(monthlySales);
        const data = Object.values(monthlySales).map(value => 
            typeof value === 'number' ? value : parseFloat(value) || 0
        );

        const hasData = data.some(value => value > 0);

        if (hasData) {
            const ctx = canvas.getContext('2d');
            this.charts.salesTrend = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Ingresos Mensuales',
                        data: data,
                        borderColor: '#6A2FB4',
                        backgroundColor: 'rgba(106, 47, 180, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#6A2FB4',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                callback: (value) => `$${this.formatCurrency(value)}`
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    return `Ingresos: $${this.formatCurrency(context.raw)}`;
                                }
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeOutQuart'
                    }
                }
            });
        } else {
            this.showNoDataMessage(canvas, 'No hay datos de tendencia disponibles');
        }
    }

    createTopProductsChart(chartsData) {
        const canvas = document.getElementById('topProductsChart');
        if (!canvas) {
            console.warn('Top products chart canvas not found');
            return;
        }

        if (this.charts.topProducts) {
            this.charts.topProducts.destroy();
        }

        const topProductsData = chartsData.topProducts || [];

        if (topProductsData.length > 0) {
            const labels = topProductsData.map(item => {
                // Acortar nombres largos para mejor visualización
                const name = item.name || 'Producto Desconocido';
                return name.length > 25 ? name.substring(0, 25) + '...' : name;
            });
            const data = topProductsData.map(item => item.sales || 0);

            const ctx = canvas.getContext('2d');
            this.charts.topProducts = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Unidades Vendidas',
                        data: data,
                        backgroundColor: '#6A2FB4',
                        borderColor: '#5A2A9D',
                        borderWidth: 2,
                        borderRadius: 6,
                        borderSkipped: false,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                        x: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                precision: 0,
                                callback: function(value) {
                                    return value.toLocaleString(); // Formato con separadores de miles
                                }
                            }
                        },
                        y: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    size: 11
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                title: (context) => {
                                    const index = context[0].dataIndex;
                                    return topProductsData[index].name || 'Producto Desconocido';
                                },
                                label: (context) => {
                                    return `Vendidos: ${context.raw.toLocaleString()} unidades`;
                                }
                            }
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeOutQuart'
                    }
                }
            });
        } else {
            this.showNoDataMessage(canvas, 'No hay datos de productos vendidos disponibles');
        }
    }

    showNoDataMessage(canvasElement, message = 'No hay datos disponibles') {
        const container = canvasElement.parentElement;
        container.innerHTML = `
            <div class="no-data-message">
                <i class="fas fa-chart-bar fa-2x mb-3 text-muted"></i>
                <p class="text-muted mb-0">${message}</p>
            </div>
        `;
    }

    async loadReport() {
        const reportType = document.getElementById('reportType').value;
        let url = '/api/reports/';
        let params = '';

        try {
            this.showLoading(true, 'Generando reporte...');

            if (reportType === 'sales') {
                const startDate = document.getElementById('startDate').value;
                const endDate = document.getElementById('endDate').value;
                if (!startDate || !endDate) {
                    this.showAlert('Por favor selecciona un rango de fechas', 'warning');
                    this.showLoading(false);
                    return;
                }
                url += 'sales';
                params = `?startDate=${startDate}&endDate=${endDate}`;
            } else if (reportType === 'inventory') {
                url += 'inventory';
            } else if (reportType === 'monthly') {
                const month = document.getElementById('month').value;
                if (!month) {
                    this.showAlert('Por favor selecciona un mes', 'warning');
                    this.showLoading(false);
                    return;
                }
                const [year, monthNum] = month.split('-');
                url += 'monthly-sales';
                params = `?year=${year}&month=${monthNum}`;
            } else if (reportType === 'performance') {
                url = '/api/reports/dashboard-stats';
            }

            const response = await fetch(url + params);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            this.currentReportData = data;
            this.displayReportData(data, reportType);
            this.showAlert('Reporte generado exitosamente', 'success');
            
        } catch (error) {
            console.error('Error cargando reporte:', error);
            this.showAlert('Error generando el reporte', 'danger');
            this.displayReportData({}, reportType);
        } finally {
            this.showLoading(false);
        }
    }

    displayReportData(data, reportType) {
        const container = document.getElementById('reportData');
        if (!container) {
            console.error('Report data container not found');
            return;
        }

        let html = '';

        if (reportType === 'sales') {
            html = this.createSalesReportHTML(data);
        } else if (reportType === 'inventory') {
            html = this.createInventoryReportHTML(data);
        } else if (reportType === 'monthly') {
            html = this.createMonthlyReportHTML(data);
        } else if (reportType === 'performance') {
            html = this.createPerformanceReportHTML(data);
        } else {
            html = this.createEmptyReportHTML();
        }

        container.innerHTML = html;

        // Animar la aparición de los elementos
        setTimeout(() => {
            container.querySelectorAll('.fade-in').forEach((el, index) => {
                setTimeout(() => {
                    el.classList.add('visible');
                }, index * 100);
            });
        }, 100);
    }

    createSalesReportHTML(data) {
        const totalSales = data.totalSalesInRange || 0;
        const revenue = data.revenueInRange || 0;
        const salesByStatus = data.salesByStatus || {};

        const hasSalesData = totalSales > 0 || revenue > 0;
        const hasStatusData = Object.keys(salesByStatus).length > 0;

        if (!hasSalesData && !hasStatusData) {
            return this.createEmptyStateHTML('No hay datos de ventas para el período seleccionado');
        }

        return `
            <div class="fade-in">
                <div class="mb-4">
                    <h5 class="text-primary">📊 Reporte de Ventas</h5>
                    <p class="text-muted">
                        <strong>Período:</strong> ${document.getElementById('startDate').value} a ${document.getElementById('endDate').value}
                    </p>
                </div>
                
                <div class="metrics-grid mb-4">
                    <div class="metric-card fade-in">
                        <div class="metric-value">${totalSales}</div>
                        <div class="metric-label">Ventas Totales</div>
                    </div>
                    <div class="metric-card fade-in">
                        <div class="metric-value">$${this.formatCurrency(revenue)}</div>
                        <div class="metric-label">Ingresos Totales</div>
                    </div>
                </div>

                ${hasStatusData ? `
                    <div class="fade-in">
                        <h6 class="mb-3 text-dark">📈 Ventas por Estado</h6>
                        <div class="table-responsive">
                            <table class="report-table">
                                <thead>
                                    <tr>
                                        <th>Estado</th>
                                        <th>Cantidad</th>
                                        <th>Porcentaje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.entries(salesByStatus).map(([status, count]) => `
                                        <tr class="fade-in">
                                            <td>${this.getStatusText(status)}</td>
                                            <td><strong>${count}</strong></td>
                                            <td>${totalSales > 0 ? ((count / totalSales) * 100).toFixed(1) + '%' : '0%'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : '<p class="text-muted text-center">No hay datos de estado de ventas disponibles</p>'}
            </div>
        `;
    }

    createInventoryReportHTML(data) {
        const hasData = data.totalProducts > 0 || data.activeProducts > 0;

        if (!hasData) {
            return this.createEmptyStateHTML('No hay datos de inventario disponibles');
        }

        return `
            <div class="fade-in">
                <div class="mb-4">
                    <h5 class="text-primary">📦 Reporte de Inventario</h5>
                    <p class="text-muted">Estado actual del inventario</p>
                </div>
                
                <div class="metrics-grid mb-4">
                    <div class="metric-card fade-in">
                        <div class="metric-value">${data.totalProducts || 0}</div>
                        <div class="metric-label">Total Productos</div>
                    </div>
                    <div class="metric-card fade-in">
                        <div class="metric-value">${data.activeProducts || 0}</div>
                        <div class="metric-label">Productos Activos</div>
                    </div>
                    <div class="metric-card fade-in">
                        <div class="metric-value">${data.lowStockProducts || 0}</div>
                        <div class="metric-label">Stock Bajo</div>
                    </div>
                    <div class="metric-card fade-in">
                        <div class="metric-value">${data.outOfStockProducts || 0}</div>
                        <div class="metric-label">Sin Stock</div>
                    </div>
                </div>

                ${data.inactiveProducts ? `
                    <div class="metric-card fade-in">
                        <div class="metric-value">${data.inactiveProducts}</div>
                        <div class="metric-label">Productos Inactivos</div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    createMonthlyReportHTML(data) {
        const hasData = data.totalSalesInRange > 0 || data.revenueInRange > 0;

        if (!hasData) {
            return this.createEmptyStateHTML('No hay datos mensuales disponibles');
        }

        return `
            <div class="fade-in">
                <div class="mb-4">
                    <h5 class="text-primary">📅 Reporte Mensual</h5>
                    <p class="text-muted">
                        <strong>Mes:</strong> ${document.getElementById('month').value}
                    </p>
                </div>
                
                <div class="metrics-grid mb-4">
                    <div class="metric-card fade-in">
                        <div class="metric-value">${data.totalSalesInRange || 0}</div>
                        <div class="metric-label">Ventas del Mes</div>
                    </div>
                    <div class="metric-card fade-in">
                        <div class="metric-value">$${this.formatCurrency(data.revenueInRange || 0)}</div>
                        <div class="metric-label">Ingresos del Mes</div>
                    </div>
                </div>

                ${data.salesByStatus ? `
                    <div class="fade-in">
                        <h6 class="mb-3 text-dark">📊 Distribución por Estado</h6>
                        <div class="table-responsive">
                            <table class="report-table">
                                <thead>
                                    <tr>
                                        <th>Estado</th>
                                        <th>Cantidad</th>
                                        <th>Porcentaje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.entries(data.salesByStatus).map(([status, count]) => `
                                        <tr class="fade-in">
                                            <td>${this.getStatusText(status)}</td>
                                            <td><strong>${count}</strong></td>
                                            <td>${data.totalSalesInRange > 0 ? ((count / data.totalSalesInRange) * 100).toFixed(1) + '%' : '0%'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    createPerformanceReportHTML(data) {
        const hasData = data.totalSales > 0 || data.totalRevenue > 0;

        if (!hasData) {
            return this.createEmptyStateHTML('No hay datos de rendimiento disponibles');
        }

        return `
            <div class="fade-in">
                <div class="mb-4">
                    <h5 class="text-primary">🚀 Reporte de Rendimiento</h5>
                    <p class="text-muted">Métricas de desempeño general</p>
                </div>
                
                <div class="metrics-grid mb-4">
                    <div class="metric-card fade-in">
                        <div class="metric-value">${data.totalSales || 0}</div>
                        <div class="metric-label">Ventas Totales</div>
                    </div>
                    <div class="metric-card fade-in">
                        <div class="metric-value">$${this.formatCurrency(data.totalRevenue || 0)}</div>
                        <div class="metric-label">Ingresos Totales</div>
                    </div>
                    <div class="metric-card fade-in">
                        <div class="metric-value">${data.activeProducts || 0}</div>
                        <div class="metric-label">Productos Activos</div>
                    </div>
                    <div class="metric-card fade-in">
                        <div class="metric-value">${data.lowStockProducts || 0}</div>
                        <div class="metric-label">Stock Bajo</div>
                    </div>
                </div>

                ${data.todayRevenue ? `
                    <div class="metric-card fade-in">
                        <div class="metric-value">$${this.formatCurrency(data.todayRevenue)}</div>
                        <div class="metric-label">Ingresos de Hoy</div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    createEmptyReportHTML() {
        return this.createEmptyStateHTML('Selecciona un tipo de reporte y haz clic en "Generar Reporte"');
    }

    createEmptyStateHTML(message) {
        return `
            <div class="empty-state">
                <i class="fas fa-chart-bar fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No hay datos para mostrar</h5>
                <p class="text-muted">${message}</p>
            </div>
        `;
    }

    // Métodos utilitarios
    formatCurrency(amount) {
        if (typeof amount !== 'number') {
            amount = parseFloat(amount) || 0;
        }
        return new Intl.NumberFormat('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    getStatusText(status) {
        const statusMap = {
            'PENDING': '⏳ Pendiente',
            'CONFIRMED': '✅ Confirmada',
            'PAID': '💰 Pagada',
            'DELIVERED': '🚚 Entregada',
            'CANCELLED': '❌ Cancelada'
        };
        return statusMap[status] || status;
    }

    showLoading(show, message = 'Cargando...') {
        // Buscar o crear elemento de loading
        let loadingEl = document.getElementById('reports-loading');
        
        if (show) {
            if (!loadingEl) {
                loadingEl = document.createElement('div');
                loadingEl.id = 'reports-loading';
                loadingEl.className = 'loading-overlay';
                loadingEl.innerHTML = `
                    <div class="loading-content">
                        <div class="loading-spinner"></div>
                        <p class="loading-text">${message}</p>
                    </div>
                `;
                document.body.appendChild(loadingEl);
            }
            loadingEl.style.display = 'flex';
        } else if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }

    showAlert(message, type = 'info') {
        // Buscar o crear contenedor de alertas
        let alertContainer = document.getElementById('reports-alert-container');
        
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.id = 'reports-alert-container';
            alertContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9998;
                max-width: 400px;
            `;
            document.body.appendChild(alertContainer);
        }

        const alertId = 'alert-' + Date.now();
        const alertEl = document.createElement('div');
        alertEl.id = alertId;
        alertEl.className = `alert alert-${type} alert-dismissible fade show`;
        alertEl.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        alertContainer.appendChild(alertEl);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                alert.remove();
            }
        }, 5000);
    }

    initializeScrollAnimations() {
        // Implementación básica de animaciones al hacer scroll
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

        // Observar todos los elementos con clase fade-in
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.reportsManager = new ReportsManager();
});

// Funciones globales para compatibilidad con HTML
function generateReport() {
    if (window.reportsManager) {
        window.reportsManager.loadReport();
    } else {
        console.error('ReportsManager not initialized');
    }
}

function downloadChart(chartId) {
    const canvas = document.getElementById(chartId);
    if (canvas) {
        try {
            const link = document.createElement('a');
            link.download = `chart-${chartId}-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading chart:', error);
            alert('Error al descargar el gráfico');
        }
    } else {
        console.error('Chart canvas not found:', chartId);
    }
}

function loadReport() {
    if (window.reportsManager) {
        window.reportsManager.loadReport();
    } else {
        console.error('ReportsManager not initialized');
    }
}

function toggleDateFilters() {
    if (window.reportsManager) {
        window.reportsManager.toggleDateFilters();
    } else {
        console.error('ReportsManager not initialized');
    }
}