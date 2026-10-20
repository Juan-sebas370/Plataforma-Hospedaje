/**
 * Configuración global de la aplicación
 */

import { environment } from '../../environments/environment';

export const CONFIG = {
  // URLs
  API_BASE_URL: environment.apiUrl,
  WS_URL: environment.wsUrl,

  // Timeouts
  REQUEST_TIMEOUT: 30000, // 30 segundos
  RECONNECT_TIMEOUT: 5000, // 5 segundos

  // Paginación
  ITEMS_PER_PAGE: 10,
  MAX_ITEMS_PER_PAGE: 100,

  // Validaciones
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 255,

  // Archivos
  MAX_FILE_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],

  // Cache
  CACHE_DURATION_MINUTES: 30,
  SESSION_TIMEOUT_MINUTES: 60,

  // Moneda
  CURRENCY: 'COP',
  LOCALE: 'es-CO',

  // Rutas públicas
  PUBLIC_ROUTES: [
    '',
    'inicio',
    'habitaciones',
    'galeria',
    'servicios',
    'contacto',
    'login',
    'registro',
    'forgot-password',
    'reset-password',
  ],

  // Rutas protegidas (requieren cuenta). Reservar, pagar y confirmar NO
  // requieren login — el huésped ingresa sus propios datos al reservar.
  PROTECTED_ROUTES: [
    'perfil',
    'cambiar-contrasena',
    'dashboard',
  ],
};

/**
 * Mensajes de la aplicación
 */
export const MENSAJES = {
  // Éxito
  EXITO_LOGIN: 'Bienvenido! Has iniciado sesión correctamente.',
  EXITO_REGISTRO: 'Cuenta creada exitosamente. Bienvenido!',
  EXITO_PERFIL_ACTUALIZADO: 'Perfil actualizado exitosamente.',
  EXITO_CONTRASENA_CAMBIADA: 'Contraseña cambiada correctamente.',
  EXITO_RESERVA_CREADA: 'Reserva creada exitosamente.',
  EXITO_PAGO_PROCESADO: 'Pago procesado correctamente.',
  EXITO_FOTO_SUBIDA: 'Foto subida correctamente.',

  // Errores comunes
  ERROR_EMAIL_EXISTENTE: 'Este email ya está registrado.',
  ERROR_USUARIO_NO_ENCONTRADO: 'Usuario no encontrado.',
  ERROR_CONTRASENA_INVALIDA: 'Contraseña incorrecta.',
  ERROR_AUTENTICACION: 'Error de autenticación. Por favor inicia sesión nuevamente.',
  ERROR_PERMISO_DENEGADO: 'No tienes permiso para realizar esta acción.',
  ERROR_RECURSO_NO_ENCONTRADO: 'El recurso no fue encontrado.',
  ERROR_VALIDACION: 'Por favor verifica los datos ingresados.',
  ERROR_CONEXION: 'Error de conexión. Verifica tu internet.',
  ERROR_TIMEOUT: 'La solicitud tardó demasiado tiempo. Intenta nuevamente.',
  ERROR_SERVIDOR: 'Error del servidor. Intenta más tarde.',

  // Advertencias
  ADVERTENCIA_SESION_EXPIRA: 'Tu sesión expirará en {minutos} minutos.',
  ADVERTENCIA_CAMBIOS_NO_GUARDADOS: 'Tienes cambios sin guardar. ¿Deseas continuar?',
  ADVERTENCIA_ELIMINAR_PERMANENTE: 'Esta acción no se puede deshacer. ¿Estás seguro?',

  // Información
  INFO_CARGANDO: 'Cargando...',
  INFO_PROCESANDO: 'Procesando tu solicitud...',
  INFO_NO_RESULTADOS: 'No hay resultados para mostrar.',
  INFO_CONECTANDO: 'Conectando...',
};

/**
 * Tipos de habitación
 */
export const TIPOS_HABITACION = {
  INDIVIDUAL: 'Individual',
  DOBLE: 'Doble',
  FAMILIAS: 'Familiar',
  SUITE: 'Suite',
};

/**
 * Estados de reserva
 */
export const ESTADOS_RESERVA = {
  PENDIENTE: 'pendiente',
  CONFIRMADA: 'confirmada',
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada',
  RECHAZADA: 'rechazada',
};

/**
 * Métodos de pago
 */
export const METODOS_PAGO = {
  TARJETA: 'tarjeta',
  TRANSFERENCIA: 'transferencia',
  PAYPAL: 'paypal',
  EFECTIVO: 'efectivo',
};

/**
 * Estados de pago
 */
export const ESTADOS_PAGO = {
  EXITOSO: 'exitoso',
  PENDIENTE: 'pendiente',
  FALLIDO: 'fallido',
  REEMBOLSADO: 'reembolsado',
};

/**
 * Colores para estados
 */
export const COLORES_ESTADO = {
  exitoso:    '#27ae60',
  pendiente:  '#D1902C',   // --accent dorado
  fallido:    '#c0392b',
  confirmada: '#0E5A9C',   // --primary azul colonial
  completada: '#27ae60',
  cancelada:  '#c0392b',
  rechazada:  '#7A7A7A',   // --muted
};

/**
 * Pautas de convencion de nombres
 */
export const CONVENCION_NOMBRES = {
  COMPONENTES: 'kebab-case',
  SERVICIOS: 'camelCase',
  INTERFACES: 'PascalCase',
  CONSTANTES: 'UPPER_SNAKE_CASE',
  VARIABLES: 'camelCase',
  FUNCIONES: 'camelCase',
  MÉTODOS: 'camelCase',
  PROPIEDADES: 'camelCase',
};
