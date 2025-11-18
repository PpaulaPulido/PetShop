// customer_addresses_list.js
class AddressesList {
    constructor() {
        this.addresses = [];
        this.addressToDelete = null;
        
        this.init();
    }

    init() {
        this.loadAddresses();
        this.setupEventListeners();
    }

    async loadAddresses() {
        try {
            this.showLoadingState();
            
            const response = await fetch('/api/customer/addresses');
            
            if (response.ok) {
                this.addresses = await response.json();
                this.renderAddresses();
            } else {
                throw new Error('Error al cargar direcciones');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showErrorState('Error al cargar las direcciones');
        }
    }

    renderAddresses() {
        const grid = document.getElementById('addressesGrid');
        const emptyState = document.getElementById('emptyAddresses');
        const addressesCount = document.getElementById('addressesCount');
        
        // Actualizar contador
        addressesCount.textContent = `${this.addresses.length} dirección${this.addresses.length !== 1 ? 'es' : ''}`;
        
        if (this.addresses.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            document.getElementById('addressesState').style.display = 'none';
            return;
        }
        
        emptyState.style.display = 'none';
        document.getElementById('addressesState').style.display = 'none';
        grid.style.display = 'grid';
        
        grid.innerHTML = this.addresses.map(address => this.createAddressCard(address)).join('');
        
        // Agregar event listeners a los botones
        this.attachEventListeners();
    }

    createAddressCard(address) {
        return `
            <div class="address-card ${address.isPrimary ? 'primary' : ''}">
                ${address.isPrimary ? '<div class="primary-badge">📍 Principal</div>' : ''}
                
                <div class="address-header">
                    <span class="address-type">${this.formatAddressType(address.addressType)}</span>
                    <div class="address-actions">
                        <a href="/user/addresses/edit/${address.id}" class="btn-icon btn-edit" title="Editar">
                            ✏️
                        </a>
                        <button class="btn-icon btn-delete" data-address-id="${address.id}" title="Eliminar">
                            🗑️
                        </button>
                        ${!address.isPrimary ? `
                            <button class="btn-icon btn-set-primary" data-address-id="${address.id}" title="Establecer como principal">
                                ⭐
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <div class="address-content">
                    <div class="contact-info">
                        <div class="contact-item">
                            👤 ${address.contactName}
                        </div>
                        <div class="contact-item">
                            📞 ${address.contactPhone}
                        </div>
                    </div>
                    
                    <div class="address-details">
                        <div class="address-line">📍 ${address.addressLine1}</div>
                        ${address.addressLine2 ? `<div class="address-line">${address.addressLine2}</div>` : ''}
                        <div class="address-line">🏙️ ${address.city}, ${this.formatDepartmentName(address.department)}</div>
                        <div class="address-line">🇨🇴 ${address.country} - ${address.zipCode}</div>
                        ${address.landmark ? `<div class="address-line">🚩 ${address.landmark}</div>` : ''}
                    </div>
                    
                    ${address.deliveryInstructions ? `
                        <div class="address-instructions">
                            <div class="instructions-label">📋 Instrucciones de entrega:</div>
                            <div class="instructions-content">${address.deliveryInstructions}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    formatAddressType(type) {
        const types = {
            'HOME': '🏠 Casa',
            'APARTMENT': '🏢 Apartamento',
            'WORK': '💼 Trabajo',
            'OFFICE': '🏛️ Oficina',
            'OTHER': '📦 Otro'
        };
        return types[type] || type;
    }

    formatDepartmentName(dept) {
        return dept.split('_')
            .map(word => word.charAt(0) + word.slice(1).toLowerCase())
            .join(' ');
    }

    attachEventListeners() {
        // Botones de eliminar
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const addressId = e.currentTarget.getAttribute('data-address-id');
                this.showDeleteModal(addressId);
            });
        });

        // Botones de establecer como principal
        document.querySelectorAll('.btn-set-primary').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const addressId = e.currentTarget.getAttribute('data-address-id');
                await this.setPrimaryAddress(addressId);
            });
        });
    }

    setupEventListeners() {
        // Modal de eliminación
        document.getElementById('closeDeleteModal').addEventListener('click', () => this.hideDeleteModal());
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => this.hideDeleteModal());
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.confirmDelete());
        
        // Cerrar modal al hacer clic fuera
        document.getElementById('deleteModalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideDeleteModal();
            }
        });
    }

    showDeleteModal(addressId) {
        this.addressToDelete = addressId;
        document.getElementById('deleteModalOverlay').style.display = 'flex';
    }

    hideDeleteModal() {
        this.addressToDelete = null;
        document.getElementById('deleteModalOverlay').style.display = 'none';
    }

    async confirmDelete() {
        if (!this.addressToDelete) return;

        try {
            const response = await fetch(`/api/customer/addresses/${this.addressToDelete}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showNotification('Dirección eliminada correctamente', 'success');
                this.hideDeleteModal();
                this.loadAddresses(); // Recargar la lista
            } else {
                throw new Error('Error al eliminar la dirección');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error al eliminar la dirección', 'error');
        }
    }

    async setPrimaryAddress(addressId) {
        try {
            const response = await fetch(`/api/customer/addresses/${addressId}/primary`, {
                method: 'POST'
            });

            if (response.ok) {
                this.showNotification('Dirección principal actualizada', 'success');
                this.loadAddresses(); // Recargar la lista
            } else {
                throw new Error('Error al establecer dirección principal');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error al establecer dirección principal', 'error');
        }
    }

    showLoadingState() {
        document.getElementById('addressesState').style.display = 'block';
        document.getElementById('addressesGrid').style.display = 'none';
        document.getElementById('emptyAddresses').style.display = 'none';
    }

    showErrorState(message) {
        const stateElement = document.getElementById('addressesState');
        stateElement.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Error</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="addressesList.loadAddresses()">
                    Reintentar
                </button>
            </div>
        `;
        stateElement.style.display = 'block';
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">×</button>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Cerrar manualmente
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
}

// Inicializar cuando el DOM esté listo
let addressesList;
document.addEventListener('DOMContentLoaded', () => {
    addressesList = new AddressesList();
});