/**
 * Servicio para inicializar datos de ejemplo en desarrollo
 * Simula la carga de datos desde el backend
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import {
  USUARIOS_EJEMPLO,
  HABITACIONES_EJEMPLO,
  RESERVAS_EJEMPLO,
  PAGOS_EJEMPLO,
  CONVERSACIONES_EJEMPLO,
  MENSAJES_CHAT_EJEMPLO,
  Usuario,
  Habitacion,
  Reserva,
  Pago,
  Conversacion,
  MensajeChat,
  MockDataService,
} from '../data/mock-data';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DatabaseSeederService {
  private datosInitializados$ = new BehaviorSubject<boolean>(false);
  private cargando$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.inicializarDatos();
  }

  /**
   * Inicializar datos de ejemplo si está en modo desarrollo
   */
  private inicializarDatos(): void {
    if (!environment.production && environment.features.mockData) {
      this.cargarDatosEjemplo();
    }
  }

  /**
   * Cargar todos los datos de ejemplo
   */
  cargarDatosEjemplo(): void {
    this.cargando$.next(true);

    setTimeout(() => {
      try {
        // Simular carga de datos
        localStorage.setItem(
          'usuarios_ejemplo',
          JSON.stringify(USUARIOS_EJEMPLO)
        );
        localStorage.setItem(
          'habitaciones_ejemplo',
          JSON.stringify(HABITACIONES_EJEMPLO)
        );
        localStorage.setItem('reservas_ejemplo', JSON.stringify(RESERVAS_EJEMPLO));
        localStorage.setItem('pagos_ejemplo', JSON.stringify(PAGOS_EJEMPLO));
        localStorage.setItem(
          'conversaciones_ejemplo',
          JSON.stringify(CONVERSACIONES_EJEMPLO)
        );
        localStorage.setItem(
          'mensajes_ejemplo',
          JSON.stringify(MENSAJES_CHAT_EJEMPLO)
        );

        this.datosInitializados$.next(true);
        this.cargando$.next(false);

        console.log('✅ Datos de ejemplo cargados correctamente');
      } catch (error) {
        console.error('❌ Error al cargar datos de ejemplo:', error);
        this.cargando$.next(false);
      }
    }, 500); // Simular delay de red
  }

  /**
   * Obtener usuarios de ejemplo
   */
  obtenerUsuarios(): Observable<Usuario[]> {
    if (environment.features.mockData) {
      return of(USUARIOS_EJEMPLO).pipe(delay(1000)); // Simular 1 segundo de latencia
    }
    return of([]);
  }

  /**
   * Obtener habitaciones de ejemplo
   */
  obtenerHabitaciones(): Observable<Habitacion[]> {
    if (environment.features.mockData) {
      return of(HABITACIONES_EJEMPLO).pipe(delay(800));
    }
    return of([]);
  }

  /**
   * Obtener reservas de ejemplo
   */
  obtenerReservas(): Observable<Reserva[]> {
    if (environment.features.mockData) {
      return of(RESERVAS_EJEMPLO).pipe(delay(800));
    }
    return of([]);
  }

  /**
   * Obtener pagos de ejemplo
   */
  obtenerPagos(): Observable<Pago[]> {
    if (environment.features.mockData) {
      return of(PAGOS_EJEMPLO).pipe(delay(600));
    }
    return of([]);
  }

  /**
   * Obtener conversaciones de ejemplo
   */
  obtenerConversaciones(): Observable<Conversacion[]> {
    if (environment.features.mockData) {
      return of(CONVERSACIONES_EJEMPLO).pipe(delay(700));
    }
    return of([]);
  }

  /**
   * Obtener estado de inicialización
   */
  get datosInitializados(): Observable<boolean> {
    return this.datosInitializados$.asObservable();
  }

  /**
   * Obtener estado de carga
   */
  get cargando(): Observable<boolean> {
    return this.cargando$.asObservable();
  }

  /**
   * Limpiar datos de ejemplo
   */
  limpiarDatos(): void {
    try {
      localStorage.removeItem('usuarios_ejemplo');
      localStorage.removeItem('habitaciones_ejemplo');
      localStorage.removeItem('reservas_ejemplo');
      localStorage.removeItem('pagos_ejemplo');
      localStorage.removeItem('conversaciones_ejemplo');
      localStorage.removeItem('mensajes_ejemplo');

      this.datosInitializados$.next(false);
      console.log('✅ Datos de ejemplo eliminados');
    } catch (error) {
      console.error('❌ Error al limpiar datos:', error);
    }
  }

  /**
   * Resetear datos a valores iniciales
   */
  resetearDatos(): void {
    this.limpiarDatos();
    this.cargarDatosEjemplo();
  }

  /**
   * Obtener estadísticas de los datos cargados
   */
  obtenerEstadisticas(): {
    usuarios: number;
    habitaciones: number;
    reservas: number;
    pagos: number;
    conversaciones: number;
    mensajes: number;
  } {
    return {
      usuarios: USUARIOS_EJEMPLO.length,
      habitaciones: HABITACIONES_EJEMPLO.length,
      reservas: RESERVAS_EJEMPLO.length,
      pagos: PAGOS_EJEMPLO.length,
      conversaciones: CONVERSACIONES_EJEMPLO.length,
      mensajes: MENSAJES_CHAT_EJEMPLO.length,
    };
  }

  /**
   * Simular un nuevo usuario
   */
  crearUsuarioEjemplo(usuario: Partial<Usuario>): Observable<Usuario> {
    const nuevoUsuario: Usuario = {
      id: `USR${String(USUARIOS_EJEMPLO.length + 1).padStart(3, '0')}`,
      nombre: usuario.nombre || 'Usuario Nuevo',
      email: usuario.email || `usuario${USUARIOS_EJEMPLO.length + 1}@example.com`,
      telefono: usuario.telefono || '+57 300 0000000',
      ciudad: usuario.ciudad || 'Bogotá',
      pais: usuario.pais || 'Colombia',
      fechaNacimiento: usuario.fechaNacimiento || '1990-01-01',
      direccion: usuario.direccion || 'Calle Principal',
      bio: usuario.bio || 'Bio del usuario',
      createdAt: new Date().toISOString().split('T')[0],
      totalReservas: 0,
      puntosAcumulados: 0,
      totalGastado: 0,
      resenas: 0,
    };

    USUARIOS_EJEMPLO.push(nuevoUsuario);
    return of(nuevoUsuario).pipe(delay(500));
  }

  /**
   * Simular una nueva reserva
   */
  crearReservaEjemplo(
    usuarioId: string,
    habitacionId: string,
    fechaEntrada: string,
    fechaSalida: string
  ): Observable<Reserva> {
    const reserva = MockDataService.crearReservaEjemplo(
      usuarioId,
      habitacionId,
      fechaEntrada,
      fechaSalida
    );
    return of(reserva).pipe(delay(500));
  }

  /**
   * Obtener usuario por email
   */
  obtenerUsuarioPorEmail(email: string): Observable<Usuario | undefined> {
    const usuario = USUARIOS_EJEMPLO.find((u) => u.email === email);
    return of(usuario).pipe(delay(300));
  }

  /**
   * Obtener disponibilidad de habitaciones en rango de fechas
   */
  obtenerDisponibilidad(
    fechaEntrada: string,
    fechaSalida: string
  ): Observable<Habitacion[]> {
    // Simular verificación de disponibilidad
    const habitacionesDisponibles = HABITACIONES_EJEMPLO.filter(
      (h) => h.estadoDisponibilidad === 'disponible'
    );
    return of(habitacionesDisponibles).pipe(delay(800));
  }

  /**
   * Generar reporte de ocupación
   */
  generarReportOcupacion(): Observable<{
    totalHabitaciones: number;
    ocupadas: number;
    disponibles: number;
    mantenimiento: number;
    porcentajeOcupacion: number;
  }> {
    const total = HABITACIONES_EJEMPLO.length;
    const ocupadas = HABITACIONES_EJEMPLO.filter(
      (h) => h.estadoDisponibilidad === 'ocupada'
    ).length;
    const mantenimiento = HABITACIONES_EJEMPLO.filter(
      (h) => h.estadoDisponibilidad === 'mantenimiento'
    ).length;
    const disponibles = total - ocupadas - mantenimiento;

    const reporte = {
      totalHabitaciones: total,
      ocupadas,
      disponibles,
      mantenimiento,
      porcentajeOcupacion: Math.round((ocupadas / total) * 100),
    };

    return of(reporte).pipe(delay(600));
  }

  /**
   * Generar reporte de ingresos
   */
  generarReportIngresos(mesAno?: string): Observable<{
    totalPagos: number;
    cantidadTransacciones: number;
    promedioPago: number;
    metodosPago: { [key: string]: number };
  }> {
    const totalPagos = PAGOS_EJEMPLO.reduce((acc, p) => acc + p.monto, 0);
    const cantidadTransacciones = PAGOS_EJEMPLO.length;
    const promedioPago =
      cantidadTransacciones > 0 ? totalPagos / cantidadTransacciones : 0;

    const metodosPago: { [key: string]: number } = {};
    PAGOS_EJEMPLO.forEach((p) => {
      metodosPago[p.metodoPago] =
        (metodosPago[p.metodoPago] || 0) + p.monto;
    });

    const reporte = {
      totalPagos,
      cantidadTransacciones,
      promedioPago,
      metodosPago,
    };

    return of(reporte).pipe(delay(600));
  }
}
