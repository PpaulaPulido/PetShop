// customer_profile.js
class CustomerProfile {
    constructor() {
        this.userData = null;
        this.originalData = {};
        this.init();
    }

    async init() {
        try {
            await this.setupEventListeners();
            await this.loadUserProfile();
            this.setupFormSubmissions();
            this.calculateProfileCompletion();
        } catch (error) {
            console.error('Error initializing profile:', error);
        }
    }

    async setupEventListeners() {
        // Navegación entre tabs
        const navItems = document.querySelectorAll('.nav-item');
        if (navItems.length === 0) {
            console.warn('No se encontraron elementos de navegación');
            return;
        }

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Cambio de foto de perfil
        const profilePictureFile = document.getElementById('profilePictureFile');
        if (profilePictureFile) {
            profilePictureFile.addEventListener('change', (e) => {
                this.uploadProfilePicture(e.target.files[0]);
            });
        }

        // Auto-generar display name
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        
        if (firstName) {
            firstName.addEventListener('input', this.suggestDisplayName.bind(this));
        }
        if (lastName) {
            lastName.addEventListener('input', this.suggestDisplayName.bind(this));
        }
    }

    setupFormSubmissions() {
        // Verificar que los formularios existan antes de agregar event listeners
        const forms = [
            { id: 'personalInfoForm', handler: (e) => this.updatePersonalInfo(e) },
            { id: 'contactInfoForm', handler: (e) => this.updateContactInfo(e) },
            { id: 'preferencesForm', handler: (e) => this.updatePreferences(e) },
            { id: 'changePasswordForm', handler: (e) => this.changePassword(e) }
        ];

        forms.forEach(({ id, handler }) => {
            const form = document.getElementById(id);
            if (form) {
                form.addEventListener('submit', handler);
            } else {
                console.warn(`Formulario no encontrado: ${id}`);
            }
        });
    }

    async loadUserProfile() {
        try {
            console.log('Cargando perfil del usuario...');
            const response = await fetch('/api/customer/profile');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.userData = await response.json();
            console.log('Datos del usuario cargados:', this.userData);
            
            this.populateForms();
            this.updateSecurityInfo();
            this.showNotification('Perfil cargado correctamente', 'success');
            
        } catch (error) {
            console.error('Error loading profile:', error);
            this.showNotification('Error al cargar el perfil. Verifica tu conexión.', 'error');
        }
    }

    populateForms() {
        if (!this.userData) {
            console.warn('No hay datos de usuario para poblar formularios');
            return;
        }

        try {
            // Información Personal
            this.setValue('firstName', this.userData.firstName);
            this.setValue('lastName', this.userData.lastName);
            this.setValue('displayName', this.userData.displayName);
            this.setValue('dateOfBirth', this.formatDateForInput(this.userData.dateOfBirth));
            this.setValue('gender', this.userData.gender);

            // Información de Contacto
            this.setValue('email', this.userData.email);
            this.setValue('phone', this.userData.phone);
            this.setValue('alternatePhone', this.userData.alternatePhone);

            // Preferencias
            this.setChecked('emailNotifications', this.userData.emailNotifications !== false);
            this.setChecked('smsNotifications', this.userData.smsNotifications || false);
            this.setChecked('newsletterSubscription', this.userData.newsletterSubscription !== false);

            // Foto de perfil
            if (this.userData.profilePicture) {
                const profilePic = document.getElementById('currentProfilePicture');
                if (profilePic) {
                    profilePic.src = this.userData.profilePicture;
                }
            }

            // Guardar datos originales para comparación
            this.originalData = { ...this.userData };
            
        } catch (error) {
            console.error('Error populating forms:', error);
        }
    }

    setValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element && value !== undefined && value !== null) {
            element.value = value;
        }
    }

    setChecked(elementId, checked) {
        const element = document.getElementById(elementId);
        if (element) {
            element.checked = !!checked;
        }
    }

    formatDateForInput(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.warn('Error formatting date:', error);
            return '';
        }
    }

    updateSecurityInfo() {
        if (!this.userData) return;

        try {
            if (this.userData.lastLogin) {
                const lastLogin = new Date(this.userData.lastLogin).toLocaleString('es-ES');
                this.setTextContent('lastLoginInfo', lastLogin);
            }

            if (this.userData.createdAt) {
                const created = new Date(this.userData.createdAt).toLocaleDateString('es-ES');
                this.setTextContent('accountCreatedInfo', created);
            }
        } catch (error) {
            console.error('Error updating security info:', error);
        }
    }

    setTextContent(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    switchTab(tabName) {
        try {
            // Remover clase active de todos los tabs y nav items
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });

            // Activar tab seleccionado
            const tabElement = document.getElementById(`${tabName}-tab`);
            const navElement = document.querySelector(`[data-tab="${tabName}"]`);
            
            if (tabElement) tabElement.classList.add('active');
            if (navElement) navElement.classList.add('active');
            
        } catch (error) {
            console.error('Error switching tab:', error);
        }
    }

    suggestDisplayName() {
        try {
            const firstName = document.getElementById('firstName');
            const lastName = document.getElementById('lastName');
            const displayName = document.getElementById('displayName');

            if (!firstName || !lastName || !displayName) return;

            const firstNameValue = firstName.value || '';
            const lastNameValue = lastName.value || '';
            
            if (firstNameValue && lastNameValue && (!displayName.value || displayName.value === this.originalData.displayName)) {
                displayName.value = `${firstNameValue} ${lastNameValue}`;
            }
        } catch (error) {
            console.error('Error suggesting display name:', error);
        }
    }

    async updatePersonalInfo(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData();
            formData.append('firstName', document.getElementById('firstName').value);
            formData.append('lastName', document.getElementById('lastName').value);
            formData.append('displayName', document.getElementById('displayName').value);
            
            const dateOfBirth = document.getElementById('dateOfBirth').value;
            if (dateOfBirth) {
                formData.append('dateOfBirth', dateOfBirth);
            }
            
            const gender = document.getElementById('gender').value;
            if (gender) {
                formData.append('gender', gender);
            }

            const response = await fetch('/api/customer/profile', {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                await this.loadUserProfile();
                this.showNotification('Información personal actualizada correctamente', 'success');
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al actualizar información personal');
            }
        } catch (error) {
            console.error('Error updating personal info:', error);
            this.showNotification(error.message || 'Error al actualizar información personal', 'error');
        }
    }

    async updateContactInfo(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData();
            formData.append('phone', document.getElementById('phone').value);
            
            const alternatePhone = document.getElementById('alternatePhone').value;
            if (alternatePhone) {
                formData.append('alternatePhone', alternatePhone);
            }

            const response = await fetch('/api/customer/profile', {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                await this.loadUserProfile();
                this.showNotification('Información de contacto actualizada correctamente', 'success');
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al actualizar información de contacto');
            }
        } catch (error) {
            console.error('Error updating contact info:', error);
            this.showNotification(error.message || 'Error al actualizar información de contacto', 'error');
        }
    }

    async updatePreferences(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData();
            formData.append('emailNotifications', document.getElementById('emailNotifications').checked);
            formData.append('smsNotifications', document.getElementById('smsNotifications').checked);
            formData.append('newsletterSubscription', document.getElementById('newsletterSubscription').checked);

            const response = await fetch('/api/customer/profile', {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                await this.loadUserProfile();
                this.showNotification('Preferencias actualizadas correctamente', 'success');
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al actualizar preferencias');
            }
        } catch (error) {
            console.error('Error updating preferences:', error);
            this.showNotification(error.message || 'Error al actualizar preferencias', 'error');
        }
    }

    async changePassword(e) {
        e.preventDefault();
        
        try {
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Validaciones
            if (newPassword !== confirmPassword) {
                this.showNotification('Las contraseñas no coinciden', 'error');
                return;
            }

            if (newPassword.length < 8) {
                this.showNotification('La contraseña debe tener al menos 8 caracteres', 'error');
                return;
            }

            const formData = new URLSearchParams();
            formData.append('currentPassword', currentPassword);
            formData.append('newPassword', newPassword);

            const response = await fetch('/api/customer/profile/password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });

            if (response.ok) {
                document.getElementById('changePasswordForm').reset();
                this.showNotification('Contraseña cambiada correctamente', 'success');
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al cambiar contraseña');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            this.showNotification(error.message || 'Error al cambiar contraseña', 'error');
        }
    }

    async uploadProfilePicture(file) {
        if (!file) return;

        try {
            // Validar tipo y tamaño
            if (!file.type.startsWith('image/')) {
                this.showNotification('Solo se permiten archivos de imagen', 'error');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                this.showNotification('La imagen debe ser menor a 10MB', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/customer/profile/profile-picture', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const updatedProfile = await response.json();
                const profilePicture = document.getElementById('currentProfilePicture');
                if (profilePicture && updatedProfile.profilePicture) {
                    profilePicture.src = updatedProfile.profilePicture;
                }
                this.showNotification('Foto de perfil actualizada correctamente', 'success');
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al actualizar foto de perfil');
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            this.showNotification(error.message || 'Error al actualizar foto de perfil', 'error');
        }
    }

    async deleteProfilePicture() {
        try {
            const response = await fetch('/api/customer/profile/profile-picture', {
                method: 'DELETE'
            });

            if (response.ok) {
                const profilePicture = document.getElementById('currentProfilePicture');
                if (profilePicture) {
                    profilePicture.src = '/images/default-avatar.png';
                }
                this.showNotification('Foto de perfil eliminada correctamente', 'success');
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al eliminar foto de perfil');
            }
        } catch (error) {
            console.error('Error deleting profile picture:', error);
            this.showNotification(error.message || 'Error al eliminar foto de perfil', 'error');
        }
    }

    calculateProfileCompletion() {
        if (!this.userData) return 0;

        try {
            const fields = [
                this.userData.firstName,
                this.userData.lastName,
                this.userData.email,
                this.userData.phone,
                this.userData.dateOfBirth,
                this.userData.gender
            ];

            const completed = fields.filter(field => {
                if (typeof field === 'boolean') return field;
                return field && field.toString().trim().length > 0;
            }).length;

            const percentage = Math.round((completed / fields.length) * 100);
            
            this.setTextContent('completionPercent', `${percentage}%`);
            
            const completionBar = document.getElementById('completionBar');
            if (completionBar) {
                completionBar.style.width = `${percentage}%`;
            }

            return percentage;
        } catch (error) {
            console.error('Error calculating profile completion:', error);
            return 0;
        }
    }

    showNotification(message, type = 'info') {
        try {
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
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }
}

// Funciones globales para los botones
function resetPersonalForm() {
    try {
        const form = document.getElementById('personalInfoForm');
        if (form) {
            form.reset();
        }
        if (window.customerProfile && window.customerProfile.userData) {
            window.customerProfile.populateForms();
        }
    } catch (error) {
        console.error('Error resetting personal form:', error);
    }
}

function resetContactForm() {
    try {
        const form = document.getElementById('contactInfoForm');
        if (form) {
            form.reset();
        }
        if (window.customerProfile && window.customerProfile.userData) {
            window.customerProfile.populateForms();
        }
    } catch (error) {
        console.error('Error resetting contact form:', error);
    }
}

function deleteProfilePicture() {
    try {
        if (window.customerProfile) {
            window.customerProfile.deleteProfilePicture();
        }
    } catch (error) {
        console.error('Error deleting profile picture:', error);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.customerProfile = new CustomerProfile();
    } catch (error) {
        console.error('Error initializing customer profile:', error);
    }
});

// Manejar errores no capturados
window.addEventListener('error', (event) => {
    console.error('Error no capturado:', event.error);
});