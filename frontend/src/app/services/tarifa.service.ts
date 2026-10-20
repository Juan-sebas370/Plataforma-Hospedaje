import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { CALENDARIO_FABRICA, CalendarioTemporadas, calendarioTemporadas } from '../components/reservas/reserva.catalogo';

export type TipoTarifa = 'individual' | 'familiar' | 'pasadia' | 'grupal';

/** Tarifa POR PERSONA de un tipo de reserva en cada temporada (se edita en SOGO). */
export interface TarifaTipo {
  tipo: TipoTarifa;
  nombre: string;
  baja: number;
  media: number;
  alta: number;
}

interface TarifaApi {
  tipoReserva: TipoTarifa;
  nombre: string;
  precioBaja: number;
  precioMedia: number;
  precioAlta: number;
}

/**
 * Tarifas por tipo de reserva desde la base de datos (tabla `tarifas_reserva`,
 * editable en SOGO › Alojamiento › Tarifas y temporadas). Se piden una vez
 * y se comparten entre el reservador y el chatbot.
 */
@Injectable({ providedIn: 'root' })
export class TarifaService {
  private readonly http = inject(HttpClient);
  private peticion$?: Observable<TarifaTipo[]>;

  /** null mientras cargan; [] si no se pudieron cargar. */
  readonly tarifas = signal<TarifaTipo[] | null>(null);
  readonly error = signal(false);

  /** Calendario de temporadas (alta, media, festivos, fechas especiales) que se gestiona en SOGO. */
  private cargarTemporadas(): void {
    if (this.temporadasPedidas) return;
    this.temporadasPedidas = true;
    this.http.get<CalendarioTemporadas>(`${environment.apiUrl}/tarifas/temporadas`).subscribe({
      next: c => calendarioTemporadas.set({ ...CALENDARIO_FABRICA, ...c }),
      error: () => { this.temporadasPedidas = false; },   // se queda con las reglas de fábrica
    });
  }
  private temporadasPedidas = false;

  cargar(): Observable<TarifaTipo[]> {
    this.cargarTemporadas();
    if (this.tarifas()?.length) return of(this.tarifas()!);
    this.peticion$ ??= this.http.get<TarifaApi[]>(`${environment.apiUrl}/tarifas`).pipe(
      map(lista => lista.map(t => ({
        tipo: t.tipoReserva, nombre: t.nombre, baja: t.precioBaja, media: t.precioMedia, alta: t.precioAlta,
      }))),
      tap({
        next: lista => { this.tarifas.set(lista); this.error.set(false); },
        error: () => { this.tarifas.set([]); this.error.set(true); this.peticion$ = undefined; },
      }),
      shareReplay(1),
    );
    return this.peticion$;
  }

  de(tipo: string): TarifaTipo | undefined {
    return this.tarifas()?.find(t => t.tipo === tipo);
  }
}
