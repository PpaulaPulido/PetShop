class CustomerProfile {
    constructor() {
        this.userData = null;
        this.originalData = {};
        this.isLoading = false;

        setTimeout(() => {
            if (window.customerProfileValidations) {
                window.customerProfileValidations.hasUserInteracted = true;
            }
        }, 500);

        this.init();
    }

    async init() {
        try {
            await this.setupEventListeners();
            await this.loadUserProfile();
            this.setupFormSubmissions();
            this.setupPasswordStrength();
            this.calculateProfileCompletion();
            this.setupFileUpload();
        } catch (error) {
            this.showNotification('Error al inicializar el perfil', 'error');
        }
    }

    async setupEventListeners() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });

        const changePictureBtn = document.getElementById('changePictureBtn');
        const deletePictureBtn = document.getElementById('deletePictureBtn');
        const currentAvatar = document.querySelector('.current-avatar');

        if (changePictureBtn) {
            changePictureBtn.addEventListener('click', () => {
                document.getElementById('profilePictureFile').click();
            });
        }

        if (deletePictureBtn) {
            deletePictureBtn.addEventListener('click', () => {
                this.deleteProfilePicture();
            });
        }

        if (currentAvatar) {
            currentAvatar.addEventListener('click', () => {
                document.getElementById('profilePictureFile').click();
            });
        }

        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');

        if (firstName) {
            firstName.addEventListener('input', this.debounce(this.suggestDisplayName.bind(this), 300));
        }
        if (lastName) {
            lastName.addEventListener('input', this.debounce(this.suggestDisplayName.bind(this), 300));
        }

        const resetPersonalBtn = document.getElementById('resetPersonalBtn');
        const resetContactBtn = document.getElementById('resetContactBtn');

        if (resetPersonalBtn) {
            resetPersonalBtn.addEventListener('click', () => this.resetForm('personalInfoForm'));
        }
        if (resetContactBtn) {
            resetContactBtn.addEventListener('click', () => this.resetForm('contactInfoForm'));
        }
    }

    setupFormSubmissions() {
        const forms = [
            { id: 'personalInfoForm', handler: (e) => this.updatePersonalInfo(e) },
            { id: 'contactInfoForm', handler: (e) => this.updateContactInfo(e) },
            { id: 'preferencesForm', handler: (e) => this.updatePreferences(e) },
            { id: 'changePasswordForm', handler: (e) => this.changePassword(e) }
        ];

        forms.forEach(({ id, handler }) => {
            const form = document.getElementById(id);
            if (form) {
                form.removeEventListener('submit', handler);
                form.addEventListener('submit', handler);
            }
        });
    }

    setupPasswordStrength() {
        const newPassword = document.getElementById('newPassword');
        if (newPassword) {
            newPassword.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
        }
    }

    setupFileUpload() {
        const fileInput = document.getElementById('profilePictureFile');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.previewProfilePicture(e.target.files[0]);
                    this.uploadProfilePicture(e.target.files[0]);
                }
            });
        }
    }

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

    async loadUserProfile() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoadingState(true);

        try {
            const response = await fetch('/api/customer/profile');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.userData = await response.json();
            this.populateForms();
            this.updateSecurityInfo();
            this.calculateProfileCompletion();

        } catch (error) {
            this.showNotification('Error al cargar el perfil. Verifica tu conexión.', 'error');
        } finally {
            this.isLoading = false;
            this.showLoadingState(false);
        }
    }

    showLoadingState(show) {
        const forms = document.querySelectorAll('.profile-form');
        const buttons = document.querySelectorAll('.btn');

        if (show) {
            forms.forEach(form => form.style.opacity = '0.6');
            buttons.forEach(btn => btn.disabled = true);
        } else {
            forms.forEach(form => form.style.opacity = '1');
            buttons.forEach(btn => btn.disabled = false);
        }
    }

    populateForms() {
        if (!this.userData) return;

        this.setValue('firstName', this.userData.firstName);
        this.setValue('lastName', this.userData.lastName);
        this.setValue('displayName', this.userData.displayName);
        this.setValue('dateOfBirth', this.formatDateForInput(this.userData.dateOfBirth));
        this.setValue('gender', this.userData.gender);

        this.setValue('email', this.userData.email);
        this.setValue('phone', this.userData.phone);
        this.setValue('alternatePhone', this.userData.alternatePhone);

        this.setChecked('emailNotifications', this.userData.emailNotifications !== false);
        this.setChecked('smsNotifications', this.userData.smsNotifications || false);
        this.setChecked('newsletterSubscription', this.userData.newsletterSubscription !== false);

        if (this.userData.profilePicture) {
            const profilePic = document.getElementById('currentProfilePicture');
            if (profilePic) {
                profilePic.src = this.userData.profilePicture + '?' + new Date().getTime();
            }
        }

        this.originalData = { ...this.userData };

        setTimeout(() => {
            if (window.customerProfileValidations) {
                window.customerProfileValidations.hasUserInteracted = true;

                Object.keys(window.customerProfileValidations.validators).forEach(fieldName => {
                    const field = document.getElementById(fieldName);
                    if (field && field.value) {
                        window.customerProfileValidations.validateField(fieldName, field.value, field);
                    }
                });
            }
        }, 300);
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
        const currentTab = document.querySelector('.tab-content.active');
        if (currentTab) {
            currentTab.style.opacity = '0';
            currentTab.style.transform = 'translateY(20px)';

            setTimeout(() => {
                currentTab.classList.remove('active');
                this.showTab(tabName);
            }, 300);
        } else {
            this.showTab(tabName);
        }

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    showTab(tabName) {
        const tabElement = document.getElementById(`${tabName}-tab`);
        if (tabElement) {
            tabElement.classList.add('active');
            setTimeout(() => {
                tabElement.style.opacity = '1';
                tabElement.style.transform = 'translateY(0)';
            }, 50);
        }
    }

    suggestDisplayName() {
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const displayName = document.getElementById('displayName');

        if (!firstName || !lastName || !displayName) return;

        const firstNameValue = firstName.value || '';
        const lastNameValue = lastName.value || '';

        if (firstNameValue && lastNameValue && (!displayName.value || displayName.value === this.originalData.displayName)) {
            displayName.value = `${firstNameValue} ${lastNameValue}`;
        }
    }

    updatePasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');

        if (!strengthBar || !strengthText) return;

        let strength = 0;
        let text = 'Muy débil';
        let color = '#dc3545';

        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;

        if (strength >= 75) {
            text = 'Muy fuerte';
            color = '#28a745';
        } else if (strength >= 50) {
            text = 'Fuerte';
            color = '#20c997';
        } else if (strength >= 25) {
            text = 'Moderada';
            color = '#ffc107';
        }

        strengthBar.style.setProperty('--strength-width', `${strength}%`);
        strengthBar.style.setProperty('--strength-color', color);
        strengthText.textContent = text;
        strengthText.style.color = color;
    }

    // NUEVO MÉTODO: Validar si la nueva contraseña es igual a la actual
    validateNewPasswordNotSame(currentPassword, newPassword) {
        return currentPassword !== newPassword;
    }

    async updatePersonalInfo(e) {
        e.preventDefault();
        await this.submitForm('personalInfoForm', '/api/customer/profile', 'PUT',
            'Información personal actualizada correctamente',
            'Error al actualizar información personal');
    }

    async updateContactInfo(e) {
        e.preventDefault();
        await this.submitForm('contactInfoForm', '/api/customer/profile', 'PUT',
            'Información de contacto actualizada correctamente',
            'Error al actualizar información de contacto');
    }

    async updatePreferences(e) {
        e.preventDefault();
        await this.submitForm('preferencesForm', '/api/customer/profile', 'PUT',
            'Preferencias actualizadas correctamente',
            'Error al actualizar preferencias');
    }

    async submitForm(formId, url, method, successMessage, errorMessage) {
        const form = document.getElementById(formId);
        const submitBtn = form?.querySelector('button[type="submit"]');
        const btnText = submitBtn?.querySelector('.btn-text');
        const btnLoading = submitBtn?.querySelector('.btn-loading');

        if (!form || !submitBtn) return;

        if (window.customerProfileValidations) {
            const isValid = window.customerProfileValidations.validateForm(formId);
            if (!isValid) {
                this.showNotification('Por favor corrige los errores en el formulario', 'error');
                return;
            }
        }

        submitBtn.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline';

        try {
            const formData = new FormData(form);

            const response = await fetch(url, {
                method: method,
                body: formData
            });

            if (response.ok) {
                await this.loadUserProfile();
                this.showNotification(successMessage, 'success');
            } else {
                let errorText;
                try {
                    const errorData = await response.json();
                    errorText = errorData.message || await response.text();
                } catch {
                    errorText = await response.text();
                }
                throw new Error(errorText || errorMessage);
            }
        } catch (error) {
            this.showNotification(error.message || errorMessage, 'error');
        } finally {
            submitBtn.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    }
    
    async changePassword(e) {
        e.preventDefault();

        const form = document.getElementById('changePasswordForm');
        const submitBtn = form?.querySelector('button[type="submit"]');
        const btnText = submitBtn?.querySelector('.btn-text');
        const btnLoading = submitBtn?.querySelector('.btn-loading');

        if (!form || !submitBtn) return;

        // Validación de formulario
        if (window.customerProfileValidations) {
            const isValid = window.customerProfileValidations.validateForm('changePasswordForm');
            if (!isValid) {
                this.showNotification('Por favor corrige los errores en el formulario', 'error');
                return;
            }
        }

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // VALIDACIÓN CRÍTICA: Verificar que la nueva contraseña no sea igual a la actual
        if (!this.validateNewPasswordNotSame(currentPassword, newPassword)) {
            this.showNotification('La nueva contraseña no puede ser igual a la contraseña actual', 'error');
            this.showPasswordError('newPassword', 'La nueva contraseña debe ser diferente a la actual');
            return;
        }

        // Validaciones adicionales
        if (newPassword !== confirmPassword) {
            this.showNotification('Las contraseñas no coinciden', 'error');
            return;
        }

        if (newPassword.length < 8) {
            this.showNotification('La contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }

        submitBtn.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline';

        try {
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
                form.reset();
                this.showNotification('Contraseña cambiada correctamente', 'success');
                this.clearPasswordFields();
            } else {
                const errorData = await response.json();

                if (errorData.message && errorData.message.includes('contraseña actual es incorrecta')) {
                    throw new Error('La contraseña actual es incorrecta');
                } else if (errorData.message) {
                    throw new Error(errorData.message);
                } else {
                    throw new Error('Error al cambiar contraseña');
                }
            }
        } catch (error) {

            if (error.message.includes('contraseña actual es incorrecta')) {
                this.showPasswordError('currentPassword', 'La contraseña actual es incorrecta');
                this.showNotification('La contraseña actual es incorrecta', 'error');
            } else {
                this.showNotification(error.message || 'Error al cambiar contraseña', 'error');
            }
        } finally {
            submitBtn.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    }

    showPasswordError(fieldId, errorMessage) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.remove('success', 'error');
        const existingErrors = formGroup.querySelectorAll('.validation-error');
        existingErrors.forEach(error => error.remove());

        formGroup.classList.add('error');

        const errorElement = document.createElement('div');
        errorElement.className = 'validation-error';
        errorElement.innerHTML = `<div class="error-item">${errorMessage}</div>`;
        formGroup.appendChild(errorElement);

        const statusIcon = formGroup.querySelector('.validation-status');
        if (statusIcon) {
            statusIcon.textContent = '⚠';
        }

        setTimeout(() => {
            field.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
            field.focus();
        }, 100);
    }

    // MÉTODO CORREGIDO: Ahora existe updatePasswordRequirements
    updatePasswordRequirements(password = '') {
        // Este método actualiza los requisitos visuales de la contraseña
        const requirements = {
            length: document.querySelector('[data-requirement="length"]'),
            uppercase: document.querySelector('[data-requirement="uppercase"]'),
            lowercase: document.querySelector('[data-requirement="lowercase"]'),
            number: document.querySelector('[data-requirement="number"]'),
            special: document.querySelector('[data-requirement="special"]')
        };

        if (requirements.length) {
            requirements.length.classList.toggle('met', password.length >= 8);
        }
        if (requirements.uppercase) {
            requirements.uppercase.classList.toggle('met', /[A-Z]/.test(password));
        }
        if (requirements.lowercase) {
            requirements.lowercase.classList.toggle('met', /[a-z]/.test(password));
        }
        if (requirements.number) {
            requirements.number.classList.toggle('met', /[0-9]/.test(password));
        }
        if (requirements.special) {
            requirements.special.classList.toggle('met', /[^A-Za-z0-9]/.test(password));
        }
    }

    // MÉTODO CORREGIDO: clearPasswordFields ahora llama a updatePasswordRequirements
    clearPasswordFields() {
        const passwordFields = ['currentPassword', 'newPassword', 'confirmPassword'];

        passwordFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = '';

                const formGroup = field.closest('.form-group');
                if (formGroup) {
                    formGroup.classList.remove('success', 'error');
                    const existingErrors = formGroup.querySelectorAll('.validation-error');
                    existingErrors.forEach(error => error.remove());

                    const statusIcon = formGroup.querySelector('.validation-status');
                    if (statusIcon) {
                        statusIcon.textContent = '';
                    }
                }
            }
        });

        // Limpiar indicadores de contraseña
        this.updatePasswordStrength('');
        this.updatePasswordRequirements('');
    }

    previewProfilePicture(file) {
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const profilePic = document.getElementById('currentProfilePicture');
            if (profilePic) {
                profilePic.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    }

    async uploadProfilePicture(file) {
        if (!file) return;

        try {
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
                    profilePicture.src = updatedProfile.profilePicture + '?' + new Date().getTime();
                }
                this.showNotification('Foto de perfil actualizada correctamente', 'success');
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al actualizar foto de perfil');
            }
        } catch (error) {
            this.showNotification(error.message || 'Error al actualizar foto de perfil', 'error');
        }
    }

    async deleteProfilePicture() {
        if (!confirm('¿Estás seguro de que quieres eliminar tu foto de perfil?')) {
            return;
        }

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
            this.showNotification(error.message || 'Error al eliminar foto de perfil', 'error');
        }
    }

    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            this.populateForms();
        }
    }

    calculateProfileCompletion() {
        if (!this.userData) return 0;

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
            completionBar.style.transition = 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
            completionBar.style.width = `${percentage}%`;
        }

        return percentage;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        const container = document.getElementById('notificationContainer') || document.body;
        container.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.customerProfile = new CustomerProfile();
});
