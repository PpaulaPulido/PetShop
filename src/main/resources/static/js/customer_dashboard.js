class DashboardManager {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadUserData();
        await this.loadOrderStats();
        this.updateCartCount();
        this.setupEventListeners();
        this.initAnimations(); 
    }

    initAnimations() {
        if (window.petLuzEffects) {
            this.setupDashboardSpecificEffects();
        }

        // Inicializar efectos de hover si están disponibles
        if (window.AdvancedHoverEffects) {
            window.AdvancedHoverEffects.setupCardTilt();
            window.AdvancedHoverEffects.setupButtonRipple();
        }

        // Inicializar animaciones al scroll si están disponibles
        if (window.ScrollAnimations) {
            this.scrollAnimations = new window.ScrollAnimations();
        }

        // Inicializar efectos de texto si están disponibles
        if (window.TextEffects) {
            window.TextEffects.init();
        }
    }

    setupDashboardSpecificEffects() {
        // Efecto de partículas flotantes en el banner de bienvenida
        const welcomeBanner = document.querySelector('.welcome-banner');
        if (welcomeBanner && window.petLuzEffects) {
            window.petLuzEffects.createFloatingParticles(welcomeBanner, 8);
        }

        // Efecto de revelación gradual para las estadísticas
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            card.classList.add('stagger-reveal');
            card.style.transitionDelay = `${index * 0.1}s`;
        });

        // Configurar interacciones para las nuevas secciones
        this.setupBreedsInteractions();
        this.setupCareInteractions();
    }

    setupBreedsInteractions() {
        const breedCards = document.querySelectorAll('.breed-card');
        breedCards.forEach(card => {
            card.addEventListener('click', () => {
                // Efecto de pulso al hacer clic
                if (window.petLuzEffects) {
                    window.petLuzEffects.pulseElement(card, 500);
                }
                
                const breedName = card.querySelector('h3').textContent;
                this.showNotification(`¿Te interesa saber más sobre ${breedName}? 🐾`, 'info');
            });
        });
    }

    setupCareInteractions() {
        const careCards = document.querySelectorAll('.care-card');
        careCards.forEach(card => {
            card.addEventListener('click', () => {
                // Efecto de pulso al hacer clic
                if (window.petLuzEffects) {
                    window.petLuzEffects.pulseElement(card, 500);
                }
                
                const careStage = card.querySelector('h3').textContent;
                this.showNotification(`Información sobre cuidados para ${careStage} 📚`, 'info');
            });
        });
    }

    // Función para animar estadísticas
    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-info h3');
        statNumbers.forEach(stat => {
            const target = parseInt(stat.textContent);
            if (isNaN(target)) return;

            // Usar el efecto de conteo animado de PetLuzEffects si está disponible
            if (window.petLuzEffects) {
                window.petLuzEffects.animateNumberCount(stat, target, 1500);
            } else {
                // Fallback al método original
                let current = 0;
                const increment = target / 30;
                const duration = 1500;
                const stepTime = duration / 30;

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        stat.textContent = target;
                        clearInterval(timer);
                    } else {
                        stat.textContent = Math.floor(current);
                    }
                }, stepTime);
            }
        });
    }

    // Actualizar la función loadOrderStats para incluir animación
    async loadOrderStats() {
        try {
            const ordersResponse = await fetch('/api/customer/orders');
            if (ordersResponse.ok) {
                const orders = await ordersResponse.json();
                this.updateOrderStats(orders);
                this.animateStats(); // Animar los números
            }

            const addressesResponse = await fetch('/api/customer/addresses');
            if (addressesResponse.ok) {
                const addresses = await addressesResponse.json();
                document.getElementById('savedAddresses').textContent = addresses.length;
            }
        } catch (error) {
            console.error('Error loading order stats:', error);
        }
    }

    async loadUserData() {
        try {
            const response = await fetch('/api/customer/profile');
            if (response.ok) {
                const userData = await response.json();
                this.updateUserInfo(userData);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async loadOrderStats() {
        try {
            // Cargar estadísticas de pedidos
            const ordersResponse = await fetch('/api/customer/orders');
            if (ordersResponse.ok) {
                const orders = await ordersResponse.json();
                this.updateOrderStats(orders);
            }

            // Cargar conteo de direcciones
            const addressesResponse = await fetch('/api/customer/addresses');
            if (addressesResponse.ok) {
                const addresses = await addressesResponse.json();
                document.getElementById('savedAddresses').textContent = addresses.length;
            }
        } catch (error) {
            console.error('Error loading order stats:', error);
        }
    }

    updateUserInfo(userData) {
        const userNameElement = document.getElementById('userName');
        if (userNameElement && userData.firstName) {
            userNameElement.textContent = userData.firstName;
            
            // Efecto de escritura si está disponible
            if (window.petLuzEffects) {
                const originalName = userData.firstName;
                userNameElement.textContent = '';
                setTimeout(() => {
                    window.petLuzEffects.typeWriterEffect(userNameElement, originalName, 100);
                }, 1000);
            }
        }
    }

    updateOrderStats(orders) {
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order =>
            order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PAID'
        ).length;

        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('pendingOrders').textContent = pendingOrders;
    }

    updateCartCount() {
        // Obtener del localStorage como respaldo temporal
        const cart = this.getCartFromStorage();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cartItemsCount').textContent = totalItems;

        // También actualizar el contador del header
        const headerCartCount = document.getElementById('headerCartCount');
        if (headerCartCount) {
            headerCartCount.textContent = totalItems;
            
            // Efecto de pulso cuando hay cambios
            if (window.petLuzEffects && totalItems > 0) {
                window.petLuzEffects.pulseElement(headerCartCount, 1000);
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

    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            color: white;
            z-index: 10000;
            font-weight: 500;
            box-shadow: var(--shadow-hover);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;

        // Colores según el tipo usando la paleta de PetLuz
        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, var(--success), #059669)';
        } else if (type === 'error') {
            notification.style.background = 'linear-gradient(135deg, var(--error), #dc2626)';
        } else if (type === 'warning') {
            notification.style.background = 'linear-gradient(135deg, var(--warning), #d97706)';
        } else {
            notification.style.background = 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))';
        }

        document.body.appendChild(notification);

        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Efecto de shake para errores
        if (type === 'error' && window.petLuzEffects) {
            setTimeout(() => {
                window.petLuzEffects.shakeElement(notification);
            }, 300);
        }

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    setupEventListeners() {
        // Botón de pago rápido
        document.getElementById('quickCheckout')?.addEventListener('click', (e) => {
            e.preventDefault();
            const cart = this.getCartFromStorage();
            if (cart.length === 0) {
                this.showNotification('Tu carrito está vacío 🛒', 'warning');
                
                // Efecto de shake al botón
                const quickCheckoutBtn = document.getElementById('quickCheckout');
                if (window.petLuzEffects) {
                    window.petLuzEffects.shakeElement(quickCheckoutBtn);
                }
                return;
            }
            window.location.href = '/user/checkout';
        });

        // Escuchar eventos de actualización del carrito
        window.addEventListener('cartUpdated', () => {
            this.updateCartCount();
            // Recargar datos del carrito desde la API
            this.loadCartFromAPI();
        });

        // Interacción con la galería de mascotas
        this.setupGalleryInteractions();

        // Cargar datos iniciales del carrito desde la API
        this.loadCartFromAPI();
    }

    setupGalleryInteractions() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                // Efecto de pulso al hacer clic
                if (window.petLuzEffects) {
                    window.petLuzEffects.pulseElement(item, 500);
                }
                
                this.showNotification('¡Qué linda mascota! 🐾', 'info');
            });
        });
    }

    async loadCartFromAPI() {
        try {
            const response = await fetch('/api/customer/cart');
            if (response.ok) {
                const cartData = await response.json();
                this.updateLocalStorageCart(cartData);
                this.updateCartCount();
            }
        } catch (error) {
            console.error('Error loading cart from API:', error);
        }
    }

    updateLocalStorageCart(cartData) {
        if (cartData && cartData.items) {
            const simplifiedCart = cartData.items.map(item => ({
                productId: item.productId,
                productName: item.productName,
                productPrice: item.productPrice,
                quantity: item.quantity,
                productImage: item.productImage
            }));
            localStorage.setItem('petluz_cart', JSON.stringify(simplifiedCart));
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});

window.addEventListener('error', (event) => {
    console.error('Error en el dashboard:', event.error);
});