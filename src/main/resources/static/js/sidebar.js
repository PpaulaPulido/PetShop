document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('systemSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarClose = document.getElementById('sidebarClose');
    
    createMenuToggle();
    
    // Abrir sidebar en móviles
    function openSidebar() {
        sidebar.classList.add('mobile-open');
        if (sidebarOverlay) {
            sidebarOverlay.classList.add('active');
        }
        document.body.style.overflow = 'hidden';
    }
    
    // Cerrar sidebar en móviles
    function closeSidebar() {
        sidebar.classList.remove('mobile-open');
        if (sidebarOverlay) {
            sidebarOverlay.classList.remove('active');
        }
        document.body.style.overflow = '';
    }
    
    // Crear botón hamburguesa
    function createMenuToggle() {
        const topBarContent = document.querySelector('.top-bar-content');
        if (!topBarContent) return;
        
        // Verificar si ya existe el botón
        if (document.getElementById('menuToggle')) return;
        
        const menuToggle = document.createElement('button');
        menuToggle.id = 'menuToggle';
        menuToggle.className = 'menu-toggle';
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        menuToggle.setAttribute('aria-label', 'Abrir menú');
        
        // Insertar al inicio del top-bar-content
        const pageTitle = topBarContent.querySelector('.page-title');
        if (pageTitle) {
            topBarContent.insertBefore(menuToggle, pageTitle);
        } else {
            topBarContent.prepend(menuToggle);
        }
        
        // Event listener para el botón hamburguesa
        menuToggle.addEventListener('click', openSidebar);
    }
    
    // Event listeners
    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
    
    // Cerrar sidebar al hacer clic en un enlace (en móviles)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });
    
    // Ajustar el contenido principal cuando se redimensiona la ventana
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    });
    
    // Cerrar sidebar con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeSidebar();
        }
    });
});