<?php
namespace App\Config;

use PDO;
use PDOException;

class Database {
    private static ?PDO $connection = null;

    public static function getConnection(): PDO {
        if (self::$connection === null) {
            // Variables de entorno (env.php)
            $host = $_ENV['DB_HOST'] ?? 'localhost';
            $db   = $_ENV['DB_NAME'] ?? 'remedios_sin_gluten';
            $user = $_ENV['DB_USER'] ?? 'root';
            $pass = $_ENV['DB_PASS'] ?? '';
            $charset = 'utf8mb4';

            $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
            
            // Configuraciones recomendadas para entornos web de producción
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false, // Previene inyección SQL forzando tipos nativos
            ];

            try {
                self::$connection = new PDO($dsn, $user, $pass, $options);
            } catch (PDOException $e) {
                // Nunca exponer detalles del error de DB al cliente por seguridad (OWASP)
                error_log($e->getMessage());
                Response::json(500, 'Error interno del servidor.', 'DATABASE_ERROR', 'Intente nuevamente más tarde.');
            }
        }
        return self::$connection;
    }
}