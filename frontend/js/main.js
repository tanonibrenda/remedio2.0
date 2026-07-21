document.addEventListener("DOMContentLoaded", () => {
    // 1. Detección de profundidad de la ruta para solucionar enlaces e imágenes
    const currentPath = window.location.pathname;
    const isInnerPage = currentPath.includes('/pages/');
    
    // Rutas relativas calculadas
    const assetsPath = isInnerPage ? '../assets/' : './frontend/assets/';
    const pagesPath = isInnerPage ? './' : './frontend/pages/';
    const rootPath = isInnerPage ? '../../' : './';

    // 2. Inyección de Header
    const headerElement = document.getElementById('main-header');
    if (headerElement) {
        headerElement.innerHTML = `
            <div class="a11y-toolbar" aria-label="Herramientas de accesibilidad digital">
                <button id="btn-a11y-toggle" class="btn-a11y" aria-expanded="false" aria-controls="a11y-panel">
                    <span class="sr-only">Abrir panel de accesibilidad</span>
                    <img src="${assetsPath}img/accesibilidad.webp" alt="" class="a11y-icon" width="24" height="24" aria-hidden="true">
                </button>
            </div>
            <div class="header-container">
                <a href="${rootPath}index.html" class="logo-link" aria-label="Volver a la página de inicio">
                    <img src="${assetsPath}img/logoRSG.png" alt="Remedios Sin Gluten - Inicio" height="50">
                </a>
                <nav id="main-nav" class="main-nav" aria-label="Navegación principal">
                    <ul class="nav-list">
                        <li><a href="${rootPath}index.html" class="nav-link">Buscador</a></li>
                        <li><a href="${pagesPath}infomedica.html" class="nav-link">Información Médica</a></li>
                        <li><a href="${pagesPath}comunidad.html" class="nav-link">Comunidad</a></li>
                        <li><a href="${pagesPath}nosotros.html" class="nav-link">Sobre Nosotros</a></li>
                        <li><a href="${pagesPath}contacto.html" class="nav-link">Contacto</a></li>
                    </ul>
                </nav>
            </div>
        `;
    }

    // 3. Inyección de Footer
    const footerElement = document.getElementById('main-footer');
    if (footerElement) {
        footerElement.innerHTML = `
            <div class="footer-container">
                <div class="footer-section">
                    <h2 class="footer-title">Remedios Sin Gluten</h2>
                    <p>Auditoría clínica constante para garantizar información segura basada en datos oficiales de ANMAT.</p>
                </div>
                <div class="footer-section">
                    <h2 class="footer-title">Enlaces Útiles</h2>
                    <ul class="footer-links">
                        <li><a href="${pagesPath}infomedica.html">Guía Médica</a></li>
                        <li><a href="${rootPath}index.html">Buscador de Medicamentos</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} Remedios Sin Gluten. Accesibilidad WCAG 2.2 AAA garantizada.</p>
            </div>
        `;
    }

    // Nota técnica: Para una solución comercial SEO más robusta a futuro, 
    // considerar reemplazar esta inyección JS con includes de PHP (ej. <?php include 'header.php'; ?>),
    // ya que Hostinger procesa PHP nativamente y entrega el HTML ya ensamblado a los motores de búsqueda.
});