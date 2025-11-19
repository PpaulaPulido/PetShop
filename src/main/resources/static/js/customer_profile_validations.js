class CustomerProfileValidations {
    constructor() {
        this.patternsDictionary = window.patternsDictionary || this.createFallbackPatternsDictionary();
        this.hasUserInteracted = false;
        this.initializeValidators();
        this.setupRealTimeValidation();
        this.setupFormSubmissionHandlers();
    }

    createFallbackPatternsDictionary() {
        return {
            isValidText: function (text, options = {}) {
                if (!text || text.trim().length < (options.minLength || 1)) {
                    return false;
                }

                const trimmed = text.trim().toLowerCase();

                if (/^\d+$/.test(trimmed)) {
                    return false;
                }

                if (/^[^a-zA-Z0-9áéíóúñ\s]+$/.test(trimmed)) {
                    return false;
                }

                const keyboardPatterns = ['qwerty', 'asdfg', 'zxcvb', '12345', 'abcde'];
                if (keyboardPatterns.some(pattern => trimmed.includes(pattern))) {
                    return false;
                }

                if (/(.)\1{3,}/.test(trimmed)) {
                    return false;
                }

                if (trimmed.length >= 3) {
                    const hasVowel = /[aeiouáéíóú]/.test(trimmed);
                    const hasConsonant = /[bcdfghjklmnpqrstvwxyz]/.test(trimmed);
                    if (!hasVowel || !hasConsonant) {
                        return false;
                    }
                }

                return true;
            }
        };
    }

    initializeValidators() {
        this.validators = {
            firstName: this.validateFirstName.bind(this),
            lastName: this.validateLastName.bind(this),
            dateOfBirth: this.validateDateOfBirth.bind(this),
            phone: this.validatePhone.bind(this),
            alternatePhone: this.validateAlternatePhone.bind(this),
            currentPassword: this.validateCurrentPassword.bind(this),
            newPassword: this.validateNewPassword.bind(this),
            confirmPassword: this.validateConfirmPassword.bind(this)
        };
    }

    setupRealTimeValidation() {
        Object.keys(this.validators).forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                let fieldHasInteracted = false;

                // Crear contenedor de estado de validación
                this.createValidationStatus(field);

                // REDUCIR DEBOUNCE PARA MEJOR RESPONSIVIDAD
                field.addEventListener('input', this.debounce((e) => {
                    fieldHasInteracted = true;
                    this.hasUserInteracted = true;
                    this.validateField(fieldName, e.target.value, field);
                }, 150));

                field.addEventListener('blur', (e) => {
                    fieldHasInteracted = true;
                    this.hasUserInteracted = true;
                    this.validateField(fieldName, e.target.value, field);
                });

                // VALIDACIÓN INMEDIATA AL CARGAR SI HAY VALOR
                if (field.value) {
                    setTimeout(() => {
                        this.validateField(fieldName, field.value, field);
                    }, 100);
                }
            }
        });

        // Setup para confirmación de contraseña
        const newPassword = document.getElementById('newPassword');
        const confirmPassword = document.getElementById('confirmPassword');

        if (newPassword && confirmPassword) {
            newPassword.addEventListener('input', this.debounce(() => {
                if (confirmPassword.value) {
                    this.validateField('confirmPassword', confirmPassword.value, confirmPassword);
                }
            }, 150));

            confirmPassword.addEventListener('input', this.debounce((e) => {
                this.validateField('confirmPassword', e.target.value, confirmPassword);
            }, 150));
        }

        // Setup para password requirements
        this.setupPasswordRequirements();

    }

    setupPasswordRequirements() {
        const newPassword = document.getElementById('newPassword');
        if (newPassword) {
            this.createPasswordRequirementsUI(newPassword);

            newPassword.addEventListener('input', (e) => {
                this.updatePasswordRequirements(e.target.value);
                this.updatePasswordStrength(e.target.value);
            });
        }
    }

    createValidationStatus(field) {
        const formGroup = field.closest('.form-group');
        if (formGroup && !formGroup.querySelector('.validation-status')) {
            const status = document.createElement('span');
            status.className = 'validation-status';
            formGroup.appendChild(status);
        }
    }

    createPasswordRequirementsUI(passwordField) {
        const formGroup = passwordField.closest('.form-group');
        if (!formGroup) return;

        const requirementsContainer = document.createElement('div');
        requirementsContainer.className = 'password-requirements';
        requirementsContainer.innerHTML = `
            <div class="requirement" data-requirement="length">Mínimo 8 caracteres</div>
            <div class="requirement" data-requirement="uppercase">Al menos una mayúscula</div>
            <div class="requirement" data-requirement="number">Al menos un número</div>
            <div class="requirement" data-requirement="special">Al menos un carácter especial (@$!%*?&)</div>
        `;

        const strengthContainer = document.createElement('div');
        strengthContainer.className = 'strength-meter';
        strengthContainer.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill"></div>
            </div>
            <div class="strength-text">Seguridad de la contraseña</div>
        `;

        formGroup.appendChild(requirementsContainer);
        formGroup.appendChild(strengthContainer);
    }

    setupFormSubmissionHandlers() {
        const forms = ['personalInfoForm', 'contactInfoForm', 'changePasswordForm'];

        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) {
                form.removeEventListener('submit', this.handleFormSubmit.bind(this));
                form.addEventListener('submit', this.handleFormSubmit.bind(this));
            }
        });

    }

    handleFormSubmit(e) {
        this.hasUserInteracted = true;

        if (!this.validateForm(e.target.id)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.showFormErrors();
            return false;
        }

        return true;
    }

    // VALIDATORS PRINCIPALES
    validateFirstName(value) {
        const errors = [];
        const trimmedValue = (value || '').trim();

        if (!trimmedValue) {
            return { isValid: false, errors: ['El nombre es obligatorio'] };
        }

        const words = trimmedValue.split(/\s+/).filter(word => word.length > 0);

        if (words.length === 0) {
            errors.push('El nombre no puede estar vacío');
        }

        words.forEach((word) => {
            if (word.length < 3) {
                errors.push(`"${word}" es muy corto (mínimo 3 letras)`);
            }

            if (!this.patternsDictionary.isValidText(word, { minLength: 3 })) {
                errors.push(`"${word}" no es un nombre válido`);
            }

            if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s.'-]+$/.test(word)) {
                errors.push(`"${word}" contiene caracteres no permitidos`);
            }
        });

        if (trimmedValue.length > 50) {
            errors.push('Máximo 50 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateLastName(value) {
        const errors = [];
        const trimmedValue = (value || '').trim();

        if (!trimmedValue) {
            return { isValid: false, errors: ['El apellido es obligatorio'] };
        }

        const words = trimmedValue.split(/\s+/).filter(word => word.length > 0);

        if (words.length === 0) {
            errors.push('El apellido no puede estar vacío');
        }

        words.forEach((word) => {
            if (word.length < 3) {
                errors.push(`"${word}" es muy corto (mínimo 3 letras)`);
            }

            if (!this.patternsDictionary.isValidText(word, { minLength: 3 })) {
                errors.push(`"${word}" no es un apellido válido`);
            }

            if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s.'-]+$/.test(word)) {
                errors.push(`"${word}" contiene caracteres no permitidos`);
            }
        });

        if (trimmedValue.length > 50) {
            errors.push('Máximo 50 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateDateOfBirth(value) {
        const errors = [];

        if (!value) {
            return { isValid: true, errors: [] }; // Opcional
        }

        const birthDate = new Date(value);
        const today = new Date();
        const minAgeDate = new Date();
        const maxAgeDate = new Date();

        minAgeDate.setFullYear(today.getFullYear() - 18); // Mínimo 18 años
        maxAgeDate.setFullYear(today.getFullYear() - 90); // Máximo 90 años

        // Validar que no sea fecha futura
        if (birthDate > today) {
            errors.push('La fecha de nacimiento no puede ser en el futuro');
        }

        // Validar edad mínima (18 años)
        if (birthDate > minAgeDate) {
            errors.push('Debes ser mayor de 18 años');
        }

        // Validar edad máxima (90 años)
        if (birthDate < maxAgeDate) {
            errors.push('La edad no puede ser mayor a 90 años');
        }

        // Validar fecha válida
        if (isNaN(birthDate.getTime())) {
            errors.push('Fecha de nacimiento no válida');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validatePhone(value) {
        return this.validatePhoneNumber(value, true);
    }

    validateAlternatePhone(value) {
        if (!value || value.trim().length === 0) {
            return { isValid: true, errors: [] }; // Opcional
        }
        return this.validatePhoneNumber(value, false);
    }

    validatePhoneNumber(value, isRequired = true) {
        const errors = [];
        const cleanValue = (value || '').replace(/\s/g, '');

        if (isRequired && !cleanValue) {
            return { isValid: false, errors: ['El teléfono es obligatorio'] };
        }

        if (!cleanValue) {
            return { isValid: true, errors: [] };
        }

        if (!/^[0-9]{10}$/.test(cleanValue)) {
            errors.push('Debe tener exactamente 10 dígitos');
            return { isValid: false, errors };
        }

        if (this.isRepeatedNumber(cleanValue)) {
            errors.push('No puede tener todos los dígitos iguales');
        }

        if (this.isAlternatingPattern(cleanValue)) {
            errors.push('Patrón numérico no válido');
        }

        if (!this.hasEnoughDigitVariety(cleanValue)) {
            errors.push('El número debe tener más variedad de dígitos');
        }

        if (!this.isValidColombianPhone(cleanValue)) {
            errors.push('Prefijo no válido para Colombia');
        }

        if (this.isObviousSequence(cleanValue)) {
            errors.push('Número con secuencia obvia');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateCurrentPassword(value) {
        const errors = [];

        if (!value) {
            return { isValid: false, errors: ['La contraseña actual es obligatoria'] };
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateNewPassword(value) {
        const errors = [];

        if (!value) {
            return { isValid: false, errors: ['La nueva contraseña es obligatoria'] };
        }

        // Verificar requisitos
        const hasMinLength = value.length >= 8;
        const hasUppercase = /[A-Z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[@$!%*?&]/.test(value);

        if (!hasMinLength) {
            errors.push('Mínimo 8 caracteres');
        }

        if (!hasUppercase) {
            errors.push('Al menos una letra mayúscula');
        }

        if (!hasNumber) {
            errors.push('Al menos un número');
        }

        if (!hasSpecial) {
            errors.push('Al menos un carácter especial (@$!%*?&)');
        }

        // Validar patrones comunes inseguros
        if (this.isCommonPassword(value)) {
            errors.push('Esta contraseña es muy común y poco segura');
        }

        // Validar patrones repetitivos
        if (this.hasRepetitivePattern(value)) {
            errors.push('La contraseña contiene patrones repetitivos inseguros');
        }

        // Validar secuencias de teclado
        if (this.isKeyboardSequence(value)) {
            errors.push('La contraseña contiene secuencias de teclado inseguras');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateConfirmPassword(value) {
        const errors = [];
        const newPassword = document.getElementById('newPassword')?.value;

        if (!value) {
            return { isValid: false, errors: ['Confirma tu nueva contraseña'] };
        }

        if (value !== newPassword) {
            errors.push('Las contraseñas no coinciden');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // MÉTODOS AUXILIARES PARA TELÉFONOS
    isRepeatedNumber(phone) {
        return /^(\d)\1+$/.test(phone);
    }

    isAlternatingPattern(phone) {
        const patterns = [
            /^(\d)(\d)\1\2\1\2\1\2\1\2$/,
            /^(\d)\1(\d)\2\1\1\d\2\2$/,
            /^(\d)\1{0,1}(\d)\2{0,1}\1\1{0,1}\2\2{0,1}\1\1{0,1}\2\2{0,1}$/,
            /^(\d{2})\1{4}$/,
            /^(\d{3})\1{3}$/
        ];
        return patterns.some(pattern => pattern.test(phone));
    }

    hasEnoughDigitVariety(phone) {
        const uniqueDigits = new Set(phone.split(''));
        return uniqueDigits.size >= 3;
    }

    isValidColombianPhone(phone) {
        const prefix = phone[0];
        return ['3', '1', '2', '4', '5', '6', '8', '9'].includes(prefix);
    }

    isObviousSequence(phone) {
        const sequences = [
            '1234567890', '0987654321', '1111111111', '2222222222', '3333333333',
            '4444444444', '5555555555', '6666666666', '7777777777', '8888888888',
            '9999999999', '0000000000', '1212121212', '1231231231', '3213213213',
            '1010101010', '2020202020', '3030303030', '4040404040', '5050505050'
        ];
        return sequences.includes(phone);
    }

    // MÉTODOS AUXILIARES PARA CONTRASEÑAS
    isCommonPassword(password) {
        const commonPasswords = [
            'password', '12345678', 'qwertyui', 'admin123', 'welcome',
            'password1', '123456789', '1234567890', 'abc123', 'password123'
        ];
        return commonPasswords.includes(password.toLowerCase());
    }

    hasRepetitivePattern(password) {
        return /(.)\1{2,}/.test(password) || /(..)\1{2,}/.test(password);
    }

    isKeyboardSequence(password) {
        const sequences = [
            'qwerty', 'asdfgh', 'zxcvbn', '123456', 'abcdef'
        ];
        const lowerPassword = password.toLowerCase();
        return sequences.some(seq => lowerPassword.includes(seq));
    }

    isStrongPassword(value) {
        const hasMinLength = value.length >= 12;
        const hasUppercase = /[A-Z]/.test(value);
        const hasLowercase = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[@$!%*?&]/.test(value);

        return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
    }

    // MÉTODOS DE UI
    validateField(fieldName, value, fieldElement) {
        if (!this.hasUserInteracted && !value) {
            return;
        }

        const validator = this.validators[fieldName];
        if (!validator) return;

        const result = validator(value);
        this.updateFieldUI(fieldElement, result);
    }

    updateFieldUI(fieldElement, validationResult) {
        const formGroup = fieldElement.closest('.form-group');
        if (!formGroup) return;

        // Remover estados anteriores
        formGroup.classList.remove('success', 'error', 'warning');

        const existingErrors = formGroup.querySelectorAll('.validation-error');
        existingErrors.forEach(error => error.remove());

        const statusIcon = formGroup.querySelector('.validation-status');
        if (statusIcon) {
            statusIcon.textContent = '';
        }

        // Aplicar nuevo estado
        if (validationResult.isValid) {
            formGroup.classList.add('success');
            if (statusIcon) {
                statusIcon.textContent = '✓';
            }
        } else {
            formGroup.classList.add('error');
            if (statusIcon) {
                statusIcon.textContent = '⚠';
            }

            if (validationResult.errors.length > 0) {
                const errorElement = document.createElement('div');
                errorElement.className = 'validation-error';
                errorElement.innerHTML = validationResult.errors
                    .map(error => `<div class="error-item">${error}</div>`)
                    .join('');
                formGroup.appendChild(errorElement);
            }
        }
    }

    updatePasswordRequirements(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[@$!%*?&]/.test(password)
        };

        Object.keys(requirements).forEach(req => {
            const element = document.querySelector(`[data-requirement="${req}"]`);
            if (element) {
                element.classList.toggle('met', requirements[req]);
            }
        });
    }

    updatePasswordStrength(password) {
        const strengthFill = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');

        if (!strengthFill || !strengthText) return;

        const requirements = [
            password.length >= 8,
            /[A-Z]/.test(password),
            /\d/.test(password),
            /[@$!%*?&]/.test(password)
        ];

        const strength = requirements.filter(Boolean).length;

        strengthFill.className = 'strength-fill';
        strengthText.textContent = 'Seguridad de la contraseña';

        if (password.length === 0) {
            strengthFill.style.width = '0%';
            return;
        }

        switch (strength) {
            case 1:
                strengthFill.classList.add('weak');
                strengthText.textContent = 'Muy débil';
                break;
            case 2:
                strengthFill.classList.add('medium');
                strengthText.textContent = 'Débil';
                break;
            case 3:
                strengthFill.classList.add('strong');
                strengthText.textContent = 'Buena';
                break;
            case 4:
                if (this.isStrongPassword(password)) {
                    strengthFill.classList.add('very-strong');
                    strengthText.textContent = 'Muy fuerte';
                } else {
                    strengthFill.classList.add('strong');
                    strengthText.textContent = 'Fuerte';
                }
                break;
        }
    }

    validateForm(formId) {
        let isValid = true;
        let firstErrorField = null;

        const form = document.getElementById(formId);
        if (!form) {
            return false;
        }

        // Forzar interacción del usuario
        this.hasUserInteracted = true;

        // Validar campos específicos según el formulario
        const fieldsToValidate = this.getFormFields(formId);

        fieldsToValidate.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                const validator = this.validators[fieldName];
                if (validator) {
                    const result = validator(field.value);
                    this.updateFieldUI(field, result);

                    if (!result.isValid) {
                        isValid = false;
                        if (!firstErrorField) {
                            firstErrorField = field;
                        }
                    } 
                }
            }
        });

        if (!isValid && firstErrorField) {
            this.scrollToField(firstErrorField);
        } 

        return isValid;
    }

    getFormFields(formId) {
        const fieldMap = {
            personalInfoForm: ['firstName', 'lastName', 'dateOfBirth'],
            contactInfoForm: ['phone', 'alternatePhone'],
            changePasswordForm: ['currentPassword', 'newPassword', 'confirmPassword']
        };

        return fieldMap[formId] || [];
    }

    scrollToField(fieldElement) {
        setTimeout(() => {
            fieldElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });

            fieldElement.focus();

            // Efecto de shake si está disponible
            if (window.petLuzEffects && window.petLuzEffects.shakeElement) {
                const formGroup = fieldElement.closest('.form-group') || fieldElement;
                window.petLuzEffects.shakeElement(formGroup);
            }
        }, 100);
    }

    showFormErrors() {
        const firstError = document.querySelector('.form-group.error');
        if (firstError) {
            this.scrollToField(firstError);
        }

        this.showNotification('Por favor corrige los errores en el formulario', 'error');
    }

    // UTILIDADES
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

    showNotification(message, type = 'info') {
        if (window.customerProfile && window.customerProfile.showNotification) {
            window.customerProfile.showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                color: white;
                z-index: 10000;
                font-weight: 500;
                box-shadow: 0 8px 30px rgba(0,0,0,0.15);
                background: ${type === 'error' ? '#f44336' :
                    type === 'warning' ? '#ff9800' : '#6A2FB4'};
                animation: slideInRight 0.3s ease;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 5000);
        }
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        try {
            window.customerProfileValidations = new CustomerProfileValidations();
        } catch (error) {
            console.error('Error inicializando validaciones de perfil:', error);
        }
    }, 100);
});

window.CustomerProfileValidations = CustomerProfileValidations;