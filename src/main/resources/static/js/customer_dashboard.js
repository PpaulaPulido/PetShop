class DashboardManager {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadUserData();
        await this.loadOrderStats();
        await this.loadRecentOrders();
        await this.loadRecommendedProducts();
        this.updateCartCount();
        this.setupEventListeners();
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

    async loadRecentOrders() {
        try {
            const response = await fetch('/api/customer/orders');
            if (response.ok) {
                const orders = await response.json();
                this.displayRecentOrders(orders.slice(0, 3)); // Mostrar solo 3 más recientes
            }
        } catch (error) {
            console.error('Error loading recent orders:', error);
            this.displayRecentOrders([]);
        }
    }

    async loadRecommendedProducts() {
        try {
            const response = await fetch('/api/customer/products');
            if (response.ok) {
                const products = await response.json();
                this.displayRecommendedProducts(products.slice(0, 4)); // Mostrar solo 4 productos
            }
        } catch (error) {
            console.error('Error loading recommended products:', error);
            this.displayRecommendedProducts([]);
        }
    }

    updateUserInfo(userData) {
        const userNameElement = document.getElementById('userName');
        if (userNameElement && userData.firstName) {
            userNameElement.textContent = userData.firstName;
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

    displayRecentOrders(orders) {
        const container = document.getElementById('recentOrders');
        
        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No tienes pedidos recientes</p>
                    <a href="/customer/products" class="btn btn-primary">Comenzar a comprar</a>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <span class="order-number">Pedido #${order.invoiceNumber}</span>
                    <span class="order-status status-${order.status.toLowerCase()}">${this.getStatusText(order.status)}</span>
                </div>
                <div class="order-details">
                    <span class="order-date">${new Date(order.createdAt).toLocaleDateString('es-ES')}</span>
                    <span class="order-amount">$${order.totalAmount.toFixed(2)}</span>
                </div>
                <a href="/user/order-details/${order.id}" class="order-link">Ver detalles</a>
            </div>
        `).join('');
    }

    displayRecommendedProducts(products) {
        const container = document.getElementById('recommendedProducts');
        
        if (!products || products.length === 0) {
            container.innerHTML = '<div class="empty-state">No hay productos recomendados disponibles</div>';
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.displayImage || '/images/default-product.png'}" 
                     alt="${product.name}" 
                     class="product-image"
                     onerror="this.src='/images/default-product.png'">
                <div class="product-info">
                    <h4 class="product-name">${product.name}</h4>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <button class="btn-add-to-cart" data-product-id="${product.id}">
                        Agregar al carrito
                    </button>
                </div>
            </div>
        `).join('');

        // Agregar event listeners a los botones
        container.querySelectorAll('.btn-add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.addToCart(productId);
            });
        });
    }

    getStatusText(status) {
        const statusMap = {
            'PENDING': 'Pendiente',
            'CONFIRMED': 'Confirmado',
            'PAID': 'Pagado',
            'SHIPPED': 'Enviado',
            'DELIVERED': 'Entregado',
            'CANCELLED': 'Cancelado'
        };
        return statusMap[status] || status;
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
        }
    }

    getCartFromStorage() {
        try {
            return JSON.parse(localStorage.getItem('petluz_cart') || '[]');
        } catch (error) {
            return [];
        }
    }

    async addToCart(productId) {
        try {
            const response = await fetch(`/api/customer/cart/items/${productId}?quantity=1`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const cartData = await response.json();
                this.updateCartCount();
                
                // Actualizar localStorage como respaldo
                this.updateLocalStorageCart(cartData);
                
                // Disparar evento para actualizar el sidebar del carrito
                window.dispatchEvent(new CustomEvent('cartUpdated'));
                
                // Mostrar notificación
                this.showNotification('Producto agregado al carrito', 'success');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al agregar al carrito');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification(error.message || 'Error al agregar el producto', 'error');
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

    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            z-index: 2000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        // Colores según el tipo
        if (type === 'success') {
            notification.style.background = '#10b981';
        } else if (type === 'error') {
            notification.style.background = '#ef4444';
        } else if (type === 'warning') {
            notification.style.background = '#f59e0b';
        } else {
            notification.style.background = '#3b82f6';
        }
        
        document.body.appendChild(notification);
        
        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
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
                this.showNotification('Tu carrito está vacío', 'warning');
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

        // Cargar datos iniciales del carrito desde la API
        this.loadCartFromAPI();
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
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});

// Manejar errores no capturados
window.addEventListener('error', (event) => {
    console.error('Error en el dashboard:', event.error);
});