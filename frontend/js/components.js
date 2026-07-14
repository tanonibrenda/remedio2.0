// 1. PRIMERO: Definimos la función que carga los componentes
async function loadComponent(elementId, componentPath) {
  try {
    const response = await fetch(componentPath);
    
    if (!response.ok) {
      throw new Error(`Error al cargar el componente: ${componentPath}`);
    }
    
    const htmlSnippet = await response.text();
    document.getElementById(elementId).innerHTML = htmlSnippet;
    
  } catch (error) {
    console.error("Fallo la inyección de componentes:", error);
    document.getElementById(elementId).innerHTML = `<p style="padding:1rem;">Error cargando componente.</p>`;
  }
}

// 2. SEGUNDO: Ejecutamos todo cuando la página cargue
document.addEventListener('DOMContentLoaded', async () => {
 
  // IMPORTANTE: Agregamos "await" para que espere a que el header y footer se inyecten
  // ANTES de intentar darle funcionalidades a los botones.
  await loadComponent('main-header', './frontend/components/header.html');
  await loadComponent('main-footer', './frontend/components/footer.html');
 
  // --- A partir de acá, el HTML ya existe en la página, podemos buscar los botones ---

  // Lógica del menú principal
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
      }
    });
  }

  // Lógica del Panel de Accesibilidad
  const a11yToggle = document.getElementById('btn-a11y-toggle');
  const a11yPanel = document.getElementById('a11y-panel');
  const btnDarkMode = document.getElementById('btn-dark-mode');
  
  if (a11yToggle && a11yPanel) {
    a11yToggle.addEventListener('click', () => {
      const isExpanded = a11yToggle.getAttribute('aria-expanded') === 'true';
      a11yToggle.setAttribute('aria-expanded', !isExpanded);
      
      if (isExpanded) {
        a11yPanel.setAttribute('hidden', '');
      } else {
        a11yPanel.removeAttribute('hidden');
        // Trasladar el foco al primer botón del panel para navegación por teclado
        if(btnDarkMode) btnDarkMode.focus(); 
      }
    });
  }

  // Lógica de Modo Oscuro
  if (btnDarkMode) {
    btnDarkMode.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isPressed = document.body.classList.contains('dark-mode');
      btnDarkMode.setAttribute('aria-pressed', isPressed);
    });
  }
});