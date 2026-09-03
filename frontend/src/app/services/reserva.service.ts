import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  /** Obtener reserva por ID */
  obtenerReserva(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.apiUrl}/${id}`);
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
}
