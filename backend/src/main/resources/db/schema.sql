-- Esquema alineado a entidades actuales (MySQL 8+)

CREATE TABLE usuarios (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255),
  nombre VARCHAR(120),
  apellido VARCHAR(120),
  codigo_pais VARCHAR(10),
  telefono VARCHAR(30),
  tipo_documento VARCHAR(20),
  cedula_identidad VARCHAR(50),
  pais VARCHAR(120),
  ciudad VARCHAR(120),
  direccion VARCHAR(200),
  rol VARCHAR(20),
  activo TINYINT(1),
  fecha_registro DATETIME,
  ultima_conexion DATETIME,
  reset_token VARCHAR(255),
  reset_token_expiry DATETIME
);

CREATE TABLE habitaciones (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  numero VARCHAR(20),
  tipo VARCHAR(30),
  piso INT NOT NULL DEFAULT 1,
  capacidad INT,
  precio_noche DECIMAL(10,2),
  descripcion TEXT,
  estado VARCHAR(30),
  climatizacion TINYINT(1),
  television TINYINT(1),
  wifi TINYINT(1),
  bano TINYINT(1),
  minibar TINYINT(1)
);

CREATE TABLE habitacion_servicios (
  habitacion_id BIGINT NOT NULL,
  servicio VARCHAR(120) NOT NULL,
  PRIMARY KEY (habitacion_id, servicio),
  CONSTRAINT fk_hab_servicios
    FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id)
    ON DELETE CASCADE
);

CREATE TABLE habitacion_imagenes (
  habitacion_id BIGINT NOT NULL,
  imagen_url VARCHAR(300) NOT NULL,
  PRIMARY KEY (habitacion_id, imagen_url),
  CONSTRAINT fk_hab_imagenes
    FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id)
    ON DELETE CASCADE
);

CREATE TABLE reservas (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  usuario_id BIGINT,
  habitacion_id BIGINT,
  -- Tipo y modo de reserva (wizard frontend)
  tipo_reserva VARCHAR(20),   -- individual | familiar | pasadia | grupal
  modo_espacio VARCHAR(20),   -- habitaciones | piso | casa
  espacio      VARCHAR(20),   -- piso1 | piso2 | completo
  -- Fechas y precio
  fecha_ingreso DATE,
  fecha_salida DATE,
  noches INT,
  precio_total DECIMAL(10,2),
  precio_noche DECIMAL(10,2),
  temporada VARCHAR(10),      -- alta | media | baja
  estado VARCHAR(30),
  -- Personas
  huespedes INT,
  ninos3  INT DEFAULT 0,
  ninos10 INT DEFAULT 0,
  ninos11 INT DEFAULT 0,
  -- Datos del huésped
  nombre_huesped VARCHAR(120),
  apellido_huesped VARCHAR(120),
  email_contacto VARCHAR(120),
  pais VARCHAR(120),
  tipo_documento VARCHAR(20),
  numero_documento VARCHAR(50),
  codigo_pais VARCHAR(10),
  telefono_contacto VARCHAR(30),
  observaciones TEXT,
  -- Auditoría
  fecha_creacion DATETIME,
  fecha_modificacion DATETIME,
  CONSTRAINT fk_reserva_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_reserva_habitacion
    FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id)
);

-- Habitaciones adicionales por reserva (múltiples habitaciones en un wizard)
CREATE TABLE reserva_habitaciones (
  reserva_id   BIGINT NOT NULL,
  habitacion_id BIGINT NOT NULL,
  PRIMARY KEY (reserva_id, habitacion_id),
  CONSTRAINT fk_res_hab_reserva
    FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE,
  CONSTRAINT fk_res_hab_habitacion
    FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id)
);

CREATE INDEX idx_reserva_fechas ON reservas (fecha_ingreso, fecha_salida);
CREATE INDEX idx_reserva_estado ON reservas (estado);
CREATE INDEX idx_usuario_email ON usuarios (email);

