// customer_validations.js - SISTEMA DE VALIDACIONES
class CustomerValidations {
    constructor() {
        this.patternsDictionary = window.patternsDictionary || this.createFallbackPatternsDictionary();
        this.initializeValidators();
        this.setupRealTimeValidation();
        this.setupZipCodeProtection();
        this.setupFormSubmissionHandler();
        this.hasUserInteracted = false;
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
            contactName: this.validateContactName.bind(this),
            contactPhone: this.validateContactPhone.bind(this),
            addressLine1: this.validateAddressLine1.bind(this),
            addressLine2: this.validateAddressLine2.bind(this),
            landmark: this.validateLandmark.bind(this),
            deliveryInstructions: this.validateDeliveryInstructions.bind(this),
            zipCode: this.validateZipCode.bind(this),
            addressType: this.validateAddressType.bind(this),
            department: this.validateDepartment.bind(this),
            city: this.validateCity.bind(this)
        };
    }

    setupRealTimeValidation() {
        const form = document.getElementById('addressForm');
        if (!form) return;

        Object.keys(this.validators).forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                let fieldHasInteracted = false;

                field.addEventListener('input', this.debounce((e) => {
                    fieldHasInteracted = true;
                    this.hasUserInteracted = true;
                    this.validateField(fieldName, e.target.value, field);
                }, 300));

                field.addEventListener('blur', (e) => {
                    if (fieldHasInteracted || e.target.value) {
                        this.validateField(fieldName, e.target.value, field);
                    }
                });
            }
        });
    }

    setupZipCodeProtection() {
        const zipCodeField = document.getElementById('zipCode');
        if (zipCodeField) {
            zipCodeField.readOnly = true;
            zipCodeField.title = 'Código postal autocompletado - No editable';
            zipCodeField.placeholder = 'Se autocompletará desde el mapa';

            zipCodeField.addEventListener('keydown', (e) => {
                if (e.target.readOnly) {
                    e.preventDefault();
                }
            });

            zipCodeField.addEventListener('paste', (e) => {
                e.preventDefault();
            });

            zipCodeField.addEventListener('drop', (e) => {
                e.preventDefault();
            });
        }
    }

    setupFormSubmissionHandler() {
        const form = document.getElementById('addressForm');
        if (form) {
            form.removeEventListener('submit', this.handleFormSubmit.bind(this));
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }
    }

    handleFormSubmit(e) {
        this.hasUserInteracted = true;

        if (!this.validateFullForm()) {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.showFormErrors();
        }
    }

    // Configuraciones específicas por campo
    getValidationConfig(fieldName) {
        const configs = {
            contactName: {
                minLength: 2,
                strictMode: true,
                rejectRepetitive: true,
                maxLength: 100,
                allowNumbers: false,
                allowSpecialChars: false
            },
            addressLine1: {
                minLength: 5,
                strictMode: false,
                rejectRepetitive: true,
                maxLength: 200,
                allowNumbers: true,
                allowSpecialChars: true
            },
            addressLine2: {
                minLength: 3,
                strictMode: false,
                rejectRepetitive: true,
                maxLength: 100,
                allowNumbers: true,
                allowSpecialChars: true
            },
            landmark: {
                minLength: 5,
                strictMode: false,
                rejectRepetitive: true,
                maxLength: 150,
                allowNumbers: true,
                allowSpecialChars: true
            },
            deliveryInstructions: {
                minLength: 10,
                strictMode: false,
                rejectRepetitive: true,
                maxLength: 500,
                allowNumbers: true,
                allowSpecialChars: true
            }
        };
        
        return configs[fieldName] || { 
            minLength: 1, 
            strictMode: false, 
            rejectRepetitive: true,
            allowNumbers: true,
            allowSpecialChars: false
        };
    }

    validateContactName(value) {
        const errors = [];
        const trimmedValue = (value || '').trim();

        if (!trimmedValue) {
            return { isValid: false, errors: ['El nombre de contacto es obligatorio'] };
        }

        const words = trimmedValue.split(/\s+/).filter(word => word.length > 0);

        if (words.length < 2) {
            errors.push('Debe contener al menos nombre y apellido (2 palabras)');
        }

        const uniqueWords = new Set(words.map(word => word.toLowerCase()));
        if (uniqueWords.size < words.length) {
            errors.push('No puede repetir la misma palabra');
        }

        const config = this.getValidationConfig('contactName');

        words.forEach((word) => {
            if (word.length < 2) {
                errors.push(`"${word}" es muy corta (mínimo 2 caracteres)`);
            }

            if (!this.patternsDictionary.isValidText(word, config)) {
                errors.push(`"${word}" no es un nombre válido`);
            }

            if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s.'-]+$/.test(word)) {
                errors.push(`"${word}" contiene caracteres no permitidos`);
            }
        });

        if (trimmedValue.length < 4) {
            errors.push('Mínimo 4 caracteres en total');
        }

        if (trimmedValue.length > config.maxLength) {
            errors.push(`Máximo ${config.maxLength} caracteres`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateContactPhone(value) {
        const errors = [];
        const cleanValue = (value || '').replace(/\s/g, '');

        if (!cleanValue) {
            return { isValid: false, errors: ['El teléfono es obligatorio'] };
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

    validateAddressLine1(value) {
        const errors = [];
        const trimmedValue = (value || '').trim();
        const config = this.getValidationConfig('addressLine1');

        if (!trimmedValue) {
            return { isValid: false, errors: ['La dirección principal es obligatoria'] };
        }

        if (trimmedValue.length < config.minLength) {
            errors.push(`Mínimo ${config.minLength} caracteres`);
        }

        if (trimmedValue.length > config.maxLength) {
            errors.push(`Máximo ${config.maxLength} caracteres`);
        }

        if (/^[0-9#@!$%^&*()]/.test(trimmedValue)) {
            errors.push('No puede comenzar con números o caracteres especiales');
        }

        if (!this.patternsDictionary.isValidText(trimmedValue, config)) {
            errors.push('La dirección contiene texto no válido o patrones sospechosos');
        }

        if (!this.isValidAddressStructure(trimmedValue)) {
            errors.push('La dirección debe contener letras y números (Ej: Calle 100 # 15-20)');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateAddressLine2(value) {
        if (!value || value.trim().length === 0) {
            return { isValid: true, errors: [] };
        }

        const errors = [];
        const trimmedValue = value.trim();
        const config = this.getValidationConfig('addressLine2');

        if (trimmedValue.length < config.minLength) {
            errors.push(`Mínimo ${config.minLength} caracteres`);
        }

        if (trimmedValue.length > config.maxLength) {
            errors.push(`Máximo ${config.maxLength} caracteres`);
        }

        if (!this.patternsDictionary.isValidText(trimmedValue, config)) {
            errors.push('El texto no parece ser válido');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateLandmark(value) {
        if (!value || value.trim().length === 0) {
            return { isValid: true, errors: [] };
        }

        const errors = [];
        const trimmedValue = value.trim();
        const config = this.getValidationConfig('landmark');

        if (trimmedValue.length < config.minLength) {
            errors.push(`Mínimo ${config.minLength} caracteres`);
        }

        if (trimmedValue.length > config.maxLength) {
            errors.push(`Máximo ${config.maxLength} caracteres`);
        }

        if (!this.patternsDictionary.isValidText(trimmedValue, config)) {
            errors.push('El punto de referencia contiene texto no válido');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateDeliveryInstructions(value) {
        if (!value || value.trim().length === 0) {
            return { isValid: true, errors: [] };
        }

        const errors = [];
        const trimmedValue = value.trim();
        const config = this.getValidationConfig('deliveryInstructions');

        if (trimmedValue.length < config.minLength) {
            errors.push(`Mínimo ${config.minLength} caracteres para instrucciones claras`);
        }

        if (trimmedValue.length > config.maxLength) {
            errors.push(`Máximo ${config.maxLength} caracteres`);
        }

        if (!this.patternsDictionary.isValidText(trimmedValue, config)) {
            errors.push('Las instrucciones contienen texto no válido');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateZipCode(value) {
        if (!value || value.trim().length === 0) {
            return { isValid: true, errors: [] };
        }

        const errors = [];
        const cleanValue = value.trim();

        if (cleanValue && !/^[0-9]{6}$/.test(cleanValue)) {
            errors.push('Debe tener 6 dígitos');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateAddressType(value) {
        const errors = [];
        if (!value) {
            errors.push('El tipo de dirección es obligatorio');
        }
        return { isValid: errors.length === 0, errors };
    }

    validateDepartment(value) {
        const errors = [];
        if (!value) {
            errors.push('El departamento es obligatorio');
        }
        return { isValid: errors.length === 0, errors };
    }

    validateCity(value) {
        const errors = [];
        if (!value) {
            errors.push('La ciudad es obligatoria');
        }
        return { isValid: errors.length === 0, errors };
    }

    // Métodos auxiliares
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

    isValidAddressStructure(address) {
        const hasLetters = /[a-zA-Záéíóúñ]/.test(address);
        const hasNumbers = /[0-9]/.test(address);
        const words = address.split(/\s+/).filter(word => word.length >= 2);
        return hasLetters && hasNumbers && words.length >= 2;
    }

    // Métodos de UI
    validateField(fieldName, value, fieldElement) {
        if (!this.hasUserInteracted) {
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

        formGroup.classList.remove('success', 'error', 'warning');

        const existingErrors = formGroup.querySelectorAll('.validation-error, .validation-warning');
        existingErrors.forEach(error => error.remove());

        if (validationResult.isValid) {
            formGroup.classList.add('success');
        } else {
            formGroup.classList.add('error');

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

    validateFullForm() {
        let isValid = true;
        let firstErrorField = null;
        const form = document.getElementById('addressForm');

        Object.keys(this.validators).forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                const validator = this.validators[fieldName];
                const result = validator(field.value);

                if (!result.isValid) {
                    isValid = false;
                    this.updateFieldUI(field, result);

                    if (!firstErrorField) {
                        firstErrorField = field;
                    }
                }
            }
        });

        if (!isValid && firstErrorField) {
            this.scrollToField(firstErrorField);
        }

        return isValid;
    }

    scrollToField(fieldElement) {
        setTimeout(() => {
            fieldElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });

            if (fieldElement.focus) {
                fieldElement.focus();
            }

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

    // Utilidades
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
        if (window.addressForm && window.addressForm.showNotification) {
            window.addressForm.showNotification(message, type);
        } else {
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

document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        try {
            window.customerValidations = new CustomerValidations();
        } catch (error) {
            console.error('Error inicializando validaciones:', error);
        }
    }, 100);
});

window.CustomerValidations = CustomerValidations;