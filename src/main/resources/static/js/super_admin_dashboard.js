// super_admin_dashboard.js
class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadDashboardStats();
        this.setupEventListeners();
        
        // Actualizar cada 30 segundos
        setInterval(() => this.loadDashboardStats(), 30000);
    }

    async loadDashboardStats() {
        try {
            const response = await fetch('/api/reports/dashboard-stats');
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const stats = await response.json();            
            this.updateStatsDisplay(stats);
            this.generateAlerts(stats);
            
        } catch (error) {
            this.showError('Error al cargar las estadísticas del dashboard');
        }
    }

    updateStatsDisplay(stats) {
        
        const elementsMap = {
            'total-products': stats.totalProducts || 0,
            'active-products': stats.activeProducts || 0,
            'low-stock-products': stats.lowStockProducts || 0,
            'out-of-stock-products': stats.outOfStockProducts || 0,
            'total-customers': stats.totalCustomers || 0,
            'total-managers': stats.totalManagers || 0
        };

        Object.entries(elementsMap).forEach(([elementId, value]) => {
            const element = document.getElementById(elementId);
            if (element) {
                this.animateValue(element, 0, value, ADMIN_CONFIG.ANIMATION_DURATION);
            } else {
                console.warn(`Elemento no encontrado: ${elementId}`);
            }
        });
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

    generateAlerts(stats) {
        const alertsContainer = document.getElementById('alerts-container');
        let alertsHTML = '';

        if (stats.lowStockProducts > 0) {
            alertsHTML += `
                <div class="alert-item alert-warning">
                    <div class="alert-header">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div class="alert-title">Stock Bajo</div>
                    </div>
                    <div class="alert-message">
                        Tienes <strong>${stats.lowStockProducts} productos</strong> con stock bajo que necesitan atención inmediata.
                    </div>
                    <a href="/super-admin/inventory" class="alert-link">Revisar inventario →</a>
                </div>
            `;
        }

        if (stats.outOfStockProducts > 0) {
            alertsHTML += `
                <div class="alert-item alert-danger">
                    <div class="alert-header">
                        <i class="fas fa-times-circle"></i>
                        <div class="alert-title">Productos Agotados</div>
                    </div>
                    <div class="alert-message">
                        <strong>${stats.outOfStockProducts} productos</strong> están completamente agotados. Es necesario reabastecer el inventario.
                    </div>
                    <a href="/super-admin/inventory" class="alert-link">Reabastecer productos →</a>
                </div>
            `;
        }

        if (stats.activeProducts === 0) {
            alertsHTML += `
                <div class="alert-item alert-info">
                    <div class="alert-header">
                        <i class="fas fa-info-circle"></i>
                        <div class="alert-title">Sin Productos Activos</div>
                    </div>
                    <div class="alert-message">
                        No hay productos activos disponibles para la venta en este momento.
                    </div>
                    <a href="/super-admin/products" class="alert-link">Crear productos →</a>
                </div>
            `;
        }

        if (!alertsHTML) {
            alertsHTML = `
                <div class="alert-item alert-success">
                    <div class="alert-header">
                        <i class="fas fa-check-circle"></i>
                        <div class="alert-title">¡Todo en Orden!</div>
                    </div>
                    <div class="alert-message">
                        No hay alertas críticas en este momento. Tu tienda está funcionando perfectamente.
                    </div>
                </div>
            `;
        }

        alertsContainer.innerHTML = alertsHTML;
        
        setTimeout(() => {
            const alertItems = alertsContainer.querySelectorAll('.alert-item');
            alertItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '0';
                    item.style.transform = 'translateX(-20px)';
                    item.offsetHeight;
                    item.style.transition = 'all 0.5s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                }, index * 200);
            });
        }, 100);
    }

    setupEventListeners() {
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

        const actionCards = document.querySelectorAll('.action-card');
        actionCards.forEach(card => {
            card.addEventListener('click', (e) => {
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 150);
            });
        });

        initializeScrollAnimations();
    }

    showError(message) {
        const alertsContainer = document.getElementById('alerts-container');
        alertsContainer.innerHTML = `
            <div class="alert-item alert-danger">
                <div class="alert-header">
                    <i class="fas fa-exclamation-circle"></i>
                    <div class="alert-title">Error</div>
                </div>
                <div class="alert-message">${message}</div>
                <button onclick="location.reload()" class="alert-link">Reintentar →</button>
            </div>
        `;
    }
}

// Funciones globales para compatibilidad
function loadLowStockProducts() {
    window.location.href = '/super-admin/inventory?filter=low-stock';
}

function showReports() {
    window.location.href = '/super-admin/reports';
}

document.addEventListener('DOMContentLoaded', function() {
    window.dashboardManager = new DashboardManager();
});

// Manejo de errores globales
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
});