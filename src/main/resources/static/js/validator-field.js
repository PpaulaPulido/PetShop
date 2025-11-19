class FieldValidator {
    constructor() {
        this.patterns = window.patternsDictionary;
        this.setupDefaultValidations();
        this.lastValidationState = {};
    }

    setupDefaultValidations() {
        this.validations = {
            // Texto general
            name: this.validateName.bind(this),
            title: this.validateName.bind(this),
            description: this.validateDescription.bind(this),
            categoryName: this.validateCategoryName.bind(this),
            categoryDescription: this.validateCategoryDescription.bind(this),

            // Números
            price: this.validatePrice.bind(this),
            stock: this.validateStock.bind(this),
            quantity: this.validateStock.bind(this),
            minStock: this.validateMinStock.bind(this),

            // Selecciones
            category: this.validateCategory.bind(this),
            type: this.validateType.bind(this),
            status: this.validateStatus.bind(this),

            // Texto especial
            email: this.validateEmail.bind(this),
            phone: this.validatePhone.bind(this),
            url: this.validateUrl.bind(this)
        };
    }

    // ========== VALIDACIONES ESPECÍFICAS ==========

    validateName(value, isRequired = true) {
        if (!value || !value.trim()) {
            return {
                isValid: !isRequired,
                message: isRequired ? 'Este campo es requerido' : ''
            };
        }

        const name = value.trim();

        // Verificar que tenga al menos 1 palabra
        const words = name.split(/\s+/).filter(word => word.length > 0);
        if (words.length === 0) {
            return { isValid: false, message: 'Debe contener al menos una palabra' };
        }

        // Si es una sola palabra, debe tener mínimo 3 caracteres
        if (words.length === 1 && words[0].length < 3) {
            return { isValid: false, message: 'Una sola palabra debe tener mínimo 3 caracteres' };
        }

        if (name.length > 100) {
            return { isValid: false, message: 'Máximo 100 caracteres' };
        }

        // No puede comenzar con número o carácter especial
        if (/^[0-9]/.test(name)) {
            return { isValid: false, message: 'No puede comenzar con números' };
        }

        if (/^[^a-zA-Z0-9\s]/.test(name)) {
            return { isValid: false, message: 'No puede comenzar con caracteres especiales' };
        }

        // Validación de coherencia textual
        if (!this.patterns.isValidText(name, { strictMode: false })) {
            return {
                isValid: false,
                message: 'El texto no parece tener sentido'
            };
        }

        return { isValid: true, message: '✓ Nombre válido' };
    }

    validateDescription(value, isRequired = false) {
        if (!value || !value.trim()) {
            return {
                isValid: !isRequired,
                message: isRequired ? 'Este campo es requerido' : ''
            };
        }

        const description = value.trim();

        // Mínimo 3 palabras, máximo 50 palabras para productos
        const words = description.split(/\s+/).filter(word => word.length > 0);
        if (words.length < 3) {
            return { isValid: false, message: 'Debe tener al menos 3 palabras' };
        }

        if (words.length > 50) {
            return { isValid: false, message: 'Máximo 50 palabras' };
        }

        if (description.length > 1000) {
            return { isValid: false, message: 'Máximo 1000 caracteres' };
        }

        // Validar palabras repetidas consecutivas
        if (this.hasConsecutiveRepeatedWords(description)) {
            return { isValid: false, message: 'No se permiten palabras repetidas consecutivas' };
        }

        // Validación de coherencia textual
        if (!this.patterns.isValidText(description, { strictMode: false })) {
            return {
                isValid: false,
                message: 'El texto contiene patrones sin sentido'
            };
        }

        return { isValid: true, message: '✓ Descripción válida' };
    }

    validateCategoryName(value, isRequired = true) {
        if (!value || !value.trim()) {
            return {
                isValid: !isRequired,
                message: isRequired ? 'El nombre de categoría es requerido' : ''
            };
        }

        const name = value.trim();

        // Verificar que tenga al menos 1 palabra
        const words = name.split(/\s+/).filter(word => word.length > 0);
        if (words.length === 0) {
            return { isValid: false, message: 'Debe contener al menos una palabra' };
        }

        // Si es una sola palabra, debe tener mínimo 3 caracteres
        if (words.length === 1 && words[0].length < 3) {
            return { isValid: false, message: 'Una sola palabra debe tener mínimo 3 caracteres' };
        }

        if (name.length > 50) {
            return { isValid: false, message: 'Máximo 50 caracteres' };
        }

        // No puede comenzar con número o carácter especial
        if (/^[0-9]/.test(name)) {
            return { isValid: false, message: 'No puede comenzar con números' };
        }

        if (/^[^a-zA-Z0-9\s]/.test(name)) {
            return { isValid: false, message: 'No puede comenzar con caracteres especiales' };
        }

        // Validación de coherencia textual
        if (!this.patterns.isValidText(name, { strictMode: false })) {
            return {
                isValid: false,
                message: 'El nombre no parece tener sentido'
            };
        }

        return { isValid: true, message: '✓ Nombre válido' };
    }

    validateCategoryDescription(value, isRequired = false) {
        if (!value || !value.trim()) {
            return {
                isValid: !isRequired,
                message: isRequired ? 'La descripción es requerida' : ''
            };
        }

        const description = value.trim();

        // Mínimo 3 palabras, máximo 30 palabras para categorías
        const words = description.split(/\s+/).filter(word => word.length > 0);
        if (words.length < 3) {
            return { isValid: false, message: 'Debe tener al menos 3 palabras' };
        }

        if (words.length > 30) {
            return { isValid: false, message: 'Máximo 30 palabras' };
        }

        if (description.length > 500) {
            return { isValid: false, message: 'Máximo 500 caracteres' };
        }

        // Validar palabras repetidas consecutivas
        if (this.hasConsecutiveRepeatedWords(description)) {
            return { isValid: false, message: 'No se permiten palabras repetidas consecutivas' };
        }

        // Validación de coherencia textual
        if (!this.patterns.isValidText(description, { strictMode: false })) {
            return {
                isValid: false,
                message: 'La descripción contiene patrones sin sentido'
            };
        }

        return { isValid: true, message: '✓ Descripción válida' };
    }

    // ========== MÉTODO PARA DETECTAR PALABRAS REPETIDAS ==========
    hasConsecutiveRepeatedWords(text) {
        const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);

        for (let i = 0; i < words.length - 1; i++) {
            if (words[i] === words[i + 1]) {
                return true;
            }
        }

        return false;
    }

    // ========== VALIDACIONES NUMÉRICAS ==========
    validatePrice(value, isRequired = true) {
        if (!value && isRequired) {
            return { isValid: false, message: 'El precio es requerido' };
        }

        if (!value) {
            return { isValid: true, message: '' };
        }

        const price = parseFloat(value);

        if (isNaN(price)) {
            return { isValid: false, message: 'Debe ser un número válido' };
        }

        if (price < 1000) {
            return { isValid: false, message: 'Mínimo $1.000' };
        }

        if (price > 100000000) {
            return { isValid: false, message: 'Máximo $100.000.000' };
        }

        return { isValid: true, message: '✓ Precio válido' };
    }

    validateStock(value, isRequired = true) {
        if (!value && isRequired) {
            return { isValid: false, message: 'Este campo es requerido' };
        }

        if (!value) {
            return { isValid: true, message: '' };
        }

        const stock = parseInt(value);

        if (isNaN(stock) || !Number.isInteger(stock)) {
            return { isValid: false, message: 'Debe ser un número entero' };
        }

        if (stock < 0) {
            return { isValid: false, message: 'No puede ser negativo' };
        }

        if (stock > 1000000) {
            return { isValid: false, message: 'Máximo 1.000.000 unidades' };
        }

        return { isValid: true, message: '✓ Stock válido' };
    }

    validateMinStock(value, isRequired = false) {
        if (!value) {
            return { isValid: true, message: '' };
        }

        const minStock = parseInt(value);

        if (isNaN(minStock) || !Number.isInteger(minStock)) {
            return { isValid: false, message: 'Debe ser un número entero' };
        }

        if (minStock < 5) {
            return { isValid: false, message: 'Mínimo 5 unidades' };
        }

        if (minStock > 10000) {
            return { isValid: false, message: 'Máximo 10.000 unidades' };
        }

        return { isValid: true, message: '✓ Stock mínimo válido' };
    }

    // ========== VALIDACIONES GENÉRICAS ==========
    validateCategory(value, isRequired = false) {
        if (!value && isRequired) {
            return { isValid: false, message: 'Este campo es requerido' };
        }
        return { isValid: true, message: '' };
    }

    validateType(value, isRequired = true) {
        if (!value && isRequired) {
            return { isValid: false, message: 'Este campo es requerido' };
        }
        return { isValid: true, message: '' };
    }

    validateStatus(value, isRequired = true) {
        if (!value && isRequired) {
            return { isValid: false, message: 'Este campo es requerido' };
        }
        return { isValid: true, message: '' };
    }

    validateEmail(value, isRequired = true) {
        if (!value && isRequired) {
            return { isValid: false, message: 'El email es requerido' };
        }

        if (!value) {
            return { isValid: true, message: '' };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return { isValid: false, message: 'Formato de email inválido' };
        }

        return { isValid: true, message: '✓ Email válido' };
    }

    validatePhone(value, isRequired = false) {
        if (!value) {
            return { isValid: true, message: '' };
        }

        const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
        if (!phoneRegex.test(value)) {
            return { isValid: false, message: 'Formato de teléfono inválido' };
        }

        return { isValid: true, message: '✓ Teléfono válido' };
    }

    validateUrl(value, isRequired = false) {
        if (!value) {
            return { isValid: true, message: '' };
        }

        try {
            new URL(value);
            return { isValid: true, message: '✓ URL válida' };
        } catch {
            return { isValid: false, message: 'URL inválida' };
        }
    }

    // ========== MÉTODOS DE VALIDACIÓN EN TIEMPO REAL ==========
    initializeRealTimeValidation(formId, fieldConfigs) {
        const form = document.getElementById(formId);
        if (!form) {
            console.warn(`Formulario con ID ${formId} no encontrado`);
            return;
        }

        fieldConfigs.forEach(config => {
            const field = document.getElementById(config.fieldId);
            if (field) {
                let timeoutId;

                field.addEventListener('input', () => {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => {
                        this.validateAndShowFeedback(
                            config.fieldId,
                            config.fieldType,
                            config.isRequired,
                            true
                        );
                    }, 500);
                });

                field.addEventListener('blur', () => {
                    clearTimeout(timeoutId);
                    this.validateAndShowFeedback(
                        config.fieldId,
                        config.fieldType,
                        config.isRequired,
                        true
                    );
                });

                field.addEventListener('focus', () => {
                    this.clearFieldError(field);
                });
            }
        });
    }

    // ========== MÉTODOS DE UI ==========
    validateAndShowFeedback(fieldId, fieldType, isRequired = true, showSuccess = false) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const value = field.value;
        const result = this.validateField(fieldType, value, isRequired);

        const currentState = `${fieldId}-${result.isValid}-${result.message}`;
        if (this.lastValidationState[fieldId] === currentState) {
            return result.isValid;
        }
        this.lastValidationState[fieldId] = currentState;

        if (!result.isValid) {
            this.showFieldError(field, result.message);
        } else {
            this.clearFieldError(field);
            if (showSuccess && result.message && result.message.startsWith('✓')) {
                this.showFieldSuccess(field, result.message);
            }
        }

        return result.isValid;
    }

    validateField(fieldType, value, isRequired = true) {
        const validationFn = this.validations[fieldType] || this.validateGenericField.bind(this);
        return validationFn(value, isRequired);
    }

    validateGenericField(value, isRequired = true) {
        if (!value && isRequired) {
            return { isValid: false, message: 'Este campo es requerido' };
        }

        if (!value) {
            return { isValid: true, message: '' };
        }

        return { isValid: true, message: '✓ Campo válido' };
    }

    showFieldError(fieldElement, message) {
        fieldElement.classList.add('is-invalid');
        fieldElement.classList.remove('is-valid');

        let feedbackElement = fieldElement.nextElementSibling;
        if (!feedbackElement || !feedbackElement.classList.contains('invalid-feedback')) {
            feedbackElement = document.createElement('div');
            feedbackElement.className = 'invalid-feedback';
            fieldElement.parentNode.insertBefore(feedbackElement, fieldElement.nextSibling);
        }

        feedbackElement.textContent = message;
        feedbackElement.style.display = 'block';
    }

    showFieldSuccess(fieldElement, message) {
        fieldElement.classList.add('is-valid');
        fieldElement.classList.remove('is-invalid');

        let feedbackElement = fieldElement.nextElementSibling;
        if (!feedbackElement || !feedbackElement.classList.contains('valid-feedback')) {
            feedbackElement = document.createElement('div');
            feedbackElement.className = 'valid-feedback';
            fieldElement.parentNode.insertBefore(feedbackElement, fieldElement.nextSibling);
        }

        feedbackElement.textContent = message;
        feedbackElement.style.display = 'block';

        setTimeout(() => {
            if (feedbackElement) {
                feedbackElement.style.display = 'none';
                fieldElement.classList.remove('is-valid');
            }
        }, 2000);
    }

    clearFieldError(fieldElement) {
        fieldElement.classList.remove('is-invalid', 'is-valid');

        const feedbackElement = fieldElement.nextElementSibling;
        if (feedbackElement &&
            (feedbackElement.classList.contains('invalid-feedback') ||
                feedbackElement.classList.contains('valid-feedback'))) {
            feedbackElement.style.display = 'none';
        }
    }

    // ========== VALIDACIÓN COMPLETA DE FORMULARIO ==========
    validateForm(formData, fieldRules) {
        const errors = [];
        let isValid = true;

        for (const [fieldName, rules] of Object.entries(fieldRules)) {
            const value = formData[fieldName];
            const result = this.validateField(rules.fieldType || fieldName, value, rules.required);

            if (!result.isValid) {
                isValid = false;
                errors.push({
                    field: fieldName,
                    message: result.message,
                    isValid: false
                });
            }
        }

        return {
            isValid,
            errors
        };
    }

    // ========== VALIDACIÓN RÁPIDA DE CAMPO ==========
    quickValidate(fieldId, fieldType, isRequired = true) {
        const field = document.getElementById(fieldId);
        if (!field) return false;

        const value = field.value;
        const result = this.validateField(fieldType, value, isRequired);
        return result.isValid;
    }

    // ========== MANEJO DE ERRORES DEL SERVIDOR ==========
    handleServerError(error, fieldMap = {}) {
        const errorMessages = [];

        if (error.includes('Ya existe un producto con el nombre')) {
            errorMessages.push('Ya existe un producto con ese nombre');
            if (fieldMap.name) {
                this.showFieldError(fieldMap.name, 'Este nombre ya está en uso');
            }
        }

        if (error.includes('Categoría no encontrada')) {
            errorMessages.push('La categoría seleccionada no existe');
            if (fieldMap.categoryId) {
                this.showFieldError(fieldMap.categoryId, 'Categoría no válida');
            }
        }

        if (error.includes('Ya existe una categoría con el nombre')) {
            errorMessages.push('Ya existe una categoría con ese nombre');
            if (fieldMap.categoryName) {
                this.showFieldError(fieldMap.categoryName, 'Este nombre ya está en uso');
            }
        }

        if (error.includes('Stock insuficiente')) {
            errorMessages.push('No hay suficiente stock para realizar esta operación');
            if (fieldMap.stock) {
                this.showFieldError(fieldMap.stock, 'Stock insuficiente');
            }
        }

        if (errorMessages.length === 0) {
            errorMessages.push('Error del servidor: ' + error);
        }

        return errorMessages;
    }

    // ========== UTILIDADES ==========
    clearAllValidations(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const fields = form.querySelectorAll('.is-invalid, .is-valid');
        fields.forEach(field => {
            field.classList.remove('is-invalid', 'is-valid');
        });

        const feedbacks = form.querySelectorAll('.invalid-feedback, .valid-feedback');
        feedbacks.forEach(feedback => {
            feedback.style.display = 'none';
        });

        this.lastValidationState = {};
    }

    markFieldAsValid(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('is-valid');
            field.classList.remove('is-invalid');
            this.clearFieldError(field);
        }
    }

    markFieldAsInvalid(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            this.showFieldError(field, message);
        }
    }

    // ========== MÉTODOS DE CONFIGURACIÓN ==========
    addCustomValidation(fieldType, validationFn) {
        this.validations[fieldType] = validationFn;
    }

    removeValidation(fieldType) {
        delete this.validations[fieldType];
    }

    getAvailableValidations() {
        return Object.keys(this.validations);
    }

    // ========== MÉTODO DE PRUEBA ==========
    testValidation(fieldType, value, isRequired = true) {
        const result = this.validateField(fieldType, value, isRequired);
        return result;
    }
}

// Crear instancia global
if (typeof window.fieldValidator === 'undefined') {
    window.fieldValidator = new FieldValidator();
}