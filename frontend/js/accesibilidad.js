/**
 * accesibilidad.js
 * Gestiona las preferencias de accesibilidad del usuario (Modo Oscuro, Tamaño de Fuente)
 * y el panel interactivo. Utiliza localStorage para persistencia de datos.
 */

// 1. Inicializar preferencias visuales en cuanto el DOM esté listo 
// (Se ejecuta rápido para evitar destellos visuales o saltos de tamaño)
document.addEventListener('DOMContentLoaded', initPreferences);

// 2. Esperar a que components.js termine de inyectar el header asíncrono
document.addEventListener('componentsLoaded', () => {
    
    // --- Lógica del Panel de Accesibilidad ---
    const a11yToggle = document.getElementById('btn-a11y-toggle');
    const a11yPanel = document.getElementById('a11y-panel');
    
    if (a11yToggle && a11yPanel) {
        a11yToggle.addEventListener('click', () => {
            const isExpanded = a11yToggle.getAttribute('aria-expanded') === 'true';
            a11yToggle.setAttribute('aria-expanded', !isExpanded);
            
            if (isExpanded) {
                // Ocultar panel
                a11yPanel.setAttribute('hidden', '');
            } else {
                // Mostrar panel
                a11yPanel.removeAttribute('hidden');
                // WCAG 2.4.3 Focus Order: Mover el foco al primer elemento interactivo del panel al abrirlo
                const firstBtn = a11yPanel.querySelector('button');
                if (firstBtn) firstBtn.focus(); 
            }
        });
    }

    // --- Lógica del Modo Oscuro ---
    const btnDarkMode = document.getElementById('btn-dark-mode');
    if (btnDarkMode) {
        // Establecer el estado inicial del botón (aria-pressed) basado en si la clase ya se aplicó en initPreferences()
        const isDarkModeOnLoad = document.body.classList.contains('dark-mode');
        btnDarkMode.setAttribute('aria-pressed', isDarkModeOnLoad);

        btnDarkMode.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            
            // Actualizar estado dinámico para lectores de pantalla
            btnDarkMode.setAttribute('aria-pressed', isDarkMode);
            
            // Guardar preferencia del usuario en su navegador
            localStorage.setItem('rsg-dark-mode', isDarkMode);
        });
    }

    // --- Lógica de Tamaño de Fuente ---
    const btnIncreaseFont = document.getElementById('btn-increase-font');
    const btnDecreaseFont = document.getElementById('btn-decrease-font');
    const btnResetFont = document.getElementById('btn-reset-font'); 
    
    // Obtenemos el tamaño actual de localStorage o usamos 100% por defecto
    let currentFontSize = parseInt(localStorage.getItem('rsg-font-size')) || 100;

    function updateFontSize(newSize) {
        // WCAG 1.4.4 Resize text: Permitir ampliar el texto hasta un 200%
        // Limitamos el mínimo a 90% para proteger la legibilidad base
        if (newSize >= 90 && newSize <= 200) {
            currentFontSize = newSize;
            document.documentElement.style.setProperty('--base-font-size', `${currentFontSize}%`);
            localStorage.setItem('rsg-font-size', currentFontSize);
        }
    }

    if (btnIncreaseFont) {
        btnIncreaseFont.addEventListener('click', () => updateFontSize(currentFontSize + 10));
    }

    if (btnDecreaseFont) {
        btnDecreaseFont.addEventListener('click', () => updateFontSize(currentFontSize - 10));
    }

    if (btnResetFont) {
        btnResetFont.addEventListener('click', () => updateFontSize(100));
    }
});

/**
 * Función para aplicar preferencias previas guardadas en localStorage.
 * Al estar separada, se ejecuta inmediatamente con el DOMContentLoaded
 * previniendo el efecto FOUC (Flash of Unstyled Content).
 */
function initPreferences() {
    // Restaurar Modo Oscuro
    const savedDarkMode = localStorage.getItem('rsg-dark-mode') === 'true';
    if (savedDarkMode) {
        document.body.classList.add('dark-mode');
    }

    // Restaurar Tamaño de Fuente
    const savedFontSize = localStorage.getItem('rsg-font-size');
    if (savedFontSize) {
        document.documentElement.style.setProperty('--base-font-size', `${savedFontSize}%`);
    }
}