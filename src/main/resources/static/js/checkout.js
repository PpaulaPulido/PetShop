// checkout.js
class CheckoutManager {
    constructor() {
        this.checkoutData = {
            selectedAddress: null,
            selectedShipping: 'STANDARD_SHIPPING',
            selectedPayment: 'MERCADO_PAGO', // Por defecto Mercado Pago
            deliveryInstructions: '',
            cart: null,
            addresses: []
        };
        this.init();
    }

    async init() {
        try {
            await this.setupEventListeners();
            await this.loadCheckoutData();
            this.setupFormSubmissions();
            this.updateProceedButton();
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

        // Modal de dirección
        document.getElementById('addAddressBtn')?.addEventListener('click', () => {
            this.showAddressModal();
        });

        document.getElementById('closeAddressModal')?.addEventListener('click', () => {
            this.hideAddressModal();
        });

        document.getElementById('cancelAddressModal')?.addEventListener('click', () => {
            this.hideAddressModal();
        });

        document.getElementById('addressModalOverlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'addressModalOverlay') {
                this.hideAddressModal();
            }
        });

        // Instrucciones de entrega
        document.getElementById('deliveryInstructions')?.addEventListener('input', (e) => {
            this.checkoutData.deliveryInstructions = e.target.value;
        });

        // Términos y condiciones
        document.getElementById('agreeTerms')?.addEventListener('change', (e) => {
            this.updateProceedButton();
        });

