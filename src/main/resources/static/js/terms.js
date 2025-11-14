// terms.js - Funcionalidad simplificada para Términos y Condiciones

class SimpleTermsManager {
    constructor() {
        this.hasAccepted = false;
        this.init();
    }

    init() {
        this.setupAcceptanceButton();
        this.setupSmoothScroll();
        this.checkPreviousAcceptance();
    }

    setupAcceptanceButton() {
        const acceptButton = document.getElementById('acceptTermsBtn');
        
        if (acceptButton) {
            acceptButton.addEventListener('click', () => {
                this.acceptTerms();
            });
        }
    }

    setupSmoothScroll() {
        // Smooth scroll para enlaces internos
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    acceptTerms() {
        if (this.hasAccepted) return;

        this.hasAccepted = true;
        
        // Mostrar notificación de éxito
        this.showNotification('Términos y condiciones aceptados correctamente', 'success');
        
        // Deshabilitar botón de aceptación
        const acceptButton = document.getElementById('acceptTermsBtn');
        if (acceptButton) {
            acceptButton.disabled = true;
            acceptButton.innerHTML = '<i class="fas fa-check-circle"></i> Términos Aceptados';
            acceptButton.style.background = '#4CAF50';
            acceptButton.style.cursor = 'not-allowed';
        }

        // Guardar aceptación en localStorage
        localStorage.setItem('petluz_terms_accepted', 'true');
        localStorage.setItem('petluz_terms_accepted_date', new Date().toISOString());

        // Redirigir al registro después de 2 segundos
        setTimeout(() => {
            window.location.href = '/auth/register';
        }, 2000);
    }

    checkPreviousAcceptance() {
        const accepted = localStorage.getItem('petluz_terms_accepted');
        if (accepted === 'true') {
            this.hasAccepted = true;
            
            const acceptButton = document.getElementById('acceptTermsBtn');
            if (acceptButton) {
                acceptButton.disabled = true;
                acceptButton.innerHTML = '<i class="fas fa-check-circle"></i> Términos Aceptados';
                acceptButton.style.background = '#4CAF50';
                acceptButton.style.cursor = 'not-allowed';
            }
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('acceptanceNotification');
        const messageElement = document.getElementById('notificationMessage');
        
        if (notification && messageElement) {
            messageElement.textContent = message;
            
            // Cambiar estilo según el tipo
            const content = notification.querySelector('.notification-content');
            content.className = `notification-content ${type}`;
            
            notification.classList.add('show');
            
            // Ocultar después de 5 segundos
            setTimeout(() => {
                notification.classList.remove('show');
            }, 5000);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.termsManager = new SimpleTermsManager();
});

// Agregar estilos adicionales para mejor UX
const additionalStyles = `
    .term-section {
        scroll-margin-top: 100px;
    }
    
    .simple-toc a {
        position: relative;
        padding-left: 0.5rem;
    }
    
    .simple-toc a::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 0;
        background: var(--primary-color);
        transition: height 0.3s ease;
    }
    
    .simple-toc a:hover::before {
        height: 70%;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);