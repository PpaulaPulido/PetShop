// Edit User Form functionality
class EditUserForm {
    constructor() {
        this.form = document.getElementById('editUserForm');
        this.submitBtn = document.getElementById('updateUserBtn');
        this.validator = null;
        this.userId = this.getUserIdFromUrl();

        this.init();
    }

    init() {
        if (!this.userId) {
            this.showError('ID de usuario no válido');
            this.redirectToUsers();
            return;
        }

        this.loadUserData();
        this.setupEventListeners();
        this.initializeValidator();
    }

    formatDateForDisplay(dateString) {
        if (!dateString) return '';
        return dateString;
    }

    getUserIdFromUrl() {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1];
    }

    initializeValidator() {
        // Extender el validador existente para incluir validaciones específicas de edición
        if (window.formValidator) {
            this.validator = window.formValidator;
            this.setupCustomValidations();
        } else {
            console.error('Validador no inicializado');
        }
    }

    setupCustomValidations() {
        // Guardar referencia a this para usar en las funciones
        const self = this;

        // Agregar validación de fecha de nacimiento al validador existente
        this.validator.validateDateOfBirth = function (value) {
            const errorElement = document.getElementById('dateOfBirthError');
            const inputElement = document.getElementById('dateOfBirth');

            if (!errorElement || !inputElement) return true;

            this.hideError(errorElement);
            inputElement.classList.remove('invalid', 'valid');

            if (!value) {
                return true; // No es requerido
            }

            const birthDate = new Date(value);
            const today = new Date();
            const minAgeDate = new Date();
            minAgeDate.setFullYear(today.getFullYear() - 18);
            const maxAgeDate = new Date();
            maxAgeDate.setFullYear(today.getFullYear() - 90);

            // Validar que no sea fecha futura
            if (birthDate > today) {
                this.showError(errorElement, 'La fecha de nacimiento no puede ser en el futuro');
                inputElement.classList.add('invalid');
                return false;
            }

            // Validar edad mínima (18 años)
            if (birthDate > minAgeDate) {
                this.showError(errorElement, 'El usuario debe ser mayor de 18 años');
                inputElement.classList.add('invalid');
                return false;
            }

            // Validar edad máxima (90 años)
            if (birthDate < maxAgeDate) {
                this.showError(errorElement, 'La edad no puede ser mayor a 90 años');
                inputElement.classList.add('invalid');
                return false;
            }

            inputElement.classList.add('valid');
            return true;
        };

        // Agregar validación de teléfono alternativo SEPARADA
        this.validator.validateAlternatePhone = function (value, forceCheck = false) {
            const errorElement = document.getElementById('alternatePhoneError');
            const inputElement = document.getElementById('alternatePhone');
            const checkButton = document.getElementById('checkAlternatePhone');

            if (!errorElement || !inputElement) return true;

            this.hideError(errorElement);
            inputElement.classList.remove('invalid', 'valid');
            if (checkButton) checkButton.classList.remove('valid', 'invalid');

            // Campo opcional - si está vacío, es válido
            if (!value.trim()) {
                inputElement.classList.add('valid');
                if (checkButton) checkButton.classList.add('valid');
                return true;
            }

            // Solo números
            const phoneRegex = /^\d+$/;
            if (!phoneRegex.test(value)) {
                this.showError(errorElement, 'Solo se permiten números');
                inputElement.classList.add('invalid');
                if (checkButton) checkButton.classList.add('invalid');
                return false;
            }

            // Longitud exacta (10 dígitos para Colombia)
            if (value.length !== 10) {
                this.showError(errorElement, 'El teléfono debe tener 10 dígitos');
                inputElement.classList.add('invalid');
                if (checkButton) checkButton.classList.add('invalid');
                return false;
            }

            // Validar que no sea una secuencia inválida
            if (self.isInvalidPhoneSequence(value)) {
                this.showError(errorElement, 'Número de teléfono no válido');
                inputElement.classList.add('invalid');
                if (checkButton) checkButton.classList.add('invalid');
                return false;
            }

            // Validar código de operador (Colombia)
            if (!self.isValidColombianOperator(value)) {
                this.showError(errorElement, 'Número de operador no válido para Colombia');
                inputElement.classList.add('invalid');
                if (checkButton) checkButton.classList.add('invalid');
                return false;
            }

            // Si es una verificación forzada o el teléfono parece válido
            if (forceCheck) {
                self.checkAlternatePhoneAvailability(value);
            } else {
                inputElement.classList.add('valid');
                if (checkButton) checkButton.classList.add('valid');
            }

            return true;
        };

        // Método para verificar disponibilidad del teléfono alternativo
        this.checkAlternatePhoneAvailability = async function (phone) {
            const errorElement = document.getElementById('alternatePhoneError');
            const inputElement = document.getElementById('alternatePhone');
            const checkButton = document.getElementById('checkAlternatePhone');

            if (!errorElement || !inputElement) return;

            try {
                // Simular verificación con API
                const isAvailable = await this.simulatePhoneCheck(phone);

                if (isAvailable) {
                    this.validator.hideError(errorElement);
                    inputElement.classList.add('valid');
                    if (checkButton) checkButton.classList.add('valid');
                    this.showNotification('Teléfono alternativo disponible y válido', 'success');
                } else {
                    this.validator.showError(errorElement, 'Este teléfono alternativo ya está registrado');
                    inputElement.classList.add('invalid');
                    if (checkButton) checkButton.classList.add('invalid');
                }
            } catch (error) {
                this.validator.showError(errorElement, 'Error al verificar el teléfono alternativo');
                console.error('Error checking alternate phone:', error);
            }
        }.bind(this);
    }

    // Métodos auxiliares para validación de teléfono
    isInvalidPhoneSequence(value) {
        const invalidSequences = [
            '0000000000', '1111111111', '2222222222', '3333333333',
            '4444444444', '5555555555', '6666666666', '7777777777',
            '8888888888', '9999999999', '1234567890', '0987654321'
        ];

        return invalidSequences.includes(value) ||
            /^(\d)\1{9}$/.test(value) || // Todos los dígitos iguales
            /^0123456789$/.test(value) || // Secuencia ascendente
            /^9876543210$/.test(value);   // Secuencia descendente
    }

    isValidColombianOperator(value) {
        const operatorCode = value.substring(0, 3);
        const validOperators = [
            '300', '301', '302', '303', '304', '305', '310', '311', '312', '313',
            '314', '315', '316', '317', '318', '319', '320', '321', '322', '323',
            '350', '351'
        ];
        return validOperators.includes(operatorCode);
    }

    simulatePhoneCheck(phone) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simular que algunos teléfonos ya están registrados
                const takenPhones = ['3001234567', '3112345678', '3209876543'];
                // No verificar contra el teléfono actual del usuario
                const currentPhone = document.getElementById('phone')?.value;
                resolve(!takenPhones.includes(phone) || phone === currentPhone);
            }, 1000);
        });
    }

    setupEventListeners() {
        // Event listeners para validación en tiempo real
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const phone = document.getElementById('phone');
        const alternatePhone = document.getElementById('alternatePhone');
        const dateOfBirth = document.getElementById('dateOfBirth');
        const checkPhone = document.getElementById('checkPhone');
        const checkAlternatePhone = document.getElementById('checkAlternatePhone');

        if (firstName) {
            firstName.addEventListener('input', (e) => {
                this.validator.validateName(e.target.value, 'firstName');
            });
        }

        if (lastName) {
            lastName.addEventListener('input', (e) => {
                this.validator.validateName(e.target.value, 'lastName');
            });
        }

        if (phone) {
            phone.addEventListener('input', (e) => {
                this.validator.validatePhone(e.target.value);
            });
        }

        if (alternatePhone) {
            alternatePhone.addEventListener('input', (e) => {
                this.validator.validateAlternatePhone(e.target.value);
            });

            // Permitir limpiar el campo
            alternatePhone.addEventListener('blur', (e) => {
                if (!e.target.value.trim()) {
                    const errorElement = document.getElementById('alternatePhoneError');
                    const inputElement = document.getElementById('alternatePhone');
                    const checkButton = document.getElementById('checkAlternatePhone');

                    this.validator.hideError(errorElement);
                    inputElement.classList.remove('invalid', 'valid');
                    if (checkButton) checkButton.classList.remove('valid', 'invalid');
                }
            });
        }

        if (dateOfBirth) {
            dateOfBirth.addEventListener('change', (e) => {
                this.validator.validateDateOfBirth(e.target.value);
            });
        }

        if (checkPhone) {
            checkPhone.addEventListener('click', () => {
                const phoneValue = document.getElementById('phone')?.value;
                if (phoneValue) {
                    this.validator.validatePhone(phoneValue, true);
                }
            });
        }

        if (checkAlternatePhone) {
            checkAlternatePhone.addEventListener('click', () => {
                const phoneValue = document.getElementById('alternatePhone')?.value;
                if (phoneValue) {
                    this.validator.validateAlternatePhone(phoneValue, true);
                }
            });
        }

        // Event listener para el botón de actualizar
        if (this.submitBtn) {
            this.submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.updateUser();
            });
        }

        // Prevenir envío del formulario con Enter
        if (this.form) {
            this.form.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.target.type !== 'textarea') {
                    e.preventDefault();
                }
            });
        }
    }

    loadUserData() {
        fetch(`/system-admin/api/users/${this.userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Usuario no encontrado');
                }
                return response.json();
            })
            .then(user => {
                this.populateUserData(user);
            })
            .catch(error => {
                console.error('Error:', error);
                this.showError('Error al cargar datos del usuario: ' + error.message);
                setTimeout(() => {
                    this.redirectToUsers();
                }, 3000);
            });
    }

    validateForm() {
        if (!this.validator) {
            this.showError('Sistema de validación no disponible');
            return false;
        }

        const validations = [
            this.validator.validateName(document.getElementById('firstName').value, 'firstName'),
            this.validator.validateName(document.getElementById('lastName').value, 'lastName'),
            this.validator.validatePhone(document.getElementById('phone').value),
            this.validator.validateAlternatePhone(document.getElementById('alternatePhone').value),
            this.validator.validateDateOfBirth(document.getElementById('dateOfBirth').value),
            this.validateRole()
        ];

        return validations.every(validation => validation === true);
    }

    validateRole() {
        const role = document.getElementById('role').value;
        const errorElement = document.getElementById('roleError');

        this.validator.hideError(errorElement);

        if (!role) {
            this.validator.showError(errorElement, 'El rol es requerido');
            return false;
        }

        const validRoles = ['SUPER_ADMIN', 'MANAGER', 'CUSTOMER'];
        if (!validRoles.includes(role)) {
            this.validator.showError(errorElement, 'Rol no válido');
            return false;
        }

        return true;
    }

    updateUser() {
        if (!this.validateForm()) {
            this.showError('Por favor, corrige los errores en el formulario');
            return;
        }

        const userData = this.getFormData();
        this.submitForm(userData);
    }

    populateUserData(user) {

        // Llenar información de display
        document.getElementById('userIdDisplay').textContent = user.id;
        document.getElementById('userEmailDisplay').textContent = user.email;
        document.getElementById('userCreatedAt').textContent = user.createdAt ?
            new Date(user.createdAt).toLocaleString() : 'No disponible';

        document.getElementById('userStatusDisplay').innerHTML = user.isActive ?
            '<span class="badge bg-success">Activo</span>' :
            '<span class="badge bg-danger">Inactivo</span>';

        document.getElementById('userLastLogin').textContent = user.lastLogin ?
            new Date(user.lastLogin).toLocaleString() : 'Nunca';

        document.getElementById('userEmailVerified').innerHTML = user.emailVerified ?
            '<span class="badge bg-success">Sí</span>' :
            '<span class="badge bg-secondary">No</span>';

        // Llenar formulario
        document.getElementById('userId').value = user.id;
        document.getElementById('email').value = user.email;
        document.getElementById('firstName').value = user.firstName || '';
        document.getElementById('lastName').value = user.lastName || '';
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('role').value = user.role || '';
        document.getElementById('isActive').checked = user.isActive !== false;
        document.getElementById('emailVerified').checked = user.emailVerified === true;

        // Campos opcionales
        document.getElementById('alternatePhone').value = user.alternatePhone || '';

        // Fecha de nacimiento - Solución robusta para visualización
        if (user.dateOfBirth) {
            // Método 1: Parsear manualmente la fecha del string
            const dateParts = user.dateOfBirth.split('-');
            if (dateParts.length === 3) {
                const year = parseInt(dateParts[0]);
                const month = parseInt(dateParts[1]) - 1; // Los meses en JS son 0-indexed
                const day = parseInt(dateParts[2]);

                // Crear fecha en UTC para evitar desplazamientos
                const utcDate = new Date(Date.UTC(year, month, day));
                const formattedDate = utcDate.toISOString().split('T')[0];

                document.getElementById('dateOfBirth').value = formattedDate;
            } else {
                // Método 2: Usar el valor directo como fallback
                document.getElementById('dateOfBirth').value = user.dateOfBirth;
            }
        } else {
            document.getElementById('dateOfBirth').value = '';
        }

        // Género
        if (user.gender) {
            document.getElementById('gender').value = user.gender.toString();
        }

        // Configuraciones
        document.getElementById('emailNotifications').checked = user.emailNotifications !== false;
        document.getElementById('smsNotifications').checked = user.smsNotifications === true;
        document.getElementById('newsletterSubscription').checked = user.newsletterSubscription !== false;

        // Ejecutar validaciones iniciales
        setTimeout(() => {
            this.validator.validateName(user.firstName || '', 'firstName');
            this.validator.validateName(user.lastName || '', 'lastName');
            this.validator.validatePhone(user.phone || '');
            this.validator.validateAlternatePhone(user.alternatePhone || '');
            this.validator.validateDateOfBirth(document.getElementById('dateOfBirth').value);
        }, 100);
    }

    getFormData() {
        // Obtener la fecha de nacimiento y manejarla correctamente
        let dateOfBirth = document.getElementById('dateOfBirth').value;
        // Si hay fecha de nacimiento, enviarla EXACTAMENTE como está
        if (dateOfBirth) {
            // Verificar que la fecha sea correcta antes de enviar
            const date = new Date(dateOfBirth);
        }

        return {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            phone: document.getElementById('phone').value,
            alternatePhone: document.getElementById('alternatePhone').value || null,
            dateOfBirth: dateOfBirth || null,
            gender: document.getElementById('gender').value || null,
            role: document.getElementById('role').value,
            isActive: document.getElementById('isActive').checked,
            emailVerified: document.getElementById('emailVerified').checked,
            emailNotifications: document.getElementById('emailNotifications').checked,
            smsNotifications: document.getElementById('smsNotifications').checked,
            newsletterSubscription: document.getElementById('newsletterSubscription').checked
        };
    }

    submitForm(data) {
        this.setLoadingState(true);

        fetch(`/system-admin/api/users/${this.userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.text().then(text => { throw new Error(text) });
                }
            })
            .then(() => {
                this.showSuccess('Usuario actualizado exitosamente');
                setTimeout(() => {
                    this.redirectToUsers();
                }, 2000);
            })
            .catch(error => {
                console.error('Error:', error);
                this.showError('Error al actualizar usuario: ' + error.message);
            })
            .finally(() => {
                this.setLoadingState(false);
            });
    }

    setLoadingState(loading) {
        if (!this.submitBtn) return;

        if (loading) {
            this.submitBtn.disabled = true;
            this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Usuario';
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.getElementById(`${type}Notification`);
        const messageElement = document.getElementById(`${type}Message`);

        if (notification && messageElement) {
            messageElement.textContent = message;
            notification.classList.add('show');

            setTimeout(() => {
                notification.classList.remove('show');
            }, 5000);
        }
    }

    redirectToUsers() {
        window.location.href = '/system-admin/users';
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Primero inicializar el validador
    if (typeof FormValidator !== 'undefined') {
        window.formValidator = new FormValidator();
    }

    // Luego inicializar el formulario de edición
    window.editUserForm = new EditUserForm();
});

// Manejo de errores globales
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
});