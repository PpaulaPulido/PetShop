class PetLuzEffects {
    constructor() {
        this.init();
    }

    init() {
        this.setupImageZoomEffects();
        this.setupParticleSystems();
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupProductsHeaderParticles();
    }

    // Efectos de zoom en imágenes
    setupImageZoomEffects() {
        const zoomImages = document.querySelectorAll('.gallery-image img, .tip-image img, .product-image');

        zoomImages.forEach(img => {
            img.addEventListener('mouseenter', () => {
                img.style.transform = 'scale(1.1)';
            });

            img.addEventListener('mouseleave', () => {
                img.style.transform = 'scale(1)';
            });
        });
    }

    setupParticleSystems() {
        // Partículas para la sección ¿Por qué PetLuz?
        const whyPetluzCanvas = document.getElementById('whyPetluzParticles');
        if (whyPetluzCanvas && window.ParticleSystem) {
            this.whyPetluzParticles = new window.ParticleSystem('whyPetluzParticles');
            this.whyPetluzParticles.createParticles = function () {
                this.particles = [];
                const particleCount = 15;

                for (let i = 0; i < particleCount; i++) {
                    this.particles.push({
                        x: Math.random() * this.canvas.width,
                        y: Math.random() * this.canvas.height,
                        size: Math.random() * 3 + 1,
                        speedX: (Math.random() - 0.5) * 0.5,
                        speedY: (Math.random() - 0.5) * 0.5,
                        opacity: Math.random() * 0.4 + 0.1,
                        color: `rgba(255, 209, 102, ${Math.random() * 0.3 + 0.2})`
                    });
                }
            };

            this.whyPetluzParticles.setupCanvas();
            this.whyPetluzParticles.createParticles();
            this.whyPetluzParticles.animate();
        }
    }

    // Animaciones al hacer scroll
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateOnScroll(entry.target);
                }
            });
        }, observerOptions);

        // Observar elementos para animación
        const elementsToAnimate = document.querySelectorAll(
            '.stat-card, .action-card, .tip-card, .gallery-item, .feature-item'
        );

        elementsToAnimate.forEach(el => {
            el.classList.add('scroll-animate');
            this.observer.observe(el);
        });
    }

    animateOnScroll(element) {
        element.classList.add('animated');

        // Animación escalonada para elementos en grid
        if (element.classList.contains('stat-card') ||
            element.classList.contains('action-card') ||
            element.classList.contains('tip-card') ||
            element.classList.contains('gallery-item')) {
            const index = Array.from(element.parentElement.children).indexOf(element);
            element.style.animationDelay = `${index * 0.1}s`;
        }
    }

    // Efectos hover personalizados
    setupHoverEffects() {
        // Efecto de tilt en tarjetas
        const cards = document.querySelectorAll('.stat-card, .action-card, .tip-card, .product-card');

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                if (window.innerWidth > 768) {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    const rotateY = (x - centerX) / 25;
                    const rotateX = (centerY - y) / 25;

                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });

        // Efecto de ripple en botones
        const buttons = document.querySelectorAll('.btn-add-to-cart, .btn-primary');

        buttons.forEach(button => {
            button.addEventListener('click', function (e) {
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

        // Agregar estilos para ripple si no existen
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

    // Efecto de conteo animado para números
    animateNumberCount(element, target, duration = 1500) {
        let current = 0;
        const increment = target / 30;
        const stepTime = duration / 30;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, stepTime);
    }

    // Efecto de texto tipo máquina de escribir
    typeWriterEffect(element, text, speed = 50) {
        let i = 0;
        element.textContent = '';

        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    // Efecto de parallax para imágenes de fondo
    setupParallaxEffect() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');

            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    // Efecto de revelación gradual al hacer scroll
    setupStaggeredReveal() {
        const revealElements = document.querySelectorAll('.stagger-reveal');

        revealElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = `all 0.6s ease ${index * 0.1}s`;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            });

            observer.observe(element);
        });
    }

    // Efecto de hover con gradiente animado
    setupGradientHover() {
        const gradientElements = document.querySelectorAll('.gradient-hover');

        gradientElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.background = 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))';
                element.style.backgroundSize = '200% 200%';
                element.style.animation = 'gradientShift 2s ease infinite';
            });

            element.addEventListener('mouseleave', () => {
                element.style.background = '';
                element.style.backgroundSize = '';
                element.style.animation = '';
            });
        });

        // Agregar keyframes para el gradiente
        if (!document.querySelector('#gradient-shift-styles')) {
            const style = document.createElement('style');
            style.id = 'gradient-shift-styles';
            style.textContent = `
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Efecto de partículas flotantes para elementos específicos
    createFloatingParticles(container, count = 10) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: var(--primary-color);
                border-radius: 50%;
                opacity: ${Math.random() * 0.6 + 0.2};
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: float ${Math.random() * 6 + 4}s infinite ease-in-out;
                animation-delay: ${Math.random() * 2}s;
            `;
            container.appendChild(particle);
        }

        // Agregar keyframes para flotar
        if (!document.querySelector('#float-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'float-animation-styles';
            style.textContent = `
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Efecto de shake para elementos (útil para errores)
    shakeElement(element) {
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    // Efecto de pulso para llamar la atención
    pulseElement(element, duration = 1000) {
        element.style.animation = `pulse ${duration}ms ease-in-out`;
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    // Efecto de carga escalonada para productos
    setupProductStaggerAnimation() {
        const productCards = document.querySelectorAll('.product-card');

        productCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // Efecto de filtro blur al abrir modales
    setupModalEffects() {
        const modals = document.querySelectorAll('.product-modal');

        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
    }

    closeModal(modal) {
        modal.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            modal.classList.remove('active');
            modal.style.animation = '';
        }, 300);
    }

    // Efecto de búsqueda con resultados
    setupSearchEffects() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if (e.target.value.length > 2) {
                    this.pulseElement(document.querySelector('.search-btn'));
                }
            });
        }
    }

    // Efecto de aplicación de filtros
    setupFilterEffects() {
        const applyBtn = document.getElementById('applyFilters');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.pulseElement(applyBtn);
            });
        }
    }

    // Efecto de cambio de vista (grid/list)
    setupViewModeEffects() {
        const viewBtns = document.querySelectorAll('.view-btn');

        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.pulseElement(btn);
            });
        });
    }

    // Efecto de hover en cards de producto
    setupProductCardEffects() {
        const productCards = document.querySelectorAll('.product-card');

        productCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (window.innerWidth > 768) {
                    card.style.transform = 'translateY(-10px) scale(1.02)';
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    // Sistema de partículas simples - solo bolitas en movimiento
    setupProductsHeaderParticles() {
        const productsHeader = document.querySelector('.products-header');
        if (!productsHeader) return;

        // Crear canvas para partículas
        const canvas = document.createElement('canvas');
        canvas.className = 'products-header-particles';
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;

        productsHeader.style.position = 'relative';
        productsHeader.appendChild(canvas);

        // Inicializar partículas simples
        this.initCleanParticles(canvas);
    }

    initCleanParticles(canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];

        // Ajustar tamaño del canvas
        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            createParticles();
        };

        // Clase de partícula simple - solo bolitas
        class CleanParticle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1; 
                this.speedX = (Math.random() - 0.5) * 1.5; 
                this.speedY = (Math.random() - 0.5) * 1.5;
                this.color = this.getRandomColor();
                this.opacity = Math.random() * 0.6 + 0.2;
                this.originalSize = this.size;
            }

            getRandomColor() {
                const colors = [
                    'rgba(255, 255, 255, 0.8)',    
                    'rgba(255, 209, 102, 0.7)',   
                    'rgba(142, 68, 255, 0.6)',    
                    'rgba(255, 255, 255, 0.9)',    
                    'rgba(244, 240, 255, 0.7)'    
                ];
                return colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                // Movimiento simple
                this.x += this.speedX;
                this.y += this.speedY;

                // Rebote en los bordes
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // Crear partículas iniciales
        const createParticles = () => {
            particles = [];
            const particleCount = 35; // Más partículas para mejor efecto
            
            for (let i = 0; i < particleCount; i++) {
                particles.push(new CleanParticle());
            }
        };

        // Animación limpia - sin estelas
        const animate = () => {
            // Limpiar completamente el canvas en cada frame
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Actualizar y dibujar partículas
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            requestAnimationFrame(animate);
        };

        // Inicializar
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        animate();
    }
}

// Inicializar efectos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.petLuzEffects = new PetLuzEffects();
});

// Agregar estilos globales para efectos
if (!document.querySelector('#global-effects-styles')) {
    const style = document.createElement('style');
    style.id = 'global-effects-styles';
    style.textContent = `
        .scroll-animate {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }
        
        .scroll-animate.animated {
            opacity: 1;
            transform: translateY(0);
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .floating-particle {
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
}

window.PetLuzEffects = PetLuzEffects;