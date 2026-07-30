/**
 * Datos de ejemplo para desarrollo y testing
 */

// Interfaces - Importar del proyecto si es necesario
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  ciudad: string;
  pais: string;
  fechaNacimiento: string;
  direccion: string;
  bio: string;
  foto?: string;
  createdAt: string;
  totalReservas: number;
  puntosAcumulados: number;
  totalGastado: number;
  resenas?: number;
}

export interface Habitacion {
  id: string;
  numero: string;
  tipo: string;
  capacidad: number;
  precioPorNoche: number;
  descripcion: string;
  servicios: string[];
  estadoDisponibilidad: 'disponible' | 'ocupada' | 'mantenimiento';
  imagenes: string[];
  rating: number;
  resenas: number;
  createdAt: string;
}

export interface Reserva {
  id: string;
  usuarioId: string;
  habitacionId: string;
  fechaEntrada: string;
  fechaSalida: string;
  numeroNoches: number;
  precioTotal: number;
  metodoPago: string;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  createdAt: string;
  especialesRequerimientos?: string;
}

export interface Pago {
  id: string;
  reservaId: string;
  usuarioId: string;
  monto: number;
  metodoPago: string;
  estado: 'exitoso' | 'pendiente' | 'fallido';
  transactionId?: string;
  fecha: string;
  ultimoDigitos?: string;
}

export interface MensajeChat {
  id: string;
  conversacionId: string;
  remitente: 'usuario' | 'soporte';
  contenido: string;
  timestamp: string;
  leido: boolean;
}

export interface Conversacion {
  id: string;
  usuarioId: string;
  agente?: string;
  estado: 'abierta' | 'cerrada' | 'en_espera';
  tema: string;
  fechaInicio: string;
  fechaCierre?: string;
  ultimoMensaje: string;
  noLeidosCount: number;
}

// ============================================================================
// USUARIOS DE EJEMPLO
// ============================================================================

export const USUARIOS_EJEMPLO: Usuario[] = [
  {
    id: '001',
    nombre: 'Juan Sebastian',
    email: 'juan@example.com',
    telefono: '+57 312 4567890',
    ciudad: 'Bogotá',
    pais: 'Colombia',
    fechaNacimiento: '1990-05-15',
    direccion: 'Carrera 5 #10-30, Apt 401',
    bio: 'Viajero apasionado por conocer nuevos lugares',
    foto: 'https://ui-avatars.com/api/?name=Juan+Sebastian&background=7C3AED&color=fff',
    createdAt: '2024-01-10',
    totalReservas: 5,
    puntosAcumulados: 2500,
    totalGastado: 5000000,
    resenas: 4,
  },
  {
    id: '002',
    nombre: 'María González',
    email: 'maria@example.com',
    telefono: '+57 301 9876543',
    ciudad: 'Medellín',
    pais: 'Colombia',
    fechaNacimiento: '1995-08-22',
    direccion: 'Calle 50 #7-80, Apt 205',
    bio: 'Fotógrafa profesional viajando por negocios',
    foto: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=EC4899&color=fff',
    createdAt: '2024-02-14',
    totalReservas: 8,
    puntosAcumulados: 4200,
    totalGastado: 8500000,
    resenas: 5,
  },
  {
    id: '003',
    nombre: 'Carlos López',
    email: 'carlos@example.com',
    telefono: '+57 315 5555555',
    ciudad: 'Cali',
    pais: 'Colombia',
    fechaNacimiento: '1988-03-10',
    direccion: 'Avenida 6 #50-25, Apt 301',
    bio: 'Ejecutivo de tecnología en búsqueda de descanso',
    foto: 'https://ui-avatars.com/api/?name=Carlos+Lopez&background=06B6D4&color=fff',
    createdAt: '2024-01-20',
    totalReservas: 12,
    puntosAcumulados: 6800,
    totalGastado: 15000000,
    resenas: 5,
  },
  {
    id: '004',
    nombre: 'Laura Martínez',
    email: 'laura@example.com',
    telefono: '+57 318 2222222',
    ciudad: 'Santa Marta',
    pais: 'Colombia',
    fechaNacimiento: '1992-11-28',
    direccion: 'Calle 10 #1-50, Apt 105',
    bio: 'Diseñadora gráfica y amante del mar',
    foto: 'https://ui-avatars.com/api/?name=Laura+Martinez&background=F59E0B&color=fff',
    createdAt: '2024-02-01',
    totalReservas: 6,
    puntosAcumulados: 3100,
    totalGastado: 6200000,
    resenas: 4,
  },
];

