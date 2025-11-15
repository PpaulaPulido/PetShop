// Create User Form functionality
class CreateUserForm {
    constructor() {
        this.form = document.getElementById('createUserForm');
        this.submitBtn = document.getElementById('createUserBtn');
        this.validator = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeValidator();
    }

    initializeValidator() {
        if (window.formValidator) {
            this.validator = window.formValidator;
            this.setupCustomValidations();
        } else {
            console.error('Validador no inicializado');
        }
    }

    setupCustomValidations() {
        const self = this;

        // Validación de email
        this.validator.validateEmail = function (value, forceCheck = false) {
            const errorElement = document.getElementById('emailError');
            const inputElement = document.getElementById('email');

            if (!errorElement || !inputElement) return true;

            this.hideError(errorElement);
            inputElement.classList.remove('invalid', 'valid');

            if (!value.trim()) {
                this.showError(errorElement, 'El email es requerido');
                inputElement.classList.add('invalid');
                return false;
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showError(errorElement, 'Formato de email no válido');
                inputElement.classList.add('invalid');
                return false;
            }

            // Si es una verificación forzada, verificar disponibilidad
            if (forceCheck) {
                self.checkEmailAvailability(value);
            } else {
                inputElement.classList.add('valid');
            }

            return true;
        };

        // Validación de contraseña
        this.validator.validatePassword = function (value) {
            const errorElement = document.getElementById('passwordError');
            const inputElement = document.getElementById('password');

            if (!errorElement || !inputElement) return true;

            this.hideError(errorElement);
            inputElement.classList.remove('invalid', 'valid');

            if (!value.trim()) {
                this.showError(errorElement, 'La contraseña es requerida');
                inputElement.classList.add('invalid');
                return false;
            }

            // Mínimo 8 caracteres
            if (value.length < 8) {
                this.showError(errorElement, 'La contraseña debe tener al menos 8 caracteres');
                inputElement.classList.add('invalid');
                return false;
            }

            // Validar fortaleza de contraseña
            const strengthErrors = [];
            
            if (!/(?=.*[a-z])/.test(value)) {
                strengthErrors.push('una letra minúscula');
            }
            if (!/(?=.*[A-Z])/.test(value)) {
                strengthErrors.push('una letra mayúscula');
            }
            if (!/(?=.*\d)/.test(value)) {
                strengthErrors.push('un número');
            }
            if (!/(?=.*[@$!%*?&])/.test(value)) {
                strengthErrors.push('un carácter especial (@$!%*?&)');
            }

            if (strengthErrors.length > 0) {
                this.showError(errorElement, `La contraseña debe contener al menos ${strengthErrors.join(', ')}`);
                inputElement.classList.add('invalid');
                return false;
            }

            inputElement.classList.add('valid');
            return true;
        };

        // Validación de confirmación de contraseña
        this.validator.validateConfirmPassword = function (value) {
            const errorElement = document.getElementById('confirmPasswordError');
            const inputElement = document.getElementById('confirmPassword');
            const password = document.getElementById('password').value;

            if (!errorElement || !inputElement) return true;

            this.hideError(errorElement);
            inputElement.classList.remove('invalid', 'valid');

            if (!value.trim()) {
                this.showError(errorElement, 'Por favor confirme la contraseña');
                inputElement.classList.add('invalid');
                return false;
            }

            if (value !== password) {
                this.showError(errorElement, 'Las contraseñas no coinciden');
                inputElement.classList.add('invalid');
                return false;
            }

            inputElement.classList.add('valid');
            return true;
        };

        // Validación de fecha de nacimiento
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

        // Validación de teléfono alternativo
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

            // Si es una verificación forzada
            if (forceCheck) {
                self.checkAlternatePhoneAvailability(value);
            } else {
                inputElement.classList.add('valid');
                if (checkButton) checkButton.classList.add('valid');
            }

            return true;
        };

        // Método para verificar disponibilidad del email
        this.checkEmailAvailability = async function (email) {
            const errorElement = document.getElementById('emailError');
            const inputElement = document.getElementById('email');

            if (!errorElement || !inputElement) return;

            try {
                const isAvailable = await this.simulateEmailCheck(email);

                if (isAvailable) {
                    this.validator.hideError(errorElement);
                    inputElement.classList.add('valid');
                    this.showNotification('Email disponible', 'success');
                } else {
                    this.validator.showError(errorElement, 'Este email ya está registrado');
                    inputElement.classList.add('invalid');
                }
            } catch (error) {
                this.validator.showError(errorElement, 'Error al verificar el email');
                console.error('Error checking email:', error);
            }
        }.bind(this);

