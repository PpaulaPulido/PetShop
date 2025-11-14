// Sistema de partículas mejorado
class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.mouse = { x: 0, y: 0, radius: 100 };
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.createParticles();
        this.animate();
        this.setupEventListeners();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.createParticles();
        });

        this.canvas.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = undefined;
            this.mouse.y = undefined;
        });
    }

    createParticles() {
        this.particles = [];
        const particleCount = Math.min(100, Math.floor(window.innerWidth / 15));
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.6 + 0.2,
                color: `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar conexiones entre partículas
        this.drawConnections();
        
        this.particles.forEach(particle => {
            // Interacción con el mouse
            if (this.mouse.x && this.mouse.y) {
                const dx = particle.x - this.mouse.x;
                const dy = particle.y - this.mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.mouse.radius) {
                    const angle = Math.atan2(dy, dx);
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    particle.x += Math.cos(angle) * force * 2;
                    particle.y += Math.sin(angle) * force * 2;
                }
            }
            
            // Movimiento normal
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Rebotar en los bordes
            if (particle.x < 0 || particle.x > this.canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.speedY *= -1;
            
            // Dibujar partícula
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - distance / 100)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Gestor de Tips
class TipsManager {
    constructor() {
        this.tips = [
            {
                id: 1,
                title: 'Alimentación Saludable',
                icon: '🍖',
                description: 'Consejos para una nutrición balanceada',
                tips: [
                    'Proporciona alimento de alta calidad según la edad y tamaño',
                    'Establece horarios regulares para las comidas',
                    'Mantén agua fresca disponible siempre',
                    'Evita alimentos humanos que puedan ser tóxicos'
                ]
            },
            {
                id: 2,
                title: 'Ejercicio y Actividad',
                icon: '⚽',
                description: 'Mantén a tu mascota activa y feliz',
                tips: [
                    'Paseos diarios según la raza y energía',
                    'Juegos interactivos para estimulación mental',
                    'Ejercicio adecuado para la edad',
                    'Socialización con otras mascotas'
                ]
            },
            {
                id: 3,
                title: 'Cuidado e Higiene',
                icon: '🛁',
                description: 'Mantenimiento y limpieza esencial',
                tips: [
                    'Baño regular con productos específicos',
                    'Cepillado frecuente del pelaje',
                    'Limpieza de oídos y corte de uñas',
                    'Cuidado dental con juguetes masticables'
                ]
            },
            {
                id: 4,
                title: 'Salud Preventiva',
                icon: '💊',
                description: 'Prevención y cuidados médicos',
                tips: [
                    'Visitas regulares al veterinario',
                    'Vacunación y desparasitación al día',
                    'Control de peso y condición física',
                    'Observación de cambios de comportamiento'
                ]
            }
        ];
    }

    init() {
        this.renderTips();
        this.setupTipInteractions();
    }

    renderTips() {
        const tipsContainer = document.getElementById('tipsContainer');
        if (!tipsContainer) {
            console.error('No se encontró el contenedor de tips');
            return;
        }

        tipsContainer.innerHTML = this.tips.map(tip => `
            <div class="tip-card" data-tip-id="${tip.id}">
                <div class="tip-header">
                    <div class="tip-icon">${tip.icon}</div>
                    <h3>${tip.title}</h3>
                    <p>${tip.description}</p>
                </div>
                <div class="tip-content">
                    <ul>
                        ${tip.tips.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');

        console.log('Tips renderizados correctamente');
    }

    setupTipInteractions() {
        const tipCards = document.querySelectorAll('.tip-card');
        
        tipCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                card.classList.toggle('active');
            });
        });

        // Cerrar tips al hacer click fuera
        document.addEventListener('click', () => {
            tipCards.forEach(card => card.classList.remove('active'));
        });
    }
}

// Gestor de Navegación
class NavigationManager {
    init() {
        this.setupNavbarScroll();
        this.setupMobileMenu();
        this.setupSmoothScroll();
        this.setupActiveLinks();
    }

    setupNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        const handleScroll = () => {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Ejecutar al cargar
    }

    setupMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (!hamburger || !navMenu) return;

        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    setupSmoothScroll() {
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

    setupActiveLinks() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(section => observer.observe(section));
    }
}

// Gestor de Carrito
class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('petluz_cart')) || [];
    }

    init() {
        this.updateCartCount();
        this.setupCartEvents();
    }

    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1,
                cartId: Date.now().toString()
            });
        }
        
        this.saveCart();
        this.animateCartIcon();
        this.showAddToCartNotification(product.name);
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.cartId !== productId);
        this.saveCart();
    }

    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    animateCartIcon() {
        const cartIcon = document.getElementById('cartIcon');
        if (cartIcon) {
            cartIcon.style.transform = 'scale(1.2)';
            setTimeout(() => {
                cartIcon.style.transform = 'scale(1)';
            }, 300);
        }
    }

    showAddToCartNotification(productName) {
        this.showNotification(`¡${productName} añadido al carrito!`, 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => notification.classList.add('show'), 100);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    saveCart() {
        localStorage.setItem('petluz_cart', JSON.stringify(this.cart));
        this.updateCartCount();
    }

    setupCartEvents() {
        const cartIcon = document.getElementById('cartIcon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => {
                this.showNotification('Carrito de compras - Funcionalidad en desarrollo', 'info');
            });
        }
    }
}

