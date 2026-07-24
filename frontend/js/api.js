// frontend/js/api.js

async function buscarMedicamento(termino) {
    const token = localStorage.getItem('jwt_token'); // Si el usuario está autenticado
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`https://remediosingluten.com.ar/backend/api/buscador?q=${encodeURIComponent(termino)}`, {
            method: 'GET',
            headers: headers
        });

        const data = await response.json();

        if (!response.ok) {
            // Manejo de error accesible utilizando los campos de nuestra Response.php
            console.error(`Error ${data.error_code}: ${data.message}. Ayuda: ${data.help}`);
            mostrarMensajeErrorAlUsuario(data.message);
            return null;
        }

        return data.data; // Devuelve los resultados de la búsqueda
    } catch (error) {
        console.error('Error de red o CORS:', error);
    }
}