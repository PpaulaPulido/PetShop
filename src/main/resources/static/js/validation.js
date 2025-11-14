class FormValidator {
    constructor() {
        this.invalidWords = [
            'sdchiudhngre', 'aaaaaa', 'lllll', 'asdfgh', 'qwerty',
            'zxcvbn', '123456', 'password', 'admin', 'test'
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupRealTimeValidation();
    }

    setupEventListeners() {
        // Event listeners para validación en tiempo real
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const email = document.getElementById('email');
        const phone = document.getElementById('phone');
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        const acceptTerms = document.getElementById('acceptTerms');

        if (firstName) {
            firstName.addEventListener('input', (e) => {
                this.validateName(e.target.value, 'firstName');
            });
        }

        if (lastName) {
            lastName.addEventListener('input', (e) => {
                this.validateName(e.target.value, 'lastName');
            });
        }

        if (email) {
            email.addEventListener('input', (e) => {
                this.validateEmail(e.target.value);
            });
        }

        if (phone) {
            phone.addEventListener('input', (e) => {
                this.validatePhone(e.target.value);
            });
        }

        if (password) {
            password.addEventListener('input', (e) => {
                this.validatePassword(e.target.value);
            });
        }

        if (confirmPassword) {
            confirmPassword.addEventListener('input', (e) => {
                this.validatePasswordMatch(e.target.value);
            });
        }

        if (acceptTerms) {
            acceptTerms.addEventListener('change', (e) => {
                this.validateTerms(e.target.checked);
            });
        }

        // Botones de verificación
        const checkEmail = document.getElementById('checkEmail');
        const checkPhone = document.getElementById('checkPhone');

        if (checkEmail) {
            checkEmail.addEventListener('click', () => {
                const emailValue = document.getElementById('email')?.value;
                if (emailValue) {
                    this.validateEmail(emailValue, true);
                }
            });
        }

        if (checkPhone) {
            checkPhone.addEventListener('click', () => {
                const phoneValue = document.getElementById('phone')?.value;
                if (phoneValue) {
                    this.validatePhone(phoneValue, true);
                }
            });
        }
    }

    setupRealTimeValidation() {
        // Validación en tiempo real con debounce
        const debounce = (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        };

        // Aplicar debounce a las validaciones
        const debouncedNameValidation = debounce((value, field) => {
            this.validateName(value, field);
        }, 300);

        const debouncedEmailValidation = debounce((value) => {
            this.validateEmail(value);
        }, 500);

        const debouncedPhoneValidation = debounce((value) => {
            this.validatePhone(value);
        }, 300);

        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const email = document.getElementById('email');
        const phone = document.getElementById('phone');

        if (firstName) {
            firstName.addEventListener('input', (e) => {
                debouncedNameValidation(e.target.value, 'firstName');
            });
        }

        if (lastName) {
            lastName.addEventListener('input', (e) => {
                debouncedNameValidation(e.target.value, 'lastName');
            });
        }

        if (email) {
            email.addEventListener('input', (e) => {
                debouncedEmailValidation(e.target.value);
            });
        }

        if (phone) {
            phone.addEventListener('input', (e) => {
                debouncedPhoneValidation(e.target.value);
            });
        }
    }

    // ========== SISTEMA PARA DETECTAR TEXTO INCOHERENTE ==========

    // Método principal para detectar texto sin sentido
    isIncoherentText(value, context = 'name') {
        if (value.length < 4) return false;

        const cleanValue = value.toLowerCase().replace(/[^a-z]/g, '');
        if (cleanValue.length < 4) return false;

        // Para emails, ser más permisivo con la parte local
        if (context === 'email') {
            return this.isGibberishEmail(cleanValue);
        }

        return this.hasKeyboardWalking(cleanValue) ||
            this.hasRandomCharacterPattern(cleanValue) ||
            this.lacksVowelConsonantBalance(cleanValue) ||
            this.hasRepeatedCharacterPatterns(cleanValue) ||
            this.isGibberish(cleanValue);
    }

    // Detector específico para emails - MÁS PERMISIVO
    isGibberishEmail(value) {
        if (value.length < 6) return false;

        let score = 0;

        // Criterio 1: Proporción de vocales muy baja
        const vowelRatio = (value.match(/[aeiou]/g) || []).length / value.length;
        if (vowelRatio < 0.1) score += 2; // Umbral más bajo para emails

        // Criterio 2: Muchas consonantes consecutivas
        if (/[bcdfghjklmnpqrstvwxyz]{5,}/.test(value)) score += 1; // Más consecutivas

        // Criterio 3: Patrones de teclado muy evidentes
        if (this.hasKeyboardWalking(value)) score += 2;

        // Criterio 4: Entropía extremadamente alta
        if (this.calculateEntropy(value) > 4.0) score += 1; // Umbral más alto

        // Criterio 5: Pocas transiciones vocal-consonante
        if (this.calculateTransitionScore(value) < 0.15) score += 1; // Umbral más bajo

        // Solo bloquear si es claramente incoherente
        return score >= 5; // Puntaje más alto requerido
    }

    // 1. Detectar "caminatas" por el teclado
    hasKeyboardWalking(value) {
        const keyboardLayouts = [
            // Teclado QWERTY
            {
                rows: [
                    'qwertyuiop',
                    'asdfghjkl',
                    'zxcvbnm'
                ],
                adjacentDistance: 1.5
            },
            // Teclado QWERTY - filas combinadas para secuencias más largas
            'qwertyuiopasdfghjklzxcvbnm'
        ];

        const normalizedValue = value.toLowerCase();

        for (const layout of keyboardLayouts) {
            if (typeof layout === 'string') {
                // Buscar secuencias en layout lineal (solo secuencias largas)
                for (let i = 0; i <= normalizedValue.length - 5; i++) {
                    const segment = normalizedValue.substring(i, i + 5);
                    if (this.isKeyboardSequenceInString(segment, layout)) {
                        return true;
                    }
                }
            } else {
                // Buscar en layout por filas (secuencias más cortas pero consecutivas)
                for (const row of layout.rows) {
                    for (let i = 0; i <= normalizedValue.length - 4; i++) {
                        const segment = normalizedValue.substring(i, i + 4);
                        if (this.isConsecutiveInRow(segment, row)) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    isConsecutiveInRow(segment, row) {
        if (segment.length < 3) return false;

        // Buscar la posición de inicio del segmento en la fila
        const startIndex = row.indexOf(segment[0]);
        if (startIndex === -1) return false;

        // Verificar si los siguientes caracteres son consecutivos en la fila
        for (let i = 1; i < segment.length; i++) {
            const expectedChar = row[startIndex + i];
            if (expectedChar !== segment[i]) {
                return false;
            }
        }

        return true;
    }

    isKeyboardSequenceInString(segment, layout) {
        return layout.includes(segment) ||
            layout.includes(segment.split('').reverse().join(''));
    }

    // 2. Detectar patrones de caracteres aleatorios 
    hasRandomCharacterPattern(value) {
        if (value.length < 8) return false; // Longitud mínima mayor

        // Calcular entropía del texto (qué tan aleatorio es)
        const entropy = this.calculateEntropy(value);

        // Contar transiciones entre vocales y consonantes
        const transitionScore = this.calculateTransitionScore(value);

        // Verificar patrones repetitivos sin sentido
        const repetitiveScore = this.calculateRepetitiveScore(value);

        // Texto con alta entropía pero bajo score de transiciones es probablemente aleatorio
        // Umbrales más estrictos
        return entropy > 3.8 && transitionScore < 0.2 && repetitiveScore > 0.5;
    }

    // 3. Verificar balance vocal-consonante
    lacksVowelConsonantBalance(value) {
        if (value.length < 6) return false; // Longitud mínima mayor

        const vowelCount = (value.match(/[aeiou]/g) || []).length;
        const consonantCount = (value.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
        const totalLetters = vowelCount + consonantCount;

        if (totalLetters === 0) return true;

        const vowelRatio = vowelCount / totalLetters;

        // Rangos más permisivos para texto válido
        return vowelRatio < 0.15 || vowelRatio > 0.85;
    }

    // Calcular entropía de Shannon para medir aleatoriedad
    calculateEntropy(value) {
        if (!value || value.length === 0) return 0;

        const charCount = {};
        const length = value.length;

        // Contar frecuencia de caracteres
        for (let char of value) {
            charCount[char] = (charCount[char] || 0) + 1;
        }

        // Calcular entropía
        let entropy = 0;
        for (let char in charCount) {
            const probability = charCount[char] / length;
            entropy -= probability * Math.log2(probability);
        }

        return entropy;
    }

    // Calcular score de transiciones entre vocales y consonantes
    calculateTransitionScore(value) {
        if (!value || value.length < 2) return 0;

        let transitions = 0;
        const vowels = 'aeiou';

        for (let i = 1; i < value.length; i++) {
            const prevIsVowel = vowels.includes(value[i - 1]);
            const currIsVowel = vowels.includes(value[i]);

            if (prevIsVowel !== currIsVowel) {
                transitions++;
            }
        }

        return transitions / (value.length - 1);
    }

    // Calcular score de patrones repetitivos
    calculateRepetitiveScore(value) {
        if (!value || value.length < 4) return 0;

        let repetitiveCount = 0;
        let totalPatterns = 0;

        // Buscar patrones de 2-3 caracteres repetidos
        for (let patternLength = 2; patternLength <= 3; patternLength++) {
            for (let i = 0; i <= value.length - patternLength * 2; i++) {
                totalPatterns++;
                const pattern = value.substring(i, i + patternLength);
                const nextSegment = value.substring(i + patternLength, i + patternLength * 2);

                if (pattern === nextSegment) {
                    repetitiveCount++;
                }
            }
        }

        return totalPatterns > 0 ? repetitiveCount / totalPatterns : 0;
    }

    // Detectar patrones de caracteres repetidos
    hasRepeatedCharacterPatterns(value) {
        if (value.length < 6) return false;

        // Patrones como "aaaaaa", "ababab", "abcabc"
        const patterns = [
            /(.)\1{4,}/, // 5+ caracteres iguales consecutivos
            /(..)\1{2,}/, // Patrón de 2 caracteres repetido 3+ veces
            /(...)\1{1,}/, // Patrón de 3 caracteres repetido 2+ veces
            /(....)\1{1,}/ // Patrón de 4 caracteres repetido 2+ veces
        ];

        return patterns.some(pattern => pattern.test(value));
    }

    validatePasswordMatch(value) {
        const errorElement = document.getElementById('confirmPasswordError');
        const inputElement = document.getElementById('confirmPassword');
        const password = document.getElementById('password')?.value || '';

        if (!errorElement || !inputElement) return false;

        this.hideError(errorElement);
        inputElement.classList.remove('invalid', 'valid');

        if (!value.trim()) {
            return false;
        }

        if (value !== password) {
            this.showError(errorElement, 'Las contraseñas no coinciden');
            inputElement.classList.add('invalid');
            return false;
        }

        inputElement.classList.add('valid');
        return true;
    }

    // 5. Detector de "texto sin sentido" usando múltiples criterios
    isGibberish(value) {
        if (value.length < 8) return false; // Longitud mínima mayor

        let score = 0;

        // Criterio 1: Proporción de vocales muy baja o muy alta
        const vowelRatio = (value.match(/[aeiou]/g) || []).length / value.length;
        if (vowelRatio < 0.1 || vowelRatio > 0.8) score += 2;

        // Criterio 2: Muchas consonantes consecutivas
        if (/[bcdfghjklmnpqrstvwxyz]{5,}/.test(value)) score += 1;

        // Criterio 3: Patrones de teclado
        if (this.hasKeyboardWalking(value)) score += 2;

        // Criterio 4: Entropía muy alta (muy aleatorio)
        if (this.calculateEntropy(value) > 4.0) score += 1;

        // Criterio 5: Pocas transiciones vocal-consonante
        if (this.calculateTransitionScore(value) < 0.15) score += 1;

        // Solo marcar como gibberish si es muy evidente
        return score >= 5;
    }

    // ========== MÉTODOS DE VALIDACIÓN ACTUALIZADOS ==========

    // Validación de nombre y apellido
    validateName(value, field) {
        const errorElement = document.getElementById(`${field}Error`);
        const inputElement = document.getElementById(field);

        if (!errorElement || !inputElement) return false;

        // Resetear estado
        this.hideError(errorElement);
        inputElement.classList.remove('invalid', 'valid');

        if (!value.trim()) {
            return false;
        }

        // Validaciones básicas
        if (value.length < 3) {
            this.showError(errorElement, 'Debe tener al menos 3 caracteres');
            inputElement.classList.add('invalid');
            return false;
        }

        if (value.length > 30) {
            this.showError(errorElement, 'No puede tener más de 30 caracteres');
            inputElement.classList.add('invalid');
            return false;
        }

        // Validar caracteres permitidos (solo letras, espacios y algunos caracteres especiales)
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-']+$/.test(value)) {
            this.showError(errorElement, 'Ese formato no es valido');
            inputElement.classList.add('invalid');
            return false;
        }

        // Validar que no sean solo consonantes o solo vocales
        if (this.isOnlyConsonants(value) || this.isOnlyVowels(value)) {
            this.showError(errorElement, 'No puede contener solo consonantes o solo vocales');
            inputElement.classList.add('invalid');
            return false;
        }

        // Detectar texto incoherente (solo para nombres)
        if (this.isIncoherentText(value, 'name')) {
            this.showError(errorElement, 'El texto parece no tener sentido coherente');
            inputElement.classList.add('invalid');
            return false;
        }

        // Validar palabras incoherentes (mantener por compatibilidad)
        if (this.containsInvalidWords(value)) {
            this.showError(errorElement, 'El nombre contiene palabras no permitidas');
            inputElement.classList.add('invalid');
            return false;
        }

        // Validar patrones repetitivos
        if (this.hasRepetitivePattern(value)) {
            this.showError(errorElement, 'El nombre contiene patrones repetitivos no válidos');
            inputElement.classList.add('invalid');
            return false;
        }

        // Validar secuencias de teclado
        if (this.isKeyboardSequence(value)) {
            this.showError(errorElement, 'El nombre contiene secuencias de teclado no válidas');
            inputElement.classList.add('invalid');
            return false;
        }

        // Validar que tenga al menos una vocal y una consonante
        if (!this.hasVowelsAndConsonants(value)) {
            this.showError(errorElement, 'El nombre debe contener vocales y consonantes');
            inputElement.classList.add('invalid');
            return false;
        }

        // Validar que no sean solo letras iguales
        if (this.isAllSameCharacters(value)) {
            this.showError(errorElement, 'El nombre no puede contener solo la misma letra');
            inputElement.classList.add('invalid');
            return false;
        }

        // Si pasa todas las validaciones
        inputElement.classList.add('valid');
        return true;
    }

    // Validación de email
    validateEmail(value, forceCheck = false) {
        const errorElement = document.getElementById('emailError');
        const inputElement = document.getElementById('email');
        const checkButton = document.getElementById('checkEmail');

        if (!errorElement || !inputElement) return false;

        this.hideError(errorElement);
        inputElement.classList.remove('invalid', 'valid');
        if (checkButton) checkButton.classList.remove('valid', 'invalid');

        if (!value.trim()) {
            return false;
        }

        // Validación básica de formato
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            this.showError(errorElement, 'Formato de email inválido');
            inputElement.classList.add('invalid');
            if (checkButton) checkButton.classList.add('invalid');
            return false;
        }

        // Validación de dominio y estructura
        const [localPart, domain] = value.split('@');

        if (localPart.length < 3) {
            this.showError(errorElement, 'El email debe tener al menos 3 caracteres antes del @');
            inputElement.classList.add('invalid');
            if (checkButton) checkButton.classList.add('invalid');
            return false;
        }

        // Detectar texto incoherente en la parte local del email
        // Usar contexto 'email' para ser más permisivo
        if (localPart && this.isIncoherentText(localPart, 'email')) {
            this.showError(errorElement, 'La parte del email antes del @ parece no tener sentido');
            inputElement.classList.add('invalid');
            if (checkButton) checkButton.classList.add('invalid');
            return false;
        }

        // Validar patrones repetitivos en el local part
        if (this.hasRepetitivePattern(localPart)) {
            this.showError(errorElement, 'El email contiene patrones repetitivos no válidos');
            inputElement.classList.add('invalid');
            if (checkButton) checkButton.classList.add('invalid');
            return false;
        }

        // Validar que no sean solo letras iguales
        if (this.isAllSameCharacters(localPart)) {
            this.showError(errorElement, 'El email no puede contener solo la misma letra');
            inputElement.classList.add('invalid');
            if (checkButton) checkButton.classList.add('invalid');
            return false;
        }

        // Validar secuencias de teclado
        if (this.isKeyboardSequence(localPart)) {
            this.showError(errorElement, 'El email contiene secuencias de teclado no válidas');
            inputElement.classList.add('invalid');
            if (checkButton) checkButton.classList.add('invalid');
            return false;
        }

        if (!this.isValidDomain(domain)) {
            this.showError(errorElement, 'Dominio de email no válido');
            inputElement.classList.add('invalid');
            if (checkButton) checkButton.classList.add('invalid');
            return false;
        }

        // Si es una verificación forzada o el email parece válido
        if (forceCheck) {
            this.checkEmailAvailability(value);
        } else {
            inputElement.classList.add('valid');
            if (checkButton) checkButton.classList.add('valid');
        }

        return true;
    }

    // Validación de teléfono (Colombia)
    validatePhone(value, forceCheck = false) {
        const errorElement = document.getElementById('phoneError');
        const inputElement = document.getElementById('phone');
        const checkButton = document.getElementById('checkPhone');

        if (!errorElement || !inputElement) return false;

        this.hideError(errorElement);
        inputElement.classList.remove('invalid', 'valid');
        if (checkButton) checkButton.classList.remove('valid', 'invalid');

        if (!value.trim()) {
            return false;
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
        if (this.isInvalidPhoneSequence(value)) {
            this.showError(errorElement, 'Número de teléfono no válido');
            inputElement.classList.add('invalid');
            if (checkButton) checkButton.classList.add('invalid');
            return false;
        }

        // Validar código de operador (Colombia)
        if (!this.isValidColombianOperator(value)) {
            this.showError(errorElement, 'Número de operador no válido para Colombia');
            inputElement.classList.add('invalid');
            if (checkButton) checkButton.classList.add('invalid');
            return false;
        }

        // Si es una verificación forzada o el teléfono parece válido
        if (forceCheck) {
            this.checkPhoneAvailability(value);
        } else {
            inputElement.classList.add('valid');
            if (checkButton) checkButton.classList.add('valid');
        }

        return true;
    }

    // Validación de contraseña
    validatePassword(value) {
        const inputElement = document.getElementById('password');
        const strengthBar = document.querySelector('.strength-bar');

        if (!inputElement) return false;

        // No hay elemento de error para password, así que no intentamos acceder a él
        inputElement.classList.remove('invalid', 'valid');

        if (!value) {
            if (strengthBar) strengthBar.className = 'strength-bar';
            this.updatePasswordRequirements(false, false, false, false);
            return false;
        }

        // Verificar requisitos
        const hasMinLength = value.length >= 8;
        const hasUppercase = /[A-Z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[@$!%*?&]/.test(value);

        // Validar patrones comunes inseguros
        if (this.isCommonPassword(value)) {
            this.showPasswordError('Esta contraseña es muy común y poco segura');
            inputElement.classList.add('invalid');
            this.updatePasswordRequirements(hasMinLength, hasUppercase, hasNumber, hasSpecial);
            return false;
        }

        // Validar patrones repetitivos
        if (this.hasRepetitivePattern(value)) {
            this.showPasswordError('La contraseña contiene patrones repetitivos inseguros');
            inputElement.classList.add('invalid');
            this.updatePasswordRequirements(hasMinLength, hasUppercase, hasNumber, hasSpecial);
            return false;
        }

        // Validar secuencias de teclado
        if (this.isKeyboardSequence(value)) {
            this.showPasswordError('La contraseña contiene secuencias de teclado inseguras');
            inputElement.classList.add('invalid');
            this.updatePasswordRequirements(hasMinLength, hasUppercase, hasNumber, hasSpecial);
            return false;
        }

        // Actualizar indicadores visuales
        this.updatePasswordRequirements(hasMinLength, hasUppercase, hasNumber, hasSpecial);

        // Calcular fortaleza
        const strength = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;

        if (strengthBar) {
            if (strength === 4) {
                strengthBar.className = 'strength-bar strong';
                inputElement.classList.add('valid');
                return true;
            } else if (strength >= 2) {
                strengthBar.className = 'strength-bar medium';
            } else {
                strengthBar.className = 'strength-bar weak';
            }
        }

        if (value.length > 0) {
            inputElement.classList.add('invalid');
        }

        return false;
    }

    // Método para verificar si una contraseña es fuerte a pesar de ser "incoherente"
    isStrongPassword(value) {
        const hasMinLength = value.length >= 12;
        const hasUppercase = /[A-Z]/.test(value);
        const hasLowercase = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[@$!%*?&]/.test(value);

        return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
    }

    // ========== MÉTODOS EXISTENTES (MANTENIDOS) ==========

    // Mostrar error de contraseña (crear elemento temporal si no existe)
    showPasswordError(message) {
        let errorElement = document.getElementById('passwordError');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'passwordError';
            errorElement.className = 'error-message';
            const passwordGroup = document.querySelector('.form-group');
            if (passwordGroup) {
                passwordGroup.appendChild(errorElement);
            }
        }
        this.showError(errorElement, message);
    }

    // Actualizar requisitos de contraseña visualmente
    updatePasswordRequirements(hasMinLength, hasUppercase, hasNumber, hasSpecial) {
        const requirements = {
            length: document.getElementById('req-length'),
            uppercase: document.getElementById('req-uppercase'),
            number: document.getElementById('req-number'),
            special: document.getElementById('req-special')
        };

        Object.keys(requirements).forEach(key => {
            const element = requirements[key];
            if (element) {
                const isValid = {
                    length: hasMinLength,
                    uppercase: hasUppercase,
                    number: hasNumber,
                    special: hasSpecial
                }[key];

                element.classList.toggle('valid', isValid);
            }
        });
    }

    // Validación de contraseña - CORREGIDA
    validatePassword(value) {
        const inputElement = document.getElementById('password');
        const strengthBar = document.querySelector('.strength-bar');

        if (!inputElement) return false;

        // Resetear estado
        inputElement.classList.remove('invalid', 'valid');
        this.hidePasswordError();

        if (!value) {
            if (strengthBar) strengthBar.className = 'strength-bar';
            this.updatePasswordRequirements(false, false, false, false);
            return false;
        }

        // Verificar requisitos
        const hasMinLength = value.length >= 8;
        const hasUppercase = /[A-Z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[@$!%*?&]/.test(value);

        // Mostrar errores específicos si no cumple requisitos
        if (!hasMinLength) {
            this.showPasswordError('La contraseña debe tener al menos 8 caracteres');
            inputElement.classList.add('invalid');
            this.updatePasswordRequirements(hasMinLength, hasUppercase, hasNumber, hasSpecial);
            return false;
        }

        if (!hasUppercase) {
            this.showPasswordError('La contraseña debe contener al menos una letra mayúscula');
            inputElement.classList.add('invalid');
            this.updatePasswordRequirements(hasMinLength, hasUppercase, hasNumber, hasSpecial);
            return false;
        }

        if (!hasNumber) {
            this.showPasswordError('La contraseña debe contener al menos un número');
            inputElement.classList.add('invalid');
            this.updatePasswordRequirements(hasMinLength, hasUppercase, hasNumber, hasSpecial);
            return false;
        }

        if (!hasSpecial) {
            this.showPasswordError('La contraseña debe contener al menos un carácter especial (@$!%*?&)');
            inputElement.classList.add('invalid');
            this.updatePasswordRequirements(hasMinLength, hasUppercase, hasNumber, hasSpecial);
            return false;
        }

        // Validar patrones comunes inseguros
        if (this.isCommonPassword(value)) {
            this.showPasswordError('Esta contraseña es muy común y poco segura');
            inputElement.classList.add('invalid');
            this.updatePasswordRequirements(hasMinLength, hasUppercase, hasNumber, hasSpecial);
            return false;
        }

        // Validar patrones repetitivos
        if (this.hasRepetitivePattern(value)) {
            this.showPasswordError('La contraseña contiene patrones repetitivos inseguros');
            inputElement.classList.add('invalid');
            this.updatePasswordRequirements(hasMinLength, hasUppercase, hasNumber, hasSpecial);
            return false;
        }

        // Validar secuencias de teclado
        if (this.isKeyboardSequence(value)) {
            this.showPasswordError('La contraseña contiene secuencias de teclado inseguras');
            inputElement.classList.add('invalid');
            this.updatePasswordRequirements(hasMinLength, hasUppercase, hasNumber, hasSpecial);
            return false;
        }

        // Actualizar indicadores visuales
        this.updatePasswordRequirements(hasMinLength, hasUppercase, hasNumber, hasSpecial);

        // Calcular fortaleza
        const strength = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;

        if (strengthBar) {
            if (strength === 4) {
                strengthBar.className = 'strength-bar strong';
                inputElement.classList.add('valid');
                return true;
            } else if (strength >= 2) {
                strengthBar.className = 'strength-bar medium';
                inputElement.classList.add('valid'); // También válido si es medium o strong
            } else {
                strengthBar.className = 'strength-bar weak';
                inputElement.classList.add('invalid');
            }
        }

        // Si tiene al menos 8 caracteres pero le faltan otros requisitos
        if (value.length > 0 && strength < 4) {
            inputElement.classList.add('invalid');
            return false;
        }

        return strength === 4;
    }

    // Método para ocultar errores de contraseña
    hidePasswordError() {
        const errorElement = document.getElementById('passwordError');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }

    // Mostrar error de contraseña (crear elemento temporal si no existe)
    showPasswordError(message) {
        let errorElement = document.getElementById('passwordError');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'passwordError';
            errorElement.className = 'error-message';
            const passwordGroup = document.querySelector('.form-group');
            if (passwordGroup) {
                // Insertar después del input de contraseña
                const passwordInput = document.getElementById('password');
                passwordInput.parentNode.insertBefore(errorElement, passwordInput.nextSibling);
            }
        }
        this.showError(errorElement, message);
    }

    // Validación de términos y condiciones
    validateTerms(isChecked) {
        const errorElement = document.getElementById('termsError');

        if (!errorElement) return false;

        this.hideError(errorElement);

        if (!isChecked) {
            this.showError(errorElement, 'Debes aceptar los términos y condiciones');
            return false;
        }

        return true;
    }

    // ========== MÉTODOS DE VALIDACIÓN AVANZADA ==========

    // Verificar si es solo consonantes
    isOnlyConsonants(value) {
        const cleanValue = value.replace(/[^a-zA-Z]/g, '');
        if (cleanValue.length < 3) return false;
        return /^[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]+$/.test(cleanValue);
    }

    // Verificar si es solo vocales
    isOnlyVowels(value) {
        const cleanValue = value.replace(/[^a-zA-Z]/g, '');
        if (cleanValue.length < 3) return false;
        return /^[aeiouAEIOU]+$/.test(cleanValue);
    }

    // Verificar si tiene vocales y consonantes
    hasVowelsAndConsonants(value) {
        const cleanValue = value.replace(/[^a-zA-Z]/g, '');
        if (cleanValue.length < 3) return true; // Para nombres cortos

        const hasVowel = /[aeiouAEIOU]/.test(cleanValue);
        const hasConsonant = /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/.test(cleanValue);

        return hasVowel && hasConsonant;
    }

    // Verificar si todos los caracteres son iguales
    isAllSameCharacters(value) {
        if (value.length < 3) return false;
        return /^(.)\1+$/.test(value.replace(/[^a-zA-Z0-9]/g, ''));
    }

    // Verificar patrones repetitivos (lalalala, nenenene, etc.)
    hasRepetitivePattern(value) {
        const cleanValue = value.toLowerCase().replace(/[^a-z]/g, '');
        if (cleanValue.length < 4) return false;

        // Patrones comunes repetitivos
        const repetitivePatterns = [
            /(.)\1{2,}/, // 3 o más caracteres iguales consecutivos
            /(..)\1{2,}/, // Patrones de 2 caracteres repetidos
            /(...)\1{1,}/, // Patrones de 3 caracteres repetidos
            /^(lol)+$/i,
            /^(lal)+$/i,
            /^(nan)+$/i,
            /^(tat)+$/i,
            /^(bab)+$/i,
            /^(qoq)+$/i,
            /^(lel)+$/i,
            /^(mim)+$/i,
            /^(pip)+$/i,
            /^(rir)+$/i,
            /^(sas)+$/i,
            /^(tot)+$/i,
            /^(vov)+$/i,
            /^(zoz)+$/i
        ];

        return repetitivePatterns.some(pattern => pattern.test(cleanValue));
    }

    // Verificar secuencias de teclado (qwerty, asdfgh, etc.)
    isKeyboardSequence(value) {
        const cleanValue = value.toLowerCase();
        const sequences = [
            'qwerty', 'asdfgh', 'zxcvbn', 'qazwsx', 'edcrfv', 'tgbnhy',
            'yhnujm', 'ikm', 'olp', 'qwertz', 'azerty', 'abcdef', '123456',
            'qweasd', 'asdzxc', 'zxcvbnm', 'q1w2e3', '1q2w3e', 'qazxsw',
            'poiuyt', 'lkjhgf', 'mnbvcx', 'abcdefgh', 'qwertyuiop',
            'asdfghjkl', 'zxcvbnm', 'poiuytrewq', 'lkjhgfdsa', 'mnbvcxz'
        ];

        return sequences.some(seq => cleanValue.includes(seq));
    }

    // Verificar palabras incoherentes
    containsInvalidWords(value) {
        const lowerValue = value.toLowerCase();
        const invalidPatterns = [
            /gkncrsfdnvcshgs/i,
            /sdfghjkl/i,
            /zxcvbnm/i,
            /qwertyuiop/i,
            /asdfghjkl/i,
            /^[a-z]{15,}$/i, // Palabras muy largas sin sentido
            /([a-z])\1{4,}/i // 5 o más letras iguales consecutivas
        ];

        return this.invalidWords.some(word => lowerValue.includes(word)) ||
            invalidPatterns.some(pattern => pattern.test(lowerValue));
    }

    // Verificar contraseñas comunes
    isCommonPassword(password) {
        const commonPasswords = [
            'password', '123456', '12345678', '123456789', '1234567890',
            'qwerty', 'abc123', 'password1', '12345', '1234567',
            'admin', 'welcome', 'monkey', 'dragon', 'master',
            'letmein', 'login', 'princess', 'qwertyuiop', 'solo',
            'baseball', 'football', 'superman', '1qaz2wsx', 'password123'
        ];

        return commonPasswords.includes(password.toLowerCase());
    }

    isValidDomain(domain) {
        const domainParts = domain.split('.');
        if (domainParts.length < 2) return false;

        const tld = domainParts[domainParts.length - 1];
        const validTLDs = ['com', 'org', 'net', 'edu', 'gov', 'co', 'info', 'io', 'es', 'mx', 'ar', 'cl', 'pe', 've'];

        return validTLDs.includes(tld.toLowerCase()) && domainParts[0].length >= 2;
    }

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

    // Verificación de disponibilidad (simulada)
    async checkEmailAvailability(email) {
        const errorElement = document.getElementById('emailError');
        const inputElement = document.getElementById('email');
        const checkButton = document.getElementById('checkEmail');

        if (!errorElement || !inputElement) return;

        try {
            // Simular verificación con API
            const isAvailable = await this.simulateEmailCheck(email);

            if (isAvailable) {
                this.hideError(errorElement);
                inputElement.classList.add('valid');
                if (checkButton) checkButton.classList.add('valid');
                this.showNotification('Email disponible y válido', 'success');
            } else {
                this.showError(errorElement, 'Este email ya está registrado');
                inputElement.classList.add('invalid');
                if (checkButton) checkButton.classList.add('invalid');
            }
        } catch (error) {
            this.showError(errorElement, 'Error al verificar el email');
            console.error('Error checking email:', error);
        }
    }

    async checkPhoneAvailability(phone) {
        const errorElement = document.getElementById('phoneError');
        const inputElement = document.getElementById('phone');
        const checkButton = document.getElementById('checkPhone');

        if (!errorElement || !inputElement) return;

        try {
            // Simular verificación con API
            const isAvailable = await this.simulatePhoneCheck(phone);

            if (isAvailable) {
                this.hideError(errorElement);
                inputElement.classList.add('valid');
                if (checkButton) checkButton.classList.add('valid');
                this.showNotification('Teléfono disponible y válido', 'success');
            } else {
                this.showError(errorElement, 'Este teléfono ya está registrado');
                inputElement.classList.add('invalid');
                if (checkButton) checkButton.classList.add('invalid');
            }
        } catch (error) {
            this.showError(errorElement, 'Error al verificar el teléfono');
            console.error('Error checking phone:', error);
        }
    }

    // Simulaciones de verificación (reemplazar con llamadas reales a la API)
    simulateEmailCheck(email) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simular que algunos emails ya están registrados
                const takenEmails = ['test@test.com', 'admin@admin.com', 'user@example.com'];
                resolve(!takenEmails.includes(email.toLowerCase()));
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

    // Utilidades de UI
    showError(element, message) {
        if (element) {
            element.textContent = message;
            element.classList.add('show');
        }
    }

    hideError(element) {
        if (element) {
            element.textContent = '';
            element.classList.remove('show');
        }
    }

    showNotification(message, type = 'success') {
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

    // Validación completa del formulario
    validateForm() {
        const firstName = document.getElementById('firstName')?.value || '';
        const lastName = document.getElementById('lastName')?.value || '';
        const email = document.getElementById('email')?.value || '';
        const phone = document.getElementById('phone')?.value || '';
        const password = document.getElementById('password')?.value || '';
        const confirmPassword = document.getElementById('confirmPassword')?.value || '';
        const acceptTerms = document.getElementById('acceptTerms')?.checked || false;

        const validations = [
            this.validateName(firstName, 'firstName'),
            this.validateName(lastName, 'lastName'),
            this.validateEmail(email),
            this.validatePhone(phone),
            this.validatePassword(password),
            this.validatePasswordMatch(confirmPassword),
            this.validateTerms(acceptTerms)
        ];

        return validations.every(validation => validation === true);
    }
}

// Inicializar el validador cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.formValidator = new FormValidator();
});