// Gestor de Modales
class ModalManager {
    init() {
        this.setupModalEvents();
        this.setupFormSubmissions();
    }

    setupModalEvents() {
        // Login Modal
        const loginBtn = document.getElementById('loginBtn');
        const loginModal = document.getElementById('loginModal');
        const closeLoginModal = document.getElementById('closeLoginModal');
        
        if (loginBtn && loginModal) {
            loginBtn.addEventListener('click', () => this.openModal(loginModal));
            closeLoginModal.addEventListener('click', () => this.closeModal(loginModal));
        }

        // Register Modal
        const registerBtn = document.getElementById('registerBtn');
        const registerModal = document.getElementById('registerModal');
        const closeRegisterModal = document.getElementById('closeRegisterModal');
        
        if (registerBtn && registerModal) {
            registerBtn.addEventListener('click', () => this.openModal(registerModal));
            closeRegisterModal.addEventListener('click', () => this.closeModal(registerModal));
        }

        // Cerrar modal al hacer click fuera
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });

        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal[style="display: block;"]');
                if (openModal) this.closeModal(openModal);
            }
        });
    }

    openModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    setupFormSubmissions() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const newsletterForm = document.getElementById('newsletterForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletter(e.target);
            });
        }
    }

    handleLogin() {
        this.closeModal(document.getElementById('loginModal'));
        this.showNotification('¡Bienvenido de nuevo!', 'success');
    }

    handleRegister() {
        this.closeModal(document.getElementById('registerModal'));
        this.showNotification('¡Registro exitoso! Bienvenido a PetLuz', 'success');
    }

    handleNewsletter(form) {
        const email = form.querySelector('input[type="email"]').value;
        this.showNotification('¡Gracias por suscribirte a nuestro newsletter!', 'success');
        form.reset();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => notification.classList.add('show'), 100);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Efectos de Scroll y Animaciones
class ScrollEffects {
    init() {
        this.setupScrollAnimations();
        this.setupParallaxEffect();
        this.setupScrollIndicator();
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observar elementos para animación
        const elementsToAnimate = document.querySelectorAll(
            '.category-card, .process-step, .advantage-card, .tip-card, .section-title'
        );

        elementsToAnimate.forEach(el => {
            observer.observe(el);
        });
    }

    setupParallaxEffect() {
        const heroImage = document.querySelector('.hero-image');
        if (!heroImage) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroImage.style.transform = `translateY(${rate}px) scale(1.1)`;
        });
    }

    setupScrollIndicator() {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (!scrollIndicator) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                scrollIndicator.style.opacity = '0';
            } else {
                scrollIndicator.style.opacity = '1';
            }
        });

        // Click para scroll down
        scrollIndicator.addEventListener('click', () => {
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        });
    }
}

// Aplicación Principal
class PetLuzApp {
    constructor() {
        this.modules = {
            navigation: new NavigationManager(),
            tips: new TipsManager(),
            cart: new CartManager(),
            modal: new ModalManager(),
            scroll: new ScrollEffects()
        };
        
        this.particleSystem = null;
    }

    init() {
        try {
            console.log('Inicializando PetLuz App...');
            
            // Inicializar sistema de partículas
            this.initParticleSystem();
            
            // Inicializar módulos
            Object.values(this.modules).forEach(module => {
                if (module.init) {
                    module.init();
                }
            });
            
            // Configurar eventos globales
            this.setupGlobalEvents();
            
            console.log('PetLuz App inicializada correctamente');
        } catch (error) {
            console.error('Error inicializando la app:', error);
        }
    }

    initParticleSystem() {
        this.particleSystem = new ParticleSystem('particlesCanvas');
    }

    setupGlobalEvents() {
        // Botones del hero
        const buyNowBtn = document.getElementById('buyNowBtn');
        const exploreCategoriesBtn = document.getElementById('exploreCategoriesBtn');
        
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', () => {
                document.getElementById('categories').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        }
        
        if (exploreCategoriesBtn) {
            exploreCategoriesBtn.addEventListener('click', () => {
                document.getElementById('categories').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        }

        // Efectos hover en categorías
        this.setupCategoryHoverEffects();
        
        // Precarga de imágenes
        this.preloadImages();
    }

    setupCategoryHoverEffects() {
        const categoryCards = document.querySelectorAll('.category-card');
        
        categoryCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    preloadImages() {
        const images = document.querySelectorAll('img');
        let loadedCount = 0;
        const totalImages = images.length;

        images.forEach(img => {
            if (img.complete) {
                loadedCount++;
                this.onImageLoad(img);
            } else {
                img.addEventListener('load', () => {
                    loadedCount++;
                    this.onImageLoad(img);
                });
                
                img.addEventListener('error', () => {
                    loadedCount++;
                    console.warn('Error cargando imagen:', img.src);
                });
            }
        });

        // Todas las imágenes cargadas
        if (loadedCount === totalImages) {
            this.onAllImagesLoaded();
        }
    }

    onImageLoad(img) {
        img.style.opacity = '1';
    }

    onAllImagesLoaded() {
        console.log('Todas las imágenes cargadas');
        document.body.classList.add('images-loaded');
    }

    destroy() {
        if (this.particleSystem) {
            this.particleSystem.destroy();
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.petLuzApp = new PetLuzApp();
    window.petLuzApp.init();
});

// Manejar errores no capturados
window.addEventListener('error', (e) => {
    console.error('Error no capturado:', e.error);
});