        // Método para verificar disponibilidad del teléfono alternativo
        this.checkAlternatePhoneAvailability = async function (phone) {
            const errorElement = document.getElementById('alternatePhoneError');
            const inputElement = document.getElementById('alternatePhone');
            const checkButton = document.getElementById('checkAlternatePhone');

            if (!errorElement || !inputElement) return;

            try {
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

    simulateEmailCheck(email) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simular que algunos emails ya están registrados
                const takenEmails = ['admin@petluz.com', 'test@petluz.com', 'user@petluz.com'];
                resolve(!takenEmails.includes(email));
            }, 1000);
        });
    }

    simulatePhoneCheck(phone) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simular que algunos teléfonos ya están registrados
                const takenPhones = ['3001234567', '3112345678', '3209876543'];
                resolve(!takenPhones.includes(phone));
            }, 1000);
        });
    }

    setupEventListeners() {
        // Event listeners para validación en tiempo real
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const phone = document.getElementById('phone');
        const alternatePhone = document.getElementById('alternatePhone');
        const dateOfBirth = document.getElementById('dateOfBirth');
        const checkEmail = document.getElementById('checkEmail');
        const checkPhone = document.getElementById('checkPhone');
        const checkAlternatePhone = document.getElementById('checkAlternatePhone');

        if (email) {
            email.addEventListener('input', (e) => {
                this.validator.validateEmail(e.target.value);
            });
        }

        if (password) {
            password.addEventListener('input', (e) => {
                this.validator.validatePassword(e.target.value);
                // También validar confirmación cuando se cambia la contraseña
                const confirmValue = document.getElementById('confirmPassword').value;
                if (confirmValue) {
                    this.validator.validateConfirmPassword(confirmValue);
                }
            });
        }

        if (confirmPassword) {
            confirmPassword.addEventListener('input', (e) => {
                this.validator.validateConfirmPassword(e.target.value);
            });
        }

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

        if (checkEmail) {
            checkEmail.addEventListener('click', () => {
                const emailValue = document.getElementById('email')?.value;
                if (emailValue) {
                    this.validator.validateEmail(emailValue, true);
                }
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

        // Event listener para el botón de crear
        if (this.submitBtn) {
            this.submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.createUser();
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

    validateForm() {
        if (!this.validator) {
            this.showError('Sistema de validación no disponible');
            return false;
        }

        const validations = [
            this.validator.validateEmail(document.getElementById('email').value, true),
            this.validator.validatePassword(document.getElementById('password').value),
            this.validator.validateConfirmPassword(document.getElementById('confirmPassword').value),
            this.validator.validateName(document.getElementById('firstName').value, 'firstName'),
            this.validator.validateName(document.getElementById('lastName').value, 'lastName'),
            this.validator.validatePhone(document.getElementById('phone').value, true),
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

    createUser() {
        if (!this.validateForm()) {
            this.showError('Por favor, corrige los errores en el formulario');
            return;
        }

        const userData = this.getFormData();
        this.submitForm(userData);
    }

    getFormData() {
        let dateOfBirth = document.getElementById('dateOfBirth').value;
        // Si hay fecha de nacimiento, enviarla EXACTAMENTE como está
        if (dateOfBirth) {
            const date = new Date(dateOfBirth);
        }

        return {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            phone: document.getElementById('phone').value,
            alternatePhone: document.getElementById('alternatePhone').value || null,
            dateOfBirth: dateOfBirth || null,
            gender: document.getElementById('gender').value || null,
            role: document.getElementById('role').value,
            isActive: document.getElementById('isActive').checked,
            emailNotifications: document.getElementById('emailNotifications').checked,
            smsNotifications: document.getElementById('smsNotifications').checked,
            newsletterSubscription: document.getElementById('newsletterSubscription')?.checked || true
        };
    }

    submitForm(data) {
        this.setLoadingState(true);

        fetch('/system-admin/api/users', {
            method: 'POST',
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
            .then(user => {
                this.showSuccessModal(data.password);
            })
            .catch(error => {
                console.error('Error:', error);
                this.showError('Error al crear usuario: ' + error.message);
            })
            .finally(() => {
                this.setLoadingState(false);
            });
    }

    showSuccessModal(password) {
        // Mostrar modal de éxito con la contraseña
        document.getElementById('assignedPassword').textContent = password;
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();
        
        // Agregar clase personalizada al modal
        document.getElementById('successModal').classList.add('success-modal');
    }

    setLoadingState(loading) {
        if (!this.submitBtn) return;

        if (loading) {
            this.submitBtn.disabled = true;
            this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando...';
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = '<i class="fas fa-save"></i> Crear Usuario';
        }
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
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Primero inicializar el validador
    if (typeof FormValidator !== 'undefined') {
        window.formValidator = new FormValidator();
    }

    // Luego inicializar el formulario de creación
    window.createUserForm = new CreateUserForm();
});

// Manejo de errores globales
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
});