-- Tabla de Pagos
CREATE TABLE pagos (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  reserva_id BIGINT NOT NULL,
  usuario_id BIGINT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  metodo_pago VARCHAR(50) NOT NULL,
  estado VARCHAR(30) NOT NULL,
  numero_transaccion VARCHAR(100),
  referencia_banco VARCHAR(100),
  fecha_pago DATETIME,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion DATETIME,
  CONSTRAINT fk_pago_reserva
    FOREIGN KEY (reserva_id) REFERENCES reservas(id),
  CONSTRAINT fk_pago_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de Servicios Adicionales
CREATE TABLE servicios_adicionales (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  tipo VARCHAR(50),
  disponible TINYINT(1) DEFAULT 1,
  capacidad INT,
  duracion_horas INT,
  incluye_transporte TINYINT(1) DEFAULT 0,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion DATETIME
);

-- Tabla de relación: Servicios en Reservas
CREATE TABLE reserva_servicios (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  reserva_id BIGINT NOT NULL,
  servicio_id BIGINT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  fecha_reserva DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reserva_servicio_reserva
    FOREIGN KEY (reserva_id) REFERENCES reservas(id),
  CONSTRAINT fk_reserva_servicio_servicio
    FOREIGN KEY (servicio_id) REFERENCES servicios_adicionales(id),
  UNIQUE KEY uk_reserva_servicio (reserva_id, servicio_id)
);

-- Índices adicionales
CREATE INDEX idx_pago_estado ON pagos (estado);
CREATE INDEX idx_pago_fecha ON pagos (fecha_pago);
CREATE INDEX idx_servicio_tipo ON servicios_adicionales (tipo);
CREATE INDEX idx_reserva_servicio_fecha ON reserva_servicios (fecha_reserva);

-- Tabla de Reseñas y Calificaciones
CREATE TABLE resenas (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  reserva_id BIGINT NOT NULL,
  usuario_id BIGINT NOT NULL,
  habitacion_id BIGINT NOT NULL,
  calificacion_general INT NOT NULL,
  calificacion_limpieza INT,
  calificacion_servicio INT,
  calificacion_confort INT,
  calificacion_ubicacion INT,
  titulo VARCHAR(200),
  comentario TEXT,
  recomendaria TINYINT(1) DEFAULT 1,
  fotos_url TEXT,
  respuesta_admin TEXT,
  fecha_respuesta DATETIME,
  estado VARCHAR(30) DEFAULT 'pendiente',
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion DATETIME,
  CONSTRAINT fk_resena_reserva
    FOREIGN KEY (reserva_id) REFERENCES reservas(id),
  CONSTRAINT fk_resena_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_resena_habitacion
    FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id),
  CHECK (calificacion_general >= 1 AND calificacion_general <= 5)
);

-- Índices para reseñas
CREATE INDEX idx_resena_habitacion ON resenas (habitacion_id);
CREATE INDEX idx_resena_usuario ON resenas (usuario_id);
CREATE INDEX idx_resena_estado ON resenas (estado);
CREATE INDEX idx_resena_calificacion ON resenas (calificacion_general);
CREATE INDEX idx_resena_fecha ON resenas (fecha_creacion);

-- Tabla de Métodos de Pago Disponibles
CREATE TABLE metodos_pago (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(200),
  tipo VARCHAR(50),
  activo TINYINT(1) DEFAULT 1,
  icono_url VARCHAR(300),
  comision_porcentaje DECIMAL(5,2) DEFAULT 0,
  comision_fija DECIMAL(10,2) DEFAULT 0,
  requiere_verificacion TINYINT(1) DEFAULT 0,
  tiempo_confirmacion VARCHAR(50),
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion DATETIME
);

-- Tabla de Credenciales de Integración
CREATE TABLE integracion_proveedores (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  metodo_pago_id BIGINT NOT NULL,
  clave_publica VARCHAR(500),
  clave_privada VARCHAR(500),
  webhook_url VARCHAR(300),
  webhook_secreto VARCHAR(200),
  ambiente VARCHAR(20),
  sincronizado TINYINT(1) DEFAULT 0,
  ultima_validacion DATETIME,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion DATETIME,
  CONSTRAINT fk_integracion_metodo
    FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id)
);

-- Modificar tabla pagos para incluir referencia a metodo_pago
ALTER TABLE pagos ADD COLUMN metodo_pago_id BIGINT;
ALTER TABLE pagos ADD CONSTRAINT fk_pago_metodo
  FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id);

-- Índices para métodos de pago
CREATE INDEX idx_metodo_pago_activo ON metodos_pago (activo);
CREATE INDEX idx_integracion_metodo ON integracion_proveedores (metodo_pago_id);

