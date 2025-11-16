
// Configuración global
const ADMIN_CONFIG = {
    DEBOUNCE_DELAY: 300,
    ANIMATION_DURATION: 1000,
    ALERT_TIMEOUT: 5000
};

// Utilidades de tiempo
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
    
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = `${dateString} - ${timeString}`;
    }
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

// Utilidades de UI
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
    }, ADMIN_CONFIG.ALERT_TIMEOUT);
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

function showLoading(show) {
    const loadingOverlay = document.getElementById('loadingSpinner');
    if (!loadingOverlay) return;

    if (show) {
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.opacity = '1';
        }, 10);
    } else {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 300);
    }
}

function animateCounter(elementId, targetValue, duration = 1000) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const current = parseInt(element.textContent.replace(/,/g, '')) || 0;
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

// Utilidades de datos
function extractArrayFromResponse(responseData) {
    if (Array.isArray(responseData)) {
        return responseData;
    } else if (responseData.content && Array.isArray(responseData.content)) {
        return responseData.content;
    } else if (responseData.data && Array.isArray(responseData.data)) {
        return responseData.data;
    } else if (responseData.products && Array.isArray(responseData.products)) {
        return responseData.products;
    } else {
        return responseData ? [responseData] : [];
    }
}

function getHeaders(contentType = 'application/json') {
    const token = document.querySelector('meta[name="_csrf"]')?.getAttribute('content');
    const header = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content');

    const headers = {
        'Content-Type': contentType
    };

    if (token && header) {
        headers[header] = token;
    }

    return headers;
}

// Utilidades de texto
function truncateText(text, length) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
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

// Utilidades de stock
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

// Utilidades de animación
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

function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                if (entry.target.classList.contains('stat-card') || 
                    entry.target.classList.contains('action-card')) {
                    const index = Array.from(entry.target.parentElement.children).indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                }
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in');
    animatedElements.forEach(el => observer.observe(el));
}

// Inicialización común
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    setupScrollAnimations();
});