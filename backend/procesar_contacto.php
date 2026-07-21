<?php
// Configuración básica
$correo_destino = "info@remediosingluten.com.ar"; // Reemplazar con el correo oficial de la plataforma
$asunto_prefijo = "[Plataforma Web - Contacto]: ";

// Verificar si el formulario fue enviado por POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // 1. Recibir y sanitizar los datos (Seguridad E-E-A-T)
    $nombre = filter_input(INPUT_POST, 'nombre', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $asunto_select = filter_input(INPUT_POST, 'asunto', FILTER_SANITIZE_STRING);
    $mensaje = filter_input(INPUT_POST, 'mensaje', FILTER_SANITIZE_STRING);
    
    // 2. Validar que los campos no estén vacíos y el email sea válido
    if (!empty($nombre) && !empty($email) && !empty($mensaje) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
        
        // 3. Preparar el cuerpo del correo
        $asunto_final = $asunto_prefijo . $asunto_select;
        
        $cuerpo = "Has recibido un nuevo mensaje desde el formulario de contacto de Remedios Sin Gluten.\n\n";
        $cuerpo .= "==========================================\n";
        $cuerpo .= "Nombre: " . $nombre . "\n";
        $cuerpo .= "Email: " . $email . "\n";
        $cuerpo .= "Motivo: " . $asunto_select . "\n";
        $cuerpo .= "==========================================\n\n";
        $cuerpo .= "Mensaje:\n" . $mensaje . "\n\n";
        $cuerpo .= "==========================================\n";
        $cuerpo .= "Enviado desde remediosingluten.com.ar";

        // 4. Cabeceras del correo (Headers para evitar Spam)
        $headers = "From: no-reply@remediosingluten.com.ar\r\n"; // El dominio debe coincidir con el servidor Hostinger
        $headers .= "Reply-To: " . $email . "\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();

        // 5. Enviar el correo
        if (mail($correo_destino, $asunto_final, $cuerpo, $headers)) {
            // Éxito: Redirigir a la página de contacto con un parámetro de éxito en la URL
            // Podrías crear un exito.html, pero esto es más limpio.
            header("Location: contacto.html?estado=exito");
            exit;
        } else {
            // Error en el servidor al enviar
            header("Location: contacto.html?estado=error_servidor");
            exit;
        }
    } else {
        // Error de validación (campos vacíos o email inválido)
        header("Location: contacto.html?estado=error_validacion");
        exit;
    }
} else {
    // Si se accede al archivo directamente sin enviar el formulario
    header("Location: contacto.html");
    exit;
}
?>