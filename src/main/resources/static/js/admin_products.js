let products = [];
let categories = [];
let currentProductId = null;

document.addEventListener('DOMContentLoaded', function () {
    initializeProducts();
});

async function initializeProducts() {
    showLoading(true);
    try {
        await Promise.all([
            loadProducts(),
            loadCategories()
        ]);
        setupEventListeners();
        showAlert('Sistema de productos cargado correctamente', 'success');
    } catch (error) {
        console.error('Error en inicialización:', error);
        showAlert('Error al inicializar el sistema: ' + error.message, 'danger');
    } finally {
        showLoading(false);
    }
}

function setupEventListeners() {
    document.getElementById('search-input').addEventListener('input', debounce(filterProducts, ADMIN_CONFIG.DEBOUNCE_DELAY));
    document.getElementById('status-filter').addEventListener('change', filterProducts);
    document.getElementById('category-filter').addEventListener('change', filterProducts);

    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            document.getElementById('search-input').focus();
        }
        if (e.key === 'F5') {
            e.preventDefault();
            loadProducts();
        }
    });
}

async function loadProducts() {
    showLoading(true);
    try {
        const response = await fetch('/api/super-admin/products', {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const responseData = await response.json();
        products = extractArrayFromResponse(responseData);

        displayProducts(products);
        updateStatistics();

    } catch (error) {
        console.error('Error cargando productos:', error);
        showAlert('Error al cargar los productos: ' + error.message, 'danger');
        products = [];
        displayProducts(products);
        updateStatistics();
    } finally {
        showLoading(false);
    }
}

async function loadCategories() {
    try {
        const response = await fetch('/api/super-admin/categories', {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        categories = extractArrayFromResponse(responseData);

        const categoryFilter = document.getElementById('category-filter');
        categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';

        categories.forEach(category => {
            const option = `<option value="${category.id}">${category.name}</option>`;
            categoryFilter.innerHTML += option;
        });

    } catch (error) {
        console.error('Error cargando categorías:', error);
        categories = [];
    }
}

function updateStatistics() {
    const total = products.length;
    const active = products.filter(p => p.active).length;
    const lowStock = products.filter(p => p.stock <= p.minStock && p.stock > 0).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const uniqueCategories = new Set(products.map(p => p.categoryName)).size;

    document.getElementById('total-products').textContent = total.toLocaleString();
    document.getElementById('active-products').textContent = active.toLocaleString();
    document.getElementById('low-stock-products').textContent = lowStock.toLocaleString();
    document.getElementById('out-of-stock-products').textContent = outOfStock.toLocaleString();
    document.getElementById('total-categories').textContent = uniqueCategories.toLocaleString();
    document.getElementById('last-update').textContent = 'Ahora';

    animateCounter('total-products', total);
    animateCounter('active-products', active);
    animateCounter('low-stock-products', lowStock);
    animateCounter('out-of-stock-products', outOfStock);
}

function displayProducts(productsToShow) {
    const container = document.getElementById('products-container');
    const countElement = document.getElementById('product-count');

    if (!Array.isArray(productsToShow)) {
        productsToShow = [];
    }

    container.innerHTML = '';
    countElement.textContent = productsToShow.length.toLocaleString();

    if (productsToShow.length === 0) {
        container.innerHTML = `
            <div class="empty-products">
                <i class="fas fa-box-open fa-3x mb-3"></i>
                <h4>No se encontraron productos</h4>
                <p class="text-muted">Intenta ajustar los filtros o agregar nuevos productos.</p>
                <button class="btn btn-primary mt-2" onclick="location.href='/super-admin/product-form'">
                    <i class="fas fa-plus me-2"></i>Agregar Primer Producto
                </button>
            </div>
        `;
        return;
    }

    productsToShow.forEach((product, index) => {
        const productCard = createProductCard(product, index);
        container.innerHTML += productCard;
    });
}

function createProductCard(product, index) {
    const imageUrl = product.imageUrl || '/images/default-product.png';
    const description = product.description || '';
    const categoryName = product.categoryName || 'Sin categoría';
    const price = product.price || 0;
    const stock = product.stock || 0;
    const minStock = product.minStock || 0;
    const active = product.active !== undefined ? product.active : true;
    const updatedAt = product.updatedAt || new Date().toISOString();

    const stockStatus = getStockStatus(stock, minStock);
    const stockClass = getStockClass(stock, minStock);

    return `
        <div class="product-card" style="animation-delay: ${index * 0.1}s">
            <div class="product-card-header">
                <img src="${imageUrl}" 
                     alt="${product.name}" 
                     class="product-image"
                     onerror="this.src='/images/default-product.png'">
                <div class="product-badges">
                    <span class="product-status-badge ${active ? 'product-status-active' : 'product-status-inactive'}">
                        ${active ? 'Activo' : 'Inactivo'}
                    </span>
                    <span class="stock-badge ${stockStatus}">
                        ${getStockBadgeText(stock, minStock)}
                    </span>
                </div>
            </div>
            <div class="product-card-body">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${description}</p>
                
                <div class="product-details">
                    <div class="product-detail-item">
                        <span class="detail-label">Categoría</span>
                        <span class="detail-value">${categoryName}</span>
                    </div>
                    <div class="product-detail-item">
                        <span class="detail-label">Precio</span>
                        <span class="detail-value product-price">$${price.toLocaleString()}</span>
                    </div>
                    <div class="product-detail-item">
                        <span class="detail-label">Stock</span>
                        <span class="detail-value product-stock ${stockClass}">
                            ${stock} / ${minStock}
                        </span>
                    </div>
                </div>
            </div>
            <div class="product-card-footer">
                <div class="product-actions">
                    <button class="btn-action-icon btn-view" onclick="event.stopPropagation(); viewProduct(${product.id})" 
                            title="Ver Detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action-icon btn-edit" onclick="event.stopPropagation(); editProduct(${product.id})" 
                            title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action-icon btn-stock" onclick="event.stopPropagation(); showStockModal(${product.id})" 
                            title="Gestionar Stock">
                        <i class="fas fa-warehouse"></i>
                    </button>
                    <button class="btn-action-icon btn-toggle ${active ? '' : 'inactive'}" 
                            onclick="event.stopPropagation(); showToggleStatusModal(${product.id})" 
                            title="${active ? 'Desactivar' : 'Activar'}">
                        <i class="fas ${active ? 'fa-eye-slash' : 'fa-eye'}"></i>
                    </button>
                </div>
                <div class="product-updated">
                    ${formatDate(updatedAt)}
                </div>
            </div>
        </div>
    `;
}

function getStockStatus(stock, minStock) {
    if (stock === 0) return 'stock-out';
    if (stock <= minStock) return 'stock-low';
    return 'stock-ok';
}

function getStockClass(stock, minStock) {
    if (stock === 0) return 'stock-critical';
    if (stock <= minStock) return 'stock-warning';
    return 'stock-good';
}

function getStockBadgeText(stock, minStock) {
    if (stock === 0) return 'Sin Stock';
    if (stock <= minStock) return 'Stock Bajo';
    return 'En Stock';
}

function getStockBadge(stock, minStock, size = '') {
    if (stock === 0) {
        return `<span class="badge badge-out-of-stock ${size ? 'badge-lg' : ''}">Sin Stock</span>`;
    } else if (stock <= minStock) {
        return `<span class="badge badge-low-stock ${size ? 'badge-lg' : ''}">Stock Bajo</span>`;
    } else {
        return `<span class="badge badge-in-stock ${size ? 'badge-lg' : ''}">En Stock</span>`;
    }
}

async function viewProduct(productId) {
    showLoading(true);
    try {
        const response = await fetch(`/api/super-admin/products/${productId}`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const product = await response.json();
        showProductDetailModal(product);

    } catch (error) {
        console.error('Error cargando producto:', error);
        showAlert('Error al cargar el producto', 'danger');
    } finally {
        showLoading(false);
    }
}

function showProductDetailModal(product) {
    const modalContent = `
        <div class="row">
            <div class="col-md-4 text-center">
                <img src="${product.imageUrl || '/images/default-product.png'}" 
                     alt="${product.name}" 
                     class="img-fluid rounded mb-3 product-detail-image"
                     style="max-height: 250px; width: 100%; object-fit: cover;"
                     onerror="this.src='/images/default-product.png'">
                <div class="mt-3">
                    ${getStockBadge(product.stock, product.minStock, 'lg')}
                    <span class="${product.active ? 'status-active' : 'status-inactive'} ms-2">
                        ${product.active ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
            </div>
            <div class="col-md-8">
                <h4 class="product-detail-name mb-3">${product.name}</h4>
                <p class="text-muted product-detail-description mb-4">${product.description || 'Sin descripción'}</p>
                
                <div class="row mt-4">
                    <div class="col-6">
                        <strong class="text-muted">Precio:</strong><br>
                        <span class="h4 text-primary">$${product.price.toLocaleString()}</span>
                    </div>
                    <div class="col-6">
                        <strong class="text-muted">Stock:</strong><br>
                        <span class="h4 ${product.stock <= product.minStock ? 'text-warning' : 'text-success'}">
                            ${product.stock} unidades
                        </span>
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-6">
                        <strong class="text-muted">Tipo:</strong><br>
                        <span class="badge bg-secondary">${product.type}</span>
                    </div>
                    <div class="col-6">
                        <strong class="text-muted">Categoría:</strong><br>
                        <span>${product.categoryName || 'Sin categoría'}</span>
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-6">
                        <strong class="text-muted">Stock Mínimo:</strong><br>
                        <span>${product.minStock} unidades</span>
                    </div>
                    <div class="col-6">
                        <strong class="text-muted">Fecha Creación:</strong><br>
                        <span>${formatDate(product.createdAt)}</span>
                    </div>
                </div>
                
                ${product.sku ? `
                <div class="row mt-4">
                    <div class="col-12">
                        <strong class="text-muted">SKU:</strong><br>
                        <code class="bg-light p-2 rounded">${product.sku}</code>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    document.getElementById('productDetailContent').innerHTML = modalContent;
    document.getElementById('editProductBtn').onclick = () => editProduct(product.id);

    const modal = new bootstrap.Modal(document.getElementById('productDetailModal'));
    modal.show();
}

async function showStockModal(productId) {
    try {
        const response = await fetch(`/api/super-admin/products/${productId}`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const product = await response.json();

        document.getElementById('stockProductId').value = product.id;
        document.getElementById('stockProductName').textContent = product.name;
        document.getElementById('currentStock').textContent = `${product.stock} unidades`;
        document.getElementById('stockQuantity').value = '';
        document.getElementById('stockReason').value = '';
        document.getElementById('stockOperation').value = '';

        const modal = new bootstrap.Modal(document.getElementById('stockModal'));
        modal.show();

    } catch (error) {
        console.error('Error cargando producto:', error);
        showAlert('Error al cargar el producto', 'danger');
    }
}

async function updateStock() {
    const productId = document.getElementById('stockProductId').value;
    const operation = document.getElementById('stockOperation').value;
    const quantity = document.getElementById('stockQuantity').value;
    const reason = document.getElementById('stockReason').value;

    if (!operation || !quantity) {
        showAlert('Por favor complete todos los campos', 'warning');
        return;
    }

    const stockData = {
        operation: operation,
        quantity: parseInt(quantity),
        reason: reason
    };

    try {
        const response = await fetch(`/api/super-admin/products/${productId}/stock`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(stockData)
        });

        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('stockModal'));
            modal.hide();
            showAlert('Stock actualizado correctamente', 'success');
            loadProducts();
        } else {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error('Error actualizando stock:', error);
        showAlert('Error al actualizar el stock: ' + error.message, 'danger');
    }
}

function editProduct(productId) {
    window.location.href = `/super-admin/product-form?id=${productId}`;
}

function showToggleStatusModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showAlert('Producto no encontrado', 'danger');
        return;
    }

    const action = product.active ? 'desactivar' : 'activar';
    const actionText = product.active ? 'desactivación' : 'activación';

    document.getElementById('confirmModalTitle').textContent = `Confirmar ${actionText}`;
    document.getElementById('confirmModalBody').innerHTML = `
        <div class="text-center">
            <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
            <h5>¿Estás seguro de ${action} este producto?</h5>
            <p class="text-muted">Producto: <strong>${product.name}</strong></p>
            <p class="text-muted">Esta acción ${product.active ? 'ocultará' : 'mostrará'} el producto en el catálogo.</p>
        </div>
    `;

    const confirmBtn = document.getElementById('confirmModalBtn');
    confirmBtn.onclick = () => toggleProductStatus(productId);
    confirmBtn.textContent = action.charAt(0).toUpperCase() + action.slice(1);
    confirmBtn.className = product.active ? 'btn btn-warning' : 'btn btn-success';

    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    modal.show();
}

async function toggleProductStatus(productId) {
    try {
        const response = await fetch(`/api/super-admin/products/${productId}/toggle-status`, {
            method: 'PATCH',
            headers: getHeaders()
        });

        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
            modal.hide();
            showAlert('Estado del producto actualizado correctamente', 'success');
            loadProducts();
        } else {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error('Error cambiando estado:', error);
        showAlert('Error al cambiar el estado del producto: ' + error.message, 'danger');
    }
}

function filterProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const categoryFilter = document.getElementById('category-filter').value;

    let filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm)) ||
            (product.sku && product.sku.toLowerCase().includes(searchTerm));
        const matchesStatus = !statusFilter ||
            (statusFilter === 'active' && product.active) ||
            (statusFilter === 'inactive' && !product.active);
        const matchesCategory = !categoryFilter ||
            (product.categoryName &&
                categories.find(c => c.id == categoryFilter)?.name === product.categoryName);

        return matchesSearch && matchesStatus && matchesCategory;
    });

    displayProducts(filteredProducts);
}

