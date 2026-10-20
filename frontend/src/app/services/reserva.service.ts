import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ── Tipos que coinciden con la entidad Reserva del backend ──

export interface Reserva {
  id?: number;
  usuarioId?: number;

  // Habitaciones
  habitacionId?: number;
  habitacionesIds?: number[];

  // Tipo y modo
  tipoReserva: 'individual' | 'familiar' | 'pasadia' | 'grupal';
  modoEspacio?: 'habitaciones' | 'piso' | 'casa';
  espacio?: string;          // piso1 | piso2 | completo

  // Fechas y precio
  fechaIngreso: string;      // YYYY-MM-DD
  fechaSalida?: string;      // null para pasadía/grupal
  noches?: number;
  precioNoche?: number;
  precioTotal?: number;
  temporada?: 'alta' | 'media' | 'baja';
  estado?: string;
  /** Código secreto que entrega el backend al crear la reserva; permite verla y pagarla sin cuenta. */
  codigoAcceso?: string;
  /** Código visible de la reserva (RSV-2027-00012), el mismo que usa SOGO. */
  codigo?: string;
  /** Casillas del último paso (solo se envían; el backend guarda la fecha y la versión). */
  aceptaPoliticas?: boolean;
  autorizaDatos?: boolean;
  politicasAceptadasAt?: string;
  versionPoliticas?: string;
  consentimientoDatosAt?: string;

  // Personas
  huespedes: number;
  ninos3?: number;
  ninos10?: number;
  ninos11?: number;

  // Datos del huésped
  nombreHuesped: string;
  apellidoHuesped: string;
  emailContacto: string;
  codigoPais: string;
  telefonoContacto: string;
  pais: string;
  tipoDocumento: string;
  numeroDocumento: string;
  observaciones?: string;
}

export interface ReservaResumen {
  id: number;
  tipoReserva: string;
  espacio: string;
  fechaIngreso: string;
  fechaSalida: string;
  noches: number;
  precioTotal: number;
  temporada: string;
  estado: string;
  nombreHuesped: string;
}

/** Respuesta del endpoint GET /reservas/disponibilidad */
export interface Disponibilidad {
  habitacionesOcupadas: number[];   // IDs de habitaciones con reserva activa
  espaciosOcupados:     string[];   // ["piso1", "piso2", "completo"]
  piso1Ocupado:         boolean;
  piso2Ocupado:         boolean;
  casaOcupada:          boolean;
  disponible:           boolean;    // true si no hay ningún conflicto
  mensaje:              string;     // texto para mostrar al usuario
}

@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  private apiUrl = `${environment.apiUrl}/reservas`;

  constructor(private http: HttpClient) {}

  /** Crear reserva desde el wizard */
  crearReserva(data: Reserva): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, data);
  }

  /** Obtener reserva por ID (sin sesión hace falta el código de acceso) */
  obtenerReserva(id: number, codigo?: string | null): Observable<Reserva> {
    const params = codigo ? new HttpParams().set('codigo', codigo) : undefined;
    return this.http.get<Reserva>(`${this.apiUrl}/${id}`, { params });
  }

  /** Reservas del usuario autenticado */
  obtenerMisReservas(usuarioId: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  /** Todas las reservas (admin) */
  obtenerTodasLasReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.apiUrl);
  }

  /** Actualizar una reserva */
  actualizarReserva(id: number, data: Partial<Reserva>): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/${id}`, data);
  }

  /** Cancelar reserva */
  cancelarReserva(id: number): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/${id}/cancelar`, {});
  }

  /** Eliminar reserva */
  eliminarReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Consulta disponibilidad para un rango de fechas.
   * Devuelve habitaciones/espacios ocupados y un mensaje descriptivo.
   */
  verificarDisponibilidad(fechaIngreso: string, fechaSalida?: string): Observable<Disponibilidad> {
    let params = new HttpParams().set('fechaIngreso', fechaIngreso);
    if (fechaSalida) params = params.set('fechaSalida', fechaSalida);
    return this.http.get<Disponibilidad>(`${this.apiUrl}/disponibilidad`, { params });
  }
}
