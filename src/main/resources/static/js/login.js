class LoginForm {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.submitBtn = document.getElementById('submitBtn');
        
        this.init();
    }

    init() {
        if (this.form) {
            this.setupFormSubmission();
            this.setupRealTimeValidation();
        }
    }

    setupFormSubmission() {
        this.form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault(); // Solo prevenir si hay errores
                this.showNotification('Por favor, corrige los errores en el formulario', 'error');
                return;
            }

            // Si la validación pasa, permitir que Spring Security maneje el envío
            this.setLoadingState(true);
        });
    }

    setupRealTimeValidation() {
        const username = document.getElementById('username'); // Cambiado de 'email' a 'username'
        const password = document.getElementById('password');

        if (username) {
            username.addEventListener('input', (e) => {
                this.validateEmail(e.target.value);
            });
        }

        if (password) {
            password.addEventListener('input', (e) => {
                this.validatePassword(e.target.value);
            });
        }
    }

    validateForm() {
        const username = document.getElementById('username')?.value || ''; // Cambiado de 'email' a 'username'
        const password = document.getElementById('password')?.value || '';

        const isEmailValid = this.validateEmail(username); // Cambiado parámetro
        const isPasswordValid = this.validatePassword(password);

        return isEmailValid && isPasswordValid;
    }

    validateEmail(value) {
        const errorElement = document.getElementById('emailError');
        const inputElement = document.getElementById('username'); // Cambiado a 'username'
        
        if (!errorElement || !inputElement) return false;

        this.hideError(errorElement);
        inputElement.classList.remove('invalid', 'valid');

        if (!value.trim()) {
            this.showError(errorElement, 'El email es obligatorio');
            inputElement.classList.add('invalid');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            this.showError(errorElement, 'Formato de email inválido');
            inputElement.classList.add('invalid');
            return false;
        }

        inputElement.classList.add('valid');
        return true;
    }

    validatePassword(value) {
        const errorElement = document.getElementById('passwordError');
        const inputElement = document.getElementById('password');
        
        if (!errorElement || !inputElement) return false;

        this.hideError(errorElement);
        inputElement.classList.remove('invalid', 'valid');

        if (!value.trim()) {
            this.showError(errorElement, 'La contraseña es obligatoria');
            inputElement.classList.add('invalid');
            return false;
        }

        if (value.length < 6) {
            this.showError(errorElement, 'La contraseña debe tener al menos 6 caracteres');
            inputElement.classList.add('invalid');
            return false;
        }

        inputElement.classList.add('valid');
        return true;
    }

    setLoadingState(loading) {
        if (!this.submitBtn) return;

        if (loading) {
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('loading');
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('loading');
        }
    }

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
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.loginForm = new LoginForm();
});

// Manejo de errores globales
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
});