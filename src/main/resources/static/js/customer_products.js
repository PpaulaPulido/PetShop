class ProductsManager {
    constructor() {
        this.currentPage = 0;
        this.pageSize = 12;
        this.totalPages = 0;
        this.totalProducts = 0;
        this.filters = {
            search: '',
            categories: [],
            types: [],
            minPrice: null,
            maxPrice: null,
            inStock: true,
            lowStock: false
        };
        this.sortBy = 'name';
        this.viewMode = 'grid';
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadCategories();
        await this.loadProducts();
        await this.loadCartCount();
    }

    setupEventListeners() {
        // Búsqueda
        document.getElementById('searchBtn').addEventListener('click', () => this.handleSearch());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // Ordenamiento
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.currentPage = 0;
            this.loadProducts();
        });

        // Filtros
        document.getElementById('applyFilters').addEventListener('click', () => this.applyFilters());
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());
        document.getElementById('applyPrice').addEventListener('click', () => {
            this.applyPriceFilter();
            this.currentPage = 0;
            this.loadProducts();
        });

        // Event listeners para tipos de producto
        document.querySelectorAll('input[name="type"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateTypeFilters();
            });
        });

        // Event listeners para stock
        document.querySelectorAll('input[name="stock"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateStockFilters();
            });
        });

        // Filtros móviles
        document.getElementById('filterToggle').addEventListener('click', () => this.toggleMobileFilters());
        document.getElementById('filtersClose').addEventListener('click', () => this.closeMobileFilters());

        // Vista (grid/list)
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setViewMode(e.target.dataset.view);
            });
        });

        // Paginación
        document.getElementById('prevPage').addEventListener('click', () => this.previousPage());
        document.getElementById('nextPage').addEventListener('click', () => this.nextPage());

        // Reset búsqueda
        document.getElementById('resetSearch').addEventListener('click', () => this.clearSearch());

        // Escuchar eventos del carrito GLOBALMENTE
        window.addEventListener('cartUpdated', (event) => {
            const totalItems = event.detail?.totalItems;
            if (totalItems !== undefined) {
                this.updateCartCountDisplay(totalItems);
            } else {
                this.loadCartCount();
            }
        });
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/customer/categories');
            if (response.ok) {
                const categories = await response.json();
                this.displayCategories(categories);
            } else {
                throw new Error('Error al cargar categorías');
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            this.loadFallbackCategories();
        }
    }

    displayCategories(categories) {
        const container = document.getElementById('categoryFilters');
        container.innerHTML = categories.map(category => `
            <label class="filter-option">
                <input type="checkbox" name="category" value="${category.id}">
                <span>${category.name} (${category.productCount || 0})</span>
            </label>
        `).join('');

        // Agregar event listeners
        container.querySelectorAll('input[name="category"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateCategoryFilters();
            });
        });
    }

    loadFallbackCategories() {
        const fallbackCategories = [
            { id: 1, name: 'Alimento para Perros', productCount: 0 },
            { id: 2, name: 'Alimento para Gatos', productCount: 0 },
            { id: 3, name: 'Juguetes', productCount: 0 },
            { id: 4, name: 'Accesorios', productCount: 0 },
            { id: 5, name: 'Salud y Bienestar', productCount: 0 },
            { id: 6, name: 'Higiene', productCount: 0 }
        ];
        this.displayCategories(fallbackCategories);
    }

    updateCategoryFilters() {
        const checkedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
            .map(checkbox => parseInt(checkbox.value));
        this.filters.categories = checkedCategories;
    }

    updateTypeFilters() {
        this.filters.types = Array.from(document.querySelectorAll('input[name="type"]:checked'))
            .map(checkbox => checkbox.value);
    }

    updateStockFilters() {
        const inStockChecked = document.querySelector('input[name="stock"][value="in_stock"]:checked');
        const lowStockChecked = document.querySelector('input[name="stock"][value="low_stock"]:checked');
        
        this.filters.inStock = inStockChecked !== null;
        this.filters.lowStock = lowStockChecked !== null;
    }

    async loadProducts() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams();
            params.append('page', this.currentPage);
            params.append('size', this.pageSize);
            
            if (this.filters.search) {
                params.append('search', this.filters.search);
            }
            
            if (this.filters.categories.length > 0) {
                this.filters.categories.forEach(catId => {
                    params.append('category', catId);
                });
            }
            
            if (this.filters.types.length > 0) {
                this.filters.types.forEach(type => {
                    params.append('type', type);
                });
            }
            
            if (this.filters.minPrice !== null) {
                params.append('minPrice', this.filters.minPrice);
            }
            if (this.filters.maxPrice !== null) {
                params.append('maxPrice', this.filters.maxPrice);
            }
            
            if (this.filters.inStock) {
                params.append('inStock', 'true');
            }
            
            if (this.sortBy) {
                params.append('sort', this.sortBy);
            }

            console.log('Loading products with params:', params.toString());
            
            const response = await fetch(`/api/customer/products?${params}`);
            
            if (response.ok) {
                const products = await response.json();
                this.displayProducts(products);
                
                this.totalProducts = products.length;
                this.totalPages = Math.ceil(this.totalProducts / this.pageSize);
                this.updatePagination();
                
            } else {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Error al cargar los productos: ' + error.message);
        }
    }

    displayProducts(products) {
        const container = document.getElementById('productsGrid');
        const emptyState = document.getElementById('emptyState');

        if (!products || products.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            document.getElementById('pagination').style.display = 'none';
            return;
        }

        container.style.display = 'grid';
        emptyState.style.display = 'none';

        container.innerHTML = products.map(product => `
            <div class="product-card ${this.viewMode}-view">
                <img src="${product.displayImage || '/images/default-product.png'}" 
                     alt="${product.name}" 
                     class="product-image"
                     onerror="this.src='/images/default-product.png'">
                <div class="product-info">
                    <span class="product-category">${product.type || 'General'}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description || 'Sin descripción disponible'}</p>
                    
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    
                    <div class="product-stock ${this.getStockClass(product.stock)}">
                        ${this.getStockText(product.stock)}
                    </div>
                    
                    <div class="product-actions">
                        <button class="btn-add-to-cart" 
                                data-product-id="${product.id}"
                                ${product.stock === 0 ? 'disabled' : ''}>
                            🛒 ${product.stock === 0 ? 'Agotado' : 'Agregar'}
                        </button>
                        <a href="/customer/products/${product.id}" class="btn-view-details">
                            👀 Ver
                        </a>
                    </div>
                </div>
            </div>
        `).join('');

        // Agregar event listeners a los botones de agregar al carrito
        container.querySelectorAll('.btn-add-to-cart:not(:disabled)').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.addToCart(productId);
            });
        });

        this.updateResultsInfo(products.length);
    }

    getStockClass(stock) {
        if (stock === 0) return 'stock-out';
        if (stock <= 5) return 'stock-low';
        return 'stock-available';
    }

    getStockText(stock) {
        if (stock === 0) return '❌ Agotado';
        if (stock <= 5) return `⚠️ Solo ${stock} disponibles`;
        return `✅ En stock (${stock})`;
    }

    updateResultsInfo(displayedCount) {
        const totalText = this.totalProducts > 0 ?
            `Mostrando ${displayedCount} de ${this.totalProducts} productos` :
            'No se encontraron productos';

        document.getElementById('resultsCount').textContent = totalText;
    }

    updatePagination() {
        const pagination = document.getElementById('pagination');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const pageInfo = document.getElementById('pageInfo');

        if (this.totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }

        pagination.style.display = 'flex';
        prevBtn.disabled = this.currentPage === 0;
        nextBtn.disabled = this.currentPage === this.totalPages - 1;
        pageInfo.textContent = `Página ${this.currentPage + 1} de ${this.totalPages}`;
    }

    async loadCartCount() {
        try {
            const response = await fetch('/api/customer/cart/count');
            if (response.ok) {
                const count = await response.json();
                this.updateCartCountDisplay(count);
            } else {
                this.updateCartCountFromStorage();
            }
        } catch (error) {
            console.error('Error loading cart count:', error);
            this.updateCartCountFromStorage();
        }
    }

    updateCartCountDisplay(count) {
        const headerCartCount = document.getElementById('headerCartCount');
        const dashboardCartCount = document.getElementById('cartItemsCount');
        
        if (headerCartCount) {
            headerCartCount.textContent = count;
        }
        if (dashboardCartCount) {
            dashboardCartCount.textContent = count;
        }
        
        this.updateLocalStorageCartCount(count);
    }

    updateCartCountFromStorage() {
        const cart = this.getCartFromStorage();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        this.updateCartCountDisplay(totalItems);
    }

    updateLocalStorageCartCount(count) {
        const cart = this.getCartFromStorage();
        const currentCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (currentCount !== count) {
            console.log('Discrepancia en contador del carrito:', currentCount, 'vs', count);
        }
    }

    async addToCart(productId) {
        try {
            console.log('Adding product to cart:', productId);
            
            const response = await fetch(`/api/customer/cart/items/${productId}?quantity=1`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const cartData = await response.json();
                
                const totalItems = cartData.totalItems || cartData.items.reduce((sum, item) => sum + item.quantity, 0);
                this.updateCartCountDisplay(totalItems);
                
                this.updateLocalStorageCart(cartData);
                
                window.dispatchEvent(new CustomEvent('cartUpdated', { 
                    detail: { totalItems: totalItems } 
                }));
                
                this.showNotification('Producto agregado al carrito', 'success');
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al agregar al carrito');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Error al agregar el producto: ' + error.message, 'error');
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

    getCartFromStorage() {
        try {
            return JSON.parse(localStorage.getItem('petluz_cart') || '[]');
        } catch (error) {
            console.error('Error parsing cart from localStorage:', error);
            return [];
        }
    }

    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        this.filters.search = searchInput.value.trim();
        this.currentPage = 0;
        this.loadProducts();
    }

    applyFilters() {
        this.filters.types = Array.from(document.querySelectorAll('input[name="type"]:checked'))
            .map(checkbox => checkbox.value);

        const inStockChecked = document.querySelector('input[name="stock"][value="in_stock"]:checked');
        const lowStockChecked = document.querySelector('input[name="stock"][value="low_stock"]:checked');
        
        this.filters.inStock = inStockChecked !== null;
        this.filters.lowStock = lowStockChecked !== null;

        this.applyPriceFilter();

        this.currentPage = 0;
        this.loadProducts();
        this.closeMobileFilters();
    }

    applyPriceFilter() {
        const minPrice = document.getElementById('minPrice').value;
        const maxPrice = document.getElementById('maxPrice').value;

        this.filters.minPrice = minPrice ? parseFloat(minPrice) : null;
        this.filters.maxPrice = maxPrice ? parseFloat(maxPrice) : null;

        if (this.filters.minPrice !== null && this.filters.maxPrice !== null && 
            this.filters.minPrice > this.filters.maxPrice) {
            this.showNotification('El precio mínimo no puede ser mayor al máximo', 'error');
            this.filters.minPrice = null;
            this.filters.maxPrice = null;
            document.getElementById('minPrice').value = '';
            document.getElementById('maxPrice').value = '';
        }
    }

    clearFilters() {
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        document.querySelector('input[name="stock"][value="in_stock"]').checked = true;

        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';

        this.filters = {
            search: '',
            categories: [],
            types: [],
            minPrice: null,
            maxPrice: null,
            inStock: true,
            lowStock: false
        };

        this.currentPage = 0;
        this.loadProducts();
    }

    clearSearch() {
        document.getElementById('searchInput').value = '';
        this.filters.search = '';
        this.currentPage = 0;
        this.loadProducts();
    }

    setViewMode(mode) {
        this.viewMode = mode;
        const productsGrid = document.getElementById('productsGrid');
        const viewBtns = document.querySelectorAll('.view-btn');

        productsGrid.className = `products-grid ${mode}-view`;

        viewBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === mode);
        });

        this.loadProducts();
    }

    previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.loadProducts();
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages - 1) {
            this.currentPage++;
            this.loadProducts();
        }
    }

    toggleMobileFilters() {
        const sidebar = document.getElementById('filtersSidebar');
        sidebar.classList.toggle('active');
    }

    closeMobileFilters() {
        const sidebar = document.getElementById('filtersSidebar');
        sidebar.classList.remove('active');
    }

    showLoading() {
        const container = document.getElementById('productsGrid');
        container.innerHTML = '<div class="loading">Cargando productos...</div>';
    }

    showError(message) {
        const container = document.getElementById('productsGrid');
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-content">
                    <h3>Error</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">Reintentar</button>
                </div>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
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
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ProductsManager();
});