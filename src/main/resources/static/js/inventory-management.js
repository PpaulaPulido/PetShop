class InventoryManager {
    constructor() {
        this.products = [];
        this.categories = [];
        this.stockDistributionChart = null;
        this.lowStockChart = null;
        this.init();
    }

    init() {
        this.loadInventory();
        this.loadCategories();
        this.setupEventListeners();
        
        // Actualizar cada 30 segundos
        setInterval(() => this.loadInventory(), 30000);
    }

    async loadInventory() {
        try {
            showLoading(true);
            
            const response = await fetch('/api/super-admin/products');
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            this.products = await response.json();
            this.updateInventoryDisplay();
            this.updateStatistics();
            this.createCharts();
            
        } catch (error) {
            console.error('Error cargando inventario:', error);
            showAlert('Error al cargar el inventario', 'danger');
        } finally {
            showLoading(false);
        }
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/super-admin/categories');
            this.categories = await response.json();
            
            const categoryFilter = document.getElementById('category-filter');
            categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
            
            this.categories.forEach(category => {
                const option = `<option value="${category.id}">${category.name}</option>`;
                categoryFilter.innerHTML += option;
            });
        } catch (error) {
            console.error('Error cargando categorías:', error);
        }
    }

    updateStatistics() {
        const activeProducts = this.products.filter(p => p.active);
        const outOfStock = activeProducts.filter(p => p.stock === 0).length;
        const lowStock = activeProducts.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
        const totalValue = activeProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
        const totalProducts = activeProducts.length;
        
        // Animar los contadores
        this.animateCounter('out-of-stock-count', outOfStock);
        this.animateCounter('low-stock-count', lowStock);
        this.animateCounter('total-products', totalProducts);
        
        // Actualizar valor total
        document.getElementById('total-value').textContent = `$${totalValue.toLocaleString()}`;
    }

    animateCounter(elementId, targetValue, duration = 1000) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const current = parseInt(element.textContent) || 0;
        const steps = 60;
        const stepValue = (targetValue - current) / steps;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const value = Math.round(current + (stepValue * currentStep));
            element.textContent = value.toLocaleString();

            if (currentStep >= steps) {
                element.textContent = targetValue.toLocaleString();
                clearInterval(timer);
            }
        }, duration / steps);
    }

    updateInventoryDisplay(filteredProducts = null) {
        const tbody = document.getElementById('inventory-tbody');
        const countElement = document.getElementById('inventory-count');
        const productsToShow = filteredProducts || this.products;
        
        tbody.innerHTML = '';
        countElement.textContent = `${productsToShow.length} productos`;
        
        productsToShow.forEach(product => {
            const stockLevel = this.getStockLevel(product.stock, product.minStock);
            const progressPercentage = Math.min((product.stock / (product.minStock * 2)) * 100, 100);
            const stockValue = product.price * product.stock;
            
            const row = `
                <tr class="stock-${stockLevel.class}">
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="${product.imageUrl || '/images/default-product.png'}" 
                                 alt="${product.name}" 
                                 class="rounded me-3"
                                 style="width: 40px; height: 40px; object-fit: cover;"
                                 onerror="this.src='/images/default-product.png'">
                            <div>
                                <strong>${product.name}</strong>
                                ${!product.active ? '<br><span class="badge bg-secondary">Inactivo</span>' : ''}
                            </div>
                        </div>
                    </td>
                    <td>${product.categoryName || 'Sin categoría'}</td>
                    <td>
                        <strong class="${stockLevel.class === 'critical' || stockLevel.class === 'out-of-stock' ? 'text-danger' : ''}">
                            ${product.stock}
                        </strong>
                    </td>
                    <td>${product.minStock}</td>
                    <td>
                        <span class="badge badge-${stockLevel.class}">
                            ${stockLevel.text}
                        </span>
                    </td>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="progress flex-grow-1">
                                <div class="progress-bar bg-${stockLevel.color}" 
                                     role="progressbar" 
                                     style="width: ${progressPercentage}%"
                                     aria-valuenow="${progressPercentage}" 
                                     aria-valuemin="0" 
                                     aria-valuemax="100">
                                </div>
                            </div>
                            <small class="text-muted">${Math.round(progressPercentage)}%</small>
                        </div>
                    </td>
                    <td>
                        <strong>$${stockValue.toLocaleString()}</strong>
                    </td>
                    <td>${formatDate(product.updatedAt)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="inventoryManager.showStockModal(${product.id})">
                            <i class="fas fa-edit"></i> Ajustar
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    setupEventListeners() {
        document.getElementById('search-input').addEventListener('input', 
            debounce(() => this.filterInventory(), ADMIN_CONFIG.DEBOUNCE_DELAY));
        
        document.getElementById('stock-filter').addEventListener('change', 
            () => this.filterInventory());
        
        document.getElementById('category-filter').addEventListener('change', 
            () => this.filterInventory());
        
        document.getElementById('showOnlyActive').addEventListener('change', 
            () => this.filterInventory());
        
        document.getElementById('stockReason').addEventListener('change', 
            () => this.toggleCustomReason());
        
        document.getElementById('selectAllProducts').addEventListener('change', 
            () => this.toggleSelectAllProducts());

        // Inicializar animaciones de scroll
        initializeScrollAnimations();
    }

    filterInventory() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const stockFilter = document.getElementById('stock-filter').value;
        const categoryFilter = document.getElementById('category-filter').value;
        const showOnlyActive = document.getElementById('showOnlyActive').checked;
        
        let filteredProducts = this.products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                product.description?.toLowerCase().includes(searchTerm);
            const matchesStock = !stockFilter || this.getStockLevel(product.stock, product.minStock).class === stockFilter;
            const matchesCategory = !categoryFilter || 
                                  (product.categoryName && 
                                   this.categories.find(c => c.id == categoryFilter)?.name === product.categoryName);
            const matchesActive = !showOnlyActive || product.active;
            
            return matchesSearch && matchesStock && matchesCategory && matchesActive;
        });
        
        this.updateInventoryDisplay(filteredProducts);
    }

    async showStockModal(productId) {
        try {
            const response = await fetch(`/api/super-admin/products/${productId}`);
            const product = await response.json();
            
            document.getElementById('stockProductId').value = product.id;
            document.getElementById('stockProductName').textContent = product.name;
            document.getElementById('stockProductCategory').textContent = product.categoryName || 'Sin categoría';
            document.getElementById('stockProductImage').src = product.imageUrl || '/images/default-product.png';
            document.getElementById('currentStock').textContent = `${product.stock} unidades`;
            document.getElementById('minStock').textContent = `${product.minStock} unidades`;
            document.getElementById('stockQuantity').value = '';
            document.getElementById('stockOperation').value = '';
            document.getElementById('stockReason').value = '';
            document.getElementById('customReason').value = '';
            document.getElementById('customReasonSection').style.display = 'none';
            
            this.updateQuantityPlaceholder();
            
            const modal = new bootstrap.Modal(document.getElementById('stockModal'));
            modal.show();
            
        } catch (error) {
            console.error('Error cargando producto:', error);
            showAlert('Error al cargar el producto', 'danger');
        }
    }

    updateQuantityPlaceholder() {
        const operation = document.getElementById('stockOperation').value;
        const currentStock = parseInt(document.getElementById('currentStock').textContent) || 0;
        const helpText = document.getElementById('quantityHelp');
        
        switch(operation) {
            case 'ADD':
                helpText.textContent = `Stock actual: ${currentStock} → Nuevo stock: ${currentStock} + cantidad`;
                break;
            case 'SUBTRACT':
                helpText.textContent = `Stock actual: ${currentStock} → Nuevo stock: ${currentStock} - cantidad`;
                if (currentStock === 0) {
                    helpText.innerHTML += '<br><span class="text-danger">No se puede reducir stock de un producto sin existencias</span>';
                }
                break;
            case 'SET':
                helpText.textContent = `Stock actual: ${currentStock} → Nuevo stock: cantidad establecida`;
                break;
            default:
                helpText.textContent = '';
        }
    }

    toggleCustomReason() {
        const reason = document.getElementById('stockReason').value;
        const customSection = document.getElementById('customReasonSection');
        customSection.style.display = reason === 'OTRO' ? 'block' : 'none';
    }

    async updateStock() {
        const productId = document.getElementById('stockProductId').value;
        const operation = document.getElementById('stockOperation').value;
        const quantity = document.getElementById('stockQuantity').value;
        let reason = document.getElementById('stockReason').value;
        
        if (reason === 'OTRO') {
            reason = document.getElementById('customReason').value;
        }
        
        if (!operation || !quantity || !reason) {
            showAlert('Por favor complete todos los campos', 'warning');
            return;
        }
        
        // Validar reducción de stock
        if (operation === 'SUBTRACT') {
            const currentStock = parseInt(document.getElementById('currentStock').textContent);
            if (parseInt(quantity) > currentStock) {
                showAlert('No puede reducir más stock del disponible', 'danger');
                return;
            }
        }
        
        const stockData = {
            operation: operation,
            quantity: parseInt(quantity),
            reason: reason
        };
        
        try {
            const response = await fetch(`/api/super-admin/products/${productId}/stock`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...getHeaders()
                },
                body: JSON.stringify(stockData)
            });
            
            if (response.ok) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('stockModal'));
                modal.hide();
                showAlert('Stock actualizado correctamente', 'success');
                this.loadInventory();
            } else {
                throw new Error('Error en la respuesta del servidor');
            }
        } catch (error) {
            console.error('Error actualizando stock:', error);
            showAlert('Error al actualizar el stock', 'danger');
        }
    }

    showBulkStockModal() {
        const productsList = document.getElementById('bulkProductsList');
        productsList.innerHTML = '';
        
        this.products.forEach(product => {
            if (product.active) {
                const stockLevel = this.getStockLevel(product.stock, product.minStock);
                const productItem = `
                    <div class="product-check-item">
                        <div class="form-check">
                            <input class="form-check-input product-checkbox" type="checkbox" value="${product.id}" id="product-${product.id}">
                            <label class="form-check-label" for="product-${product.id}">
                                <strong>${product.name}</strong>
                                <span class="badge badge-${stockLevel.class} ms-2">${stockLevel.text}</span>
                                <br>
                                <small class="text-muted">Stock: ${product.stock} | Mínimo: ${product.minStock}</small>
                            </label>
                        </div>
                    </div>
                `;
                productsList.innerHTML += productItem;
            }
        });
        
        this.updateSelectedCount();
        
        // Agregar event listeners a los checkboxes
        document.querySelectorAll('.product-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateSelectedCount());
        });
        
        const modal = new bootstrap.Modal(document.getElementById('bulkStockModal'));
        modal.show();
    }

    toggleSelectAllProducts() {
        const selectAll = document.getElementById('selectAllProducts').checked;
        document.querySelectorAll('.product-checkbox').forEach(checkbox => {
            checkbox.checked = selectAll;
        });
        this.updateSelectedCount();
    }

    updateSelectedCount() {
        const selectedCount = document.querySelectorAll('.product-checkbox:checked').length;
        document.getElementById('selectedProductsCount').textContent = `${selectedCount} seleccionados`;
        document.getElementById('selectedProductsCountWarning').textContent = selectedCount;
    }

    async applyBulkStockUpdate() {
        const operation = document.getElementById('bulkOperation').value;
        const quantity = document.getElementById('bulkQuantity').value;
        const reason = document.getElementById('bulkReason').value;
        
        if (!operation || !quantity || !reason) {
            showAlert('Por favor complete todos los campos', 'warning');
            return;
        }
        
        const selectedProducts = Array.from(document.querySelectorAll('.product-checkbox:checked'))
            .map(checkbox => checkbox.value);
        
        if (selectedProducts.length === 0) {
            showAlert('Seleccione al menos un producto', 'warning');
            return;
        }
        
        if (!confirm(`¿Está seguro de aplicar este ajuste a ${selectedProducts.length} productos?`)) {
            return;
        }
        
        const bulkData = {
            operation: operation,
            quantity: parseInt(quantity),
            reason: reason,
            productIds: selectedProducts
        };
        
        try {
            const response = await fetch('/api/super-admin/products/bulk-stock', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...getHeaders()
                },
                body: JSON.stringify(bulkData)
            });
            
            if (response.ok) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('bulkStockModal'));
                modal.hide();
                showAlert(`Ajuste masivo aplicado a ${selectedProducts.length} productos`, 'success');
                this.loadInventory();
            } else {
                throw new Error('Error en la respuesta del servidor');
            }
        } catch (error) {
            console.error('Error en ajuste masivo:', error);
            showAlert('Error al aplicar el ajuste masivo', 'danger');
        }
    }

    createCharts() {
        const activeProducts = this.products.filter(p => p.active);
        const stockLevels = {
            'out-of-stock': activeProducts.filter(p => p.stock === 0).length,
            'critical': activeProducts.filter(p => p.stock > 0 && p.stock <= Math.ceil(p.minStock * 0.3)).length,
            'low': activeProducts.filter(p => p.stock > Math.ceil(p.minStock * 0.3) && p.stock <= p.minStock).length,
            'ok': activeProducts.filter(p => p.stock > p.minStock && p.stock <= p.minStock * 2).length,
            'excellent': activeProducts.filter(p => p.stock > p.minStock * 2).length
        };

        // Gráfico de distribución de stock
        const distributionCtx = document.getElementById('stockDistributionChart').getContext('2d');
        if (this.stockDistributionChart) {
            this.stockDistributionChart.destroy();
        }
        this.stockDistributionChart = new Chart(distributionCtx, {
            type: 'doughnut',
            data: {
                labels: ['Sin Stock', 'Crítico', 'Bajo', 'Normal', 'Excelente'],
                datasets: [{
                    data: Object.values(stockLevels),
                    backgroundColor: [
                        '#dc3545',
                        '#fd7e14',
                        '#ffc107',
                        '#198754',
                        '#20c997'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                cutout: '60%'
            }
        });

        // Gráfico de productos con stock bajo (top 10)
        const lowStockProducts = activeProducts
            .filter(p => p.stock <= p.minStock)
            .sort((a, b) => (a.stock / a.minStock) - (b.stock / b.minStock))
            .slice(0, 10);

        const lowStockCtx = document.getElementById('lowStockChart').getContext('2d');
        if (this.lowStockChart) {
            this.lowStockChart.destroy();
        }
        this.lowStockChart = new Chart(lowStockCtx, {
            type: 'bar',
            data: {
                labels: lowStockProducts.map(p => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name),
                datasets: [{
                    label: 'Stock Actual',
                    data: lowStockProducts.map(p => p.stock),
                    backgroundColor: lowStockProducts.map(p => 
                        p.stock === 0 ? '#dc3545' : 
                        p.stock <= Math.ceil(p.minStock * 0.3) ? '#fd7e14' : '#ffc107'
                    ),
                    borderColor: lowStockProducts.map(p => 
                        p.stock === 0 ? '#dc3545' : 
                        p.stock <= Math.ceil(p.minStock * 0.3) ? '#fd7e14' : '#ffc107'
                    ),
                    borderWidth: 1
                }, {
                    label: 'Stock Mínimo',
                    data: lowStockProducts.map(p => p.minStock),
                    type: 'line',
                    fill: false,
                    borderColor: '#6A2FB4',
                    borderWidth: 2,
                    pointBackgroundColor: '#6A2FB4',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.parsed.x;
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    exportInventoryReport() {
        const activeProducts = this.products.filter(p => p.active);
        let csv = 'Producto,Categoría,Stock Actual,Stock Mínimo,Nivel,Valor en Stock,Estado\n';
        
        activeProducts.forEach(product => {
            const stockLevel = this.getStockLevel(product.stock, product.minStock);
            const stockValue = product.price * product.stock;
            csv += `"${product.name}","${product.categoryName || ''}",${product.stock},${product.minStock},${stockLevel.text},${stockValue},${product.active ? 'Activo' : 'Inactivo'}\n`;
        });
        
        this.downloadCSV(csv, `inventario_${new Date().toISOString().split('T')[0]}.csv`);
    }

    exportLowStockReport() {
        const lowStockProducts = this.products
            .filter(p => p.active && p.stock <= p.minStock)
            .sort((a, b) => (a.stock / a.minStock) - (b.stock / b.minStock));
            
        let csv = 'Producto,Categoría,Stock Actual,Stock Mínimo,Nivel,Porcentaje,Valor en Stock\n';
        
        lowStockProducts.forEach(product => {
            const stockLevel = this.getStockLevel(product.stock, product.minStock);
            const stockValue = product.price * product.stock;
            const percentage = Math.round((product.stock / product.minStock) * 100);
            csv += `"${product.name}","${product.categoryName || ''}",${product.stock},${product.minStock},${stockLevel.text},${percentage}%,${stockValue}\n`;
        });
        
        this.downloadCSV(csv, `stock_bajo_${new Date().toISOString().split('T')[0]}.csv`);
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    clearFilters() {
        document.getElementById('search-input').value = '';
        document.getElementById('stock-filter').value = '';
        document.getElementById('category-filter').value = '';
        document.getElementById('showOnlyActive').checked = true;
        this.updateInventoryDisplay();
    }

    // Utilidades
    getStockLevel(stock, minStock) {
        if (stock === 0) {
            return { class: 'out-of-stock', text: 'Sin Stock', color: 'danger' };
        } else if (stock <= Math.ceil(minStock * 0.3)) {
            return { class: 'critical', text: 'Crítico', color: 'warning' };
        } else if (stock <= minStock) {
            return { class: 'low', text: 'Bajo', color: 'warning' };
        } else if (stock <= minStock * 2) {
            return { class: 'ok', text: 'Normal', color: 'success' };
        } else {
            return { class: 'excellent', text: 'Excelente', color: 'info' };
        }
    }
}

// Funciones globales para compatibilidad
function clearFilters() {
    if (window.inventoryManager) {
        window.inventoryManager.clearFilters();
    }
}

function showBulkStockModal() {
    if (window.inventoryManager) {
        window.inventoryManager.showBulkStockModal();
    }
}

function exportInventoryReport() {
    if (window.inventoryManager) {
        window.inventoryManager.exportInventoryReport();
    }
}

function exportLowStockReport() {
    if (window.inventoryManager) {
        window.inventoryManager.exportLowStockReport();
    }
}

function updateQuantityPlaceholder() {
    if (window.inventoryManager) {
        window.inventoryManager.updateQuantityPlaceholder();
    }
}

function toggleCustomReason() {
    if (window.inventoryManager) {
        window.inventoryManager.toggleCustomReason();
    }
}

function toggleSelectAllProducts() {
    if (window.inventoryManager) {
        window.inventoryManager.toggleSelectAllProducts();
    }
}

function updateStock() {
    if (window.inventoryManager) {
        window.inventoryManager.updateStock();
    }
}

function applyBulkStockUpdate() {
    if (window.inventoryManager) {
        window.inventoryManager.applyBulkStockUpdate();
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    window.inventoryManager = new InventoryManager();
});