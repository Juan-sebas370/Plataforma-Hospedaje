/**
 * Configuración para ambiente DESARROLLO
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  wsUrl: 'ws://localhost:3000/ws',

  // Timeouts
  requestTimeout: 30000,
  reconnectTimeout: 5000,

  // Logging
  enableLogging: true,
  enableDebugMode: true,
  logLevel: 'debug', // 'error', 'warn', 'info', 'debug'

  // Features
  features: {
    mockData: true,
    offlineMode: true,
    analyticsEnabled: false,
    paymentMethods: ['tarjeta', 'transferencia', 'paypal', 'efectivo'],
  },

  // Validacion
  validation: {
    passwordMinLength: 8,
    sessionTimeout: 3600000, // 60 minutos
    tokenRefreshInterval: 900000, // 15 minutos
  },

  // Cache
  cache: {
    enabled: true,
    duration: 1800000, // 30 minutos
  },
};
