-- Usuarios
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,            
    dni VARCHAR(20) UNIQUE,
    telefono VARCHAR(20) UNIQUE
);

-- Empleados
CREATE TABLE IF NOT EXISTS empleados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100)
);

-- Servicios
CREATE TABLE IF NOT EXISTS servicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    duracion_minutos INT NOT NULL, -- en minutos
    precio NUMERIC(10,2) NOT NULL
);

-- Turnos
CREATE TABLE IF NOT EXISTS turnos (
    id SERIAL PRIMARY KEY,
    cliente_id INT REFERENCES clientes(id),
    empleado_id INT REFERENCES empleados(id),
    servicio_id INT REFERENCES servicios(id),
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    duracion_minutos INTEGER NOT NULL,
    hora_fin TIME NOT NULL,
    notas TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente'  -- pendiente, confirmado, cancelado, completado
);


