<?php
namespace App\Core;

class Response {
    /**
     * Retorna una respuesta JSON estructurada y accesible.
     */
    public static function json(int $statusCode, string $message, string $errorCode = '', mixed $data = null, string $help = ''): never {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *'); // Configurar según CORS en producción
        
        $response = [
            'status' => $statusCode >= 200 && $statusCode < 300 ? 'success' : 'error',
            'message' => $message,
        ];

        if ($errorCode !== '') {
            $response['error_code'] = $errorCode;
        }
        
        if ($help !== '') {
            $response['help'] = $help; // Texto descriptivo para guiar al usuario/desarrollador
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
}