// ============================================================================
// HABITACIONES DE EJEMPLO
// ============================================================================

export const HABITACIONES_EJEMPLO: Habitacion[] = [
  {
    id: 'HAB001',
    numero: '101',
    tipo: 'Individual',
    capacidad: 1,
    precioPorNoche: 150000,
    descripcion:
      'Habitación individual acogedora con vistas a la ciudad, baño privado y Wi-Fi gratuito.',
    servicios: ['WiFi', 'TV', 'Aire Acondicionado', 'Baño Privado', 'Escritorio'],
    estadoDisponibilidad: 'disponible',
    imagenes: [
      'https://via.placeholder.com/400x300?text=Habitacion+Individual+1',
      'https://via.placeholder.com/400x300?text=Habitacion+Individual+2',
    ],
    rating: 4.5,
    resenas: 24,
    createdAt: '2024-01-01',
  },
  {
    id: 'HAB002',
    numero: '102',
    tipo: 'Doble',
    capacidad: 2,
    precioPorNoche: 250000,
    descripcion:
      'Habitación doble confortable con cama queen, baño completo y balcón con vista al parque.',
    servicios: [
      'WiFi',
      'TV',
      'Aire Acondicionado',
      'Baño Completo',
      'Minibar',
      'Balcón',
    ],
    estadoDisponibilidad: 'disponible',
    imagenes: [
      'https://via.placeholder.com/400x300?text=Habitacion+Doble+1',
      'https://via.placeholder.com/400x300?text=Habitacion+Doble+2',
    ],
    rating: 4.7,
    resenas: 42,
    createdAt: '2024-01-01',
  },
  {
    id: 'HAB003',
    numero: '103',
    tipo: 'Familiar',
    capacidad: 4,
    precioPorNoche: 450000,
    descripcion:
      'Habitación familiar amplia con 2 habitaciones, salón y baño compartido. Perfecta para familias.',
    servicios: [
      'WiFi',
      'TV',
      'Aire Acondicionado',
      '2 Baños',
      'Cocina',
      'Sala de Estar',
    ],
    estadoDisponibilidad: 'disponible',
    imagenes: [
      'https://via.placeholder.com/400x300?text=Habitacion+Familiar+1',
      'https://via.placeholder.com/400x300?text=Habitacion+Familiar+2',
    ],
    rating: 4.8,
    resenas: 56,
    createdAt: '2024-01-01',
  },
  {
    id: 'HAB004',
    numero: '201',
    tipo: 'Suite',
    capacidad: 2,
    precioPorNoche: 600000,
    descripcion:
      'Suite de lujo con jacuzzi, salón privado, minibar completo y servicio de concierge 24/7.',
    servicios: [
      'WiFi Premium',
      'TV 4K',
      'Clima Automático',
      'Baño Completo',
      'Jacuzzi',
      'Minibar',
      'Sala Privada',
      'Servicio Concierge',
    ],
    estadoDisponibilidad: 'ocupada',
    imagenes: [
      'https://via.placeholder.com/400x300?text=Suite+Lujo+1',
      'https://via.placeholder.com/400x300?text=Suite+Lujo+2',
    ],
    rating: 5.0,
    resenas: 18,
    createdAt: '2024-01-01',
  },
  {
    id: 'HAB005',
    numero: '104',
    tipo: 'Individual',
    capacidad: 1,
    precioPorNoche: 120000,
    descripcion: 'Habitación individual económica, limpia y funcional para viajeros de negocios.',
    servicios: ['WiFi', 'TV', 'Aire Acondicionado', 'Baño Privado'],
    estadoDisponibilidad: 'disponible',
    imagenes: [
      'https://via.placeholder.com/400x300?text=Habitacion+Economica+1',
    ],
    rating: 4.2,
    resenas: 31,
    createdAt: '2024-01-01',
  },
  {
    id: 'HAB006',
    numero: '105',
    tipo: 'Doble',
    capacidad: 2,
    precioPorNoche: 280000,
    descripcion:
      'Habitación doble premium con decoración moderna, cama king-size y vista al atardecer.',
    servicios: [
      'WiFi',
      'TV Smart',
      'Aire Acondicionado',
      'Baño Premium',
      'Minibar',
      'Balcón Grande',
    ],
    estadoDisponibilidad: 'disponible',
    imagenes: [
      'https://via.placeholder.com/400x300?text=Habitacion+Premium+1',
    ],
    rating: 4.9,
    resenas: 67,
    createdAt: '2024-01-02',
  },
  {
    id: 'HAB007',
    numero: '202',
    tipo: 'Suite',
    capacidad: 2,
    precioPorNoche: 550000,
    descripcion: 'Suite ejecutiva con zona de trabajo, baño de vapor y servicio de desayuno incluido.',
    servicios: [
      'WiFi Premium',
      'TV 4K',
      'Baño de Vapor',
      'Zona de Trabajo',
      'Desayuno Incluido',
      'Minibar Completo',
    ],
    estadoDisponibilidad: 'disponible',
    imagenes: [
      'https://via.placeholder.com/400x300?text=Suite+Ejecutiva+1',
    ],
    rating: 4.6,
    resenas: 22,
    createdAt: '2024-01-02',
  },
  {
    id: 'HAB008',
    numero: '106',
    tipo: 'Familiar',
    capacidad: 4,
    precioPorNoche: 500000,
    descripcion: 'Habitación familiar con buena iluminación, zona de juegos para niños y cuna disponible.',
    servicios: [
      'WiFi',
      'TV',
      'Aire Acondicionado',
      '2 Baños',
      'Zona Juegos',
      'Cuna Disponible',
    ],
    estadoDisponibilidad: 'disponible',
    imagenes: [
      'https://via.placeholder.com/400x300?text=Familia+Confort+1',
    ],
    rating: 4.4,
    resenas: 38,
    createdAt: '2024-01-03',
  },
];

