class HeaderManager {
    constructor() {
        this.particleSystem = null;
        this.isMobileMenuOpen = false;
        this.isUserMenuOpen = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScrollEffects();
        this.updateCartCount();
        this.initParticleSystem();
        this.createMobileOverlay();
        
        setTimeout(() => {
            document.querySelector('.header')?.classList.add('loaded');
        }, 100);
    }

    setupEventListeners() {
        // Toggle menú móvil
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.querySelector('.nav-menu');
        
        navToggle?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMobileMenu();
        });

        // Cerrar menú móvil al hacer clic en enlaces
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.closeMobileMenu();
                }
            });
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-menu') && !e.target.closest('.nav-toggle')) {
                this.closeMobileMenu();
            }
        });

        // Toggle carrito sidebar
        const cartToggle = document.getElementById('cartToggle');
        cartToggle?.addEventListener('click', () => {
            this.animateCartButton();
            window.dispatchEvent(new CustomEvent('toggleCartSidebar'));
        });

        // Toggle menú de usuario
        const userMenuToggle = document.getElementById('userMenuToggle');
        const userDropdown = document.getElementById('userDropdown');
        
        userMenuToggle?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleUserMenu();
        });

        // Cerrar menú usuario al hacer clic fuera (solo desktop)
        document.addEventListener('click', (e) => {
            if (window.innerWidth > 768) {
                if (!e.target.closest('.user-menu') && !e.target.closest('.user-btn')) {
                    this.closeUserMenu();
                }
            }
        });

        // Cerrar menús al hacer clic en overlay
        const overlay = document.querySelector('.dropdown-overlay');
        overlay?.addEventListener('click', () => {
            this.closeAllMenus();
        });

        // Escuchar actualizaciones del carrito
        window.addEventListener('cartUpdated', () => {
            this.updateCartCount();
            this.animateCartUpdate();
        });

        // Manejar redimensionamiento de ventana
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Tecla Escape para cerrar menús
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllMenus();
            }
        });

        // Prevenir scroll cuando menús están abiertos
        this.preventScrollWhenOpen();
    }

    toggleUserMenu() {
        if (this.isUserMenuOpen) {
            this.closeUserMenu();
        } else {
            this.openUserMenu();
        }
    }

    openUserMenu() {
        const userMenuToggle = document.getElementById('userMenuToggle');
        const userDropdown = document.getElementById('userDropdown');
        const overlay = document.querySelector('.dropdown-overlay');
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // En móviles, usar overlay para cerrar al tocar fuera
            overlay.classList.add('active');
            document.body.classList.add('dropdown-open');
        }
        
        userDropdown.classList.add('active');
        userMenuToggle.classList.add('active');
        this.isUserMenuOpen = true;
    }

    closeUserMenu() {
        const userMenuToggle = document.getElementById('userMenuToggle');
        const userDropdown = document.getElementById('userDropdown');
        const overlay = document.querySelector('.dropdown-overlay');
        
        userDropdown.classList.remove('active');
        userMenuToggle.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('dropdown-open');
        
        this.isUserMenuOpen = false;
    }

    toggleMobileMenu() {
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.querySelector('.nav-menu');
        const overlay = document.querySelector('.dropdown-overlay');
        
        navMenu.classList.add('active');
        navToggle.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('dropdown-open');
        this.isMobileMenuOpen = true;
        
        this.animateMenuItems();
    }

    closeMobileMenu() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.querySelector('.nav-menu');
        const overlay = document.querySelector('.dropdown-overlay');
        
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('dropdown-open');
        this.isMobileMenuOpen = false;
    }

    handleResize() {
        const isMobile = window.innerWidth <= 768;
        
        // Cerrar menús si cambiamos de móvil a desktop
        if (!isMobile) {
            this.closeUserMenu();
            this.closeMobileMenu();
            document.body.classList.remove('dropdown-open');
        }
    }

    createMobileOverlay() {
        if (!document.querySelector('.dropdown-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'dropdown-overlay';
            
            overlay.addEventListener('click', () => {
                this.closeAllMenus();
            });
            
            document.body.appendChild(overlay);
        }
    }

    closeAllMenus() {
        this.closeUserMenu();
        this.closeMobileMenu();
    }

    preventScrollWhenOpen() {
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            if (this.isMobileMenuOpen || this.isUserMenuOpen) {
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (this.isMobileMenuOpen || this.isUserMenuOpen) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    setupScrollEffects() {
        let lastScrollY = window.scrollY;
        const header = document.querySelector('.header');
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Efecto de scroll en header
            if (currentScrollY > 100) {
                header?.classList.add('scrolled');
            } else {
                header?.classList.remove('scrolled');
            }
            
            // Efecto parallax suave para partículas
            if (this.particleSystem) {
                const scrolled = currentScrollY * 0.5;
                this.particleSystem.canvas.style.transform = `translateY(${scrolled}px)`;
            }
            
            // Cerrar menús al hacer scroll en móviles
            if (window.innerWidth <= 768 && currentScrollY > 50) {
                this.closeAllMenus();
            }
            
            lastScrollY = currentScrollY;
        });
    }

    initParticleSystem() {
        const canvas = document.getElementById('headerParticleCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            
            // Configuración de partículas
            const particles = [];
            const particleCount = Math.min(15, Math.floor(window.innerWidth / 40));
            
            // Crear partículas
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.2,
                    speedY: (Math.random() - 0.5) * 0.2,
                    opacity: Math.random() * 0.3 + 0.1
                });
            }
            
            // Función de animación
            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                particles.forEach(particle => {
                    // Actualizar posición
                    particle.x += particle.speedX;
                    particle.y += particle.speedY;
                    
                    // Rebotar en los bordes
                    if (particle.x <= 0 || particle.x >= canvas.width) particle.speedX *= -1;
                    if (particle.y <= 0 || particle.y >= canvas.height) particle.speedY *= -1;
                    
                    // Dibujar partícula
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
                    ctx.fill();
                });
                
                requestAnimationFrame(animate);
            };
            
            // Configurar canvas
            const setupCanvas = () => {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            };
            
            setupCanvas();
            window.addEventListener('resize', setupCanvas);
            animate();
            
            this.particleSystem = { canvas, animate, setupCanvas };
        }
    }

    animateMenuItems() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('animate-in');
            
            setTimeout(() => {
                item.classList.remove('animate-in');
            }, 1000);
        });
    }

    animateCartButton() {
        const cartBtn = document.getElementById('cartToggle');
        if (cartBtn) {
            cartBtn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                cartBtn.style.transform = 'scale(1)';
            }, 150);
        }
    }

    animateCartUpdate() {
        const cartCount = document.getElementById('headerCartCount');
        if (cartCount) {
            cartCount.style.transform = 'scale(1.3)';
            setTimeout(() => {
                cartCount.style.transform = 'scale(1)';
            }, 300);
        }
    }

    updateCartCount() {
        const cart = this.getCartFromStorage();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElement = document.getElementById('headerCartCount');
        
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
            
            if (totalItems > 0) {
                cartCountElement.style.display = 'flex';
                cartCountElement.classList.add('has-items');
            } else {
                cartCountElement.style.display = 'none';
                cartCountElement.classList.remove('has-items');
            }
        }
    }

    getCartFromStorage() {
        try {
            return JSON.parse(localStorage.getItem('petluz_cart') || '[]');
        } catch (error) {
            return [];
        }
    }

    destroy() {
        if (this.particleSystem) {
            window.removeEventListener('resize', this.particleSystem.setupCanvas);
        }
        
        const overlay = document.querySelector('.dropdown-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        document.body.classList.remove('dropdown-open');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.headerManager = new HeaderManager();
});

window.HeaderManager = HeaderManager;