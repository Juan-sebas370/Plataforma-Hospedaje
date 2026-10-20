import { Injectable } from '@angular/core';

export interface BusquedaDisponibilidad {
  fechaEntrada: string;
  fechaSalida: string;
  adultos: number;
  ninos3: number;
  ninos10: number;
  ninos11: number;
  tipoReserva: 'individual' | 'familiar' | 'pasadia' | 'grupal';
}

const BUSQUEDA_KEY = 'hospedaje-busqueda-disponibilidad';

@Injectable({ providedIn: 'root' })
export class BusquedaDisponibilidadService {
  guardar(busqueda: BusquedaDisponibilidad): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(BUSQUEDA_KEY, JSON.stringify(busqueda));
    }
  }

  leer(): BusquedaDisponibilidad | null {
    if (typeof sessionStorage === 'undefined') return null;
    const valor = sessionStorage.getItem(BUSQUEDA_KEY);
    if (!valor) return null;

    try {
      return JSON.parse(valor) as BusquedaDisponibilidad;
    } catch {
      sessionStorage.removeItem(BUSQUEDA_KEY);
      return null;
    }
  }
}
