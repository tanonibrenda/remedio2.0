<?php
// crear_admin.php
// ¡ADVERTENCIA! Elimina este archivo inmediatamente después de usarlo.

// 1. Configuración de la base de datos (ajusta con tus credenciales)
$host = 'localhost';
$dbname = 'u123456789_remedios'; // Tu nombre de base de datos
$username = 'u123456789_usuario'; // Tu usuario de BD
$password_db = 'tu_contraseña_de_bd';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password_db);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 2. Datos del primer administrador
    $nombre = 'Administrador Principal';
    $email = 'admin@remediosingluten.com.ar';
    $password_plana = 'AdminSeguro2026!'; // Cambia esto por una contraseña fuerte
    $rol = 'admin'; // Rol estricto para acceso al panel[cite: 2]
    $fecha_registro = date('Y-m-d H:i:s');

    // 3. Hashear la contraseña usando el estándar de seguridad[cite: 2]
    $password_hash = password_hash($password_plana, PASSWORD_BCRYPT);

    // 4. Preparar la consulta para la tabla Usuario[cite: 1]
    $sql = "INSERT INTO Usuario (nombre, email, password_hash, rol, fecha_registro) 
            VALUES (:nombre, :email, :password_hash, :rol, :fecha_registro)";
    
    $stmt = $pdo->prepare($sql);
    
    // 5. Ejecutar la inserción
    $stmt->execute([
        ':nombre' => $nombre,
        ':email' => $email,
        ':password_hash' => $password_hash,
        ':rol' => $rol,
        ':fecha_registro' => $fecha_registro
    ]);

    echo "✅ Usuario administrador creado con éxito. <br>";
    echo "<strong>Email:</strong> $email <br>";
    echo "<h3 style='color:red;'>⚠️ POR SEGURIDAD: Elimina este archivo (crear_admin.php) del servidor AHORA MISMO.</h3>";

} catch (PDOException $e) {
    echo "❌ Error en la base de datos: " . $e->getMessage();
}