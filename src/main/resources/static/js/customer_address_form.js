class AddressForm {
    constructor() {
        this.map = null;
        this.marker = null;
        this.selectedCoordinates = null;
        this.departments = {};
        this.isEdit = document.getElementById('addressId')?.value || false;
        this.currentResults = null;
        this.currentSuggestions = null;
        this.init();
    }

    init() {
        this.initializeMap();
        this.loadDepartments();
        this.setupEventListeners();
        this.setupFormValidation();
        this.initializeCharacterCounter();
        this.setupPetLuzEffects();
        this.setupEscapeHandler();

        if (this.isEdit) {
            this.loadAddressData();
        }
    }

    setupPetLuzEffects() {
        if (window.petLuzEffects) {
            const cards = document.querySelectorAll('.form-section, .map-section, .preview-section');
            cards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    if (window.innerWidth > 768) {
                        const rect = card.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;
                        const rotateY = (x - centerX) / 50;
                        const rotateX = (centerY - y) / 50;

                        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
                    }
                });

                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
                });
            });

            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(button => {
                button.addEventListener('click', function (e) {
                    if (window.petLuzEffects) {
                        const ripple = document.createElement('span');
                        const rect = this.getBoundingClientRect();
                        const size = Math.max(rect.width, rect.height);
                        const x = e.clientX - rect.left - size / 2;
                        const y = e.clientY - rect.top - size / 2;

                        ripple.style.cssText = `
                        position: absolute;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.6);
                        transform: scale(0);
                        animation: ripple 0.6s linear;
                        width: ${size}px;
                        height: ${size}px;
                        left: ${x}px;
                        top: ${y}px;
                        pointer-events: none;
                    `;

                        this.style.position = 'relative';
                        this.style.overflow = 'hidden';
                        this.appendChild(ripple);

                        setTimeout(() => ripple.remove(), 600);
                    }
                });
            });

            const formHeader = document.querySelector('.form-header');
            if (formHeader && window.petLuzEffects.createFloatingParticles) {
                window.petLuzEffects.createFloatingParticles(formHeader, 5);
            }

            if (window.petLuzEffects.setupStaggeredReveal) {
                window.petLuzEffects.setupStaggeredReveal();
            }
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

            let results = await this.geocodeAddress(rawQuery);

            if (!results || results.length === 0) {
                const improvedQuery = this.improveColombianAddress(rawQuery);
                results = await this.geocodeAddress(improvedQuery);
            }

            if (results && results.length > 0) {
                this.showSearchResults(results);
                this.showNotification(`✅ Se encontraron ${results.length} resultados`, 'success');
            } else {
                this.showSearchSuggestions(rawQuery);
            }
        } catch (error) {
            this.showNotification('❌ Error al buscar: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    improveColombianAddress(address) {
        if (!address) return '';

        let improved = address
            .toUpperCase()
            .replace(/\b(CL|CLLE?)\b/g, 'CALLE')
            .replace(/\b(CR|CRA|KR)\b/g, 'CARRERA')
            .replace(/\b(AV|AVDA?)\b/g, 'AVENIDA')
            .replace(/\b(DG|DIAG)\b/g, 'DIAGONAL')
            .replace(/\b(TR|TRANS)\b/g, 'TRANSVERSAL')
            .replace(/#\s*(\d+)\s*[-\s]?\s*(\d+)/g, '# $1-$2')
            .replace(/\b(\d+)\s*[-\s]?\s*(\d+)\b/g, '$1-$2')
            .trim();

        const cities = ['BOGOTA', 'MEDELLIN', 'CALI', 'BARRANQUILLA', 'CARTAGENA', 'BUCARAMANGA'];
        const hasCity = cities.some(city => improved.includes(city));
        if (!hasCity && !improved.includes('COLOMBIA')) {
            improved += ', COLOMBIA';
        }

        return improved;
    }

    async geocodeAddress(query, limit = 5) {
        const url = `/api/geocoding/search?query=${encodeURIComponent(query)}&limit=${limit}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const text = await response.text();
        let data;
        
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            throw new Error('Error en el formato de respuesta del servidor');
        }

        return Array.isArray(data) ? data : [];
    }

    generateSearchSuggestions(query) {
        const suggestions = [];
        const cities = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga'];

        cities.forEach(city => {
            suggestions.push(`${query}, ${city}`);
        });

        if (query.match(/\d/)) {
            suggestions.push(this.improveColombianAddress(query));
        }

        return suggestions.slice(0, 4);
    }

    calculateConfidence(result) {
        const importance = result.importance || 0.3;
        const type = (result.type || '').toLowerCase();

        let confidence = importance;

        if (type.includes('house') || type.includes('building')) confidence += 0.3;
        if (type.includes('street') || type.includes('road')) confidence += 0.2;
        if (importance > 0.7) confidence += 0.2;

        return `Confianza: ${Math.min(100, Math.round(confidence * 100))}%`;
    }

    selectSearchResult(result) {
        this.closeSearchResults();

        try {
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

        } catch (error) {
            this.showNotification('❌ Error al procesar la dirección seleccionada', 'error');
        }
    }

    populateFormFields(result) {
        const address = result.address || {};

        let addressLine1 = '';
        if (address.road) {
            addressLine1 = address.road;
            if (address.house_number) {
                addressLine1 += ` #${address.house_number}`;
            }
        } else {
            const displayName = result.display_name || result.formatted_address || '';
            addressLine1 = displayName.split(',')[0].trim();
        }

        const addressLine1Field = document.getElementById('addressLine1');
        if (addressLine1Field) {
            addressLine1Field.value = addressLine1;
            setTimeout(() => {
                addressLine1Field.dispatchEvent(new Event('input', { bubbles: true }));
            }, 100);
        }

        const neighborhood = address.neighbourhood || address.suburb || address.quarter || address.city_district;
        const addressLine2Field = document.getElementById('addressLine2');
        if (neighborhood && addressLine2Field) {
            addressLine2Field.value = neighborhood;
            setTimeout(() => {
                addressLine2Field.dispatchEvent(new Event('input', { bubbles: true }));
            }, 100);
        }

        const city = address.city || address.town || address.village || address.municipality || address.county;
        if (city) {
            this.updateCityAndDepartment(city, address);
        }

        const zipCodeField = document.getElementById('zipCode');
        if (address.postcode && zipCodeField) {
            zipCodeField.value = address.postcode;
            setTimeout(() => {
                zipCodeField.dispatchEvent(new Event('input', { bubbles: true }));
            }, 100);
        }

        let landmark = '';
        if (address.amenity) {
            landmark = address.amenity;
        } else if (address.road) {
            landmark = `Cerca a ${address.road}`;
        }

        const landmarkField = document.getElementById('landmark');
        if (landmark && landmarkField) {
            landmarkField.value = landmark;
            setTimeout(() => {
                landmarkField.dispatchEvent(new Event('input', { bubbles: true }));
            }, 100);
        }

        this.showNotification(
            '📍 Dirección cargada. Verifica que el departamento y ciudad sean correctos.',
            'info'
        );
    }
    
    updateCityAndDepartment(city, address) {
        if (address.state || address.region || address.county) {
            const state = address.state || address.region || address.county;
            this.autoSelectDepartment(state);
        } else if (address.city && this.isMajorCity(address.city)) {
            this.autoSelectDepartment(address.city);
        }

        const citySelect = document.getElementById('city');
        let cityFound = false;

        const normalizedTargetCity = this.normalizeText(city);

        for (let i = 0; i < citySelect.options.length; i++) {
            if (this.normalizeText(citySelect.options[i].value) === normalizedTargetCity) {
                citySelect.value = citySelect.options[i].value;
                cityFound = true;
                break;
            }
        }

        if (!cityFound) {
            for (let i = 0; i < citySelect.options.length; i++) {
                const optionValue = citySelect.options[i].value;
                const normalizedOption = this.normalizeText(optionValue);

                if (normalizedOption.includes(normalizedTargetCity) || normalizedTargetCity.includes(normalizedOption)) {
                    citySelect.value = optionValue;
                    cityFound = true;
                    break;
                }
            }
        }

        if (!cityFound && city && city.trim().length > 0) {
            this.showNotification(
                `Ciudad "${city}" no encontrada en las opciones. Por favor selecciónala manualmente.`,
                'warning'
            );
        }

        if (cityFound) {
            setTimeout(() => {
                citySelect.dispatchEvent(new Event('change', { bubbles: true }));
            }, 100);
        }
    }

    isMajorCity(cityName) {
        const majorCities = [
            'bogota', 'medellin', 'cali', 'barranquilla', 'cartagena',
            'bucaramanga', 'cucuta', 'pereira', 'manizales', 'armenia',
            'villavicencio', 'pasto', 'monteria', 'santa marta', 'valledupar',
            'ibague', 'neiva', 'popayan'
        ];
        return majorCities.includes(this.normalizeText(cityName));
    }

    autoSelectDepartment(stateName) {
        const deptSelect = document.getElementById('department');
        if (!deptSelect) return;

        const normalizedState = this.normalizeText(stateName);

        const stateToDepartmentMap = {
            'bogota': 'BOGOTA_DC',
            'cundinamarca': 'CUNDINAMARCA',
            'antioquia': 'ANTIOQUIA',
            'valle del cauca': 'VALLE_DEL_CAUCA',
            'atlantico': 'ATLANTICO',
            'santander': 'SANTANDER',
            'bolivar': 'BOLIVAR',
            'norte de santander': 'NORTE_DE_SANTANDER',
            'boyaca': 'BOYACA',
            'huila': 'HUILA',
            'tolima': 'TOLIMA',
            'meta': 'META',
            'caldas': 'CALDAS',
            'risaralda': 'RISARALDA',
            'quindio': 'QUINDIO',
            'cauca': 'CAUCA',
            'narino': 'NARINO',
            'cordoba': 'CORDOBA',
            'magdalena': 'MAGDALENA',
            'cesar': 'CESAR',
            'la guajira': 'LA_GUAJIRA',
            'sucre': 'SUCRE',
            'arauca': 'ARAUCA',
            'casanare': 'CASANARE',
            'putumayo': 'PUTUMAYO',
            'amazonas': 'AMAZONAS',
            'guainia': 'GUAINIA',
            'guaviare': 'GUAVIARE',
            'vaupes': 'VAUPES',
            'vichada': 'VICHADA',
            'san andres': 'SAN_ANDRES',
            'bogota d.c.': 'BOGOTA_DC',
            'bogotá': 'BOGOTA_DC',
            'bogota dc': 'BOGOTA_DC',
            'distrito capital': 'BOGOTA_DC',
            'medellin': 'ANTIOQUIA',
            'cali': 'VALLE_DEL_CAUCA',
            'barranquilla': 'ATLANTICO',
            'cartagena': 'BOLIVAR',
            'bucaramanga': 'SANTANDER',
            'cucuta': 'NORTE_DE_SANTANDER',
            'pereira': 'RISARALDA',
            'manizales': 'CALDAS',
            'armenia': 'QUINDIO',
            'villavicencio': 'META',
            'pasto': 'NARINO',
            'monteria': 'CORDOBA',
            'santa marta': 'MAGDALENA',
            'valledupar': 'CESAR',
            'ibague': 'TOLIMA',
            'neiva': 'HUILA',
            'popayan': 'CAUCA'
        };

        let foundDept = null;

        if (stateToDepartmentMap[normalizedState]) {
            foundDept = stateToDepartmentMap[normalizedState];
        } else {
            for (let option of deptSelect.options) {
                if (option.value) {
                    const normalizedOption = this.normalizeText(option.text);

                    if (normalizedOption.includes(normalizedState) || normalizedState.includes(normalizedOption)) {
                        foundDept = option.value;
                        break;
                    }

                    const stateWords = normalizedState.split(' ');
                    const optionWords = normalizedOption.split(' ');

                    const hasCommonWord = stateWords.some(word =>
                        word.length > 3 && optionWords.some(optWord => optWord.includes(word))
                    );

                    if (hasCommonWord) {
                        foundDept = option.value;
                        break;
                    }
                }
            }
        }

        if (foundDept) {
            deptSelect.value = foundDept;
            this.loadCities(foundDept);

            setTimeout(() => {
                deptSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }, 100);
        }
    }

    normalizeText(text) {
        if (!text) return '';

        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    async reverseGeocode(latlng) {
        try {
            const lat = latlng.lat.toString().replace(',', '.');
            const lon = latlng.lng.toString().replace(',', '.');

            const url = `/api/geocoding/reverse?lat=${lat}&lon=${lon}`;
            const response = await fetch(url);

            if (response.ok) {
                const text = await response.text();
                let data;
                
                try {
                    data = JSON.parse(text);
                } catch (parseError) {
                    return;
                }

                if (data && (data.display_name || data.formatted_address)) {
                    this.updateAddressPreview(data.display_name || data.formatted_address);
                    this.populateFormFields(data);
                    this.showNotification('📍 Dirección detectada desde el mapa', 'info');
                }
            }
        } catch (error) {
            console.error('Error en reverse geocoding:', error);
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

    loadDepartments() {
        fetch('/api/colombia/departments')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar departamentos: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                this.departments = data;
                this.populateDepartmentsSelect();

                if (this.isEdit) {
                    this.loadAddressData();
                }
            })
            .catch(error => {
                this.loadDefaultDepartments();
            });
    }

    loadDefaultDepartments() {
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
        let firstErrorField = null;

        const requiredFields = [
            { id: 'addressType', name: 'Tipo de dirección' },
            { id: 'contactName', name: 'Nombre de contacto' },
            { id: 'contactPhone', name: 'Teléfono de contacto' },
            { id: 'department', name: 'Departamento' },
            { id: 'city', name: 'Ciudad/Municipio' },
            { id: 'addressLine1', name: 'Dirección principal' }
        ];

        requiredFields.forEach(field => {
            const element = document.getElementById(field.id);
            if (!element) return;

            const value = element.value.trim();

            if (!value) {
                this.markFieldError(element, `${field.name} es un campo obligatorio`);
                isValid = false;

                if (!firstErrorField) {
                    firstErrorField = element;
                }
            } else {
                this.markFieldSuccess(element);

                if (field.id === 'contactPhone' && !/^[0-9]{10}$/.test(value)) {
                    this.markFieldError(element, 'El teléfono debe tener exactamente 10 dígitos');
                    isValid = false;
                    if (!firstErrorField) firstErrorField = element;
                }

                if (field.id === 'contactName' && value.length < 2) {
                    this.markFieldError(element, 'El nombre debe tener al menos 2 caracteres');
                    isValid = false;
                    if (!firstErrorField) firstErrorField = element;
                }
            }
        });

        const zipCode = document.getElementById('zipCode');
        if (zipCode && zipCode.value && !/^[0-9]{6}$/.test(zipCode.value)) {
            this.markFieldError(zipCode, 'El código postal debe tener 6 dígitos');
            isValid = false;
            if (!firstErrorField) firstErrorField = zipCode;
        }

        if (!isValid && firstErrorField) {
            setTimeout(() => {
                firstErrorField.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });

                firstErrorField.focus();

                if (window.petLuzEffects && window.petLuzEffects.shakeElement) {
                    window.petLuzEffects.shakeElement(firstErrorField.closest('.form-group'));
                }
            }, 100);
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
                let errorMessage = 'Error al guardar la dirección';

                try {
                    const errorText = await response.text();
                    try {
                        const errorJson = JSON.parse(errorText);
                        errorMessage = errorJson.message || errorJson.error || errorText;
                    } catch {
                        errorMessage = errorText || `Error ${response.status}: ${response.statusText}`;
                    }
                } catch (parseError) {
                    errorMessage = `Error ${response.status}: ${response.statusText}`;
                }

                throw new Error(errorMessage);
            }
        } catch (error) {
            let userMessage = '❌ Error al guardar la dirección. Por favor verifica los datos e intenta nuevamente.';
            this.showNotification(userMessage, 'error');
        } finally {
            this.hideLoading();
        }
    }

    getFormData() {
        const formData = {
            addressType: document.getElementById('addressType').value,
            contactName: document.getElementById('contactName').value,
            contactPhone: document.getElementById('contactPhone').value,
            department: document.getElementById('department').value,
            city: document.getElementById('city').value,
            zipCode: document.getElementById('zipCode').value || "",
            addressLine1: document.getElementById('addressLine1').value,
            addressLine2: document.getElementById('addressLine2').value || null,
            landmark: document.getElementById('landmark').value || null,
            deliveryInstructions: document.getElementById('deliveryInstructions').value || null,
            isPrimary: document.getElementById('isPrimary').checked,
            latitude: this.selectedCoordinates?.lat || null,
            longitude: this.selectedCoordinates?.lng || null
        };

        return formData;
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

    showSearchResults(results) {
        this.closeSearchResults();
        this.currentResults = results;

        const resultsContainer = document.createElement('div');
        resultsContainer.id = 'searchResults';
        resultsContainer.className = 'search-results';

        resultsContainer.innerHTML = `
            <div class="search-results-header">
                <h3>📍 Se encontraron ${results.length} resultados</h3>
                <button class="search-close-btn">×</button>
            </div>
            <div class="search-results-content">
                ${results.map((result, index) => `
                    <div class="search-result-item" data-index="${index}">
                        <div class="result-address">${result.display_name || result.formatted_address || result.address}</div>
                        <div class="result-type">${result.type || ''} ${result.class || ''}</div>
                        <div class="result-confidence">${this.calculateConfidence(result)}</div>
                    </div>
                `).join('')}
            </div>
        `;

        document.body.appendChild(resultsContainer);

        setTimeout(() => {
            const closeBtn = resultsContainer.querySelector('.search-close-btn');
            closeBtn.addEventListener('click', () => this.closeSearchResults());

            const resultItems = resultsContainer.querySelectorAll('.search-result-item');
            resultItems.forEach((item, index) => {
                item.addEventListener('click', () => {
                    this.selectSearchResult(results[index]);
                });
            });

            resultsContainer.addEventListener('click', (e) => {
                if (e.target === resultsContainer) {
                    this.closeSearchResults();
                }
            });
        }, 10);

        this.escapeHandler = (e) => {
            if (e.key === 'Escape') this.closeSearchResults();
        };
        document.addEventListener('keydown', this.escapeHandler);
    }

    showSearchSuggestions(originalQuery) {
        this.closeSearchResults();
        const suggestions = this.generateSearchSuggestions(originalQuery);
        this.currentSuggestions = suggestions;

        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'searchResults';
        suggestionsContainer.className = 'search-results';

        suggestionsContainer.innerHTML = `
            <div class="search-results-header">
                <h3>💡 Sugerencias de búsqueda</h3>
                <button class="search-close-btn">×</button>
            </div>
            <div class="search-results-content">
                <div class="search-suggestion-header">
                    <strong>No se encontraron resultados exactos. Prueba con:</strong>
                </div>
                ${suggestions.map((suggestion, index) => `
                    <div class="search-suggestion-item" data-suggestion="${suggestion}">
                        🔍 "${suggestion}"
                    </div>
                `).join('')}
                <div class="search-suggestion-tip">
                    <small>💡 <strong>Tip:</strong> Incluye ciudad y usa formato como "Calle 100 # 15-20, Bogotá"</small>
                </div>
            </div>
        `;

        document.body.appendChild(suggestionsContainer);

        setTimeout(() => {
            const closeBtn = suggestionsContainer.querySelector('.search-close-btn');
            closeBtn.addEventListener('click', () => this.closeSearchResults());

            const suggestionItems = suggestionsContainer.querySelectorAll('.search-suggestion-item');
            suggestionItems.forEach((item) => {
                const suggestion = item.getAttribute('data-suggestion');
                item.addEventListener('click', () => {
                    this.selectSuggestion(suggestion);
                });
            });

            suggestionsContainer.addEventListener('click', (e) => {
                if (e.target === suggestionsContainer) {
                    this.closeSearchResults();
                }
            });
        }, 10);

        this.escapeHandler = (e) => {
            if (e.key === 'Escape') this.closeSearchResults();
        };
        document.addEventListener('keydown', this.escapeHandler);

        this.showNotification('🔍 No se encontraron resultados exactos. Prueba con las sugerencias.', 'warning');
    }

    closeSearchResults() {
        const results = document.getElementById('searchResults');
        if (results) {
            results.classList.add('closing');
            setTimeout(() => {
                if (results.parentNode) {
                    results.parentNode.removeChild(results);
                }
            }, 200);
        }

        this.currentResults = null;
        this.currentSuggestions = null;

        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
            this.escapeHandler = null;
        }
    }

    selectSuggestion(suggestion) {
        this.closeSearchResults();
        document.getElementById('addressSearch').value = suggestion;

        setTimeout(() => {
            this.searchAddress();
        }, 300);
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

    setupEscapeHandler() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSearchResults();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.addressForm = new AddressForm();
});