-- Datos iniciales - Métodos de Pago
INSERT INTO metodos_pago (nombre, descripcion, tipo, activo, comision_porcentaje, comision_fija, tiempo_confirmacion) VALUES
('Visa', 'Tarjeta de crédito Visa', 'tarjeta_credito', 1, 2.5, 0, 'Inmediata'),
('PayPal', 'Pago a través de PayPal', 'billetera_digital', 1, 3.5, 0, 'Inmediata'),
('Transferencia Bancaria', 'Transferencia bancaria directa', 'transferencia', 1, 0, 500, '1-3 días hábiles'),
('Mastercard', 'Tarjeta de crédito Mastercard', 'tarjeta_credito', 1, 2.5, 0, 'Inmediata'),
('American Express', 'Tarjeta American Express', 'tarjeta_credito', 1, 3.0, 0, 'Inmediata');

-- Datos iniciales - Credenciales de Integración (VALORES DE PRUEBA)
INSERT INTO integracion_proveedores (metodo_pago_id, clave_publica, clave_privada, webhook_url, webhook_secreto, ambiente, sincronizado) VALUES
(1, 'pk_test_visa_2024', 'sk_test_visa_secret_2024', 'https://webhook.example.com/visa', 'visa_webhook_secret_2024', 'sandbox', 1),
(2, 'pk_test_paypal_2024', 'sk_test_paypal_secret_2024', 'https://webhook.example.com/paypal', 'paypal_webhook_secret_2024', 'sandbox', 1);

-- Tabla de Promociones y Descuentos
CREATE TABLE promociones (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(300),
  tipo_descuento VARCHAR(20),
  valor_descuento DECIMAL(10,2) NOT NULL,
  porcentaje_descuento INT,
  minimo_reserva DECIMAL(10,2),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  usos_limitados INT,
  usos_actuales INT DEFAULT 0,
  activo TINYINT(1) DEFAULT 1,
  aplicable_habitaciones TINYINT(1) DEFAULT 1,
  aplicable_servicios TINYINT(1) DEFAULT 1,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion DATETIME
);

-- Tabla de Empleados
CREATE TABLE empleados (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  usuario_id BIGINT,
  nombre VARCHAR(120) NOT NULL,
  apellido VARCHAR(120),
  email VARCHAR(120) NOT NULL UNIQUE,
  telefono VARCHAR(30),
  cargo VARCHAR(100) NOT NULL,
  departamento VARCHAR(50),
  fecha_contratacion DATE NOT NULL,
  fecha_terminacion DATE,
  salario DECIMAL(12,2),
  activo TINYINT(1) DEFAULT 1,
  numero_empleado VARCHAR(20) UNIQUE,
  turno VARCHAR(50),
  datos_bancarios VARCHAR(300),
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion DATETIME,
  CONSTRAINT fk_empleado_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de Paquetes Especiales
CREATE TABLE paquetes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50),
  imagen_url VARCHAR(300),
  precio_total DECIMAL(12,2) NOT NULL,
  precio_por_noche DECIMAL(10,2),
  noches_minimas INT,
  capacidad_maxima INT,
  incluye_servicios TEXT,
  servicios_incluidos_ids VARCHAR(500),
  descuento_porcentaje INT,
  disponible TINYINT(1) DEFAULT 1,
  fecha_inicio DATE,
  fecha_fin DATE,
  validez_meses INT,
  activo TINYINT(1) DEFAULT 1,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion DATETIME
);

-- Tabla de Relación: Paquetes y Habitaciones
CREATE TABLE paquete_habitaciones (
  paquete_id BIGINT NOT NULL,
  habitacion_id BIGINT NOT NULL,
  PRIMARY KEY (paquete_id, habitacion_id),
  CONSTRAINT fk_paquete_hab_paquete
    FOREIGN KEY (paquete_id) REFERENCES paquetes(id),
  CONSTRAINT fk_paquete_hab_habitacion
    FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id)
);

-- Tabla de Contactos y Mensajes de Soporte
CREATE TABLE contactos (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  usuario_id BIGINT,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL,
  telefono VARCHAR(30),
  asunto VARCHAR(200) NOT NULL,
  mensaje TEXT NOT NULL,
  categoria VARCHAR(50),
  prioridad VARCHAR(20) DEFAULT 'normal',
  estado VARCHAR(30) DEFAULT 'nuevo',
  respuesta TEXT,
  fecha_respuesta DATETIME,
  respondido_por BIGINT,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion DATETIME,
  CONSTRAINT fk_contacto_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_contacto_respondido_por
    FOREIGN KEY (respondido_por) REFERENCES empleados(id)
);

