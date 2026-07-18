/**
 * frontend/js/search.js
 * Motor de búsqueda y renderizado de resultados.
 * WCAG 2.2 AA/AAA: Gestión de foco, regiones aria-live, prevención XSS.
 */

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results-container');

    if (!searchForm || !searchInput || !resultsContainer) return;

    // Facilita la corrección rápida al enfocar el input
    searchInput.addEventListener('focus', function() {
        this.select();
    });

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const term = searchInput.value.trim();
        
        if (!term) return;

        // Estado de carga accesible
        resultsContainer.innerHTML = `
            <div class="status-box state-loading" role="status">
                <div class="spinner" aria-hidden="true"></div>
                <p>Consultando base de datos para <strong>${escapeHTML(term)}</strong>...</p>
            </div>`;

        try {
            // Endpoint unificado de búsqueda
            const response = await fetch(`api.php?q=${encodeURIComponent(term)}`);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            renderResults(data, term);
        } catch (error) {
            console.error('Error de consulta:', error);
            resultsContainer.innerHTML = `
                <div class="status-box state-error" role="alert">
                    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <div>
                        <h3>Problema de conexión</h3>
                        <p>No pudimos conectar con la base de datos. Por favor, intentá nuevamente en unos instantes.</p>
                    </div>
                </div>`;
            resultsContainer.focus();
        }
    });

    function renderResults(results, term) {
        resultsContainer.innerHTML = ''; 

        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="status-box state-warning" role="alert">
                    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <div>
                        <h3>Medicamento no encontrado</h3>
                        <p><strong>${escapeHTML(term)}</strong> no figura actualmente como libre de gluten.</p>
                        <span class="suggestion-text">Verificá la ortografía o consultá el prospecto oficial.</span>
                    </div>
                </div>`;
        } else {
            // Anuncio invisible para Screen Readers
            const srAnnouncement = document.createElement('div');
            srAnnouncement.className = 'sr-only';
            srAnnouncement.textContent = `Búsqueda completada. ${results.length} resultados encontrados.`;
            resultsContainer.appendChild(srAnnouncement);

            // Grilla de resultados
            const grid = document.createElement('div');
            grid.className = 'results-grid';
            
            results.forEach(med => {
                const article = document.createElement('article');
                article.className = 'result-card';
                if (med.es_linea_completa == 1) article.classList.add('card-highlight');

                article.innerHTML = `
                    <h3 class="med-title">${escapeHTML(med.nombre_medicamento || 'Línea Completa')}</h3>
                    <dl class="med-details">
                        <div class="detail-row">
                            <dt>Laboratorio:</dt>
                            <dd>${escapeHTML(med.laboratorio)}</dd>
                        </div>
                        ${med.droga ? `
                        <div class="detail-row">
                            <dt>Droga:</dt>
                            <dd>${escapeHTML(med.droga)}</dd>
                        </div>` : ''}
                    </dl>
                    ${med.es_linea_completa == 1 ? `
                    <div class="badge-linea-segura" aria-label="Información destacada">
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        Toda la línea de este laboratorio es apta
                    </div>` : ''}
                `;
                grid.appendChild(article);
            });
            resultsContainer.appendChild(grid);
        }

        // Mover foco lógico
        searchInput.value = '';
        resultsContainer.focus();
    }

    // Utilidad para evitar inyecciones XSS
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});