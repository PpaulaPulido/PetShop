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
        
        // Agregar prefijo al teléfono
        data.phone = '+57' + data.phone;
        
        return data;
    }

    async submitForm(data) {
        this.setLoadingState(true);

        try {
            // Simular envío a la API (reemplazar con llamada real)
            const response = await this.simulateApiCall(data);
            
            if (response.success) {
                this.handleSuccess(response);
            } else {
                this.handleError(response.error);
            }
        } catch (error) {
            this.handleError('Error de conexión. Por favor, intenta nuevamente.');
        } finally {
            this.setLoadingState(false);
        }
    }

    async simulateApiCall(data) {
        // Simular llamada a la API
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simular diferentes respuestas basadas en los datos
                if (data.email.includes('error')) {
                    resolve({
                        success: false,
                        error: 'El servidor encontró un error con los datos proporcionados'
                    });
                } else {
                    resolve({
                        success: true,
                        message: '¡Cuenta creada exitosamente! Te hemos enviado un email de verificación.',
                        email: data.email,
                        userId: Math.random().toString(36).substr(2, 9)
                    });
                }
            }, 2000);
        });
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
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('loading');
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