// ============================================================================
// RESERVAS DE EJEMPLO
// ============================================================================

export const RESERVAS_EJEMPLO: Reserva[] = [
  {
    id: 'RES001',
    usuarioId: '001',
    habitacionId: 'HAB002',
    fechaEntrada: '2024-12-15',
    fechaSalida: '2024-12-18',
    numeroNoches: 3,
    precioTotal: 750000,
    metodoPago: 'tarjeta',
    estado: 'confirmada',
    createdAt: '2024-11-20',
    especialesRequerimientos: 'Habitación tranquila sin ruido',
  },
  {
    id: 'RES002',
    usuarioId: '002',
    habitacionId: 'HAB006',
    fechaEntrada: '2024-12-20',
    fechaSalida: '2024-12-25',
    numeroNoches: 5,
    precioTotal: 1400000,
    metodoPago: 'paypal',
    estado: 'confirmada',
    createdAt: '2024-11-18',
    especialesRequerimientos: 'Tarjeta de bienvenida para aniversario',
  },
  {
    id: 'RES003',
    usuarioId: '003',
    habitacionId: 'HAB003',
    fechaEntrada: '2024-11-25',
    fechaSalida: '2024-11-28',
    numeroNoches: 3,
    precioTotal: 1350000,
    metodoPago: 'transferencia',
    estado: 'completada',
    createdAt: '2024-11-10',
  },
  {
    id: 'RES004',
    usuarioId: '004',
    habitacionId: 'HAB005',
    fechaEntrada: '2024-12-01',
    fechaSalida: '2024-12-05',
    numeroNoches: 4,
    precioTotal: 480000,
    metodoPago: 'tarjeta',
    estado: 'confirmada',
    createdAt: '2024-11-22',
  },
  {
    id: 'RES005',
    usuarioId: '001',
    habitacionId: 'HAB007',
    fechaEntrada: '2024-12-28',
    fechaSalida: '2024-12-31',
    numeroNoches: 3,
    precioTotal: 1650000,
    metodoPago: 'tarjeta',
    estado: 'pendiente',
    createdAt: '2024-11-25',
    especialesRequerimientos: 'Cena especial de año nuevo',
  },
];

// ============================================================================
// PAGOS DE EJEMPLO
// ============================================================================

export const PAGOS_EJEMPLO: Pago[] = [
  {
    id: 'PAG001',
    reservaId: 'RES001',
    usuarioId: '001',
    monto: 750000,
    metodoPago: 'tarjeta',
    estado: 'exitoso',
    transactionId: 'TXN_20241115_001',
    fecha: '2024-11-15',
    ultimoDigitos: '4242',
  },
  {
    id: 'PAG002',
    reservaId: 'RES002',
    usuarioId: '002',
    monto: 1400000,
    metodoPago: 'paypal',
    estado: 'exitoso',
    transactionId: 'PP_20241118_002',
    fecha: '2024-11-18',
  },
  {
    id: 'PAG003',
    reservaId: 'RES003',
    usuarioId: '003',
    monto: 1350000,
    metodoPago: 'transferencia',
    estado: 'exitoso',
    transactionId: 'TRF_20241110_003',
    fecha: '2024-11-10',
  },
  {
    id: 'PAG004',
    reservaId: 'RES004',
    usuarioId: '004',
    monto: 480000,
    metodoPago: 'tarjeta',
    estado: 'exitoso',
    transactionId: 'TXN_20241122_004',
    fecha: '2024-11-22',
    ultimoDigitos: '8765',
  },
];

