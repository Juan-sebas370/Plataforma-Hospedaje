import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Habitacion {
  id: number;
  numero: string;
  tipo: string;
  piso: number;
  capacidad: number;
  precioNoche: number;
  descripcion: string;
  servicios: string[];
  imagenes: string[];
  estado: string;
  climatizacion: boolean;
  television: boolean;
  wifi: boolean;
  bano: boolean;
  minibar: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HabitacionService {
  private apiUrl = `${environment.apiUrl}/habitaciones`;

  constructor(private http: HttpClient) { }

  obtenerTodas(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(this.apiUrl);
  }

  obtenerDisponibles(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(`${this.apiUrl}/disponibles`);
  }

  obtenerPorPiso(piso: number): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(`${this.apiUrl}/piso/${piso}`);
  }

  obtenerPorId(id: number): Observable<Habitacion> {
    return this.http.get<Habitacion>(`${this.apiUrl}/${id}`);
  }
}
