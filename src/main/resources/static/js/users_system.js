class UsersManager {
    constructor() {
        this.allUsers = [];
        this.currentUserId = null;
        this.currentUserData = null;
        this.init();
    }

    init() {
        this.loadUsers();
        this.setupEventListeners();
        this.setupRealTimeStats();
        this.setupModalEventListeners();
    }

    setupModalEventListeners() {
        // Modal de cambio de estado
        document.getElementById('confirmStatusChange').addEventListener('click', () => {
            this.confirmStatusChange();
        });

        // Modal de cambio de rol
        document.getElementById('confirmRoleChange').addEventListener('click', () => {
            this.confirmRoleChange();
        });

        // Selección de roles
        document.querySelectorAll('.role-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectRoleOption(e.currentTarget);
            });
        });

        // Limpiar selecciones al cerrar modales
        document.getElementById('changeStatusModal').addEventListener('hidden.bs.modal', () => {
            this.currentUserId = null;
            this.currentUserData = null;
        });

        document.getElementById('changeRoleModal').addEventListener('hidden.bs.modal', () => {
            this.currentUserId = null;
            this.currentUserData = null;
            document.getElementById('confirmRoleChange').disabled = true;
        });
    }

    setupEventListeners() {
        // Búsqueda en tiempo real
        document.getElementById('searchInput').addEventListener('input', () => {
            this.applyFilters();
        });

        // Filtros en tiempo real
        document.getElementById('roleFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('statusFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        // Actualizar cada 30 segundos
        setInterval(() => {
            this.loadUsers();
        }, 30000);
    }

    setupRealTimeStats() {
        // Actualizar estadísticas cada 10 segundos
        setInterval(() => {
            this.updateStats(this.allUsers);
        }, 10000);
    }

    loadUsers() {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="loading-state">
                    <div class="loader-spinner"></div>
                    <p>Cargando usuarios...</p>
                </td>
            </tr>
        `;

        fetch('/system-admin/api/users')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar usuarios');
                }
                return response.json();
            })
            .then(users => {
                this.allUsers = users;
                this.updateStats(users);
                this.applyFilters();
            })
            .catch(error => {
                console.error('Error:', error);
                this.showError('No se pudieron cargar los usuarios');
                this.displayErrorState();
            });
    }

    updateStats(users) {
        const totalUsers = users.length;
        const activeUsers = users.filter(u => u.isActive).length;
        const inactiveUsers = totalUsers - activeUsers;
        const adminUsers = users.filter(u => u.role === 'SUPER_ADMIN' || u.role === 'SYSTEM_ADMIN').length;

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

    applyFilters() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const roleFilter = document.getElementById('roleFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;

        let filteredUsers = this.allUsers.filter(user => {
            const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
            const matchesSearch = fullName.toLowerCase().includes(searchTerm) || 
                                user.email.toLowerCase().includes(searchTerm);
            const matchesRole = !roleFilter || user.role === roleFilter;
            const matchesStatus = !statusFilter || 
                                (statusFilter === 'active' && user.isActive) ||
                                (statusFilter === 'inactive' && !user.isActive);
            
            return matchesSearch && matchesRole && matchesStatus;
        });

        this.displayUsers(filteredUsers);
    }

    displayUsers(users) {
        const tbody = document.getElementById('usersTableBody');
        const countElement = document.getElementById('usersCount');
        
        countElement.textContent = users.length;
        
        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <i class="fas fa-users-slash fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">No se encontraron usuarios</h5>
                        <p class="text-muted">Intenta ajustar los filtros de búsqueda</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.classList.add('fade-in');
            
            const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
            const initials = this.getUserInitials(fullName);
            
            row.innerHTML = `
                <td>
                    <div class="user-info-cell">
                        <div class="user-avatar">${initials}</div>
                        <div class="user-details">
                            <h4>${fullName}</h4>
                            <p>${user.email}</p>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="contact-info">
                        <p><i class="fas fa-phone"></i> ${user.phone || 'No especificado'}</p>
                        <p><i class="fas fa-calendar"></i> ${user.lastLogin ? this.formatDate(new Date(user.lastLogin)) : 'Nunca'}</p>
                    </div>
                </td>
                <td>
                    <span class="badge bg-primary">${user.role}</span>
                </td>
                <td>
                    <span class="badge ${user.isActive ? 'bg-success' : 'bg-danger'}">
                        ${user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    <br>
                    <small class="text-muted">
                        ${user.emailVerified ? '✓ Email verificado' : '✗ Email no verificado'}
                    </small>
                </td>
                <td>
                    <div class="activity-info">
                        <strong>${user.lastLogin ? this.formatDate(new Date(user.lastLogin)) : 'Nunca'}</strong>
                        <br>
                        <small class="text-muted">
                            Creado: ${user.createdAt ? this.formatDate(new Date(user.createdAt)) : 'N/A'}
                        </small>
                    </div>
                </td>
                <td>
                    <div class="user-actions">
                        <button class="btn-action-sm btn-info" onclick="usersManager.viewUser(${user.id})" title="Ver Información">
                            <i class="fas fa-eye"></i>
                        </button>
                        <a href="/system-admin/users/edit/${user.id}" class="btn-action-sm btn-warning" title="Editar">
                            <i class="fas fa-edit"></i>
                        </a>
                        <button class="btn-action-sm ${user.isActive ? 'btn-danger' : 'btn-success'}" 
                                onclick="usersManager.toggleUserStatus(${user.id})" 
                                title="${user.isActive ? 'Desactivar' : 'Activar'}">
                            <i class="fas ${user.isActive ? 'fa-ban' : 'fa-check'}"></i>
                        </button>
                        <button class="btn-action-sm btn-secondary" onclick="usersManager.changeUserRole(${user.id})" title="Cambiar Rol">
                            <i class="fas fa-user-tag"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
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

    viewUser(id) {
        fetch(`/system-admin/api/users/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Usuario no encontrado');
                }
                return response.json();
            })
            .then(user => {
                this.populateUserModal(user);
                const modal = new bootstrap.Modal(document.getElementById('viewUserModal'));
                modal.show();
            })
            .catch(error => {
                console.error('Error:', error);
                this.showError('Error al cargar información del usuario: ' + error.message);
            });
    }

    populateUserModal(user) {
        const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
        const initials = this.getUserInitials(fullName);

        // Avatar
        document.getElementById('viewUserAvatar').textContent = initials;

        // Header
        document.getElementById('viewFullName').textContent = fullName;
        document.getElementById('viewEmail').textContent = user.email;

        // Badges
        const roleBadge = document.getElementById('viewRole');
        roleBadge.textContent = user.role;
        roleBadge.className = 'badge bg-primary';
        
        const statusBadge = document.getElementById('viewStatus');
        statusBadge.textContent = user.isActive ? 'Activo' : 'Inactivo';
        statusBadge.className = user.isActive ? 'badge bg-success' : 'badge bg-danger';

        // Información básica
        document.getElementById('viewUserId').textContent = user.id;
        document.getElementById('viewFullNameText').textContent = fullName;
        document.getElementById('viewEmailText').textContent = user.email;
        
        const roleTextBadge = document.getElementById('viewRoleText');
        roleTextBadge.textContent = user.role;
        roleTextBadge.className = 'badge bg-primary';

        // Información de contacto
        document.getElementById('viewPhone').textContent = user.phone || 'No especificado';
        document.getElementById('viewAlternatePhone').textContent = user.alternatePhone || 'No especificado';
        document.getElementById('viewDateOfBirth').textContent = user.dateOfBirth ? 
            new Date(user.dateOfBirth).toLocaleDateString() : 'No especificado';
        document.getElementById('viewGender').textContent = user.gender ? 
            this.formatGender(user.gender) : 'No especificado';

        // Verificación y seguridad
        const emailVerifiedBadge = document.getElementById('viewEmailVerified');
        emailVerifiedBadge.textContent = user.emailVerified ? 'Sí' : 'No';
        emailVerifiedBadge.className = user.emailVerified ? 'badge bg-success' : 'badge bg-secondary';
        
        const phoneVerifiedBadge = document.getElementById('viewPhoneVerified');
        phoneVerifiedBadge.textContent = user.phoneVerified ? 'Sí' : 'No';
        phoneVerifiedBadge.className = user.phoneVerified ? 'badge bg-success' : 'badge bg-secondary';
        
        document.getElementById('viewFailedAttempts').textContent = user.failedLoginAttempts || 0;
        
        const accountLockedBadge = document.getElementById('viewAccountLocked');
        accountLockedBadge.textContent = user.accountLocked ? 'Sí' : 'No';
        accountLockedBadge.className = user.accountLocked ? 'badge bg-danger' : 'badge bg-success';

        // Configuraciones
        const emailNotifBadge = document.getElementById('viewEmailNotifications');
        emailNotifBadge.textContent = user.emailNotifications ? 'Activado' : 'Desactivado';
        emailNotifBadge.className = user.emailNotifications ? 'badge bg-success' : 'badge bg-secondary';
        
        const smsNotifBadge = document.getElementById('viewSmsNotifications');
        smsNotifBadge.textContent = user.smsNotifications ? 'Activado' : 'Desactivado';
        smsNotifBadge.className = user.smsNotifications ? 'badge bg-success' : 'badge bg-secondary';
        
        const newsletterBadge = document.getElementById('viewNewsletter');
        newsletterBadge.textContent = user.newsletterSubscription ? 'Activado' : 'Desactivado';
        newsletterBadge.className = user.newsletterSubscription ? 'badge bg-success' : 'badge bg-secondary';

        // Auditoría
        document.getElementById('viewCreatedAt').textContent = user.createdAt ? 
            new Date(user.createdAt).toLocaleString() : 'No disponible';
        document.getElementById('viewCreatedBy').textContent = user.createdBy || 'Sistema';
        document.getElementById('viewUpdatedAt').textContent = user.updatedAt ? 
            new Date(user.updatedAt).toLocaleString() : 'No actualizado';
        document.getElementById('viewLastLogin').textContent = user.lastLogin ? 
            new Date(user.lastLogin).toLocaleString() : 'Nunca';
    }

    formatGender(gender) {
        const genderMap = {
            'MALE': 'Masculino',
            'FEMALE': 'Femenino', 
            'OTHER': 'Otro'
        };
        return genderMap[gender] || gender;
    }

    toggleUserStatus(id) {
        const user = this.allUsers.find(u => u.id === id);
        if (!user) return;

        this.currentUserId = id;
        this.currentUserData = user;
        this.showStatusChangeModal(user);
    }

    showStatusChangeModal(user) {
        const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
        const initials = this.getUserInitials(fullName);
        const newStatus = !user.isActive;

        // Configurar el modal
        document.getElementById('statusUserAvatar').textContent = initials;
        document.getElementById('statusUserName').textContent = fullName;
        document.getElementById('statusUserEmail').textContent = user.email;

        // Estado actual
        const currentStatusBadge = document.getElementById('currentStatusBadge');
        currentStatusBadge.textContent = user.isActive ? 'Activo' : 'Inactivo';
        currentStatusBadge.className = user.isActive ? 'badge bg-success' : 'badge bg-danger';

        // Nuevo estado
        const newStatusBadge = document.getElementById('newStatusBadge');
        newStatusBadge.textContent = newStatus ? 'Activo' : 'Inactivo';
        newStatusBadge.className = newStatus ? 'badge bg-success' : 'badge bg-danger';

        // Icono y mensaje
        const statusModalIcon = document.getElementById('statusModalIcon');
        const statusModalTitle = document.getElementById('statusModalTitle');
        const statusModalMessage = document.getElementById('statusModalMessage');

        if (newStatus) {
            statusModalIcon.className = 'fas fa-user-check';
            statusModalIcon.style.color = 'var(--success)';
            statusModalTitle.textContent = 'Activar Usuario';
            statusModalMessage.textContent = 'Estás a punto de activar este usuario. ¿Estás seguro de que deseas continuar?';
            
            // Cambiar color del botón de confirmación
            document.getElementById('confirmStatusChange').className = 'btn-modal success';
        } else {
            statusModalIcon.className = 'fas fa-user-slash';
            statusModalIcon.style.color = 'var(--error)';
            statusModalTitle.textContent = 'Desactivar Usuario';
            statusModalMessage.textContent = 'Estás a punto de desactivar este usuario. ¿Estás seguro de que deseas continuar?';
            
            // Cambiar color del botón de confirmación
            document.getElementById('confirmStatusChange').className = 'btn-modal danger';
        }

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('changeStatusModal'));
        modal.show();
    }

    confirmStatusChange() {
        if (!this.currentUserId) return;

        // Mostrar estado de carga
        const confirmBtn = document.getElementById('confirmStatusChange');
        const originalText = confirmBtn.innerHTML;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        confirmBtn.disabled = true;

        fetch(`/system-admin/api/users/${this.currentUserId}/toggle-status`, {
            method: 'PATCH'
        })
        .then(response => {
            if (response.ok) {
                this.loadUsers();
                this.showSuccess('Estado del usuario actualizado correctamente');
                bootstrap.Modal.getInstance(document.getElementById('changeStatusModal')).hide();
            } else {
                throw new Error('Error al cambiar el estado del usuario');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            this.showError('Error al cambiar el estado del usuario: ' + error.message);
        })
        .finally(() => {
            // Restaurar botón
            confirmBtn.innerHTML = originalText;
            confirmBtn.disabled = false;
            this.currentUserId = null;
            this.currentUserData = null;
        });
    }

    changeUserRole(id) {
        const user = this.allUsers.find(u => u.id === id);
        if (!user) return;

        this.currentUserId = id;
        this.currentUserData = user;
        this.showRoleChangeModal(user);
    }

    showRoleChangeModal(user) {
        const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
        const initials = this.getUserInitials(fullName);

        // Configurar información del usuario
        document.getElementById('roleUserAvatar').textContent = initials;
        document.getElementById('roleUserName').textContent = fullName;
        document.getElementById('roleUserEmail').textContent = user.email;

        // Rol actual
        const currentRoleBadge = document.getElementById('currentRoleBadge');
        currentRoleBadge.textContent = user.role;
        currentRoleBadge.className = 'badge bg-primary';

        // Resetear selección
        document.querySelectorAll('.role-option').forEach(option => {
            option.classList.remove('selected');
            const radio = option.querySelector('.form-check-input');
            radio.checked = false;
            
            // Preseleccionar el rol actual
            if (option.getAttribute('data-role') === user.role) {
                option.classList.add('selected');
                radio.checked = true;
                document.getElementById('confirmRoleChange').disabled = false;
            }
        });

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('changeRoleModal'));
        modal.show();
    }

    selectRoleOption(optionElement) {
        // Remover selección anterior
        document.querySelectorAll('.role-option').forEach(opt => {
            opt.classList.remove('selected');
            const radio = opt.querySelector('.form-check-input');
            radio.checked = false;
        });

        // Marcar como seleccionado
        optionElement.classList.add('selected');
        const radio = optionElement.querySelector('.form-check-input');
        radio.checked = true;

        // Habilitar botón de confirmación
        document.getElementById('confirmRoleChange').disabled = false;
    }

    confirmRoleChange() {
        if (!this.currentUserId) return;

        const selectedOption = document.querySelector('.role-option.selected');
        if (!selectedOption) return;

        const newRole = selectedOption.getAttribute('data-role');
        const currentRole = this.currentUserData.role;

        // Si el rol es el mismo, no hacer nada
        if (newRole === currentRole) {
            this.showInfo('El usuario ya tiene este rol asignado');
            bootstrap.Modal.getInstance(document.getElementById('changeRoleModal')).hide();
            return;
        }

        // Mostrar estado de carga
        const confirmBtn = document.getElementById('confirmRoleChange');
        const originalText = confirmBtn.innerHTML;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        confirmBtn.disabled = true;

        fetch(`/system-admin/api/users/${this.currentUserId}/role?newRole=${newRole}`, {
            method: 'PATCH'
        })
        .then(response => {
            if (response.ok) {
                this.loadUsers();
                this.showSuccess('Rol del usuario actualizado correctamente');
                bootstrap.Modal.getInstance(document.getElementById('changeRoleModal')).hide();
            } else {
                throw new Error('Error al cambiar el rol del usuario');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            this.showError('Error al cambiar el rol del usuario: ' + error.message);
        })
        .finally(() => {
            // Restaurar botón
            confirmBtn.innerHTML = originalText;
            confirmBtn.disabled = false;
            this.currentUserId = null;
            this.currentUserData = null;
        });
    }

    exportUsers() {
        // Simular exportación
        this.showSuccess('La exportación de usuarios comenzará pronto...');
        
        // En una implementación real, aquí iría la lógica de exportación
        setTimeout(() => {
            this.showSuccess('Exportación completada exitosamente');
        }, 2000);
    }

    displayErrorState() {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                    <h5 class="text-danger">Error al cargar usuarios</h5>
                    <p class="text-muted">No se pudieron cargar los usuarios. Por favor, intente nuevamente.</p>
                    <button class="btn btn-primary mt-2" onclick="usersManager.loadUsers()">
                        <i class="fas fa-redo"></i> Reintentar
                    </button>
                </td>
            </tr>
        `;
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type) {
        // Remover notificaciones anteriores
        document.querySelectorAll('.alert').forEach(alert => {
            if (alert.parentNode) {
                alert.remove();
            }
        });

        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 2000;
            min-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'info': 'info-circle'
        };
        
        const titles = {
            'success': 'Éxito:',
            'error': 'Error:',
            'info': 'Información:'
        };

        notification.innerHTML = `
            <strong><i class="fas fa-${icons[type]}"></i> ${titles[type]}</strong> ${message}
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

// Inicializar cuando el DOM esté listo
let usersManager;

document.addEventListener('DOMContentLoaded', function() {
    usersManager = new UsersManager();
    
    // Agregar estilos adicionales
    const styles = document.createElement('style');
    styles.textContent = `
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
        
        .fade-in {
            animation: fadeInUp 0.5s ease forwards;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        body.loaded * {
            transition: all 0.3s ease !important;
        }

        .btn-modal.success {
            background: var(--success);
            color: var(--white);
        }

        .btn-modal.success:hover {
            background: #45a049;
        }

        .fa-spinner {
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(styles);
});

// Funciones globales para compatibilidad
function loadUsers() {
    if (usersManager) {
        usersManager.loadUsers();
    }
}

function applyFilters() {
    if (usersManager) {
        usersManager.applyFilters();
    }
}

function viewUser(id) {
    if (usersManager) {
        usersManager.viewUser(id);
    }
}

function toggleUserStatus(id) {
    if (usersManager) {
        usersManager.toggleUserStatus(id);
    }
}

function changeUserRole(id) {
    if (usersManager) {
        usersManager.changeUserRole(id);
    }
}

function exportUsers() {
    if (usersManager) {
        usersManager.exportUsers();
    }
}