// ============================================================================
// MENSAJES DE CHAT DE EJEMPLO
// ============================================================================

export const MENSAJES_CHAT_EJEMPLO: MensajeChat[] = [
  {
    id: 'MSG001',
    conversacionId: 'CONV001',
    remitente: 'usuario',
    contenido: '¿Cuál es la política de cancelación?',
    timestamp: '2024-11-20T10:30:00Z',
    leido: true,
  },
  {
    id: 'MSG002',
    conversacionId: 'CONV001',
    remitente: 'soporte',
    contenido:
      'Puedes cancelar gratuitamente hasta 7 días antes de la fecha de entrada. Después de ese período, se cobra el 50% de la tarifa.',
    timestamp: '2024-11-20T10:32:00Z',
    leido: true,
  },
  {
    id: 'MSG003',
    conversacionId: 'CONV001',
    remitente: 'usuario',
    contenido: '¿Hay cargos por mascotas?',
    timestamp: '2024-11-20T10:35:00Z',
    leido: true,
  },
  {
    id: 'MSG004',
    conversacionId: 'CONV001',
    remitente: 'soporte',
    contenido:
      'Sí, cobramos $50,000 COP por noche por mascota. Se requiere aceptar nuestra política de mascotas.',
    timestamp: '2024-11-20T10:37:00Z',
    leido: true,
  },
  {
    id: 'MSG005',
    conversacionId: 'CONV002',
    remitente: 'usuario',
    contenido: 'Mi recibo no llegó a mi email',
    timestamp: '2024-11-21T14:15:00Z',
    leido: true,
  },
  {
    id: 'MSG006',
    conversacionId: 'CONV002',
    remitente: 'soporte',
    contenido:
      'Lo sentimos, voy a verificar. ¿Cuál es el número de tu reserva?',
    timestamp: '2024-11-21T14:17:00Z',
    leido: true,
  },
];

// ============================================================================
// CONVERSACIONES DE EJEMPLO
// ============================================================================

export const CONVERSACIONES_EJEMPLO: Conversacion[] = [
  {
    id: 'CONV001',
    usuarioId: '001',
    agente: 'Carlos - Soporte',
    estado: 'cerrada',
    tema: 'Política de cancelación',
    fechaInicio: '2024-11-20T10:30:00Z',
    fechaCierre: '2024-11-20T10:45:00Z',
    ultimoMensaje: '¿Hay cargos por mascotas?',
    noLeidosCount: 0,
  },
  {
    id: 'CONV002',
    usuarioId: '002',
    agente: 'María - Soporte',
    estado: 'abierta',
    tema: 'Problema con recibo',
    fechaInicio: '2024-11-21T14:15:00Z',
    ultimoMensaje: '¿Cuál es el número de tu reserva?',
    noLeidosCount: 1,
  },
  {
    id: 'CONV003',
    usuarioId: '003',
    agente: 'Pedro - Soporte',
    estado: 'en_espera',
    tema: 'Solicitud de cambio de habitación',
    fechaInicio: '2024-11-22T09:00:00Z',
    ultimoMensaje: 'Verificando disponibilidad de habitaciones...',
    noLeidosCount: 2,
  },
  {
    id: 'CONV004',
    usuarioId: '004',
    estado: 'abierta',
    tema: 'Descripción de servicio de transporte',
    fechaInicio: '2024-11-23T16:45:00Z',
    ultimoMensaje: '¿Ofrecen servicio de shuttle al aeropuerto?',
    noLeidosCount: 0,
  },
];

// ============================================================================
// FUNCIÓN PARA OBTENER DATOS DE EJEMPLO
// ============================================================================

export class MockDataService {
  /**
   * Obtener usuario de ejemplo por ID
   */
  static obtenerUsuario(id: string): Usuario | undefined {
    return USUARIOS_EJEMPLO.find((u) => u.id === id);
  }

  /**
   * Obtener todas las habitaciones
   */
  static obtenerHabitaciones(): Habitacion[] {
    return HABITACIONES_EJEMPLO;
  }

