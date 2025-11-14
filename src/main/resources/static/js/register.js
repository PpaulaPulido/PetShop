class RegisterForm {
    constructor() {
        this.form = document.getElementById('registerForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.validator = window.formValidator;
        
        this.init();
    }

    init() {
        if (this.form) {
            this.setupFormSubmission();
        }
    }

    setupFormSubmission() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!this.validator) {
                console.error('Validador no inicializado');
                return;
            }

            // Validar formulario completo
            if (!this.validator.validateForm()) {
                this.showNotification('Por favor, corrige los errores en el formulario', 'error');
                return;
            }

            // Preparar datos del formulario
            const formData = this.getFormData();
            
            // Enviar formulario
            await this.submitForm(formData);
        });
    }

    getFormData() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        // Convertir el checkbox "on" a boolean
        data.acceptTerms = data.acceptTerms === 'on';
        
        // IMPORTANTE: El teléfono debe enviarse solo con los 10 dígitos
        // Tu DTO espera el formato: "3001234567" sin +57
        // El +57 se agrega en el servicio con normalizePhone()
        
        return data;
    }

    async submitForm(data) {
        this.setLoadingState(true);

        try {
            console.log('Enviando datos:', data); // Para debug
            
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            console.log('Respuesta del servidor:', result); // Para debug
            
            if (result.success) {
                this.handleSuccess(result);
            } else {
                // Manejar errores de validación del servidor
                if (result.errors) {
                    const errorMessages = result.errors.map(error => error.defaultMessage).join(', ');
                    this.handleError(`Errores de validación: ${errorMessages}`);
                } else {
                    this.handleError(result.error || 'Error en el registro');
                }
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            this.handleError('Error de conexión. Por favor, intenta nuevamente.');
        } finally {
            this.setLoadingState(false);
        }
    }

    handleSuccess(response) {
        this.showNotification(response.message, 'success');
        this.form.reset();
        this.clearValidationStates();
        
        // Redirigir después de 3 segundos
        setTimeout(() => {
            window.location.href = `/auth/verification-sent?email=${encodeURIComponent(response.email)}`;
        }, 3000);
    }

    handleError(errorMessage) {
        this.showNotification(errorMessage, 'error');
    }

    setLoadingState(loading) {
        if (!this.submitBtn) return;

        if (loading) {
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('loading');
            this.submitBtn.querySelector('.btn-text').textContent = 'Registrando...';
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('loading');
            this.submitBtn.querySelector('.btn-text').textContent = 'Crear Cuenta';
        }
    }

    clearValidationStates() {
        // Limpiar estados de validación visual
        const formControls = this.form.querySelectorAll('.form-control');
        formControls.forEach(control => {
            control.classList.remove('valid', 'invalid');
        });

        const errorMessages = this.form.querySelectorAll('.error-message');
        errorMessages.forEach(error => {
            error.classList.remove('show');
            error.textContent = '';
        });

        const checkButtons = this.form.querySelectorAll('.validation-btn');
        checkButtons.forEach(btn => {
            btn.classList.remove('valid', 'invalid');
        });

        // Resetear fortaleza de contraseña
        const strengthBar = document.querySelector('.strength-bar');
        if (strengthBar) {
            strengthBar.className = 'strength-bar';
        }

        const requirements = document.querySelectorAll('.password-requirements li');
        requirements.forEach(req => req.classList.remove('valid'));
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById(`${type}Notification`);
        const messageElement = document.getElementById(`${type}Message`);
        
        if (notification && messageElement) {
            messageElement.textContent = message;
            notification.classList.add('show');
            
            // Ocultar notificación después de 5 segundos
            setTimeout(() => {
                notification.classList.remove('show');
            }, 5000);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Primero inicializar el validador
    window.formValidator = new FormValidator();
    
    // Luego inicializar el formulario de registro
    window.registerForm = new RegisterForm();
});

// Manejo de errores globales
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
});

// Prevenir envío del formulario con Enter en campos individuales
document.addEventListener('DOMContentLoaded', () => {
    const formControls = document.querySelectorAll('.form-control');
    formControls.forEach(control => {
        control.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && control.type !== 'textarea') {
                e.preventDefault();
            }
        });
    });
});