-- Índices para las nuevas tablas
CREATE INDEX idx_promocion_codigo ON promociones (codigo);
CREATE INDEX idx_promocion_activo ON promociones (activo);
CREATE INDEX idx_promocion_fecha ON promociones (fecha_inicio, fecha_fin);
CREATE INDEX idx_empleado_cargo ON empleados (cargo);
CREATE INDEX idx_empleado_departamento ON empleados (departamento);
CREATE INDEX idx_empleado_activo ON empleados (activo);
CREATE INDEX idx_paquete_tipo ON paquetes (tipo);
CREATE INDEX idx_paquete_activo ON paquetes (activo);
CREATE INDEX idx_paquete_precio ON paquetes (precio_total);
CREATE INDEX idx_contacto_estado ON contactos (estado);
CREATE INDEX idx_contacto_prioridad ON contactos (prioridad);
CREATE INDEX idx_contacto_fecha ON contactos (fecha_creacion);

-- ============================================================
-- DATOS INICIALES — Habitaciones reales Hospedaje Sebastián
-- Se insertan solo si la tabla está vacía para evitar duplicados
-- ============================================================

INSERT INTO habitaciones (numero, tipo, piso, capacidad, precio_noche, descripcion, estado, climatizacion, television, wifi, bano, minibar)
SELECT * FROM (SELECT
  '101', 'Individual', 1, 4, 80000.00,
  'Habitación principal del piso 1 con cama doble y camarote. Baño privado, ideal para 4 personas en un ambiente acogedor.',
  'DISPONIBLE', 0, 0, 1, 1, 0
) AS tmp WHERE NOT EXISTS (SELECT 1 FROM habitaciones WHERE numero = '101');

INSERT INTO habitaciones (numero, tipo, piso, capacidad, precio_noche, descripcion, estado, climatizacion, television, wifi, bano, minibar)
SELECT * FROM (SELECT
  '102', 'Doble', 1, 2, 100000.00,
  'Habitación doble con cama matrimonial. Comparte baño con la habitación 103. Cómoda y tranquila.',
  'DISPONIBLE', 0, 0, 1, 0, 0
) AS tmp WHERE NOT EXISTS (SELECT 1 FROM habitaciones WHERE numero = '102');

INSERT INTO habitaciones (numero, tipo, piso, capacidad, precio_noche, descripcion, estado, climatizacion, television, wifi, bano, minibar)
SELECT * FROM (SELECT
  '103', 'Doble', 1, 2, 100000.00,
  'Habitación doble con cama matrimonial. Comparte baño con la habitación 102. Ambiente tranquilo y acogedor.',
  'DISPONIBLE', 0, 0, 1, 0, 0
) AS tmp WHERE NOT EXISTS (SELECT 1 FROM habitaciones WHERE numero = '103');

INSERT INTO habitaciones (numero, tipo, piso, capacidad, precio_noche, descripcion, estado, climatizacion, television, wifi, bano, minibar)
SELECT * FROM (SELECT
  '201', 'Individual', 2, 4, 80000.00,
  'Habitación con cama doble y camarote. Baño privado, ideal para 4 personas en un ambiente acogedor y tranquilo.',
  'DISPONIBLE', 0, 0, 1, 1, 0
) AS tmp WHERE NOT EXISTS (SELECT 1 FROM habitaciones WHERE numero = '201');

INSERT INTO habitaciones (numero, tipo, piso, capacidad, precio_noche, descripcion, estado, climatizacion, television, wifi, bano, minibar)
SELECT * FROM (SELECT
  '202', 'Doble', 2, 2, 110000.00,
  'Habitación doble acogedora con cama matrimonial. Comparte baño con la habitación 203. Perfecta para parejas.',
  'DISPONIBLE', 0, 0, 1, 0, 0
) AS tmp WHERE NOT EXISTS (SELECT 1 FROM habitaciones WHERE numero = '202');

INSERT INTO habitaciones (numero, tipo, piso, capacidad, precio_noche, descripcion, estado, climatizacion, television, wifi, bano, minibar)
SELECT * FROM (SELECT
  '203', 'Doble', 2, 2, 110000.00,
  'Habitación doble con cama matrimonial y ambiente tranquilo. Comparte baño con la habitación 202.',
  'DISPONIBLE', 0, 0, 1, 0, 0
) AS tmp WHERE NOT EXISTS (SELECT 1 FROM habitaciones WHERE numero = '203');

