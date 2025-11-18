// customer_address_form.js - VERSIÓN MEJORADA CON FALLBACKS
class AddressForm {
    constructor() {
        this.map = null;
        this.marker = null;
        this.selectedCoordinates = null;
        this.departments = {};
        this.isEdit = document.getElementById('addressId')?.value || false;

        this.init();
    }

    init() {
        this.initializeMap();
        this.loadDepartments();
        this.setupEventListeners();
        this.setupFormValidation();
        this.initializeCharacterCounter();

        if (this.isEdit) {
            this.loadAddressData();
        }
    }

    initializeMap() {
        this.map = L.map('addressMap').setView([4.7110, -74.0721], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);

        L.control.scale().addTo(this.map);

        this.map.on('click', (e) => {
            this.setMarker(e.latlng);
            this.reverseGeocode(e.latlng);
        });
    }

    setMarker(latlng) {
        if (this.marker) {
            this.map.removeLayer(this.marker);
        }

        this.marker = L.marker(latlng, {
            draggable: true,
            autoPan: true
        }).addTo(this.map);

        this.selectedCoordinates = latlng;

        document.getElementById('coordinatesText').textContent =
            `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;

        this.marker.on('dragend', (e) => {
            const newLatLng = e.target.getLatLng();
            this.selectedCoordinates = newLatLng;
            document.getElementById('coordinatesText').textContent =
                `${newLatLng.lat.toFixed(6)}, ${newLatLng.lng.toFixed(6)}`;
            this.reverseGeocode(newLatLng);
        });

        this.map.panTo(latlng);
    }

    async searchAddress() {
        const rawQuery = document.getElementById('addressSearch').value.trim();

        if (!rawQuery) {
            this.showNotification('Por favor ingresa una dirección para buscar', 'error');
            return;
        }

        try {
            this.showLoading('Buscando dirección...');

            // Primero intentar con búsqueda estándar
            let results = await this.geocodeAddress(rawQuery);
            
            // Si no hay resultados, intentar con formato mejorado
            if (!results || results.length === 0) {
                const improvedQuery = this.improveColombianAddress(rawQuery);
                console.log('🔄 Mejorando búsqueda:', improvedQuery);
                results = await this.geocodeAddress(improvedQuery);
            }

            console.log('📦 Resultados recibidos:', results);

            if (results && results.length > 0) {
                this.showSearchResults(results);
                this.showNotification(`✅ Se encontraron ${results.length} resultados`, 'success');
            } else {
                // Mostrar sugerencias para mejorar la búsqueda
                this.showSearchSuggestions(rawQuery);
            }
        } catch (error) {
            console.error('Error en búsqueda de dirección:', error);
            this.showNotification('❌ Error al buscar: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    improveColombianAddress(address) {
        if (!address) return '';
        
        let improved = address
            .toUpperCase()
            // Normalizar abreviaturas comunes
            .replace(/\b(CL|CLLE?)\b/g, 'CALLE')
            .replace(/\b(CR|CRA|KR)\b/g, 'CARRERA')
            .replace(/\b(AV|AVDA?)\b/g, 'AVENIDA')
            .replace(/\b(DG|DIAG)\b/g, 'DIAGONAL')
            .replace(/\b(TR|TRANS)\b/g, 'TRANSVERSAL')
            // Mejorar formato de números
            .replace(/#\s*(\d+)\s*[-\s]?\s*(\d+)/g, '# $1-$2')
            .replace(/\b(\d+)\s*[-\s]?\s*(\d+)\b/g, '$1-$2')
            // Agregar ciudad si no está especificada
            .trim();

        // Si no menciona una ciudad conocida, agregar "Colombia"
        const cities = ['BOGOTA', 'MEDELLIN', 'CALI', 'BARRANQUILLA', 'CARTAGENA', 'BUCARAMANGA'];
        const hasCity = cities.some(city => improved.includes(city));
        if (!hasCity && !improved.includes('COLOMBIA')) {
            improved += ', COLOMBIA';
        }

        return improved;
    }

    async geocodeAddress(query, limit = 5) {
        try {
            const url = `/api/geocoding/search?query=${encodeURIComponent(query)}&limit=${limit}`;
            console.log('🔍 Solicitando:', url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const text = await response.text();
            console.log('📄 Respuesta cruda:', text);
            
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error('❌ Error parseando JSON:', parseError);
                throw new Error('Error en el formato de respuesta del servidor');
            }

            console.log('✅ Resultados parseados:', data);
            return Array.isArray(data) ? data : [];

        } catch (error) {
            console.error('❌ Error en geocoding:', error);
            throw error;
        }
    }

    showSearchSuggestions(originalQuery) {
        const suggestions = this.generateSearchSuggestions(originalQuery);
        
        const searchContainer = document.querySelector('.search-container');
        const existingResults = document.getElementById('searchResults');
        if (existingResults) {
            existingResults.remove();
        }

        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'searchResults';
        suggestionsContainer.className = 'search-results';
        suggestionsContainer.innerHTML = `
            <div class="search-suggestion-header">
                <strong>💡 Sugerencias para mejorar la búsqueda:</strong>
            </div>
            ${suggestions.map(suggestion => `
                <div class="search-suggestion-item" onclick="document.getElementById('addressSearch').value = '${suggestion}'; this.closest('.search-results').remove();">
                    🔍 "${suggestion}"
                </div>
            `).join('')}
            <div class="search-suggestion-tip">
                <small>💡 Tip: Incluye ciudad y formato como "Calle 100 # 15-20, Bogotá"</small>
            </div>
        `;

        searchContainer.appendChild(suggestionsContainer);
        
        this.showNotification('🔍 No se encontraron resultados exactos. Prueba con las sugerencias.', 'warning');
    }

    generateSearchSuggestions(query) {
        const suggestions = [];
        const cities = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga'];
        
        // Sugerir con diferentes ciudades
        cities.forEach(city => {
            suggestions.push(`${query}, ${city}`);
        });
        
        // Sugerir formato mejorado
        if (query.match(/\d/)) {
            suggestions.push(this.improveColombianAddress(query));
        }
        
        return suggestions.slice(0, 4); // Máximo 4 sugerencias
    }

    showSearchResults(results) {
        const searchContainer = document.querySelector('.search-container');

        // Remover resultados anteriores
        const existingResults = document.getElementById('searchResults');
        if (existingResults) {
            existingResults.remove();
        }

        const resultsContainer = document.createElement('div');
        resultsContainer.id = 'searchResults';
        resultsContainer.className = 'search-results';

        results.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <div class="result-address">${result.display_name || result.formatted_address || result.address}</div>
                <div class="result-type">${result.type || ''} ${result.class || ''}</div>
                <div class="result-confidence">${this.calculateConfidence(result)}</div>
            `;

            resultItem.addEventListener('click', () => {
                this.selectSearchResult(result);
                resultsContainer.remove();
            });

            resultsContainer.appendChild(resultItem);
        });

        // Cerrar resultados al hacer clic fuera
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!searchContainer.contains(e.target)) {
                    resultsContainer.remove();
                }
            });
        }, 100);

        searchContainer.appendChild(resultsContainer);
    }

    calculateConfidence(result) {
        // Calcular confianza basada en el tipo de resultado
        const importance = result.importance || 0.3;
        const type = (result.type || '').toLowerCase();
        
        let confidence = importance;
        
        if (type.includes('house') || type.includes('building')) confidence += 0.3;
        if (type.includes('street') || type.includes('road')) confidence += 0.2;
        if (importance > 0.7) confidence += 0.2;
        
        return `Confianza: ${Math.min(100, Math.round(confidence * 100))}%`;
    }

    selectSearchResult(result) {
        console.log('🎯 Seleccionando resultado:', result);

        // Obtener coordenadas según el formato de respuesta
        let lat, lon;
        if (result.lat && result.lon) {
            lat = result.lat;
            lon = result.lon;
        } else if (result.latitude && result.longitude) {
            lat = result.latitude;
            lon = result.longitude;
        } else if (result.geometry && result.geometry.location) {
            lat = result.geometry.location.lat;
            lon = result.geometry.location.lng;
        } else {
            this.showNotification('❌ No se pudieron obtener las coordenadas del resultado', 'error');
            return;
        }

        const latlng = L.latLng(parseFloat(lat), parseFloat(lon));
        this.setMarker(latlng);
        this.populateFormFields(result);
        this.updateAddressPreview(result.display_name || result.formatted_address);

        // Ajustar vista del mapa
        if (result.boundingbox) {
            const bounds = [
                [parseFloat(result.boundingbox[0]), parseFloat(result.boundingbox[2])],
                [parseFloat(result.boundingbox[1]), parseFloat(result.boundingbox[3])]
            ];
            this.map.fitBounds(bounds, { padding: [20, 20] });
        } else {
            this.map.setView(latlng, 16);
        }

        document.getElementById('addressSearch').value = result.display_name || result.formatted_address;
        this.showNotification('✅ Dirección encontrada y marcada en el mapa', 'success');
    }

    populateFormFields(result) {
        const address = result.address || {};
        console.log('🏠 Datos de dirección para formulario:', address);

        // Dirección principal
        let addressLine1 = '';
        if (address.road) {
            addressLine1 = address.road;
            if (address.house_number) {
                addressLine1 += ` #${address.house_number}`;
            }
        } else {
            // Usar el primer elemento del display_name
            const displayName = result.display_name || result.formatted_address || '';
            addressLine1 = displayName.split(',')[0].trim();
        }
        document.getElementById('addressLine1').value = addressLine1;

        // Barrio/Urbanización
        const neighborhood = address.neighbourhood || address.suburb || address.quarter || address.city_district;
        if (neighborhood) {
            document.getElementById('addressLine2').value = neighborhood;
        }

        // Ciudad/Municipio
        const city = address.city || address.town || address.village || address.municipality;
        if (city) {
            this.updateCityAndDepartment(city, address);
        }

        // Código postal
        if (address.postcode) {
            document.getElementById('zipCode').value = address.postcode;
        }

        // Punto de referencia
        let landmark = '';
        if (address.amenity) {
            landmark = address.amenity;
        } else if (address.road) {
            landmark = `Cerca a ${address.road}`;
        }

        if (landmark) {
            document.getElementById('landmark').value = landmark;
        }

        console.log('✅ Formulario actualizado con datos de:', result.display_name || result.formatted_address);
    }

    updateCityAndDepartment(city, address) {
        console.log('🏙️ Buscando ciudad:', city);
        
        const citySelect = document.getElementById('city');
        
        // Buscar ciudad exacta
        let cityFound = false;
        for (let i = 0; i < citySelect.options.length; i++) {
            if (this.normalizeText(citySelect.options[i].value) === this.normalizeText(city)) {
                citySelect.value = citySelect.options[i].value;
                cityFound = true;
                console.log('✅ Ciudad encontrada:', citySelect.options[i].value);
                break;
            }
        }

        // Si no se encontró la ciudad, buscar por departamento/estado
        if (!cityFound && (address.state || address.county)) {
            const state = address.state || address.county;
            console.log('🔍 Buscando por estado:', state);
            
            const deptSelect = document.getElementById('department');
            
            for (let i = 0; i < deptSelect.options.length; i++) {
                const option = deptSelect.options[i];
                if (option.value && this.normalizeText(option.text).includes(this.normalizeText(state))) {
                    console.log('✅ Departamento encontrado:', option.value);
                    deptSelect.value = option.value;
                    this.loadCities(option.value);
                    
                    // Esperar a que se carguen las ciudades y luego buscar la ciudad
                    setTimeout(() => {
                        const updatedCitySelect = document.getElementById('city');
                        for (let j = 0; j < updatedCitySelect.options.length; j++) {
                            if (this.normalizeText(updatedCitySelect.options[j].value) === this.normalizeText(city)) {
                                updatedCitySelect.value = updatedCitySelect.options[j].value;
                                console.log('✅ Ciudad establecida después de cargar departamento:', updatedCitySelect.options[j].value);
                                break;
                            }
                        }
                    }, 300);
                    break;
                }
            }
        }
        
        if (!cityFound) {
            console.log('⚠️ Ciudad no encontrada en las opciones:', city);
        }
    }

    normalizeText(text) {
        return text.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    async reverseGeocode(latlng) {
        try {
            // Usar punto decimal explícitamente
            const lat = latlng.lat.toString().replace(',', '.');
            const lon = latlng.lng.toString().replace(',', '.');
            
            const url = `/api/geocoding/reverse?lat=${lat}&lon=${lon}`;
            console.log('🗺️ Reverse geocode solicitando:', url);

            const response = await fetch(url);

            if (response.ok) {
                const text = await response.text();
                console.log('📄 Reverse geocode respuesta cruda:', text);
                
                let data;
                try {
                    data = JSON.parse(text);
                } catch (parseError) {
                    console.error('❌ Error parseando JSON en reverse:', parseError);
                    return;
                }

                console.log('✅ Reverse geocode resultado:', data);

                if (data && (data.display_name || data.formatted_address)) {
                    this.updateAddressPreview(data.display_name || data.formatted_address);
                    this.populateFormFields(data);
                    this.showNotification('📍 Dirección detectada desde el mapa', 'info');
                }
            } else {
                console.error('❌ Error en reverse geocode:', response.status);
            }
        } catch (error) {
            console.error('❌ Error en reverse geocoding:', error);
        }
    }

    updateAddressPreview(address) {
        const preview = document.getElementById('addressPreview');
        preview.innerHTML = `
            <div class="preview-address">
                <h4>📍 Ubicación Seleccionada</h4>
                <p>${address}</p>
                ${this.selectedCoordinates ? `
                <div class="preview-coordinates">
                    <small>Coordenadas: ${this.selectedCoordinates.lat.toFixed(6)}, ${this.selectedCoordinates.lng.toFixed(6)}</small>
                </div>
                ` : ''}
            </div>
        `;
        preview.classList.add('active');
    }

    // ... (el resto de los métodos se mantienen igual que en la versión anterior)

    loadDepartments() {
        console.log('📋 Cargando departamentos...');
        fetch('/api/colombia/departments')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar departamentos: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('✅ Departamentos cargados:', data);
                this.departments = data;
                this.populateDepartmentsSelect();
                
                if (this.isEdit) {
                    this.loadAddressData();
                }
            })
            .catch(error => {
                console.error('❌ Error cargando departamentos:', error);
                this.loadDefaultDepartments();
            });
    }

    loadDefaultDepartments() {
        console.log('📋 Cargando departamentos por defecto...');
        this.departments = {
            'BOGOTA_DC': ['Bogotá'],
            'ANTIOQUIA': ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Rionegro'],
            'VALLE_DEL_CAUCA': ['Cali', 'Palmira', 'Buenaventura', 'Tuluá'],
            'CUNDINAMARCA': ['Soacha', 'Facatativá', 'Zipaquirá', 'Girardot'],
            'ATLANTICO': ['Barranquilla', 'Soledad', 'Malambo'],
            'SANTANDER': ['Bucaramanga', 'Floridablanca', 'Girón'],
            'BOLIVAR': ['Cartagena', 'Magangué', 'Turbaco'],
            'NORTE_DE_SANTANDER': ['Cúcuta', 'Los Patios', 'Villa del Rosario'],
            'BOYACA': ['Tunja', 'Sogamoso', 'Duitama'],
            'HUILA': ['Neiva', 'Pitalito', 'Garzón'],
            'TOLIMA': ['Ibagué', 'Espinal', 'Melgar'],
            'META': ['Villavicencio', 'Acacías', 'Granada'],
            'CALDAS': ['Manizales', 'La Dorada', 'Chinchiná'],
            'RISARALDA': ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal'],
            'QUINDIO': ['Armenia', 'Calarcá', 'La Tebaida'],
            'CAUCA': ['Popayán', 'Santander de Quilichao'],
            'NARINO': ['Pasto', 'Ipiales', 'Tumaco'],
            'CORDOBA': ['Montería', 'Cereté', 'Sahagún'],
            'MAGDALENA': ['Santa Marta', 'Ciénaga', 'Fundación'],
            'CESAR': ['Valledupar', 'Aguachica'],
            'LA_GUAJIRA': ['Riohacha', 'Maicao', 'Uribia'],
            'SUCRE': ['Sincelejo', 'Corozal', 'Sampués'],
            'ARAUCA': ['Arauca'],
            'CASANARE': ['Yopal'],
            'PUTUMAYO': ['Mocoa'],
            'AMAZONAS': ['Leticia'],
            'GUAINIA': ['Inírida'],
            'GUAVIARE': ['San José del Guaviare'],
            'VAUPES': ['Mitú'],
            'VICHADA': ['Puerto Carreño'],
            'SAN_ANDRES': ['San Andrés']
        };
        this.populateDepartmentsSelect();
    }

    populateDepartmentsSelect() {
        const select = document.getElementById('department');
        const currentValue = select.value;
        
        select.innerHTML = '<option value="">Selecciona un departamento</option>';

        Object.keys(this.departments).forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = this.formatDepartmentName(dept);
            select.appendChild(option);
        });

        if (currentValue) {
            select.value = currentValue;
        }
    }

    formatDepartmentName(dept) {
        return dept.split('_')
            .map(word => word.charAt(0) + word.slice(1).toLowerCase())
            .join(' ');
    }

    loadCities(department) {
        const citySelect = document.getElementById('city');
        const currentValue = citySelect.value;
        
        const cities = this.departments[department] || [];

        citySelect.innerHTML = '<option value="">Selecciona una ciudad</option>';
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });

        citySelect.disabled = false;

        if (currentValue) {
            citySelect.value = currentValue;
        }
    }

    setupEventListeners() {
        document.getElementById('searchBtn').addEventListener('click', () => this.searchAddress());

        document.getElementById('addressSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.searchAddress();
            }
        });

        document.getElementById('department').addEventListener('change', (e) => {
            this.loadCities(e.target.value);
        });

        document.getElementById('addressForm').addEventListener('submit', (e) => this.handleSubmit(e));

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                const results = document.getElementById('searchResults');
                if (results) results.remove();
            }
        });
    }

    setupFormValidation() {
        const form = document.getElementById('addressForm');
        form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
            }
        });
    }

    validateForm() {
        let isValid = true;

        if (!this.selectedCoordinates) {
            this.showNotification('Por favor busca y selecciona una ubicación en el mapa', 'error');
            isValid = false;
        }

        const requiredFields = ['addressType', 'contactName', 'contactPhone', 'department', 'city', 'addressLine1'];
        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (!element.value.trim()) {
                this.markFieldError(element, 'Este campo es requerido');
                isValid = false;
            } else {
                this.markFieldSuccess(element);
            }
        });

        const phone = document.getElementById('contactPhone');
        if (phone.value && !/^[0-9]{10}$/.test(phone.value)) {
            this.markFieldError(phone, 'El teléfono debe tener 10 dígitos');
            isValid = false;
        }

        const zipCode = document.getElementById('zipCode');
        if (zipCode.value && !/^[0-9]{6}$/.test(zipCode.value)) {
            this.markFieldError(zipCode, 'El código postal debe tener 6 dígitos');
            isValid = false;
        }

        return isValid;
    }

    markFieldError(element, message) {
        element.parentElement.classList.add('error');
        let errorElement = element.parentElement.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            element.parentElement.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    markFieldSuccess(element) {
        element.parentElement.classList.remove('error');
        element.parentElement.classList.add('success');
        const errorElement = element.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    initializeCharacterCounter() {
        const textarea = document.getElementById('deliveryInstructions');
        this.updateCharacterCounter(textarea);
        
        textarea.addEventListener('input', (e) => {
            this.updateCharacterCounter(e.target);
        });
    }

    updateCharacterCounter(textarea) {
        const counter = textarea.parentElement.querySelector('.char-counter');
        if (counter) {
            counter.textContent = `${textarea.value.length}/500 caracteres`;
            
            if (textarea.value.length > 450) {
                counter.style.color = '#e74c3c';
            } else if (textarea.value.length > 400) {
                counter.style.color = '#f39c12';
            } else {
                counter.style.color = '#7f8c8d';
            }
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        try {
            this.showLoading(this.isEdit ? 'Actualizando dirección...' : 'Creando dirección...');

            const formData = this.getFormData();
            const url = this.isEdit ?
                `/api/customer/addresses/${this.isEdit}` :
                '/api/customer/addresses';

            const method = this.isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification(
                    this.isEdit ? '✅ Dirección actualizada correctamente' : '✅ Dirección creada correctamente',
                    'success'
                );

                setTimeout(() => {
                    window.location.href = '/user/addresses';
                }, 1500);
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al guardar la dirección');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('❌ Error al guardar la dirección: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    getFormData() {
        return {
            addressType: document.getElementById('addressType').value,
            contactName: document.getElementById('contactName').value,
            contactPhone: document.getElementById('contactPhone').value,
            department: document.getElementById('department').value,
            city: document.getElementById('city').value,
            zipCode: document.getElementById('zipCode').value,
            addressLine1: document.getElementById('addressLine1').value,
            addressLine2: document.getElementById('addressLine2').value,
            landmark: document.getElementById('landmark').value,
            deliveryInstructions: document.getElementById('deliveryInstructions').value,
            isPrimary: document.getElementById('isPrimary').checked,
            latitude: this.selectedCoordinates?.lat,
            longitude: this.selectedCoordinates?.lng
        };
    }

    async loadAddressData() {
        try {
            const response = await fetch(`/api/customer/addresses/${this.isEdit}`);
            if (response.ok) {
                const address = await response.json();
                this.populateEditForm(address);
            }
        } catch (error) {
            console.error('Error cargando datos de dirección:', error);
        }
    }

    populateEditForm(address) {
        document.getElementById('addressType').value = address.addressType || '';
        document.getElementById('contactName').value = address.contactName || '';
        document.getElementById('contactPhone').value = address.contactPhone || '';
        document.getElementById('zipCode').value = address.zipCode || '';
        document.getElementById('addressLine1').value = address.addressLine1 || '';
        document.getElementById('addressLine2').value = address.addressLine2 || '';
        document.getElementById('landmark').value = address.landmark || '';
        document.getElementById('deliveryInstructions').value = address.deliveryInstructions || '';
        document.getElementById('isPrimary').checked = address.isPrimary || false;

        this.updateCharacterCounter(document.getElementById('deliveryInstructions'));

        if (address.latitude && address.longitude) {
            const latlng = L.latLng(address.latitude, address.longitude);
            this.setMarker(latlng);
            this.map.setView(latlng, 16);
            this.reverseGeocode(latlng);
        }

        if (address.department) {
            setTimeout(() => {
                document.getElementById('department').value = address.department;
                this.loadCities(address.department);
                
                if (address.city) {
                    setTimeout(() => {
                        document.getElementById('city').value = address.city;
                    }, 200);
                }
            }, 100);
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">×</button>
            </div>
        `;

        container.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }

    showLoading(message = 'Cargando...') {
        const submitBtn = document.getElementById('submitBtn');
        const searchBtn = document.getElementById('searchBtn');

        submitBtn.disabled = true;
        searchBtn.disabled = true;
        
        const originalSubmitText = submitBtn.innerHTML;
        const originalSearchText = searchBtn.innerHTML;
        
        submitBtn.setAttribute('data-original-text', originalSubmitText);
        searchBtn.setAttribute('data-original-text', originalSearchText);
        
        submitBtn.innerHTML = '<div class="loading-spinner-small"></div> ' + message;
        searchBtn.innerHTML = '<div class="loading-spinner-small"></div> Buscando...';
    }

    hideLoading() {
        const submitBtn = document.getElementById('submitBtn');
        const searchBtn = document.getElementById('searchBtn');

        submitBtn.disabled = false;
        searchBtn.disabled = false;
        
        const originalSubmitText = submitBtn.getAttribute('data-original-text') || 
            (this.isEdit ? 'Actualizar Dirección' : 'Crear Dirección');
        const originalSearchText = searchBtn.getAttribute('data-original-text') || '🔍';
        
        submitBtn.innerHTML = originalSubmitText;
        searchBtn.innerHTML = originalSearchText;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando AddressForm...');
    new AddressForm();
});