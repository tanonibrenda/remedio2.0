// URL base de la API definida en la estructura backend
const API_BASE = '/backend/routes/api.php'; // Ajustar según enrutador REST real

document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    configurarNavegacion();
    configurarFormularioLogin();
    configurarBuscadorAdmin(); // NUEVA INICIALIZACIÓN: Configuración del buscador de estadísticas
});

// --- Gestión de Autenticación (JWT) ---
function verificarAutenticacion() {
    const token = localStorage.getItem('jwt');
    const loginView = document.getElementById('login-view');
    const adminView = document.getElementById('admin-view');

    if (token) {
        loginView.setAttribute('aria-hidden', 'true');
        loginView.hidden = true;
        
        adminView.setAttribute('aria-hidden', 'false');
        adminView.hidden = false;
        
        cargarEstadisticasBase();
    } else {
        loginView.setAttribute('aria-hidden', 'false');
        loginView.hidden = false;
        
        adminView.setAttribute('aria-hidden', 'true');
        adminView.hidden = true;
    }
}

function configurarFormularioLogin() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.token) {
                localStorage.setItem('jwt', data.token);
                verificarAutenticacion();
            } else {
                mostrarErrorAccesible('email-error', data.error_message || 'Credenciales inválidas');
            }
        } catch (error) {
            mostrarErrorAccesible('email-error', 'Error de conexión con el servidor.');
        }
    });

    document.getElementById('logout-btn')?.addEventListener('click', () => {
        localStorage.removeItem('jwt');
        verificarAutenticacion();
    });
}

function mostrarErrorAccesible(elementId, mensaje) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = mensaje;
        el.focus();
    }
}

// --- Pestañas y Navegación Accesible ---
function configurarNavegacion() {
    const tabs = document.querySelectorAll('.nav-tab');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Resetear estados
            tabs.forEach(t => {
                t.classList.remove('active');
                t.removeAttribute('aria-current');
            });
            panes.forEach(p => {
                p.hidden = true;
                p.classList.remove('active');
            });

            // Activar pestaña actual
            tab.classList.add('active');
            tab.setAttribute('aria-current', 'page');
            
            const targetId = tab.getAttribute('data-target');
            const targetPane = document.getElementById(targetId);
            
            if (targetPane) {
                targetPane.hidden = false;
                targetPane.classList.add('active');
                
                // Mover el foco al panel para lectores de pantalla
                const mainContent = document.getElementById('main-content');
                if (mainContent) mainContent.focus();

                // Cargar datos según la pestaña
                if (targetId === 'auditoria') cargarAuditoria();
            }
        });
    });
}

// --- Consumo de Endpoints REST ---
async function fetchSeguro(endpoint) {
    const token = localStorage.getItem('jwt');
    const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });
    
    if (response.status === 401) {
        localStorage.removeItem('jwt');
        verificarAutenticacion();
        throw new Error('Sesión expirada');
    }
    
    return await response.json();
}

async function cargarEstadisticasBase() {
    try {
        const medsData = await fetchSeguro('/admin/estadisticas/medicamentos-total');
        const labsData = await fetchSeguro('/admin/estadisticas/laboratorios-total');
        const updateData = await fetchSeguro('/admin/estadisticas/ultima-actualizacion');

        document.getElementById('stat-meds').textContent = medsData.total || '0';
        document.getElementById('stat-labs').textContent = labsData.total || '0';
        document.getElementById('stat-update').textContent = updateData.fecha || 'Sin datos';
    } catch (error) {
        console.error('Error cargando estadísticas base:', error);
    }
}

async function cargarAuditoria() {
    try {
        const data = await fetchSeguro('/admin/auditoria/lista');
        const tbody = document.getElementById('audit-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        if (Array.isArray(data) && data.length > 0) {
            data.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.fecha}</td>
                    <td>${item.usuario_responsable}</td>
                    <td>${item.tabla_afectada}</td>
                    <td><span class="badge ${item.tipo_cambio}">${item.tipo_cambio}</span></td>
                    <td>${item.descripcion}</td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5">No hay registros de auditoría recientes.</td></tr>';
        }
    } catch (error) {
        document.getElementById('audit-table-body').innerHTML = '<tr><td colspan="5">Error al cargar la auditoría.</td></tr>';
    }
}

// --- NUEVO: Integración del Buscador de Estadísticas Médicas ---
function configurarBuscadorAdmin() {
    const searchForm = document.getElementById('searchForm');
    const resultadosContainer = document.getElementById('resultados');
    
    if (!searchForm || !resultadosContainer) return;

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Estado de carga accesible (aria-live="polite" lo leerá automáticamente)
        resultadosContainer.innerHTML = '<h3>Resultados</h3><p>Procesando búsqueda...</p>';

        const fecha = document.getElementById('fecha').value;
        const inicio = document.getElementById('inicio').value;
        const fin = document.getElementById('fin').value;

        // Construir la URL con parámetros GET
        const params = new URLSearchParams();
        if (fecha) params.append('fecha', fecha);
        if (inicio) params.append('inicio', inicio);
        if (fin) params.append('fin', fin);

        try {
            const endpoint = `/admin/estadisticas/medicamentos-mas-buscados?${params.toString()}`;
            const response = await fetchSeguro(endpoint);

            if (response.status === 'success' && response.data.length > 0) {
                let html = `
                    <h3>Resultados: Medicamentos más consultados</h3>
                    <div class="table-responsive">
                        <table class="data-table" aria-label="Resultados de búsqueda de medicamentos">
                            <thead>
                                <tr>
                                    <th scope="col">Medicamento Comercial</th>
                                    <th scope="col">Laboratorio</th>
                                    <th scope="col">Total de Consultas</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                response.data.forEach(item => {
                    html += `
                        <tr>
                            <td><strong>${item.nombre_comercial}</strong></td>
                            <td>${item.laboratorio || 'No especificado'}</td>
                            <td>${item.total_consultas}</td>
                        </tr>
                    `;
                });

                html += `
                            </tbody>
                        </table>
                    </div>
                `;
                resultadosContainer.innerHTML = html;
            } else {
                resultadosContainer.innerHTML = '<h3>Resultados</h3><p>No se registraron búsquedas para el período seleccionado.</p>';
            }
        } catch (error) {
            console.error('Error en búsqueda de estadísticas:', error);
            resultadosContainer.innerHTML = `
                <h3>Error</h3>
                <p class="error-message" role="alert">No se pudo completar la búsqueda. Verifique el rango de fechas (la fecha de inicio no debe ser posterior a la de fin) o intente más tarde.</p>
            `;
        }
    });
}


// ===== TEmporal ===== 

// function verificarAutenticacion() {
//     // FORZADO PARA DISEÑO: Ignoramos el token y mostramos el panel directamente
//     const loginView = document.getElementById('login-view');
//     const adminView = document.getElementById('admin-view');

//     // Ocultar login
//     loginView.setAttribute('aria-hidden', 'true');
//     loginView.hidden = true;
    
//     // Mostrar admin
//     adminView.setAttribute('aria-hidden', 'false');
//     adminView.hidden = false;
    
//     // cargarEstadisticasBase(); // Comentamos esto para que no tire error en consola al no tener backend
// }