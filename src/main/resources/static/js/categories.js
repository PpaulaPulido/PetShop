let categories = [];
let products = [];
let currentCategoryId = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeCategories();
    setupCategoryValidation();
});

// Configurar validaciones para categorías
function setupCategoryValidation() {
    const fieldConfigs = [
        { fieldId: 'categoryName', fieldType: 'categoryName', isRequired: true },
        { fieldId: 'categoryDescription', fieldType: 'categoryDescription', isRequired: false }
    ];

    window.fieldValidator.initializeRealTimeValidation('categoryForm', fieldConfigs);
}

async function initializeCategories() {
    showLoading(true);
    try {
        await Promise.all([
            loadCategories(),
            loadProducts()
        ]);
        setupEventListeners();
        showAlert('Sistema de categorías cargado correctamente', 'success');
    } catch (error) {
        console.error('Error en inicialización:', error);
        showAlert('Error al inicializar el sistema: ' + error.message, 'danger');
    } finally {
        showLoading(false);
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterCategories, ADMIN_CONFIG.DEBOUNCE_DELAY));
    }
}

// Cargar categorías
async function loadCategories() {
    try {
        const response = await fetch('/api/super-admin/categories', {
            headers: getHeaders()
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const responseData = await response.json();
        categories = extractArrayFromResponse(responseData);
        displayCategories(categories);
        updateStatistics();

    } catch (error) {
        console.error('Error cargando categorías:', error);
        showAlert('Error al cargar las categorías: ' + error.message, 'danger');
        categories = [];
        displayCategories(categories);
        updateStatistics();
    }
}

// Cargar productos para estadísticas
async function loadProducts() {
    try {
        const response = await fetch('/api/super-admin/products', {
            headers: getHeaders()
        });

        if (response.ok) {
            const responseData = await response.json();
            products = extractArrayFromResponse(responseData);
            updateStatistics();
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
        products = [];
    }
}

// Mostrar categorías
function displayCategories(categoriesToShow) {
    const container = document.getElementById('categories-container');
    const countElement = document.getElementById('category-count');

    if (!Array.isArray(categoriesToShow)) {
        categoriesToShow = [];
    }

    container.innerHTML = '';
    countElement.textContent = categoriesToShow.length.toLocaleString();

    if (categoriesToShow.length === 0) {
        container.innerHTML = `
            <div class="empty-categories fade-in">
                <i class="fas fa-tags"></i>
                <h4>No se encontraron categorías</h4>
                <p class="text-muted">Crea tu primera categoría para organizar tus productos</p>
                <button class="btn btn-primary" onclick="showCategoryForm()">
                    <i class="fas fa-plus me-2"></i>Crear Primera Categoría
                </button>
            </div>
        `;
        return;
    }

    categoriesToShow.forEach((category, index) => {
        const categoryCard = createCategoryCard(category, index);
        container.innerHTML += categoryCard;
    });
}

function createCategoryCard(category, index) {
    const productCount = category.productCount || products.filter(p => p.categoryId === category.id).length;
    const description = category.description || 'Sin descripción';
    const createdAt = category.createdAt || new Date().toISOString();

    return `
        <div class="category-card fade-in" style="animation-delay: ${index * 0.1}s">
            <div class="category-header">
                <h3 class="category-name">${category.name}</h3>
                <span class="category-badge">${productCount} producto${productCount !== 1 ? 's' : ''}</span>
            </div>
            <p class="category-description">${description}</p>
            <div class="category-meta">
                <span class="category-date">Creada: ${formatDate(createdAt)}</span>
                <div class="category-actions">
                    <button class="btn-action-icon btn-edit" 
                            onclick="event.stopPropagation(); editCategory(${category.id})" 
                            title="Editar categoría">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action-icon btn-delete" 
                            onclick="event.stopPropagation(); confirmDeleteCategory(${category.id})" 
                            ${productCount > 0 ? 'disabled title="No se puede eliminar categorías con productos"' : 'title="Eliminar categoría"'}>
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Actualizar estadísticas
function updateStatistics() {
    const totalCategories = categories.length;
    const totalProducts = products.length;
    const averageProducts = totalCategories > 0 ? (totalProducts / totalCategories).toFixed(1) : 0;
    
    const emptyCategories = categories.filter(category => {
        const productCount = category.productCount || products.filter(p => p.categoryId === category.id).length;
        return productCount === 0;
    }).length;

    document.getElementById('total-categories').textContent = totalCategories.toLocaleString();
    document.getElementById('total-products-categories').textContent = totalProducts.toLocaleString();
    document.getElementById('average-products').textContent = averageProducts;
    document.getElementById('empty-categories').textContent = emptyCategories.toLocaleString();

    animateCounter('total-categories', totalCategories);
    animateCounter('total-products-categories', totalProducts);
    animateCounter('empty-categories', emptyCategories);
}

// Mostrar formulario de categoría
function showCategoryForm(categoryId = null) {
    const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    const form = document.getElementById('categoryForm');
    
    form.reset();
    document.getElementById('categoryId').value = '';
    
    // Limpiar validaciones anteriores
    clearCategoryFormValidations();

    if (categoryId) {
        document.getElementById('categoryModalTitle').textContent = 'Editar Categoría';
        loadCategoryData(categoryId);
    } else {
        document.getElementById('categoryModalTitle').textContent = 'Nueva Categoría';
    }

    modal.show();
}

// Limpiar validaciones del formulario
function clearCategoryFormValidations() {
    const fields = ['categoryName', 'categoryDescription'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            window.fieldValidator.clearFieldError(field);
        }
    });
}

// Cargar datos de categoría para editar
async function loadCategoryData(categoryId) {
    showLoading(true);
    try {
        const response = await fetch(`/api/super-admin/categories/${categoryId}`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }

        const category = await response.json();
        
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description || '';

    } catch (error) {
        console.error('Error cargando categoría:', error);
        showAlert('Error al cargar la categoría: ' + error.message, 'danger');
    } finally {
        showLoading(false);
    }
}

// Guardar categoría
async function saveCategory() {
    const saveBtn = document.getElementById('saveCategoryBtn');
    const originalText = saveBtn.innerHTML;
    
    // Validar formulario usando FieldValidator - VALIDACIÓN INDIVIDUAL
    const nameField = document.getElementById('categoryName');
    const descriptionField = document.getElementById('categoryDescription');
    
    // Validar nombre (requerido)
    const nameValidation = window.fieldValidator.validateField('categoryName', nameField.value, true);
    if (!nameValidation.isValid) {
        window.fieldValidator.showFieldError(nameField, nameValidation.message);
        showAlert(nameValidation.message, 'warning');
        return;
    }
    
    // Validar descripción (opcional, pero si tiene contenido debe ser válida)
    if (descriptionField.value.trim()) {
        const descriptionValidation = window.fieldValidator.validateField('categoryDescription', descriptionField.value, false);
        if (!descriptionValidation.isValid) {
            window.fieldValidator.showFieldError(descriptionField, descriptionValidation.message);
            showAlert(descriptionValidation.message, 'warning');
            return;
        }
    }

    const categoryData = {
        name: nameField.value.trim(),
        description: descriptionField.value.trim() || null // Enviar null si está vacío
    };

    const categoryId = document.getElementById('categoryId').value;
    const url = categoryId ? `/api/super-admin/categories/${categoryId}` : '/api/super-admin/categories';
    const method = categoryId ? 'PUT' : 'POST';

    // Mostrar loading en el botón
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Guardando...';
    saveBtn.disabled = true;

    try {
        const response = await fetch(url, {
            method: method,
            headers: getHeaders(),
            body: JSON.stringify(categoryData)
        });

        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
            modal.hide();
            
            showAlert(`Categoría ${categoryId ? 'actualizada' : 'creada'} correctamente`, 'success');
            await loadCategories();
            
        } else {
            const errorText = await response.text();
            
            // Manejar errores del servidor usando FieldValidator
            const errorMessages = window.fieldValidator.handleServerError(errorText, {
                categoryName: nameField
            });
            
            throw new Error(errorMessages[0] || 'Error del servidor');
        }
    } catch (error) {
        console.error('Error guardando categoría:', error);
        showAlert(error.message, 'danger');
    } finally {
        // Restaurar botón
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

// Editar categoría
function editCategory(categoryId) {
    showCategoryForm(categoryId);
}

// Confirmar eliminación
function confirmDeleteCategory(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const productCount = category.productCount || products.filter(p => p.categoryId === categoryId).length;
    
    if (productCount > 0) {
        showAlert('No se puede eliminar una categoría que tiene productos asignados', 'warning');
        return;
    }

    document.getElementById('confirmMessage').textContent = `¿Estás seguro de eliminar la categoría "${category.name}"?`;
    document.getElementById('confirmDetails').textContent = 'Esta acción no se puede deshacer y todos los datos asociados se perderán permanentemente.';

    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.onclick = () => deleteCategory(categoryId);

    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    modal.show();
}

// Eliminar categoría
async function deleteCategory(categoryId) {
    try {
        const response = await fetch(`/api/super-admin/categories/${categoryId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
            modal.hide();
            
            showAlert('Categoría eliminada correctamente', 'success');
            await loadCategories();
            
        } else {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error('Error eliminando categoría:', error);
        showAlert('Error al eliminar la categoría: ' + error.message, 'danger');
    }
}

// Filtrar categorías
function filterCategories() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();

    let filteredCategories = categories.filter(category => {
        return category.name.toLowerCase().includes(searchTerm) ||
               (category.description && category.description.toLowerCase().includes(searchTerm));
    });

    displayCategories(filteredCategories);
}

// Limpiar búsqueda
function clearSearch() {
    document.getElementById('search-input').value = '';
    displayCategories(categories);
    showAlert('Búsqueda limpiada', 'info');
}

// Función de loading específica para categorías
function showLoading(show) {
    const container = document.getElementById('categories-container');
    
    if (show) {
        container.innerHTML = `
            <div class="loading-categories">
                <div class="loading-spinner"></div>
                <p class="text-muted mt-2">Cargando categorías...</p>
            </div>
        `;
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return 'Fecha inválida';
    }
}