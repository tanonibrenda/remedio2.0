<?php
declare(strict_types=1);

namespace Backend\Controllers;

use Backend\Services\BusquedaService;
use Exception;

class BusquedaController {
    private BusquedaService $busquedaService;

    public function __construct(BusquedaService $busquedaService) {
        $this->busquedaService = $busquedaService;
    }

    /**
     * Endpoint: GET /admin/estadisticas/medicamentos-mas-buscados
     */
    public function obtenerEstadisticasAdmin(): void {
        header('Content-Type: application/json; charset=utf-8');
        
        // Validación de permisos: Aquí se debe integrar la validación del JWT 
        // para asegurar que solo el rol 'admin' (personal médico/auditores) acceda.
        // Auth::requireRole('admin');

        // Sanitización de inputs (GET)
        $fecha = filter_input(INPUT_GET, 'fecha', FILTER_SANITIZE_SPECIAL_CHARS) ?? '';
        $inicio = filter_input(INPUT_GET, 'inicio', FILTER_SANITIZE_SPECIAL_CHARS) ?? '';
        $fin = filter_input(INPUT_GET, 'fin', FILTER_SANITIZE_SPECIAL_CHARS) ?? '';

        $filtros = [];
        
        // Validación de formato de fechas (YYYY-MM-DD)
        if ($this->validarFecha($fecha)) {
            $filtros['fecha'] = $fecha;
        } elseif ($this->validarFecha($inicio) && $this->validarFecha($fin)) {
            // Lógica de validación temporal: inicio no puede ser mayor que fin
            if (strtotime($inicio) <= strtotime($fin)) {
                $filtros['inicio'] = $inicio;
                $filtros['fin'] = $fin;
            } else {
                http_response_code(400);
                echo json_encode([
                    'error_code' => 'INVALID_DATE_RANGE',
                    'error_message' => 'La fecha de inicio no puede ser posterior a la fecha de fin.',
                    'help' => 'Ajuste el rango de fechas en el formulario.'
                ]);
                exit;
            }
        }

        $resultado = $this->busquedaService->getMedicamentosMasConsultados($filtros);

        if ($resultado['success']) {
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'count' => count($resultado['data']),
                'data' => $resultado['data']
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'error_code' => $resultado['error_code'],
                'error_message' => $resultado['error_message'],
                'help' => $resultado['help']
            ]);
        }
    }

    /**
     * Helper para validar el formato ISO 8601 (YYYY-MM-DD)
     */
    private function validarFecha(string $fecha): bool {
        if (empty($fecha)) return false;
        $d = \DateTime::createFromFormat('Y-m-d', $fecha);
        return $d && $d->format('Y-m-d') === $fecha;
    }
}