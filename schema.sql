-- Configuración inicial
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "-03:00";

-- 1. Tabla Usuario (Debe crearse primero por las llaves foráneas en otras tablas)
CREATE TABLE IF NOT EXISTS Usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'farmacia', 'hospital', 'paciente') NOT NULL DEFAULT 'paciente',
    activo BOOLEAN NOT NULL DEFAULT 1,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla Laboratorio
CREATE TABLE IF NOT EXISTS Laboratorio (
    id_laboratorio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla Droga
CREATE TABLE IF NOT EXISTS Droga (
    id_droga INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla DrogaAlias (Permite búsquedas accesibles por diferentes nombres)
CREATE TABLE IF NOT EXISTS DrogaAlias (
    id_alias INT AUTO_INCREMENT PRIMARY KEY,
    id_droga INT NOT NULL,
    alias VARCHAR(150) NOT NULL,
    FOREIGN KEY (id_droga) REFERENCES Droga(id_droga) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabla Medicamento
CREATE TABLE IF NOT EXISTS Medicamento (
    id_medicamento INT AUTO_INCREMENT PRIMARY KEY,
    id_laboratorio INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    es_sintacc BOOLEAN NOT NULL DEFAULT 1,
    activo BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (id_laboratorio) REFERENCES Laboratorio(id_laboratorio) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabla Pivote: MedicamentoDroga (Relación Muchos a Muchos)
CREATE TABLE IF NOT EXISTS MedicamentoDroga (
    id_medicamento INT NOT NULL,
    id_droga INT NOT NULL,
    PRIMARY KEY (id_medicamento, id_droga),
    FOREIGN KEY (id_medicamento) REFERENCES Medicamento(id_medicamento) ON DELETE CASCADE,
    FOREIGN KEY (id_droga) REFERENCES Droga(id_droga) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Tablas de Auditoría Médica
CREATE TABLE IF NOT EXISTS Actualizacion (
    id_actualizacion INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,
    tipo_entidad VARCHAR(50) NOT NULL,
    accion ENUM('CREAR', 'EDITAR', 'ELIMINAR') NOT NULL,
    descripcion TEXT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ActualizacionDetalle (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_actualizacion INT NOT NULL,
    campo VARCHAR(100) NOT NULL,
    valor_anterior TEXT,
    valor_nuevo TEXT,
    FOREIGN KEY (id_actualizacion) REFERENCES Actualizacion(id_actualizacion) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Tabla BusquedaLog (Nuevo modelo obligatorio)
CREATE TABLE IF NOT EXISTS BusquedaLog (
    id_busqueda INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NULL,
    termino VARCHAR(255) NOT NULL,
    tipo ENUM('medicamento','droga','alias') NOT NULL,
    id_medicamento INT NULL,
    id_droga INT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tuvo_resultado BOOLEAN NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE SET NULL,
    FOREIGN KEY (id_medicamento) REFERENCES Medicamento(id_medicamento) ON DELETE SET NULL,
    FOREIGN KEY (id_droga) REFERENCES Droga(id_droga) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;