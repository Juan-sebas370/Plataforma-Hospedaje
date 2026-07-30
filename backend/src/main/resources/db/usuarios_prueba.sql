-- Script para insertar usuarios de prueba en Hotel Sebastian
-- Base de datos: hotel_sebastian
-- Nota: Las contraseñas deben estar hasheadas con BCrypt en producción

-- Seleccionar la base de datos
USE hotel_sebastian;

-- Usuario de prueba: Sebastian
-- Email: sebastian@gmail.com
-- Contraseña original: jiampi2018*
-- Contraseña hasheada BCrypt: $2a$10$N9qo8uLOickgx2ZMQbicOeEwNl.9Kx8WPdqxEj/Jb8Z8l7dVJ1xDi

INSERT INTO usuarios (
  email,
  password,
  nombre,
  apellido,
  codigo_pais,
  telefono,
  tipo_documento,
  cedula_identidad,
  pais,
  ciudad,
  direccion,
  rol,
  activo,
  fecha_registro
) VALUES (
  'sebastian@gmail.com',
  '$2a$10$N9qo8uLOickgx2ZMQbicOeEwNl.9Kx8WPdqxEj/Jb8Z8l7dVJ1xDi',
  'Juan Sebastián',
  'Pérez',
  '+57',
  '3001234567',
  'CC',
  '1234567890',
  'Colombia',
  'Medellín',
  'Calle 10 #20-30',
  'USUARIO',
  1,
  NOW()
);

-- Nota: Para usar este script en MySQL:
-- mysql -u usuario -p base_datos < usuarios_prueba.sql

-- O ejecutar directamente en MySQL CLI:
-- SOURCE usuarios_prueba.sql;
