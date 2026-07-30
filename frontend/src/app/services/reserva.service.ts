import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Reserva {
  id: string;
  numeroReserva: string;
  fechaEntrada: string;
  fechaSalida: string;
  habitacion: {
    numero: string;
    tipo: string;
    precio: number;
  };
  estado: 'confirmada' | 'pendiente' | 'cancelada' | 'completada';
  total: number;
}

interface CrearReservaRequest {
  habitacionId: string;
  fechaEntrada: string;
  fechaSalida: string;
  nombreHuesped: string;
  emailHuesped: string;
  telefonoHuesped: string;
  notas?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  private apiUrl = 'http://localhost:3000/api/reservas';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las reservas del usuario autenticado
   */
  obtenerMisReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/mis-reservas`);
  }

  /**
   * Obtiene una reserva específica
   */
  obtenerReserva(id: string): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea una nueva reserva
   */
  crearReserva(data: CrearReservaRequest): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.apiUrl}`, data);
  }

  /**
   * Actualiza una reserva existente
   */
  actualizarReserva(id: string, data: Partial<Reserva>): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Cancela una reserva
   */
  cancelarReserva(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/cancelar`, {});
  }

  /**
   * Obtiene todas las reservas (admin)
   */
  obtenerTodasLasReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/admin/todas`);
  }

  /**
   * Obtiene disponibilidad de habitaciones
   */
  verificarDisponibilidad(
    habitacionId: string,
    fechaEntrada: string,
    fechaSalida: string
  ): Observable<{ disponible: boolean }> {
    return this.http.get<{ disponible: boolean }>(
      `${this.apiUrl}/disponibilidad/${habitacionId}?inicio=${fechaEntrada}&fin=${fechaSalida}`
    );
  }

  /**
   * Descarga el recibo de una reserva
   */
  descargarRecibo(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/recibo`, {
      responseType: 'blob',
    });
  }
}
