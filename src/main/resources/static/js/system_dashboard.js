// Dashboard functionality
class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadDashboardStats();
        this.loadRecentUsers();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Actualizar estadísticas cada 30 segundos
        setInterval(() => {
            this.loadDashboardStats();
        }, 30000);
    }

    loadDashboardStats() {
        fetch('/system-admin/api/users')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar estadísticas');
                }
                return response.json();
            })
            .then(users => {
                this.updateStats(users);
            })
            .catch(error => {
                console.error('Error:', error);
                this.showError('No se pudieron cargar las estadísticas');
            });
    }

    updateStats(users) {
        const totalUsers = users.length;
        const activeUsers = users.filter(u => u.isActive).length;
        const inactiveUsers = totalUsers - activeUsers;
        const adminUsers = users.filter(u => u.role === 'SUPER_ADMIN' || u.role === 'SYSTEM_ADMIN').length;

        // Animar contadores
        this.animateCounter('totalUsers', totalUsers);
        this.animateCounter('activeUsers', activeUsers);
        this.animateCounter('inactiveUsers', inactiveUsers);
        this.animateCounter('adminUsers', adminUsers);
    }

    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        const currentValue = parseInt(element.textContent) || 0;
        
        if (currentValue === targetValue) return;
        
        const duration = 1000;
        const steps = 60;
        const stepTime = duration / steps;
        const increment = (targetValue - currentValue) / steps;
        let current = currentValue;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= targetValue) || (increment < 0 && current <= targetValue)) {
                element.textContent = targetValue;
                clearInterval(timer);
            } else {
                element.textContent = Math.round(current);
            }
        }, stepTime);
    }

    loadRecentUsers() {
        fetch('/system-admin/api/users')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar usuarios');
                }
                return response.json();
            })
            .then(users => {
                this.displayRecentUsers(users);
            })
            .catch(error => {
                console.error('Error:', error);
                this.showError('No se pudieron cargar los usuarios recientes');
                this.displayErrorState();
            });
    }

    displayRecentUsers(users) {
        const grid = document.getElementById('recentUsersGrid');
        
        // Ordenar por último login (los más recientes primero) y tomar los primeros 6
        const recentUsers = users
            .sort((a, b) => new Date(b.lastLogin || 0) - new Date(a.lastLogin || 0))
            .slice(0, 6);

        if (recentUsers.length === 0) {
            grid.innerHTML = `
                <div class="no-users-message">
                    <i class="fas fa-users-slash"></i>
                    <h3>No hay usuarios registrados</h3>
                    <p>Comienza creando el primer usuario del sistema</p>
                    <a href="/system-admin/users/create" class="btn btn-primary">
                        <i class="fas fa-user-plus"></i> Crear Primer Usuario
                    </a>
                </div>
            `;
            return;
        }

        grid.innerHTML = recentUsers.map(user => this.createUserCard(user)).join('');
        
        // Añadir animaciones a las tarjetas de usuario
        setTimeout(() => {
            const userCards = grid.querySelectorAll('.user-card');
            userCards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
                card.classList.add('fade-in');
            });
        }, 100);
    }

    createUserCard(user) {
        const initials = this.getUserInitials(user.fullName || `${user.firstName} ${user.lastName}`);
        const statusClass = user.isActive ? 'active' : 'inactive';
        const statusText = user.isActive ? 'Activo' : 'Inactivo';
        const lastLogin = user.lastLogin ? this.formatDate(new Date(user.lastLogin)) : 'Nunca';
        
        return `
            <div class="user-card">
                <div class="user-avatar ${statusClass}">
                    ${initials}
                </div>
                <div class="user-info">
                    <h3>${user.fullName || `${user.firstName} ${user.lastName}`}</h3>
                    <a href="mailto:${user.email}" class="user-email">${user.email}</a>
                    <div class="user-meta">
                        <span class="user-role">${user.role}</span>
                        <span class="user-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="user-login">
                        <small><i class="fas fa-sign-in-alt"></i> ${lastLogin}</small>
                    </div>
                </div>
            </div>
        `;
    }

    getUserInitials(fullName) {
        return fullName
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    formatDate(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return 'Hoy';
        } else if (diffDays === 2) {
            return 'Ayer';
        } else if (diffDays <= 7) {
            return `Hace ${diffDays - 1} días`;
        } else {
            return date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }
    }

    displayErrorState() {
        const grid = document.getElementById('recentUsersGrid');
        grid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar usuarios</h3>
                <p>No se pudieron cargar los usuarios recientes</p>
                <button onclick="dashboardManager.loadRecentUsers()" class="btn btn-primary">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
    }

    showError(message) {
        // Crear notificación de error
        const notification = document.createElement('div');
        notification.className = 'alert alert-danger alert-dismissible fade show';
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 2000;
            min-width: 300px;
        `;
        notification.innerHTML = `
            <strong><i class="fas fa-exclamation-circle"></i> Error:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Funciones globales para compatibilidad con el código original
function loadDashboardStats() {
    if (dashboardManager) {
        dashboardManager.loadDashboardStats();
    }
}

function loadRecentUsers() {
    if (dashboardManager) {
        dashboardManager.loadRecentUsers();
    }
}

function showCreateUserModal() {
    // Esta función ya no se usa, redirigimos directamente a la página de creación
    window.location.href = '/system-admin/users/create';
}

function createQuickUser() {
    // Esta función ya no se usa en el nuevo diseño
    console.log('Función createQuickUser no disponible en el nuevo diseño');
}

function loadUserReports() {
    alert('Funcionalidad de reportes en desarrollo');
}

function showSystemLogs() {
    alert('Funcionalidad de logs en desarrollo');
}

// Inicializar dashboard cuando el DOM esté listo
let dashboardManager;

document.addEventListener('DOMContentLoaded', function() {
    dashboardManager = new DashboardManager();
    
    // Agregar estilos adicionales para estados especiales
    const styles = document.createElement('style');
    styles.textContent = `
        .no-users-message, .error-state {
            grid-column: 1 / -1;
            text-align: center;
            padding: 3rem;
            color: var(--gray);
        }
        
        .no-users-message i, .error-state i {
            font-size: 4rem;
            margin-bottom: 1rem;
            color: var(--light-gray);
        }
        
        .no-users-message h3, .error-state h3 {
            color: var(--dark-gray);
            margin-bottom: 1rem;
        }
        
        .alert {
            animation: slideInRight 0.3s ease;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        body.loaded * {
            transition: all 0.3s ease !important;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            border: none;
            border-radius: 25px;
            padding: 0.75rem 1.5rem;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-hover);
        }
    `;
    document.head.appendChild(styles);
});