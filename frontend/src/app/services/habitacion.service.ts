import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://localhost:3000/api/habitaciones';

  constructor(private http: HttpClient) { }

  obtenerTodas(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(this.apiUrl);
  }

  obtenerDisponibles(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(`${this.apiUrl}/disponibles`);
  }

  obtenerPorId(id: number): Observable<Habitacion> {
    return this.http.get<Habitacion>(`${this.apiUrl}/${id}`);
  }
}