function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('category-filter').value = '';
    displayProducts(products);
    showAlert('Filtros limpiados', 'info');
}

function exportToExcel() {
    if (products.length === 0) {
        showAlert('No hay productos para exportar', 'warning');
        return;
    }

    let csv = 'Nombre,Descripción,SKU,Categoría,Precio,Stock,Stock Mínimo,Estado\n';
    products.forEach(product => {
        csv += `"${product.name}","${product.description || ''}","${product.sku || ''}","${product.categoryName || ''}",${product.price},${product.stock},${product.minStock},${product.active ? 'Activo' : 'Inactivo'}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `productos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showAlert('Exportación completada correctamente', 'success');
}

function truncateText(text, length) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return 'Fecha inválida';
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('current-time').textContent = `${dateString} - ${timeString}`;
}

function showAlert(message, type) {
    const existingAlerts = document.querySelectorAll('.alert-toast');
    existingAlerts.forEach(alert => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
    });

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-toast alert-dismissible fade show`;
    alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas ${getAlertIcon(type)} me-2"></i>
            <div>${message}</div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
        </div>
    `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.style.opacity = '0';
            setTimeout(() => alertDiv.remove(), 300);
        }
    }, 5000);
}

function getAlertIcon(type) {
    const icons = {
        'success': 'fa-check-circle',
        'danger': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    return icons[type] || 'fa-info-circle';
}

function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

document.addEventListener('DOMContentLoaded', setupScrollAnimations);