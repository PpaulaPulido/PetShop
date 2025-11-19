// customer_cart.js - VERSIÓN SIN IVA, SOLO PRECIOS DE PRODUCTOS
class CustomerCart {
    constructor() {
        this.currentCart = null;
        this.productToDelete = null;
        this.productToView = null;
        this.particles = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCart();
        this.setupIntersectionObserver();
        this.setupCartEffects();
        this.initParticles();
    }

    setupEventListeners() {
        // Modal de eliminación
        document.getElementById('closeDeleteModal')?.addEventListener('click', () => this.hideDeleteModal());
        document.getElementById('cancelDelete')?.addEventListener('click', () => this.hideDeleteModal());
        document.getElementById('confirmDelete')?.addEventListener('click', () => this.confirmDeleteProduct());
        
        // Modal de detalles del producto
        document.getElementById('closeProductModal')?.addEventListener('click', () => this.hideProductModal());
        document.getElementById('productModalOverlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'productModalOverlay') {
                this.hideProductModal();
            }
        });

        // Cerrar modales al presionar ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideDeleteModal();
                this.hideProductModal();
            }
        });

        // Escuchar eventos de actualización
        window.addEventListener('customerCartUpdated', () => {
            this.loadCart();
        });

        // Actualizar cuando la página gana foco
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadCart();
            }
        });
    }

    setupIntersectionObserver() {
        // Animación de aparición para items del carrito
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        this.observer = observer;
    }

    setupCartEffects() {
        // Efectos específicos del carrito
        this.setupHoverEffects();
    }

    setupHoverEffects() {
        // Efecto de tilt en tarjetas del carrito
        const cards = document.querySelectorAll('.cart-page-item-card');
        
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
                    
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
                }
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }

    // SISTEMA DE PARTÍCULAS MEJORADO
    initParticles() {
        const cartHeader = document.querySelector('.cart-page-header');
        if (!cartHeader) return;

        // Crear contenedor de partículas si no existe
        let particlesContainer = document.querySelector('.cart-page-header-particles');
        if (!particlesContainer) {
            particlesContainer = document.createElement('div');
            particlesContainer.className = 'cart-page-header-particles';
            cartHeader.appendChild(particlesContainer);
        }

        // Crear partículas
        this.createParticles(particlesContainer, 25);
        
        // Iniciar animación
        this.animateParticles();
    }

    createParticles(container, count) {
        this.particles = [];
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'cart-floating-particle';
            
            // Posición aleatoria
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            
            // Tamaño y opacidad aleatorios
            const size = Math.random() * 3 + 2;
            const opacity = Math.random() * 0.7 + 0.3;
            
            // Color aleatorio (blanco, amarillo suave, morado suave)
            const colors = [
                'rgba(255, 255, 255, 0.9)',
                'rgba(255, 209, 102, 0.8)',
                'rgba(142, 68, 255, 0.6)',
                'rgba(255, 255, 255, 0.7)'
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                left: ${left}%;
                top: ${top}%;
                opacity: ${opacity};
                animation-delay: ${Math.random() * 5}s;
                box-shadow: 0 0 ${size * 2}px ${size}px rgba(255, 255, 255, 0.3);
            `;
            
            container.appendChild(particle);
            
            this.particles.push({
                element: particle,
                x: left,
                y: top,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.3,
                amplitude: Math.random() * 20 + 10,
                frequency: Math.random() * 0.02 + 0.01,
                time: Math.random() * Math.PI * 2
            });
        }
    }

    animateParticles() {
        const updateParticles = () => {
            this.particles.forEach(particle => {
                particle.time += particle.frequency;
                
                // Movimiento ondulatorio
                const newX = particle.x + Math.sin(particle.time) * particle.amplitude;
                const newY = particle.y + Math.cos(particle.time * 0.7) * (particle.amplitude * 0.5);
                
                particle.element.style.left = `${newX}%`;
                particle.element.style.top = `${newY}%`;
                
                // Efecto de parpadeo
                const opacity = 0.3 + Math.abs(Math.sin(particle.time * 2)) * 0.5;
                particle.element.style.opacity = opacity;
            });
            
            requestAnimationFrame(updateParticles);
        };
        
        updateParticles();
    }

    async loadCart() {
        try {
            this.showLoadingState();
            
            const response = await fetch('/api/customer/cart');
            if (response.ok) {
                const cartData = await response.json();
                this.currentCart = cartData;
                this.displayCart(cartData);
            } else {
                throw new Error('Error al cargar el carrito');
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            this.showErrorState();
        }
    }

    displayCart(cartData) {
        const cartState = document.getElementById('cartPageState');
        const cartItems = document.getElementById('cartPageItems');
        const emptyCart = document.getElementById('cartPageEmpty');
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (!cartData.items || cartData.items.length === 0) {
            cartState.style.display = 'none';
            cartItems.style.display = 'none';
            emptyCart.style.display = 'block';
            checkoutBtn.style.display = 'none';
            this.updateCartStats(0, 0);
            return;
        }

        cartState.style.display = 'none';
        cartItems.style.display = 'block';
        emptyCart.style.display = 'none';
        // Mostrar el botón de checkout
        checkoutBtn.style.display = 'flex';

        this.displayCartItems(cartData.items);
        this.updateCartStats(cartData.items.length, cartData.totalAmount);
        this.updateCartSummary(cartData);
    }

    displayCartItems(items) {
        const cartItemsContainer = document.getElementById('cartPageItems');
        
        cartItemsContainer.innerHTML = items.map((item, index) => `
            <div class="cart-page-item-card" data-product-id="${item.productId}" style="animation-delay: ${index * 100}ms; --item-index: ${index}">
                <div class="cart-page-item-image">
                    <img src="${item.productImage}" 
                         alt="${item.productName}"
                         onerror="this.src='/images/default-product.png'">
                </div>
                
                <div class="cart-page-item-details">
                    <div class="cart-page-item-header">
                        <h3 class="cart-page-item-name">
                            <a href="javascript:void(0)" class="cart-page-view-product-link" 
                               data-product-id="${item.productId}">
                                ${item.productName}
                            </a>
                        </h3>
                        <div class="cart-page-item-price">$${item.productPrice.toFixed(2)}</div>
                    </div>
                    
                    <div class="cart-page-item-actions">
                        <div class="cart-page-quantity-controls">
                            <button class="cart-page-quantity-btn decrease" 
                                    data-product-id="${item.productId}"
                                    ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                            <span class="cart-page-quantity-display">${item.quantity}</span>
                            <button class="cart-page-quantity-btn increase" 
                                    data-product-id="${item.productId}">+</button>
                        </div>
                        
                        <div class="cart-page-item-buttons">
                            <button class="cart-page-view-btn" 
                                    data-product-id="${item.productId}">
                                Ver Producto
                            </button>
                            <button class="cart-page-remove-btn" 
                                    data-product-id="${item.productId}"
                                    data-product-name="${item.productName}">
                                Eliminar
                            </button>
                        </div>
                        
                        <div class="cart-page-item-subtotal">
                            $${((item.productPrice || 0) * (item.quantity || 0)).toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        this.addCartPageEventListeners();
        this.observeCartItems();
        this.setupHoverEffects(); // Re-aplicar efectos hover a los nuevos elementos
    }

    observeCartItems() {
        document.querySelectorAll('.cart-page-item-card').forEach(item => {
            this.observer.observe(item);
        });
    }

    addCartPageEventListeners() {
        // Botones de cantidad
        document.querySelectorAll('.cart-page-quantity-btn.increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.updateItemQuantity(productId, 'increase');
            });
        });

        document.querySelectorAll('.cart-page-quantity-btn.decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.updateItemQuantity(productId, 'decrease');
            });
        });

        // Botones de ver producto
        document.querySelectorAll('.cart-page-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.viewProductDetails(productId);
            });
        });

        // Enlaces de nombre de producto
        document.querySelectorAll('.cart-page-view-product-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.viewProductDetails(productId);
            });
        });

        // Botones de eliminar
        document.querySelectorAll('.cart-page-remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                const productName = e.target.dataset.productName;
                this.showDeleteModal(productId, productName);
            });
        });
    }

    async viewProductDetails(productId) {
        try {
            const response = await fetch(`/api/customer/products/${productId}`);
            if (response.ok) {
                const product = await response.json();
                this.showProductModal(product);
            } else {
                throw new Error('Error al cargar detalles del producto');
            }
        } catch (error) {
            console.error('Error loading product details:', error);
            this.showNotification('Error al cargar detalles del producto', 'error');
        }
    }

    showProductModal(product) {
        this.productToView = product;
        
        document.getElementById('productModalImage').src = product.imageUrl || '/images/default-product.png';
        document.getElementById('productModalName').textContent = product.name;
        document.getElementById('productModalPrice').textContent = `$${(product.price || 0).toFixed(2)}`;
        document.getElementById('productModalDescription').textContent = product.description || 'No hay descripción disponible.';
        
        const stockElement = document.getElementById('productModalStock');
        if (product.stock > 0) {
            stockElement.textContent = `En stock (${product.stock} disponibles)`;
            stockElement.className = 'cart-product-modal-stock in-stock';
        } else {
            stockElement.textContent = 'Agotado';
            stockElement.className = 'cart-product-modal-stock out-of-stock';
        }
        
        document.getElementById('productModalOverlay').style.display = 'flex';
    }

    hideProductModal() {
        this.productToView = null;
        document.getElementById('productModalOverlay').style.display = 'none';
    }

    async updateItemQuantity(productId, action) {
        try {
            const currentItem = this.currentCart?.items?.find(item => item.productId === parseInt(productId));
            if (!currentItem) return;

            let newQuantity = action === 'increase' ? currentItem.quantity + 1 : currentItem.quantity - 1;
            
            if (newQuantity < 1) {
                this.showDeleteModal(productId, currentItem.productName);
                return;
            }

            const response = await fetch(`/api/customer/cart/items/${productId}?quantity=${newQuantity}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.showNotification('Cantidad actualizada correctamente', 'success');
                // Disparar evento específico para esta vista y el global
                window.dispatchEvent(new CustomEvent('customerCartUpdated'));
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar cantidad');
            }
        } catch (error) {
            console.error('Error updating item quantity:', error);
            this.showNotification(error.message || 'Error al actualizar la cantidad', 'error');
        }
    }

    showDeleteModal(productId, productName) {
        this.productToDelete = productId;
        document.getElementById('deleteProductName').textContent = productName;
        document.getElementById('deleteModalOverlay').style.display = 'flex';
    }

    hideDeleteModal() {
        this.productToDelete = null;
        document.getElementById('deleteModalOverlay').style.display = 'none';
    }

    async confirmDeleteProduct() {
        if (!this.productToDelete) return;

        try {
            const itemCard = document.querySelector(`[data-product-id="${this.productToDelete}"]`);
            
            // Efecto de eliminación
            if (itemCard) {
                itemCard.classList.add('removing');
            }

            const response = await fetch(`/api/customer/cart/items/${this.productToDelete}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showNotification('Producto eliminado del carrito', 'success');
                this.hideDeleteModal();
                // Disparar ambos eventos
                window.dispatchEvent(new CustomEvent('customerCartUpdated'));
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            } else {
                throw new Error('Error al eliminar producto');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showNotification('Error al eliminar el producto', 'error');
            
            // Remover clase de eliminación si hubo error
            const itemCard = document.querySelector(`[data-product-id="${this.productToDelete}"]`);
            if (itemCard) {
                itemCard.classList.remove('removing');
            }
        }
    }

    updateCartStats(itemCount, totalAmount) {
        document.getElementById('cartPageItemsCount').textContent = `${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}`;
        document.getElementById('cartPageTotalAmount').textContent = `Total: $${(totalAmount || 0).toFixed(2)}`;
        
        const headerCartCount = document.getElementById('headerCartCount');
        if (headerCartCount) {
            headerCartCount.textContent = itemCount;
        }
    }

    updateCartSummary(cartData) {
        const total = cartData.totalAmount || 0;

        // Solo mostrar el total del carrito sin IVA ni desgloses
        document.getElementById('summaryTotal').textContent = `$${total.toFixed(2)}`;
    }

    showLoadingState() {
        const cartState = document.getElementById('cartPageState');
        const cartItems = document.getElementById('cartPageItems');
        const emptyCart = document.getElementById('cartPageEmpty');
        
        cartState.style.display = 'block';
        cartItems.style.display = 'none';
        emptyCart.style.display = 'none';
        
        cartState.innerHTML = `
            <div class="cart-page-loading">
                <p>Cargando tu carrito...</p>
            </div>
        `;
    }

    showErrorState() {
        const cartState = document.getElementById('cartPageState');
        
        cartState.style.display = 'block';
        cartState.innerHTML = `
            <div class="cart-page-empty-state">
                <div class="cart-page-empty-icon">⚠️</div>
                <h2>Error al cargar el carrito</h2>
                <p>No pudimos cargar tu carrito. Por favor, intenta de nuevo.</p>
                <button class="cart-page-btn cart-page-btn-primary" onclick="location.reload()">
                    Reintentar
                </button>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `cart-notification cart-notification-${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notificationContainer');
        if (!container) {
            // Crear contenedor si no existe
            const newContainer = document.createElement('div');
            newContainer.id = 'notificationContainer';
            document.body.appendChild(newContainer);
            container = newContainer;
        }
        
        container.appendChild(notification);
        
        // Trigger reflow para la animación
        notification.offsetHeight;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.customerCart = new CustomerCart();
});