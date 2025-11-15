// Clase para partículas animadas
class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.mouse = { x: 0, y: 0 };
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.createParticles();
        this.animate();
        this.setupMouseMove();
        
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.createParticles();
        });
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupMouseMove() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    createParticles() {
        this.particles = [];
        const particleCount = Math.min(80, Math.floor(window.innerWidth / 15));
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 4 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.6 + 0.2,
                color: `rgba(106, 47, 180, ${Math.random() * 0.5 + 0.2})`
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            // Interacción con el mouse
            const dx = particle.x - this.mouse.x;
            const dy = particle.y - this.mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const angle = Math.atan2(dy, dx);
                const force = (100 - distance) / 100;
                particle.x += Math.cos(angle) * force * 2;
                particle.y += Math.sin(angle) * force * 2;
            }
            
            // Movimiento normal
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Rebotar en los bordes
            if (particle.x < 0 || particle.x > this.canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.speedY *= -1;
            
            // Dibujar partícula con efecto de brillo
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size
            );
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(1, 'rgba(106, 47, 180, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Efectos de hover avanzados
class AdvancedHoverEffects {
    static init() {
        this.setupCardTilt();
        this.setupButtonRipple();
        this.setupStatCounter();
    }

    static setupCardTilt() {
        const cards = document.querySelectorAll('.stat-card, .user-card, .quick-action-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateY = (x - centerX) / 25;
                const rotateX = (centerY - y) / 25;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }

    static setupButtonRipple() {
        const buttons = document.querySelectorAll('.view-all-btn, .btn-logout');
        
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.6);
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    pointer-events: none;
                `;
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });

        // Agregar estilo para la animación ripple
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    static setupStatCounter() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(stat => {
            const target = parseInt(stat.textContent);
            if (isNaN(target)) return;
            
            let current = 0;
            const increment = target / 50;
            const duration = 1500;
            const stepTime = duration / 50;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    stat.textContent = target;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(current);
                }
            }, stepTime);
        });
    }
}

// Animaciones al hacer scroll
class ScrollAnimations {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, observerOptions);

        this.observeElements();
    }

    observeElements() {
        const elements = document.querySelectorAll(
            '.stat-card, .quick-action-card, .user-card, .section-header'
        );
        elements.forEach(el => {
            el.classList.add('fade-in');
            this.observer.observe(el);
        });
    }

    animateElement(element) {
        element.classList.add('visible');
        
        // Animación escalonada para elementos en grid
        if (element.classList.contains('stat-card') || 
            element.classList.contains('user-card') ||
            element.classList.contains('quick-action-card')) {
            const index = Array.from(element.parentElement.children).indexOf(element);
            element.style.animationDelay = `${index * 0.1}s`;
        }
    }
}

// Efectos de texto
class TextEffects {
    static init() {
        this.setupTitleAnimation();
    }

    static setupTitleAnimation() {
        const titles = document.querySelectorAll('.dashboard-header h1');
        
        titles.forEach(title => {
            const originalText = title.textContent;
            title.textContent = '';
            
            // Crear spans para cada letra
            for (let i = 0; i < originalText.length; i++) {
                const span = document.createElement('span');
                span.textContent = originalText[i];
                span.style.animationDelay = `${i * 0.05}s`;
                span.classList.add('letter-animation');
                title.appendChild(span);
            }
        });

        // Agregar estilo para la animación de letras
        if (!document.querySelector('#letter-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'letter-animation-styles';
            style.textContent = `
                .letter-animation {
                    display: inline-block;
                    opacity: 0;
                    animation: letterFadeIn 0.5s ease forwards;
                }
                
                @keyframes letterFadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Inicializar todas las animaciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar sistema de partículas
    if (document.getElementById('particleCanvas')) {
        const particleSystem = new ParticleSystem('particleCanvas');
    }
    
    // Inicializar efectos de hover
    AdvancedHoverEffects.init();
    
    // Inicializar animaciones al scroll
    const scrollAnimations = new ScrollAnimations();
    
    // Inicializar efectos de texto
    TextEffects.init();
    
    // Agregar clase loaded al body para transiciones suaves
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

window.ParticleSystem = ParticleSystem;
window.AdvancedHoverEffects = AdvancedHoverEffects;
window.ScrollAnimations = ScrollAnimations;
window.TextEffects = TextEffects;