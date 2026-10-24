/**
 * Configuración para ambiente PRODUCCIÓN
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.hospedajesebastianfilandia.com/api',
  wsUrl: 'wss://api.hospedajesebastianfilandia.com/ws',

  // Timeouts
  requestTimeout: 30000,
  reconnectTimeout: 5000,

  // Logging
  enableLogging: false,
  enableDebugMode: false,
  logLevel: 'error', // Solo errores en producción

  // Features
  features: {
    mockData: false,
    offlineMode: false,
    analyticsEnabled: true,
    paymentMethods: ['tarjeta', 'transferencia', 'paypal'],
  },

  // Validacion
  validation: {
    passwordMinLength: 8,
    sessionTimeout: 1800000, // 30 minutos
    tokenRefreshInterval: 600000, // 10 minutos
  },

  // Cache
  cache: {
    enabled: true,
    duration: 3600000, // 60 minutos
  },
};
