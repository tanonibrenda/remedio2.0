<?php
namespace App\Services;

use App\Models\BusquedaLog;

class BusquedaService {
    private BusquedaLog $busquedaLogModel;

    public function __construct() {
        $this->busquedaLogModel = new BusquedaLog();
    }

    /**
     * Sanitiza y registra la búsqueda en la base de datos.
     */
    public function procesarYRegistrar(string $terminoRaw, ?int $idUsuario = null): array {
        // Sanitización estricta OWASP
        $terminoLimpio = htmlspecialchars(strip_tags(trim($terminoRaw)), ENT_QUOTES, 'UTF-8');
        
        if (empty($terminoLimpio)) {
            return ['error' => true, 'mensaje' => 'El término de búsqueda no es válido.'];
        }

        // Lógica simulada de búsqueda (aquí se conectarían los modelos Droga/Medicamento)
        // ... $resultados = Medicamento::buscar($terminoLimpio); ...
        
        // Mock de resultados para el ejemplo
        $tuvoResultado = true;
        $tipo = 'medicamento'; 
        $idMedicamento = 12; // ID encontrado
        $idDroga = null;

        // Registrar en BD
        $this->busquedaLogModel->registrarBusqueda(
            $idUsuario, 
            $terminoLimpio, 
            $tipo, 
            $idMedicamento, 
            $idDroga, 
            $tuvoResultado
        );

        return [
            'error' => false,
            'termino_buscado' => $terminoLimpio,
            'resultados' => [] // Array de resultados reales
        ];
    }
}