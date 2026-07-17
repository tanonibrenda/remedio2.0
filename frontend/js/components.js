async function loadComponent(elementId, componentPath) {
    const container = document.getElementById(elementId);
    if (!container) return;

    try {
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        container.innerHTML = await response.text();
        container.classList.remove(`${container.tagName.toLowerCase()}-placeholder`);
    } catch (error) {
        console.error(`Fallo en ${componentPath}:`, error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Definir la ruta correcta dependiendo de dónde se llame el script
    const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
    const basePath = isIndex ? './frontend/components/' : '../components/';

    await loadComponent('main-header', basePath + 'header.html');
    await loadComponent('main-footer', basePath + 'footer.html');

    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            
            if (isExpanded) {
                mainNav.setAttribute('hidden', '');
            } else {
                mainNav.removeAttribute('hidden');
                const firstLink = mainNav.querySelector('.nav-link');
                if (firstLink) firstLink.focus();
            }
        });
    }

    document.dispatchEvent(new CustomEvent('componentsLoaded'));
});