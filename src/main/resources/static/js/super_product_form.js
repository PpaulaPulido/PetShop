// super_product_form.js 
class ProductFormManager {
    constructor() {
        this.categories = [];
        this.isEditing = false;
        this.currentProduct = null;
        this.validator = window.fieldValidator;
        this.isSubmitting = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupRealTimeValidation();
        this.setupFormSubmission(); 
        this.loadCategories();
        this.checkEditMode();
    }

    setupEventListeners() {
        // Animaciones para elementos interactivos
        const cards = document.querySelectorAll('.form-section');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-2px)';
                card.style.boxShadow = '0 8px 25px rgba(106, 47, 180, 0.15)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = 'none';
            });
        });

        // Inicializar animaciones de scroll
        initializeScrollAnimations();
    }

    // Configurar envío seguro del formulario
    setupFormSubmission() {
        const form = document.getElementById('productForm');
        const saveButton = document.querySelector('.btn-action.primary');
        
        if (form && saveButton) {
            // Prevenir envío por defecto del formulario
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                console.log('🛑 Formulario prevenido - usando validación personalizada');
            });

            // Manejar clic en botón guardar
            saveButton.addEventListener('click', () => {
                this.saveProduct();
            });
        }
    }

    setupRealTimeValidation() {
        const fieldConfigs = [
            { fieldId: 'name', fieldType: 'name', isRequired: true },
            { fieldId: 'description', fieldType: 'description', isRequired: false },
            { fieldId: 'price', fieldType: 'price', isRequired: true },
            { fieldId: 'stock', fieldType: 'stock', isRequired: true },
            { fieldId: 'minStock', fieldType: 'minStock', isRequired: false },
            { fieldId: 'type', fieldType: 'type', isRequired: true },
            { fieldId: 'categoryId', fieldType: 'category', isRequired: false }
        ];

        this.validator.initializeRealTimeValidation('productForm', fieldConfigs);

        // Validación adicional para descripción (contador de caracteres)
        const description = document.getElementById('description');
        description.addEventListener('input', () => {
            this.updateDescriptionCounter();
        });
    }

    updateDescriptionCounter() {
        const description = document.getElementById('description');
        const counter = document.getElementById('descriptionCounter');
        const currentLength = description.value.length;
        const maxLength = 500;

        if (counter) {
            counter.textContent = `${currentLength}/${maxLength}`;
            
            if (currentLength > maxLength) {
                counter.classList.add('text-danger');
            } else {
                counter.classList.remove('text-danger');
            }
        }
    }

    // ========== VALIDACIÓN DE FORMULARIO==========

    validateForm() {
        console.log('🔍 Iniciando validación completa del formulario...');
        
        // Limpiar validaciones previas
        this.validator.clearAllValidations('productForm');

        const formData = {
            name: document.getElementById('name').value,
            description: document.getElementById('description').value,
            price: document.getElementById('price').value,
            stock: document.getElementById('stock').value,
            minStock: document.getElementById('minStock').value,
            type: document.getElementById('type').value,
            categoryId: document.getElementById('categoryId').value
        };

        const fieldRules = {
            name: { fieldType: 'name', required: true },
            description: { fieldType: 'description', required: false },
            price: { fieldType: 'price', required: true },
            stock: { fieldType: 'stock', required: true },
            minStock: { fieldType: 'minStock', required: false },
            type: { fieldType: 'type', required: true },
            categoryId: { fieldType: 'category', required: false }
        };

        const validationResult = this.validator.validateForm(formData, fieldRules);
        
        if (!validationResult.isValid) {
            console.log('❌ Errores de validación encontrados:', validationResult.errors);
            
            // Mostrar errores en los campos específicos
            validationResult.errors.forEach(error => {
                const fieldId = this.getFieldId(error.field);
                const fieldElement = document.getElementById(fieldId);
                if (fieldElement) {
                    this.validator.showFieldError(fieldElement, error.message);
                }
            });
            
            // Hacer scroll al primer error
            this.scrollToFirstError();
            
            return false;
        }

        console.log('✅ Validación del formulario exitosa');
        return true;
    }

    //Scroll al primer error
    scrollToFirstError() {
        const firstErrorField = document.querySelector('.is-invalid');
        if (firstErrorField) {
            firstErrorField.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            firstErrorField.focus();
        }
    }

    getFieldId(fieldName) {
        const fieldMap = {
            'name': 'name',
            'description': 'description',
            'price': 'price',
            'stock': 'stock',
            'minStock': 'minStock',
            'type': 'type',
            'categoryId': 'categoryId'
        };
        return fieldMap[fieldName] || fieldName;
    }

    // ========== MÉTODO saveProduct==========

    async saveProduct() {
        console.log('💾 Intentando guardar producto...');
        
        // ⚠️ PREVENIR ENVÍOS MÚLTIPLES
        if (this.isSubmitting) {
            console.log('🛑 Envío múltiple prevenido');
            return false;
        }

        // 1. VALIDACIÓN ESTRICTA DEL FORMULARIO
        console.log('🔍 Realizando validación previa...');
        const isValid = this.validateForm();
        
        if (!isValid) {
            console.log('❌ Validación fallida - cancelando envío');
            this.showError('❌ Por favor corrige todos los errores en el formulario antes de enviar.');
            return false; // ⚠️ SALIR INMEDIATAMENTE SI HAY ERRORES
        }

        console.log('✅ Validación pasada - preparando datos...');

        // 2. PREPARAR DATOS SOLO SI LA VALIDACIÓN PASA
        this.isSubmitting = true;
        
        try {
            const formData = new FormData();
            const productId = document.getElementById('productId').value;

            // Agregar campos básicos
            formData.append('name', document.getElementById('name').value.trim());
            formData.append('description', document.getElementById('description').value.trim());
            formData.append('price', document.getElementById('price').value);
            formData.append('stock', document.getElementById('stock').value);
            formData.append('minStock', document.getElementById('minStock').value);
            formData.append('type', document.getElementById('type').value);
            formData.append('active', document.getElementById('active').checked);

            // Manejo correcto de categoría
            const categoryId = document.getElementById('categoryId').value;
            if (categoryId) {
                formData.append('categoryId', categoryId);
            } else {
                formData.append('categoryId', '');
            }

            // Manejo de imágenes
            const imageFile = document.getElementById('imageFile').files[0];
            const imageUrl = document.getElementById('imageUrl').value;

            if (imageFile) {
                formData.append('imageFile', imageFile);
            } else if (imageUrl) {
                formData.append('imageUrl', imageUrl);
            }

            const url = this.isEditing ? 
                `/api/super-admin/products/${productId}` : 
                '/api/super-admin/products';
            
            const method = this.isEditing ? 'PUT' : 'POST';

            // 3. ENVIAR DATOS AL SERVIDOR
            this.showLoading(true);
            console.log('🔄 Enviando datos al servidor...', {
                url: url,
                method: method,
                isEditing: this.isEditing
            });

            const response = await fetch(url, {
                method: method,
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Producto guardado exitosamente:', result);
                
                this.showSuccess(`🎉 Producto ${this.isEditing ? 'actualizado' : 'creado'} correctamente`);
                
                // Redirigir después de éxito
                setTimeout(() => {
                    location.href = '/super-admin/products';
                }, 1500);
                
                return true;
                
            } else {
                const errorText = await response.text();
                console.error('❌ Error del servidor:', errorText);
                
                const errorMessages = this.validator.handleServerError(errorText, {
                    name: document.getElementById('name'),
                    categoryId: document.getElementById('categoryId')
                });
                
                errorMessages.forEach(message => {
                    this.showError(message);
                });
                
                return false;
            }
            
        } catch (error) {
            console.error('💥 Error crítico guardando producto:', error);
            this.showError('🚨 Error al guardar el producto: ' + error.message);
            return false;
            
        } finally {
            // 4. REINICIAR ESTADO DE ENVÍO
            this.isSubmitting = false;
            this.showLoading(false);
            console.log('🔄 Estado de envío reiniciado');
        }
    }

    // ========== MÉTODOS EXISTENTES (SIN CAMBIOS) ==========

    async loadCategories() {
        try {
            console.log('Cargando categorías...');
            const response = await fetch('/api/super-admin/categories');
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            this.categories = await response.json();
            this.populateCategorySelect();
            
        } catch (error) {
            console.error('Error cargando categorías:', error);
            this.showError('Error al cargar las categorías');
        }
    }

    populateCategorySelect() {
        const categorySelect = document.getElementById('categoryId');
        
        // Limpiar opciones excepto la primera
        while (categorySelect.children.length > 1) {
            categorySelect.removeChild(categorySelect.lastChild);
        }

        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });

        console.log(`✅ Cargadas ${this.categories.length} categorías`);
    }

    async checkEditMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (productId) {
            this.isEditing = true;
            this.updateUIForEdit();
            await this.loadProductData(productId);
        } else {
            this.updateUIForNew();
        }
    }

    updateUIForEdit() {
        document.getElementById('formTitle').textContent = 'Editar Producto';
        document.getElementById('mainFormTitle').textContent = 'Editar Producto';
        document.getElementById('formSubtitle').textContent = 'Modifica la información del producto existente';
        document.getElementById('newProductInfo').style.display = 'none';
        document.getElementById('creationInfo').style.display = 'block';
    }

    updateUIForNew() {
        document.getElementById('newProductInfo').style.display = 'block';
        document.getElementById('creationInfo').style.display = 'none';
    }

    async loadProductData(productId) {
        try {
            console.log(`Cargando producto con ID: ${productId}`);
            const response = await fetch(`/api/super-admin/products/${productId}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            this.currentProduct = await response.json();
            console.log('📥 Producto cargado para edición:', this.currentProduct);
            
            this.populateForm();
            
        } catch (error) {
            console.error('Error cargando producto:', error);
            this.showError('Error al cargar el producto');
            setTimeout(() => location.href = '/super-admin/products', 2000);
        }
    }

    populateForm() {
        if (!this.currentProduct) return;

        const product = this.currentProduct;

        // Llenar campos básicos
        document.getElementById('productId').value = product.id;
        document.getElementById('name').value = product.name;
        document.getElementById('description').value = product.description || '';
        document.getElementById('price').value = product.price;
        document.getElementById('stock').value = product.stock;
        document.getElementById('minStock').value = product.minStock;
        document.getElementById('imageUrl').value = product.imageUrl || '';
        document.getElementById('type').value = product.type;

        // Manejo correcto de categoría
        if (product.categoryId) {
            document.getElementById('categoryId').value = product.categoryId;
        } else {
            document.getElementById('categoryId').value = '';
        }

        // Estado activo
        document.getElementById('active').checked = product.active !== false;

        // Información de creación
        document.getElementById('createdAt').textContent = this.formatDate(product.createdAt);
        document.getElementById('updatedAt').textContent = this.formatDate(product.updatedAt);
        document.getElementById('createdBy').textContent = product.createdBy || 'Sistema';

        // Manejo de imágenes
        this.handleProductImage(product);

        // Actualizar contador de descripción
        this.updateDescriptionCounter();
    }

    handleProductImage(product) {
        const currentImageSection = document.getElementById('currentImageSection');
        const currentImage = document.getElementById('currentImage');

        if (product.imageUrl && product.imageUrl !== '/images/default-product.png') {
            currentImageSection.style.display = 'block';
            currentImage.src = product.imageUrl;
        } else {
            currentImageSection.style.display = 'none';
        }
    }

    previewImage(input) {
        const preview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImage');

        if (input.files && input.files[0]) {
            const file = input.files[0];
            
            // Validar tamaño del archivo (10MB máximo)
            if (file.size > 10 * 1024 * 1024) {
                this.showError('La imagen es demasiado grande. Máximo 10MB.');
                input.value = '';
                return;
            }

            // Validar tipo de archivo
            if (!file.type.match('image.*')) {
                this.showError('Por favor selecciona un archivo de imagen válido.');
                input.value = '';
                return;
            }

            const reader = new FileReader();

            reader.onload = function (e) {
                previewImg.src = e.target.result;
                preview.style.display = 'block';
                preview.classList.add('has-image');
            }

            reader.readAsDataURL(file);
        }
    }

    removeImage() {
        document.getElementById('imageFile').value = '';
        document.getElementById('imagePreview').style.display = 'none';
        document.getElementById('imageUrl').value = '';
        document.getElementById('imagePreview').classList.remove('has-image');
    }

    // Utilidades
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Fecha inválida';
        }
    }

    showLoading(show) {
        const saveButton = document.querySelector('.btn-action.primary');
        if (saveButton) {
            if (show) {
                saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
                saveButton.disabled = true;
            } else {
                saveButton.innerHTML = '<i class="fas fa-save"></i> Guardar Producto';
                saveButton.disabled = false;
            }
        }
    }

    showSuccess(message) {
        showAlert(message, 'success');
    }

    showError(message) {
        showAlert(message, 'danger');
    }
}

// ========== FUNCIONES GLOBALES==========

function previewImage(input) {
    if (window.productFormManager) {
        window.productFormManager.previewImage(input);
    }
}

function removeImage() {
    if (window.productFormManager) {
        window.productFormManager.removeImage();
    }
}

function saveProduct() {
    console.log('🎯 Función saveProduct() llamada');
    
    if (window.productFormManager) {
        // ⚠️ CAPTURAR Y RETORNAR EL RESULTADO PARA PREVENIR COMPORTAMIENTO POR DEFECTO
        const result = window.productFormManager.saveProduct();
        console.log('📊 Resultado de saveProduct:', result);
        return result; // ⚠️ IMPORTANTE: retornar el resultado
    } else {
        console.error('❌ ProductFormManager no está inicializado');
        showAlert('Error: El sistema de validación no está disponible', 'danger');
        return false; // ⚠️ SIEMPRE RETORNAR false EN CASO DE ERROR
    }
}

// Inicializar product form manager cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    window.productFormManager = new ProductFormManager();
});