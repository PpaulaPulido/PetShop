class VerificationSent {
    constructor() {
        this.resendBtn = document.getElementById('resendBtn');
        this.resendSuccess = document.getElementById('resendSuccess');
        this.resendError = document.getElementById('resendError');
        
        this.init();
    }

    init() {
        if (this.resendBtn) {
            this.resendBtn.addEventListener('click', () => {
                this.resendVerification();
            });
        }
    }

    async resendVerification() {
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        
        if (!email) {
            this.showResendError('No se encontró el email para reenviar la verificación');
            return;
        }

        this.setResendButtonState(true);

        // Ocultar mensajes anteriores
        this.hideMessages();

        try {
            const response = await fetch('/api/auth/resend-verification?email=' + encodeURIComponent(email), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok && data.message) {
                this.showResendSuccess();
                this.showNotification('Email de verificación reenviado exitosamente', 'success');
            } else {
                this.showResendError(data.error || 'Error al reenviar el email de verificación');
            }
        } catch (error) {
            this.showResendError('Error de conexión. Por favor, intenta nuevamente.');
            console.error('Error reenviando verificación:', error);
        } finally {
            this.setResendButtonState(false);
        }
    }

    setResendButtonState(loading) {
        if (!this.resendBtn) return;

        if (loading) {
            this.resendBtn.disabled = true;
            this.resendBtn.classList.add('loading');
            this.resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Enviando...';
        } else {
            this.resendBtn.disabled = false;
            this.resendBtn.classList.remove('loading');
            this.resendBtn.innerHTML = '<i class="fas fa-redo"></i>Reenviar Email';
        }
    }

    showResendSuccess() {
        if (this.resendSuccess) {
            this.resendSuccess.classList.add('show');
        }
        if (this.resendError) {
            this.resendError.classList.remove('show');
        }
    }

    showResendError(message) {
        if (this.resendError) {
            this.resendError.classList.add('show');
            document.getElementById('resendErrorText').textContent = message;
        }
        if (this.resendSuccess) {
            this.resendSuccess.classList.remove('show');
        }
    }

    hideMessages() {
        if (this.resendSuccess) {
            this.resendSuccess.classList.remove('show');
        }
        if (this.resendError) {
            this.resendError.classList.remove('show');
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
    window.verificationSent = new VerificationSent();
});

// Manejo de errores globales
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
});