  /**
   * Obtener habitación por ID
   */
  static obtenerHabitacion(id: string): Habitacion | undefined {
    return HABITACIONES_EJEMPLO.find((h) => h.id === id);
  }

  /**
   * Obtener habitaciones disponibles
   */
  static obtenerHabitacionesDisponibles(): Habitacion[] {
    return HABITACIONES_EJEMPLO.filter(
      (h) => h.estadoDisponibilidad === 'disponible'
    );
  }

  /**
   * Obtener habitaciones por tipo
   */
  static obtenerHabitacionesPorTipo(tipo: string): Habitacion[] {
    return HABITACIONES_EJEMPLO.filter((h) => h.tipo === tipo);
  }

  /**
   * Obtener habitaciones dentro de rango de precio
   */
  static obtenerHabitacionesPorPrecio(
    minimo: number,
    maximo: number
  ): Habitacion[] {
    return HABITACIONES_EJEMPLO.filter(
      (h) => h.precioPorNoche >= minimo && h.precioPorNoche <= maximo
    );
  }

  /**
   * Obtener habitaciones con capacidad mínima
   */
  static obtenerHabitacionesPorCapacidad(capacidad: number): Habitacion[] {
    return HABITACIONES_EJEMPLO.filter((h) => h.capacidad >= capacidad);
  }

  /**
   * Obtener todas las reservas de un usuario
   */
  static obtenerReservasUsuario(usuarioId: string): Reserva[] {
    return RESERVAS_EJEMPLO.filter((r) => r.usuarioId === usuarioId);
  }

  /**
   * Obtener reserva por ID
   */
  static obtenerReserva(id: string): Reserva | undefined {
    return RESERVAS_EJEMPLO.find((r) => r.id === id);
  }

  /**
   * Obtener todos los pagos de un usuario
   */
  static obtenerPagosUsuario(usuarioId: string): Pago[] {
    return PAGOS_EJEMPLO.filter((p) => p.usuarioId === usuarioId);
  }

  /**
   * Obtener conversaciones de un usuario
   */
  static obtenerConversacionesUsuario(usuarioId: string): Conversacion[] {
    return CONVERSACIONES_EJEMPLO.filter((c) => c.usuarioId === usuarioId);
  }

  /**
   * Obtener mensajes de una conversación
   */
  static obtenerMensajesConversacion(conversacionId: string): MensajeChat[] {
    return MENSAJES_CHAT_EJEMPLO.filter(
      (m) => m.conversacionId === conversacionId
    );
  }

  /**
   * Simular reserva de habitación
   */
  static crearReservaEjemplo(
    usuarioId: string,
    habitacionId: string,
    fechaEntrada: string,
    fechaSalida: string
  ): Reserva {
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    const noches = Math.ceil(
      (salida.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24)
    );

    const habitacion = this.obtenerHabitacion(habitacionId);
    const precioTotal = (habitacion?.precioPorNoche || 250000) * noches;

    const nuevoId = `RES${String(RESERVAS_EJEMPLO.length + 1).padStart(3, '0')}`;

    const nuevaReserva: Reserva = {
      id: nuevoId,
      usuarioId,
      habitacionId,
      fechaEntrada,
      fechaSalida,
      numeroNoches: noches,
      precioTotal,
      metodoPago: 'pendiente',
      estado: 'pendiente',
      createdAt: new Date().toISOString().split('T')[0],
    };

    RESERVAS_EJEMPLO.push(nuevaReserva);
    return nuevaReserva;
  }

  /**
   * Obtener estadísticas de usuario
   */
  static obtenerEstadisticasUsuario(
    usuarioId: string
  ): {
    totalReservas: number;
    reservasActivas: number;
    totalGastado: number;
    proximaReserva: Reserva | null;
  } {
    const reservas = this.obtenerReservasUsuario(usuarioId);
    const hoy = new Date().toISOString().split('T')[0];

    return {
      totalReservas: reservas.length,
      reservasActivas: reservas.filter(
        (r) => r.estado === 'confirmada' && r.fechaSalida >= hoy
      ).length,
      totalGastado: reservas.reduce((acc, r) => acc + r.precioTotal, 0),
      proximaReserva:
        reservas
          .filter((r) => r.fechaEntrada >= hoy)
          .sort(
            (a, b) =>
              new Date(a.fechaEntrada).getTime() -
              new Date(b.fechaEntrada).getTime()
          )[0] || null,
    };
  }
}
