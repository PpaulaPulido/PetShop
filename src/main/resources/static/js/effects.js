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
                color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`
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
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
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

// Efecto parallax
class ParallaxEffect {
    constructor(backgroundElement) {
        this.background = backgroundElement;
        this.init();
    }

    init() {
        if (!this.background) return;
        
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 30;
            const y = (e.clientY / window.innerHeight - 0.5) * 30;
            
            this.background.style.transform = `translate(${x}px, ${y}px) scale(1.1)`;
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
            '.category-card, .process-step, .advantage-card, .tip-card, .section-title'
        );
        elements.forEach(el => {
            el.classList.add('fade-in');
            this.observer.observe(el);
        });
    }

    animateElement(element) {
        element.classList.add('visible');
        
        // Animación escalonada para elementos en grid
        if (element.classList.contains('category-card') || 
            element.classList.contains('tip-card') ||
            element.classList.contains('advantage-card')) {
            const index = Array.from(element.parentElement.children).indexOf(element);
            element.style.animationDelay = `${index * 0.1}s`;
        }
    }
}

// Efectos de hover avanzados
class AdvancedHoverEffects {
    static init() {
        this.setupCardTilt();
        this.setupImageParallax();
        this.setupLinkMagnetic();
        this.setupButtonRipple();
    }

    static setupCardTilt() {
        const cards = document.querySelectorAll('.category-card, .tip-card, .advantage-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateY = (x - centerX) / 25;
                const rotateX = (centerY - y) / 25;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            });
        });
    }

    static setupImageParallax() {
        const images = document.querySelectorAll('.category-image img');
        
        images.forEach(img => {
            img.addEventListener('mousemove', (e) => {
                const rect = img.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const moveX = (x - rect.width / 2) / 20;
                const moveY = (y - rect.height / 2) / 20;
                
                img.style.transform = `scale(1.1) translate(${moveX}px, ${moveY}px)`;
            });
            
            img.addEventListener('mouseleave', () => {
                img.style.transform = 'scale(1) translate(0, 0)';
            });
        });
    }

    static setupLinkMagnetic() {
        const links = document.querySelectorAll('.nav-link, .footer-section a');
        
        links.forEach(link => {
            link.addEventListener('mousemove', (e) => {
                const rect = link.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const moveX = (x - centerX) / 4;
                const moveY = (y - centerY) / 4;
                
                link.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.transform = 'translate(0, 0)';
            });
        });
    }

    static setupButtonRipple() {
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .add-to-cart');
        
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
        const style = document.createElement('style');
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

// Efectos de texto
class TextEffects {
    static init() {
        this.setupTitleAnimation();
        this.setupTypewriterEffect();
    }

    static setupTitleAnimation() {
        const titles = document.querySelectorAll('.section-title');
        
        titles.forEach(title => {
            title.addEventListener('mouseenter', () => {
                title.style.animation = 'pulse 0.5s ease';
            });
            
            title.addEventListener('animationend', () => {
                title.style.animation = '';
            });
        });

        // Agregar estilo para la animación pulse
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
        `;
        document.head.appendChild(style);
    }

    static setupTypewriterEffect() {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            const text = heroTitle.textContent;
            heroTitle.textContent = '';
            heroTitle.style.borderRight = '2px solid var(--yellow)';
            
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    heroTitle.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                } else {
                    heroTitle.style.borderRight = 'none';
                }
            };
            
            // Iniciar después de la animación inicial
            setTimeout(typeWriter, 1500);
        }
    }
}

// Exportar todas las clases
export { ParticleSystem, ParallaxEffect, ScrollAnimations, AdvancedHoverEffects, TextEffects };