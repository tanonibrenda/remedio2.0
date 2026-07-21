/**
 * frontend/js/search.js
 * Motor de búsqueda modular. WCAG 2.2 AA/AAA.
 */

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('formulario-busqueda-principal');
    const searchInput = document.getElementById('buscador-input');
    const resultsContainer = document.getElementById('contenedor-resultados');
    const ariaLiveRegion = document.getElementById('anuncio-resultados');

    // 1. Lectura de parámetros URL (Para recibir búsquedas desde el Header o el Index)
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');

    if (queryParam && searchInput) {
        searchInput.value = queryParam;
        ejecutarBusqueda(queryParam);
    }

    // 2. Intercepción del formulario en la página de búsqueda (AJAX sin recargar)
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const term = searchInput.value.trim();
            if (term) {
                // Actualiza la URL sin recargar la página para que se pueda compartir
                window.history.pushState({}, '', `?q=${encodeURIComponent(term)}`);
                ejecutarBusqueda(term);
            }
        });
    }

    // 3. Función principal de búsqueda
    async function ejecutarBusqueda(term) {
        if (!resultsContainer) return;

        // Estado de carga accesible
        resultsContainer.innerHTML = `
            <div class="status-box state-loading" role="status">
                <div class="spinner" aria-hidden="true"></div>
                <p>Consultando base de datos para <strong>${escapeHTML(term)}</strong>...</p>
            </div>`;
        anunciarLectorPantalla(`Buscando resultados para ${term}`);

        try {
            // Se asume que el backend (api.php) resuelve si es genérico o comercial
            const response = await fetch(`../api.php?q=${encodeURIComponent(term)}`);
            if (!response.ok) throw new Error('Error en la red');
            
            const data = await response.json();
            renderResultados(data, term);
        } catch (error) {
            console.error('Error de consulta:', error);
            renderError(term);
        }
    }

    // 4. Renderizado condicional según tipo de resultado
    function renderResultados(data, term) {
        resultsContainer.innerHTML = ''; 

        if (!data || data.resultados.length === 0) {
            resultsContainer.innerHTML = `
                <div class="status-box state-warning" role="alert">
                    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <div>
                        <h3>Sin resultados para "${escapeHTML(term)}"</h3>
                        <p>Verificá la ortografía o consultá el prospecto oficial.</p>
                    </div>
                </div>`;
            anunciarLectorPantalla(`No se encontraron resultados para ${term}`);
            resultsContainer.focus();
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'results-grid';

        // LÓGICA: Si es un nombre comercial, se muestra su estado (tiene o no gluten)
        if (data.tipo_busqueda === 'comercial') {
            const med = data.resultados[0]; // Suponemos coincidencia exacta
            const esApto = med.tiene_isologo; // Booleano desde la BD
            
            const card = document.createElement('article');
            card.className = `result-card commercial-card ${esApto ? 'is-safe' : 'is-danger'}`;
            card.innerHTML = `
                <div class="commercial-status-header">
                    <span class="status-icon" aria-hidden="true">${esApto ? '✅' : '⚠️'}</span>
                    <h3 class="med-title">${escapeHTML(med.nombre_comercial)}</h3>
                </div>
                <div class="status-badge ${esApto ? 'badge-safe' : 'badge-danger'}">
                    ${esApto ? 'Libre de Gluten (Sin TACC)' : 'CONTIENE GLUTEN / NO APTO'}
                </div>
                <dl class="med-details mt-3">
                    <div class="detail-row"><dt>Laboratorio:</dt><dd>${escapeHTML(med.laboratorio)}</dd></div>
                    <div class="detail-row"><dt>Droga:</dt><dd>${escapeHTML(med.droga)}</dd></div>
                </dl>
            `;
            grid.appendChild(card);
            anunciarLectorPantalla(`El medicamento comercial ${med.nombre_comercial} ${esApto ? 'es libre de gluten' : 'no es apto, contiene gluten'}.`);
        } 
        // LÓGICA: Si es nombre genérico (droga), lista los medicamentos aptos
        else if (data.tipo_busqueda === 'generico') {
            anunciarLectorPantalla(`Se encontraron ${data.resultados.length} medicamentos aptos para la droga ${term}`);
            
            const headerInfo = document.createElement('div');
            headerInfo.className = 'generic-header-info';
            headerInfo.innerHTML = `<p>Mostrando medicamentos <strong>Libres de Gluten</strong> para la droga: <em>${escapeHTML(term)}</em></p>`;
            resultsContainer.appendChild(headerInfo);

            data.resultados.forEach(med => {
                const article = document.createElement('article');
                article.className = 'result-card';
                article.innerHTML = `
                    <h3 class="med-title">${escapeHTML(med.nombre_comercial)}</h3>
                    <dl class="med-details">
                        <div class="detail-row"><dt>Laboratorio:</dt><dd>${escapeHTML(med.laboratorio)}</dd></div>
                        <div class="detail-row"><dt>Presentación:</dt><dd>${escapeHTML(med.forma_presentacion)}</dd></div>
                    </dl>
                `;
                grid.appendChild(article);
            });
        }

        resultsContainer.appendChild(grid);
        resultsContainer.focus();
    }

    function renderError() {
        resultsContainer.innerHTML = `
            <div class="status-box state-error" role="alert">
                <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <div>
                    <h3>Problema de conexión</h3>
                    <p>No pudimos conectar con la base de datos. Por favor, intentá nuevamente en unos instantes.</p>
                </div>
            </div>`;
        anunciarLectorPantalla("Error de conexión al buscar.");
        resultsContainer.focus();
    }

    function anunciarLectorPantalla(texto) {
        if (ariaLiveRegion) {
            ariaLiveRegion.textContent = ''; // Limpia el nodo para forzar la relectura
            setTimeout(() => { ariaLiveRegion.textContent = texto; }, 50);
        }
    }

    function escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});