class CheckoutManager {
    constructor() {
        this.checkoutData = {
            selectedAddress: null,
            selectedShipping: 'STANDARD_SHIPPING',
            selectedPayment: 'MERCADO_PAGO',
            deliveryInstructions: '',
            cart: null,
            addresses: []
        };
        this.calculatedAmounts = {
            subtotal: 0,
            shippingCost: 0,
            taxAmount: 0,
            finalTotal: 0
        };
        this.patternsDictionary = new PatternsDictionary();
        this.init();
    }

    async init() {
        try {
            await this.setupEventListeners();
            await this.loadCheckoutData();
            this.updateProceedButton();
            this.showPaymentMethodInfo(this.checkoutData.selectedPayment);
        } catch (error) {
            console.error('Error initializing checkout:', error);
            this.showNotification('Error al cargar la información de checkout', 'error');
        }
    }

    async setupEventListeners() {
        // Selección de dirección
        document.getElementById('addressesGrid')?.addEventListener('click', (e) => {
            const addressCard = e.target.closest('.address-card');
            if (addressCard) {
                this.selectAddress(addressCard.dataset.addressId);
            }
        });

        // Selección de método de envío
        document.getElementById('shippingOptions')?.addEventListener('click', (e) => {
            const shippingOption = e.target.closest('.shipping-option');
            if (shippingOption) {
                this.selectShippingMethod(shippingOption.dataset.method);
            }
        });

        // Selección de método de pago
        document.getElementById('paymentOptions')?.addEventListener('click', (e) => {
            const paymentOption = e.target.closest('.payment-option');
            if (paymentOption) {
                this.selectPaymentMethod(paymentOption.dataset.method);
            }
        });

        // Botón agregar dirección
        document.getElementById('addAddressBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/user/addresses';
        });

        // Instrucciones de entrega - CON VALIDACIÓN EN TIEMPO REAL
        const deliveryInstructions = document.getElementById('deliveryInstructions');
        if (deliveryInstructions) {
            deliveryInstructions.addEventListener('input', (e) => {
                this.checkoutData.deliveryInstructions = e.target.value;
                this.validateDeliveryInstructions(e.target.value);
                this.updateProceedButton();
            });

            // Validar también cuando pierde el foco
            deliveryInstructions.addEventListener('blur', (e) => {
                this.validateDeliveryInstructions(e.target.value);
            });
        }

        // Términos y condiciones
        document.getElementById('agreeTerms')?.addEventListener('change', (e) => {
            this.updateProceedButton();
        });

