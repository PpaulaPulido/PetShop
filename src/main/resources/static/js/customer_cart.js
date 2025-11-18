// customer_cart.js - VERSIÓN CORREGIDA
class CustomerCart {
    constructor() {
        this.currentCart = null;
        this.productToDelete = null;
        this.productToView = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCart();
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

        // Solo escuchar eventos específicos para esta vista
        window.addEventListener('customerCartUpdated', () => {
            this.loadCart();
        });
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
        checkoutBtn.style.display = 'block';

        this.displayCartItems(cartData.items);
        this.updateCartStats(cartData.items.length, cartData.totalAmount);
        this.updateCartSummary(cartData);
    }

    displayCartItems(items) {
        const cartItemsContainer = document.getElementById('cartPageItems');
        
        cartItemsContainer.innerHTML = items.map(item => `
            <div class="cart-page-item" data-product-id="${item.productId}">
                <div class="cart-page-item-image">
                    <img src="${item.productImage}" 
                         alt="${item.productName}"
                         onerror="this.src='/images/default-product.png'">
                </div>
                
                <div class="cart-page-item-details">
                    <div class="cart-page-item-header">
                        <h3 class="cart-page-item-name">
                            <a href="javascript:void(0)" class="view-product-link" 
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
                                👁️ Ver Producto
                            </button>
                            <button class="cart-page-remove-btn" 
                                    data-product-id="${item.productId}"
                                    data-product-name="${item.productName}">
                                🗑️ Eliminar
                            </button>
                        </div>
                        
                        <div class="cart-page-item-subtotal">
                            $${item.subtotal.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        this.addCartPageEventListeners();
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
        document.querySelectorAll('.view-product-link').forEach(link => {
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
        document.getElementById('productModalPrice').textContent = `$${product.price.toFixed(2)}`;
        document.getElementById('productModalDescription').textContent = product.description || 'No hay descripción disponible.';
        document.getElementById('productModalStock').textContent = product.stock > 0 ? 
            `En stock (${product.stock} disponibles)` : 'Agotado';
        document.getElementById('productModalStock').className = product.stock > 0 ? 'in-stock' : 'out-of-stock';
        
        document.getElementById('productModalOverlay').style.display = 'flex';
    }

    hideProductModal() {
        this.productToView = null;
        document.getElementById('productModalOverlay').style.display = 'none';
    }

    async updateItemQuantity(productId, action) {
        try {
            const currentItem = this.currentCart.items.find(item => item.productId === parseInt(productId));
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
                this.showNotification('Cantidad actualizada', 'success');
                // Disparar evento específico para esta vista y el global
                window.dispatchEvent(new CustomEvent('customerCartUpdated'));
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar cantidad');
            }
        } catch (error) {
            console.error('Error updating item quantity:', error);
            this.showNotification(error.message || 'Error al actualizar cantidad', 'error');
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
            this.showNotification('Error al eliminar producto', 'error');
        }
    }

    updateCartStats(itemCount, totalAmount) {
        document.getElementById('cartPageItemsCount').textContent = `${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}`;
        document.getElementById('cartPageTotalAmount').textContent = `Total: $${totalAmount.toFixed(2)}`;
        
        const headerCartCount = document.getElementById('headerCartCount');
        if (headerCartCount) {
            headerCartCount.textContent = itemCount;
        }
    }

    updateCartSummary(cartData) {
        const subtotal = cartData.totalAmount || 0;
        const shipping = subtotal > 100 ? 0 : 5.99;
        const tax = subtotal * 0.19;
        const total = subtotal + shipping + tax;

        document.getElementById('summarySubtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('summaryShipping').textContent = shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`;
        document.getElementById('summaryTax').textContent = `$${tax.toFixed(2)}`;
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
            <div class="loading-cart">
                <p>Cargando tu carrito...</p>
            </div>
        `;
    }

    showErrorState() {
        const cartState = document.getElementById('cartPageState');
        
        cartState.style.display = 'block';
        cartState.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <h2>Error al cargar el carrito</h2>
                <p>No pudimos cargar tu carrito. Por favor, intenta de nuevo.</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    Reintentar
                </button>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notificationContainer') || document.body;
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new CustomerCart();
});