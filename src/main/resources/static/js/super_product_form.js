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

        initializeScrollAnimations();
    }

    setupFormSubmission() {
        const form = document.getElementById('productForm');
        const saveButton = document.querySelector('.btn-action.primary');
        
        if (form && saveButton) {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
            });

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

    validateForm() {
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
            validationResult.errors.forEach(error => {
                const fieldId = this.getFieldId(error.field);
                const fieldElement = document.getElementById(fieldId);
                if (fieldElement) {
                    this.validator.showFieldError(fieldElement, error.message);
                }
            });
            
            this.scrollToFirstError();
            
            return false;
        }

        return true;
    }

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

    async saveProduct() {
        if (this.isSubmitting) {
            return false;
        }

        const isValid = this.validateForm();
        
        if (!isValid) {
            this.showError('❌ Por favor corrige todos los errores en el formulario antes de enviar.');
            return false;
        }

        this.isSubmitting = true;
        
        try {
            const formData = new FormData();
            const productId = document.getElementById('productId').value;

            formData.append('name', document.getElementById('name').value.trim());
            formData.append('description', document.getElementById('description').value.trim());
            formData.append('price', document.getElementById('price').value);
            formData.append('stock', document.getElementById('stock').value);
            formData.append('minStock', document.getElementById('minStock').value);
            formData.append('type', document.getElementById('type').value);
            formData.append('active', document.getElementById('active').checked);

            const categoryId = document.getElementById('categoryId').value;
            if (categoryId) {
                formData.append('categoryId', categoryId);
            } else {
                formData.append('categoryId', '');
            }

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

            this.showLoading(true);

            const response = await fetch(url, {
                method: method,
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                
                this.showSuccess(`🎉 Producto ${this.isEditing ? 'actualizado' : 'creado'} correctamente`);
                
                setTimeout(() => {
                    location.href = '/super-admin/products';
                }, 1500);
                
                return true;
                
            } else {
                const errorText = await response.text();
                
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
            this.showError('🚨 Error al guardar el producto: ' + error.message);
            return false;
            
        } finally {
            this.isSubmitting = false;
            this.showLoading(false);
        }
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/super-admin/categories');
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            this.categories = await response.json();
            this.populateCategorySelect();
            
        } catch (error) {
            this.showError('Error al cargar las categorías');
        }
    }

    populateCategorySelect() {
        const categorySelect = document.getElementById('categoryId');
        
        while (categorySelect.children.length > 1) {
            categorySelect.removeChild(categorySelect.lastChild);
        }

        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
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
            const response = await fetch(`/api/super-admin/products/${productId}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            this.currentProduct = await response.json();
            this.populateForm();
            
        } catch (error) {
            this.showError('Error al cargar el producto');
            setTimeout(() => location.href = '/super-admin/products', 2000);
        }
    }

    populateForm() {
        if (!this.currentProduct) return;

        const product = this.currentProduct;

        document.getElementById('productId').value = product.id;
        document.getElementById('name').value = product.name;
        document.getElementById('description').value = product.description || '';
        document.getElementById('price').value = product.price;
        document.getElementById('stock').value = product.stock;
        document.getElementById('minStock').value = product.minStock;
        document.getElementById('imageUrl').value = product.imageUrl || '';
        document.getElementById('type').value = product.type;

        if (product.categoryId) {
            document.getElementById('categoryId').value = product.categoryId;
        } else {
            document.getElementById('categoryId').value = '';
        }

        document.getElementById('active').checked = product.active !== false;

        document.getElementById('createdAt').textContent = this.formatDate(product.createdAt);
        document.getElementById('updatedAt').textContent = this.formatDate(product.updatedAt);
        document.getElementById('createdBy').textContent = product.createdBy || 'Sistema';

        this.handleProductImage(product);
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
            
            if (file.size > 10 * 1024 * 1024) {
                this.showError('La imagen es demasiado grande. Máximo 10MB.');
                input.value = '';
                return;
            }

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
    if (window.productFormManager) {
        const result = window.productFormManager.saveProduct();
        return result;
    } else {
        showAlert('Error: El sistema de validación no está disponible', 'danger');
        return false;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.productFormManager = new ProductFormManager();
});