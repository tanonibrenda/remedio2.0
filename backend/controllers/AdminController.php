<?php
namespace App\Controllers;

use App\Core\Response;
use App\Core\Auth; // Servicio hipotético para validación JWT
use App\Config\Database;
use PDO;
use PDOException;

class AdminController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
        
        // Protección estricta del endpoint: Solo administradores pueden acceder a esta telemetría.
        // Si el token falla o el rol no es admin, Auth::requireRole detiene la ejecución y devuelve un 403/401 accesible.
        Auth::requireRole('admin'); 
    }

    // =========================================================================
    // 1. ESTADÍSTICAS BÁSICAS Y MÉDICAS
    // =========================================================================

    public function estadisticasLaboratoriosTotal(): void {
        try {
            $stmt = $this->db->query("SELECT COUNT(id_laboratorio) as total FROM Laboratorio WHERE activo = 1");
            $resultado = $stmt->fetch();
            
            Response::json(200, 'Total de laboratorios obtenido', '', [
                'total_laboratorios' => (int)$resultado['total']
            ], 'Indica la cantidad de laboratorios activos. Ideal para anunciar dinámicamente mediante aria-live en el dashboard.');
        } catch (PDOException $e) {
            $this->handleError($e);
        }
    }

    public function estadisticasMedicamentosTotal(): void {
        try {
            $stmt = $this->db->query("SELECT COUNT(id_medicamento) as total FROM Medicamento WHERE activo = 1");
            $resultado = $stmt->fetch();
            
            Response::json(200, 'Total de medicamentos obtenido', '', [
                'total_medicamentos' => (int)$resultado['total']
            ]);
        } catch (PDOException $e) {
            $this->handleError($e);
        }
    }

    public function estadisticasMedicamentosPorLaboratorio(): void {
        try {
            $sql = "SELECT l.nombre as laboratorio, COUNT(m.id_medicamento) as cantidad 
                    FROM Laboratorio l
                    LEFT JOIN Medicamento m ON l.id_laboratorio = m.id_laboratorio AND m.activo = 1
                    WHERE l.activo = 1
                    GROUP BY l.id_laboratorio
                    ORDER BY cantidad DESC";
            
            $stmt = $this->db->query($sql);
            $resultados = $stmt->fetchAll();
            
            Response::json(200, 'Distribución de medicamentos por laboratorio', '', $resultados, 'Los datos están estructurados para poblar directamente elementos <table> con encabezados semánticos.');
        } catch (PDOException $e) {
            $this->handleError($e);
        }
    }

    public function estadisticasMedicamentosSinTaccTotal(): void {
        try {
            // Asumiendo que existe un flag `es_sintacc` o similar. 
            // En este contexto, todos los de la plataforma deberían serlo, pero sirve para auditar el flag.
            $stmt = $this->db->query("SELECT COUNT(id_medicamento) as total FROM Medicamento WHERE es_sintacc = 1 AND activo = 1");
            $resultado = $stmt->fetch();
            
            Response::json(200, 'Total de medicamentos libres de gluten obtenido', '', [
                'total_sintacc' => (int)$resultado['total']
            ]);
        } catch (PDOException $e) {
            $this->handleError($e);
        }
    }

    public function estadisticasSinTaccPorLaboratorio(): void {
        try {
            $sql = "SELECT l.nombre as laboratorio, COUNT(m.id_medicamento) as cantidad_sintacc 
                    FROM Laboratorio l
                    JOIN Medicamento m ON l.id_laboratorio = m.id_laboratorio
                    WHERE m.es_sintacc = 1 AND m.activo = 1 AND l.activo = 1
                    GROUP BY l.id_laboratorio
                    ORDER BY cantidad_sintacc DESC";
            
            $stmt = $this->db->query($sql);
            $resultados = $stmt->fetchAll();
            
            Response::json(200, 'Distribución Sin TACC por laboratorio', '', $resultados);
        } catch (PDOException $e) {
            $this->handleError($e);
        }
    }

    public function estadisticasUltimaActualizacion(): void {
        try {
            $sql = "SELECT fecha, tipo_entidad, accion 
                    FROM Actualizacion 
                    ORDER BY fecha DESC LIMIT 1";
            $stmt = $this->db->query($sql);
            $resultado = $stmt->fetch();
            
            Response::json(200, 'Última actualización registrada', '', $resultado ?: []);
        } catch (PDOException $e) {
            $this->handleError($e);
        }
    }

    // =========================================================================
    // 2. ESTADÍSTICAS DE BÚSQUEDAS (TELEMETRÍA)
    // =========================================================================

    public function estadisticasBusquedasTotal(): void {
        try {
            $stmt = $this->db->query("SELECT COUNT(id_busqueda) as total FROM BusquedaLog");
            $resultado = $stmt->fetch();
            
            Response::json(200, 'Volumen histórico de búsquedas', '', [
                'total_busquedas' => (int)$resultado['total']
            ]);
        } catch (PDOException $e) {
            $this->handleError($e);
        }
    }

    public function estadisticasBusquedasPorDia(): void {
        try {
            $sql = "SELECT DATE(fecha) as fecha_dia, COUNT(id_busqueda) as cantidad 
                    FROM BusquedaLog 
                    WHERE fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
                    GROUP BY DATE(fecha) 
                    ORDER BY fecha_dia DESC";
            
            $stmt = $this->db->query($sql);
            $resultados = $stmt->fetchAll();
            
            Response::json(200, 'Tendencia de búsquedas de los últimos 30 días', '', $resultados, 'Recomendado para gráficos de líneas o barras en la interfaz de administración web.');
        } catch (PDOException $e) {
            $this->handleError($e);
        }
    }

    public function estadisticasTerminosMasBuscados(): void {
        try {
            $sql = "SELECT termino, COUNT(id_busqueda) as cantidad 
                    FROM BusquedaLog 
                    GROUP BY termino 
                    ORDER BY cantidad DESC 
                    LIMIT 20";
            
            $stmt = $this->db->query($sql);
            $resultados = $stmt->fetchAll();
            
            Response::json(200, 'Términos más frecuentes', '', $resultados);
        } catch (PDOException $e) {
            $this->handleError($e);
        }
    }

    public function estadisticasBusquedasSinResultado(): void {
        try {
            $sql = "SELECT termino, COUNT(id_busqueda) as intentos, MAX(fecha) as ultima_busqueda 
                    FROM BusquedaLog 
                    WHERE tuvo_resultado = 0 
                    GROUP BY termino 
                    ORDER BY intentos DESC 
                    LIMIT 20";
            
            $stmt = $this->db->query($sql);
            $resultados = $stmt->fetchAll();
            
            Response::json(200, 'Términos fallidos', '', $resultados, 'Revisión crítica: Estos términos sugieren alias faltantes o medicamentos que deben ingresarse a la plataforma.');
        } catch (PDOException $e) {
            $this->handleError($e);
        }
    }

    // =========================================================================
    // 3. AUDITORÍA CLÍNICA Y TRAZABILIDAD
    // =========================================================================

    public function listarAuditoria(): void {
        try {
            // Obtenemos los parámetros de paginación de la URL (GET) con sanitización
            $limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 50;
            $offset = isset($_GET['page']) ? (max(1, (int)$_GET['page']) - 1) * $limit : 0;

            // Join estructurado para obtener un registro legible e inmutable de quién hizo qué
            $sql = "SELECT 
                        a.id_actualizacion,
                        a.fecha, 
                        u.nombre as usuario_responsable, 
                        u.rol,
                        a.tipo_entidad as tabla_afectada, 
                        a.accion as tipo_cambio, 
                        a.descripcion
                    FROM Actualizacion a
                    LEFT JOIN Usuario u ON a.id_usuario = u.id_usuario
                    ORDER BY a.fecha DESC
                    LIMIT :limit OFFSET :offset";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $resultados = $stmt->fetchAll();
            
            Response::json(200, 'Registro de auditoría obtenido', '', $resultados, 'Diseñado para cumplir con los estándares de trazabilidad en sistemas de información en salud.');
        } catch (PDOException $e) {
            $this->handleError($e);
        }
    }

    // =========================================================================
    // MÉTODOS PRIVADOS DE AYUDA
    // =========================================================================

    /**
     * Maneja las excepciones de la base de datos de forma segura (OWASP).
     * Evita filtrar detalles de la estructura de la base de datos en los endpoints.
     */
    private function handleError(PDOException $e): never {
        error_log("Error DB en AdminController: " . $e->getMessage());
        Response::json(
            500, 
            'Ocurrió un error al procesar la estadística.', 
            'ADMIN_DB_ERROR', 
            null, 
            'Verifique el registro de errores del servidor para más detalles.'
        );
    }
}