        // Botón de pago
        document.getElementById('proceedPaymentBtn')?.addEventListener('click', () => {
            this.proceedToPayment();
        });
    }

    // ========== VALIDACIÓN DE INSTRUCCIONES DE ENTREGA ==========
    validateDeliveryInstructions(text) {
        const instructionsInput = document.getElementById('deliveryInstructions');
        const errorElement = document.getElementById('deliveryInstructionsError') || this.createErrorElement();

        if (!text || text.trim().length === 0) {
            // Si está vacío, quitar cualquier error
            this.removeInstructionError();
            return true;
        }

        // Validar usando PatternsDictionary
        const isValid = this.patternsDictionary.isValidText(text, {
            minLength: 2,
            maxLength: 500,
            strictMode: false,
            rejectRepetitive: true
        });

        if (!isValid) {
            this.showInstructionError('Las instrucciones contienen patrones no válidos o texto sin sentido');
            return false;
        } else {
            this.removeInstructionError();
            return true;
        }
    }

    createErrorElement() {
        const instructionsContainer = document.querySelector('.delivery-instructions');
        if (!instructionsContainer) return null;

        const errorElement = document.createElement('div');
        errorElement.id = 'deliveryInstructionsError';
        errorElement.className = 'instruction-error';
        instructionsContainer.appendChild(errorElement);
        return errorElement;
    }

    showInstructionError(message) {
        let errorElement = document.getElementById('deliveryInstructionsError');
        const instructionsInput = document.getElementById('deliveryInstructions');

        if (!errorElement) {
            errorElement = this.createErrorElement();
        }

        if (errorElement && instructionsInput) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';

            // Añadir estilo de error al input
            instructionsInput.classList.add('error');
            instructionsInput.classList.remove('valid');
        }
    }

    removeInstructionError() {
        const errorElement = document.getElementById('deliveryInstructionsError');
        const instructionsInput = document.getElementById('deliveryInstructions');

        if (errorElement) {
            errorElement.style.display = 'none';
        }

        if (instructionsInput) {
            instructionsInput.classList.remove('error');
            instructionsInput.classList.remove('valid');
        }
    }

    async loadCheckoutData() {
        try {
            console.log('Cargando datos de checkout...');

            // Cargar carrito
            const cartResponse = await fetch('/api/customer/cart');
            if (!cartResponse.ok) throw new Error('Error al cargar el carrito');
            this.checkoutData.cart = await cartResponse.json();

            // Cargar direcciones
            const addressesResponse = await fetch('/api/customer/addresses');
            if (!addressesResponse.ok) throw new Error('Error al cargar las direcciones');
            this.checkoutData.addresses = await addressesResponse.json();

            // Procesar datos
            this.displayCartItems();
            this.displayAddresses();
            this.calculateTotals();

            // Seleccionar dirección primaria por defecto
            const primaryAddress = this.checkoutData.addresses.find(addr => addr.isPrimary);
            if (primaryAddress) {
                this.selectAddress(primaryAddress.id);
            }

            // Seleccionar métodos por defecto
            this.selectShippingMethod('STANDARD');
            this.selectPaymentMethod(this.checkoutData.selectedPayment);

            console.log('Datos de checkout cargados:', this.checkoutData);

        } catch (error) {
            console.error('Error loading checkout data:', error);
            throw error;
        }
    }

    displayCartItems() {
        const summaryItems = document.getElementById('summaryItems');
        if (!summaryItems || !this.checkoutData.cart) return;

        if (!this.checkoutData.cart.items || this.checkoutData.cart.items.length === 0) {
            summaryItems.innerHTML = `
                <div class="empty-cart">
                    <p>Tu carrito está vacío</p>
                    <a href="/customer/products" class="btn btn-primary">Comenzar a comprar</a>
                </div>
            `;
            return;
        }

        summaryItems.innerHTML = this.checkoutData.cart.items.map(item => `
            <div class="summary-item">
                <div class="item-image">
                    <img src="${item.productImage}" 
                         alt="${item.productName}"
                         onerror="this.src='/images/default-product.png'">
                </div>
                <div class="item-details">
                    <div class="item-name">${item.productName}</div>
                    <div class="item-price">$${this.formatPrice(item.productPrice)}</div>
                    <div class="item-quantity">Cantidad: ${item.quantity}</div>
                </div>
            </div>
        `).join('');
    }

    displayAddresses() {
        const addressesGrid = document.getElementById('addressesGrid');
        if (!addressesGrid || !this.checkoutData.addresses) return;

        if (this.checkoutData.addresses.length === 0) {
            addressesGrid.innerHTML = `
                <div class="no-addresses">
                    <p>No tienes direcciones guardadas</p>
                    <p>Agrega una dirección para continuar con la compra</p>
                </div>
            `;
            return;
        }

        addressesGrid.innerHTML = this.checkoutData.addresses.map(address => `
            <div class="address-card ${address.isPrimary ? 'primary' : ''} ${this.checkoutData.selectedAddress === address.id ? 'selected' : ''}" 
                 data-address-id="${address.id}">
                <div class="address-header">
                    <div class="address-type">${this.getAddressTypeText(address.addressType)}</div>
                    <div class="address-actions">
                        ${!address.isPrimary ? `
                            <button class="btn btn-sm btn-outline" onclick="checkoutManager.setPrimaryAddress(${address.id})">
                                Hacer principal
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="address-details">
                    <div>${address.addressLine1}</div>
                    ${address.addressLine2 ? `<div>${address.addressLine2}</div>` : ''}
                    <div>${address.city}, ${address.department}</div>
                    <div>${address.zipCode}</div>
                    ${address.contactName ? `<div>Contacto: ${address.contactName}</div>` : ''}
                    ${address.contactPhone ? `<div>Tel: ${address.contactPhone}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    getAddressTypeText(type) {
        const types = {
            'HOME': '🏠 Casa',
            'WORK': '💼 Trabajo',
            'APARTMENT': '🏢 Apartamento',
            'OFFICE': '🏛️ Oficina',
            'OTHER': '📍 Otro'
        };
        return types[type] || type;
    }

    selectAddress(addressId) {
        this.checkoutData.selectedAddress = parseInt(addressId);

        // Actualizar UI
        document.querySelectorAll('.address-card').forEach(card => {
            card.classList.remove('selected');
        });

        const selectedCard = document.querySelector(`[data-address-id="${addressId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        this.updateProceedButton();
        this.calculateTotals();
    }

    selectShippingMethod(method) {
        // Mapear los métodos del frontend a los del backend
        const methodMapping = {
            'STANDARD': 'STANDARD_SHIPPING',
            'EXPRESS': 'EXPRESS_SHIPPING',
            'PICKUP': 'STORE_PICKUP'
        };

        this.checkoutData.selectedShipping = methodMapping[method] || method;

        // Actualizar UI
        document.querySelectorAll('.shipping-option').forEach(option => {
            option.classList.remove('selected');
        });

        const selectedOption = document.querySelector(`[data-method="${method}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }

        this.calculateTotals();
    }

    selectPaymentMethod(method) {
        this.checkoutData.selectedPayment = method;

        // Actualizar UI
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.remove('selected');
        });

        const selectedOption = document.querySelector(`[data-method="${method}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }

        // Mostrar/ocultar información específica del método de pago
        this.showPaymentMethodInfo(method);

        this.updateProceedButton();
    }

    showPaymentMethodInfo(method) {
        const mercadoPagoInfo = document.getElementById('mercadoPagoInfo');
        const contraEntregaInfo = document.getElementById('contraEntregaInfo');

        if (mercadoPagoInfo) {
            mercadoPagoInfo.style.display = method === 'MERCADO_PAGO' ? 'block' : 'none';
        }

        if (contraEntregaInfo) {
            contraEntregaInfo.style.display = method === 'CASH_ON_DELIVERY' ? 'block' : 'none';
        }
    }

    calculateTotals() {
        if (!this.checkoutData.cart) return;

        const subtotal = this.checkoutData.cart.totalAmount ||
            this.checkoutData.cart.items.reduce((sum, item) =>
                sum + (item.productPrice * item.quantity), 0);

        // Calcular costo de envío en pesos colombianos
        let shippingCost = 0;
        switch (this.checkoutData.selectedShipping) {
            case 'STANDARD_SHIPPING':
                shippingCost = 8000;
                break;
            case 'EXPRESS_SHIPPING':
                shippingCost = 15000;
                break;
            case 'STORE_PICKUP':
                shippingCost = 0;
                break;
            default:
                shippingCost = 8000;
        }

        // Calcular impuestos (19% Colombia)
        const taxRate = 0.19;
        const taxAmount = subtotal * taxRate;

        const finalTotal = subtotal + shippingCost + taxAmount;

        // Guardar los montos calculados para enviar al backend
        this.calculatedAmounts = {
            subtotal: subtotal,
            shippingCost: shippingCost,
            taxAmount: taxAmount,
            finalTotal: finalTotal
        };

        // Actualizar UI
        this.setTextContent('summarySubtotal', `$${this.formatPrice(subtotal)}`);
        this.setTextContent('summaryShipping', shippingCost === 0 ? 'Gratis' : `$${this.formatPrice(shippingCost)}`);
        this.setTextContent('summaryTax', `$${this.formatPrice(taxAmount)}`);
        this.setTextContent('summaryTotal', `$${this.formatPrice(finalTotal)}`);

        console.log('Montos calculados para backend:', this.calculatedAmounts);
    }

    formatPrice(price) {
        return new Intl.NumberFormat('es-CO').format(Math.round(price));
    }

    updateProceedButton() {
        const proceedBtn = document.getElementById('proceedPaymentBtn');
        const agreeTerms = document.getElementById('agreeTerms');

        if (!proceedBtn) return;

        // Validar instrucciones de entrega si hay texto
        const instructionsValid = !this.checkoutData.deliveryInstructions ||
            this.checkoutData.deliveryInstructions.trim().length === 0 ||
            this.validateDeliveryInstructions(this.checkoutData.deliveryInstructions);

        const canProceed = this.checkoutData.selectedAddress &&
            this.checkoutData.selectedShipping &&
            this.checkoutData.selectedPayment &&
            agreeTerms && agreeTerms.checked &&
            this.checkoutData.cart &&
            this.checkoutData.cart.items &&
            this.checkoutData.cart.items.length > 0 &&
            instructionsValid; // Añadir validación de instrucciones

        proceedBtn.disabled = !canProceed;

        // Actualizar texto del botón según el método de pago
        if (this.checkoutData.selectedPayment === 'CASH_ON_DELIVERY') {
            proceedBtn.textContent = 'Confirmar Pedido';
        } else {
            proceedBtn.textContent = 'Proceder al Pago';
        }
    }

    async setPrimaryAddress(addressId) {
        try {
            const response = await fetch(`/api/customer/addresses/${addressId}/primary`, {
                method: 'POST'
            });

            if (response.ok) {
                await this.loadCheckoutData();
                this.showNotification('Dirección principal actualizada', 'success');
            } else {
                throw new Error('Error al actualizar dirección principal');
            }
        } catch (error) {
            console.error('Error setting primary address:', error);
            this.showNotification('Error al actualizar dirección principal', 'error');
        }
    }

    async proceedToPayment() {
        try {
            if (!this.validateCheckout()) {
                return;
            }

            const proceedBtn = document.getElementById('proceedPaymentBtn');
            proceedBtn.disabled = true;
            proceedBtn.textContent = 'Procesando...';

            // Asegurarse de que los montos estén calculados
            this.calculateTotals();

            const orderData = {
                addressId: this.checkoutData.selectedAddress,
                paymentMethod: this.checkoutData.selectedPayment,
                deliveryMethod: this.checkoutData.selectedShipping,
                deliveryInstructions: this.checkoutData.deliveryInstructions,
                // ENVIAR TODOS LOS MONTOS CALCULADOS AL BACKEND
                subtotal: this.calculatedAmounts.subtotal,
                shippingCost: this.calculatedAmounts.shippingCost,
                taxAmount: this.calculatedAmounts.taxAmount,
                totalAmount: this.calculatedAmounts.finalTotal
            };

            console.log('Creando orden con datos completos:', orderData);

            const response = await fetch('/api/customer/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                const orderResponse = await response.json();
                this.showNotification('¡Orden creada exitosamente!', 'success');

                if (this.checkoutData.selectedPayment === 'MERCADO_PAGO' && orderResponse.paymentInfo?.paymentUrl) {
                    window.location.href = orderResponse.paymentInfo.paymentUrl;
                } else {
                    window.location.href = `/user/order-confirmation?orderId=${orderResponse.id}`;
                }

                if (window.cartSidebar) {
                    window.cartSidebar.loadCartItems();
                }
                
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al crear la orden');
            }

        } catch (error) {
            console.error('Error proceeding to payment:', error);
            this.showNotification(error.message || 'Error al procesar el pago', 'error');

            const proceedBtn = document.getElementById('proceedPaymentBtn');
            if (proceedBtn) {
                proceedBtn.disabled = false;
                proceedBtn.textContent = this.checkoutData.selectedPayment === 'CASH_ON_DELIVERY' ?
                    'Confirmar Pedido' : 'Proceder al Pago';
            }
        }
    }

    validateCheckout() {
        const errors = [];

        if (!this.checkoutData.selectedAddress) {
            errors.push('Debes seleccionar una dirección de envío');
        }

        if (!this.checkoutData.selectedShipping) {
            errors.push('Debes seleccionar un método de envío');
        }

        if (!this.checkoutData.selectedPayment) {
            errors.push('Debes seleccionar un método de pago');
        }

        if (!this.checkoutData.cart || !this.checkoutData.cart.items || this.checkoutData.cart.items.length === 0) {
            errors.push('Tu carrito está vacío');
        }

        // Validar instrucciones de entrega si hay texto
        if (this.checkoutData.deliveryInstructions && this.checkoutData.deliveryInstructions.trim().length > 0) {
            const instructionsValid = this.validateDeliveryInstructions(this.checkoutData.deliveryInstructions);
            if (!instructionsValid) {
                errors.push('Las instrucciones de entrega contienen texto no válido');
            }
        }

        const agreeTerms = document.getElementById('agreeTerms');
        if (!agreeTerms || !agreeTerms.checked) {
            errors.push('Debes aceptar los términos y condiciones');
        }

        if (errors.length > 0) {
            errors.forEach(error => this.showNotification(error, 'error'));
            return false;
        }

        return true;
    }

    // Métodos auxiliares
    setTextContent(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    showNotification(message, type = 'info') {
        try {
            // Remover notificaciones existentes
            const existingNotifications = document.querySelectorAll('.notification');
            existingNotifications.forEach(notification => notification.remove());

            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;

            const container = document.getElementById('notificationContainer');
            if (container) {
                container.appendChild(notification);

                // Mostrar con animación
                setTimeout(() => notification.classList.add('show'), 10);

                // Auto-eliminar después de 5 segundos
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 300);
                }, 5000);
            }
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.checkoutManager = new CheckoutManager();
    } catch (error) {
        console.error('Error initializing checkout manager:', error);
    }
});

window.addEventListener('error', (event) => {
    console.error('Error no capturado:', event.error);
});