INSERT INTO habitaciones (numero, tipo, piso, capacidad, precio_noche, descripcion, estado, climatizacion, television, wifi, bano, minibar)
SELECT * FROM (SELECT
  '204', 'Individual', 2, 4, 80000.00,
  'Habitación con cama doble y camarote. Baño privado, ideal para 4 personas en un ambiente acogedor y tranquilo.',
  'DISPONIBLE', 0, 0, 1, 1, 0
) AS tmp WHERE NOT EXISTS (SELECT 1 FROM habitaciones WHERE numero = '204');

-- Servicios de cada habitación
INSERT INTO habitacion_servicios (habitacion_id, servicio)
SELECT id, 'WiFi gratis' FROM habitaciones WHERE numero IN ('101','102','103','201','202','203','204')
  AND NOT EXISTS (SELECT 1 FROM habitacion_servicios hs WHERE hs.habitacion_id = habitaciones.id AND hs.servicio = 'WiFi gratis');

INSERT INTO habitacion_servicios (habitacion_id, servicio)
SELECT id, 'Agua caliente' FROM habitaciones WHERE numero IN ('101','102','103','201','202','203','204')
  AND NOT EXISTS (SELECT 1 FROM habitacion_servicios hs WHERE hs.habitacion_id = habitaciones.id AND hs.servicio = 'Agua caliente');

INSERT INTO habitacion_servicios (habitacion_id, servicio)
SELECT id, 'Cocina equipada' FROM habitaciones WHERE numero IN ('101','102','103','201','202','203','204')
  AND NOT EXISTS (SELECT 1 FROM habitacion_servicios hs WHERE hs.habitacion_id = habitaciones.id AND hs.servicio = 'Cocina equipada');

INSERT INTO habitacion_servicios (habitacion_id, servicio)
SELECT id, 'Lavandería' FROM habitaciones WHERE numero IN ('101','103','201','204')
  AND NOT EXISTS (SELECT 1 FROM habitacion_servicios hs WHERE hs.habitacion_id = habitaciones.id AND hs.servicio = 'Lavandería');

-- Imágenes de cada habitación
INSERT INTO habitacion_imagenes (habitacion_id, imagen_url)
SELECT id, 'assets/habitaciones/piso1/hab101.jpg' FROM habitaciones WHERE numero = '101'
  AND NOT EXISTS (SELECT 1 FROM habitacion_imagenes hi WHERE hi.habitacion_id = habitaciones.id);

INSERT INTO habitacion_imagenes (habitacion_id, imagen_url)
SELECT id, 'assets/habitaciones/piso1/hab102.jpg' FROM habitaciones WHERE numero = '102'
  AND NOT EXISTS (SELECT 1 FROM habitacion_imagenes hi WHERE hi.habitacion_id = habitaciones.id);

INSERT INTO habitacion_imagenes (habitacion_id, imagen_url)
SELECT id, 'assets/habitaciones/piso1/hab103.jpg' FROM habitaciones WHERE numero = '103'
  AND NOT EXISTS (SELECT 1 FROM habitacion_imagenes hi WHERE hi.habitacion_id = habitaciones.id);

INSERT INTO habitacion_imagenes (habitacion_id, imagen_url)
SELECT id, 'assets/habitaciones/piso2/hab201.jpeg' FROM habitaciones WHERE numero = '201'
  AND NOT EXISTS (SELECT 1 FROM habitacion_imagenes hi WHERE hi.habitacion_id = habitaciones.id);

INSERT INTO habitacion_imagenes (habitacion_id, imagen_url)
SELECT id, 'assets/habitaciones/piso2/hab202.jpeg' FROM habitaciones WHERE numero = '202'
  AND NOT EXISTS (SELECT 1 FROM habitacion_imagenes hi WHERE hi.habitacion_id = habitaciones.id);

INSERT INTO habitacion_imagenes (habitacion_id, imagen_url)
SELECT id, 'assets/habitaciones/piso2/hab203.jpg' FROM habitaciones WHERE numero = '203'
  AND NOT EXISTS (SELECT 1 FROM habitacion_imagenes hi WHERE hi.habitacion_id = habitaciones.id);

INSERT INTO habitacion_imagenes (habitacion_id, imagen_url)
SELECT id, 'assets/habitaciones/piso2/hab204.jpg' FROM habitaciones WHERE numero = '204'
  AND NOT EXISTS (SELECT 1 FROM habitacion_imagenes hi WHERE hi.habitacion_id = habitaciones.id);