        // Botón de pago
        document.getElementById('proceedPaymentBtn')?.addEventListener('click', () => {
            this.proceedToPayment();
        });
    }

    setupFormSubmissions() {
        const newAddressForm = document.getElementById('newAddressForm');
        if (newAddressForm) {
            newAddressForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createNewAddress();
            });
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
                    <div class="item-price">$${item.productPrice?.toFixed(2) || '0.00'}</div>
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
        this.checkoutData.selectedShipping = method;

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
        // Ocultar todas las informaciones primero
        document.getElementById('mercadoPagoInfo').style.display = 'none';
        document.getElementById('cashOnDeliveryInfo').style.display = 'none';

        // Mostrar la información correspondiente
        if (method === 'MERCADO_PAGO') {
            document.getElementById('mercadoPagoInfo').style.display = 'block';
        } else if (method === 'CASH_ON_DELIVERY') {
            document.getElementById('cashOnDeliveryInfo').style.display = 'block';
        }
    }

    calculateTotals() {
        if (!this.checkoutData.cart) return;

        const subtotal = this.checkoutData.cart.totalAmount ||
            this.checkoutData.cart.items.reduce((sum, item) =>
                sum + (item.productPrice * item.quantity), 0);

        // Calcular costo de envío
        let shippingCost = 0;
        switch (this.checkoutData.selectedShipping) {
            case 'STANDARD_SHIPPING':
                shippingCost = 5.99;
                break;
            case 'EXPRESS_SHIPPING':
                shippingCost = 12.99;
                break;
            case 'STORE_PICKUP':
                shippingCost = 0;
                break;
            default:
                shippingCost = 5.99;
        }

        // Calcular impuestos (19% Colombia)
        const taxRate = 0.19;
        const taxAmount = subtotal * taxRate;

        const finalTotal = subtotal + shippingCost + taxAmount;

        // Actualizar UI
        this.setTextContent('summarySubtotal', `$${subtotal.toFixed(2)}`);
        this.setTextContent('summaryShipping', shippingCost === 0 ? 'Gratis' : `$${shippingCost.toFixed(2)}`);
        this.setTextContent('summaryTax', `$${taxAmount.toFixed(2)}`);
        this.setTextContent('summaryTotal', `$${finalTotal.toFixed(2)}`);
    }

    updateProceedButton() {
        const proceedBtn = document.getElementById('proceedPaymentBtn');
        const agreeTerms = document.getElementById('agreeTerms');

        if (!proceedBtn) return;

        // Validar que todos los campos obligatorios estén completos
        const canProceed = this.checkoutData.selectedAddress &&
            this.checkoutData.selectedShipping &&
            this.checkoutData.selectedPayment &&
            agreeTerms && agreeTerms.checked &&
            this.checkoutData.cart &&
            this.checkoutData.cart.items &&
            this.checkoutData.cart.items.length > 0;

        proceedBtn.disabled = !canProceed;

        // Actualizar texto del botón según el método de pago
        if (this.checkoutData.selectedPayment === 'CASH_ON_DELIVERY') {
            proceedBtn.textContent = 'Confirmar Pedido';
        } else {
            proceedBtn.textContent = 'Proceder al Pago';
        }
    }

    showAddressModal() {
        const modal = document.getElementById('addressModalOverlay');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    hideAddressModal() {
        const modal = document.getElementById('addressModalOverlay');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            document.getElementById('newAddressForm').reset();
        }
    }

    async createNewAddress() {
        try {
            const formData = new FormData(document.getElementById('newAddressForm'));

            const addressData = {
                addressLine1: formData.get('addressLine1'),
                addressLine2: formData.get('addressLine2'),
                city: formData.get('city'),
                department: formData.get('department'),
                zipCode: formData.get('zipCode'),
                addressType: formData.get('addressType') || 'HOME',
                country: 'Colombia'
            };

            const response = await fetch('/api/customer/addresses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(addressData)
            });

            if (response.ok) {
                const newAddress = await response.json();
                this.hideAddressModal();
                await this.loadCheckoutData(); // Recargar direcciones
                this.selectAddress(newAddress.id); // Seleccionar nueva dirección
                this.showNotification('Dirección agregada correctamente', 'success');
            } else {
                throw new Error('Error al crear la dirección');
            }
        } catch (error) {
            console.error('Error creating address:', error);
            this.showNotification('Error al agregar la dirección', 'error');
        }
    }

    async setPrimaryAddress(addressId) {
        try {
            const response = await fetch(`/api/customer/addresses/${addressId}/primary`, {
                method: 'POST'
            });

            if (response.ok) {
                await this.loadCheckoutData(); // Recargar direcciones
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
            // Validaciones finales
            if (!this.validateCheckout()) {
                return;
            }

            const proceedBtn = document.getElementById('proceedPaymentBtn');
            proceedBtn.disabled = true;
            proceedBtn.textContent = 'Procesando...';

            // Preparar datos de la orden
            const orderData = {
                addressId: this.checkoutData.selectedAddress,
                paymentMethod: this.checkoutData.selectedPayment,
                deliveryMethod: this.checkoutData.selectedShipping,
                deliveryInstructions: this.checkoutData.deliveryInstructions
            };

            console.log('Creando orden con datos:', orderData);

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

                // Redirigir según el método de pago
                if (this.checkoutData.selectedPayment === 'MERCADO_PAGO' && orderResponse.paymentInfo?.paymentUrl) {
                    // Redirigir a MercadoPago
                    window.location.href = orderResponse.paymentInfo.paymentUrl;
                } else {
                    // Redirigir a confirmación directa (para contra entrega)
                    window.location.href = `/user/order-confirmation?orderId=${orderResponse.id}`;
                }

                if (window.cartSidebar) {
                    window.cartSidebar.loadCartItems();
                } else if (window.refreshCart) {
                    window.refreshCart();
                }
                
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al crear la orden');
            }

        } catch (error) {
            console.error('Error proceeding to payment:', error);
            this.showNotification(error.message || 'Error al procesar el pago', 'error');

            // Rehabilitar botón
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
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 6px;
                color: white;
                z-index: 2000;
                font-weight: 500;
                max-width: 300px;
                transition: all 0.3s ease;
            `;

            if (type === 'success') {
                notification.style.background = '#28a745';
            } else if (type === 'error') {
                notification.style.background = '#dc3545';
            } else {
                notification.style.background = '#17a2b8';
            }

            const container = document.getElementById('notificationContainer');
            if (container) {
                container.appendChild(notification);

                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
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

// Manejar errores no capturados
window.addEventListener('error', (event) => {
    console.error('Error no capturado:', event.error);
});