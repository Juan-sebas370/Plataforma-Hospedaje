import {
  ChangeDetectionStrategy, Component, ElementRef, OnInit, PLATFORM_ID, effect, inject, signal, untracked, viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservaEstado } from './reserva-estado';
import { formatCOP } from './reserva.catalogo';
import { Icono } from '../../shared/icono';
import { ResumenReserva } from './ui/resumen-reserva';
import { PasoViaje } from './pasos/paso-viaje';
import { PasoEspacio } from './pasos/paso-espacio';
import { PasoDatos } from './pasos/paso-datos';
import { PasoConfirmar } from './pasos/paso-confirmar';

/**
 * Página de reservas: asistente de 4 pasos (3 para pasadía / jornada) con un
 * guía que da consejos, un resumen siempre visible y una barra de acciones
 * fija para no tener que bajar a buscar el botón de continuar.
 */
@Component({
  selector: 'app-reservas',
  imports: [Icono, ResumenReserva, PasoViaje, PasoEspacio, PasoDatos, PasoConfirmar],
  providers: [ReservaEstado],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reservas.html',
  styleUrls: ['./ui/reservas-ui.css', './reservas.css'],
})
export class Reservas implements OnInit {
  readonly estado = inject(ReservaEstado);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly inicio = viewChild<ElementRef<HTMLElement>>('inicio');

  readonly formatCOP = formatCOP;
  readonly resumenAbierto = signal(false);

  constructor() {
    // Al cambiar de paso, volver al inicio del asistente (sin saltar en la primera carga).
    let primera = true;
    effect(() => {
      this.estado.paso();
      if (primera) { primera = false; return; }
      untracked(() => {
        this.resumenAbierto.set(false);
        if (this.isBrowser) this.inicio()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.estado.inicializar(params);
    // Al llegar desde el buscador del inicio, la página venía desplazada.
    if (this.isBrowser) window.scrollTo({ top: 0 });
    // Ya se aplicaron: se quitan de la URL para que al recargar mande el
    // borrador guardado (con lo que la persona eligió después) y no la búsqueda.
    if (this.isBrowser && Object.keys(params).length) {
      this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
    }
  }

  get esUltimo(): boolean {
    return this.estado.paso() === 'confirmar';
  }

  continuar(): void {
    if (this.esUltimo) this.confirmar();
    else this.estado.siguiente();
  }

  private confirmar(): void {
    if (this.estado.enviando()) return;
    if (this.estado.problemaPasoActual()) {
      this.estado.intentoFallido.set('confirmar');
      return;
    }
    this.estado.enviando.set(true);
    this.estado.errorReserva.set('');
    this.estado.crearReserva().subscribe({
      next: ({ id, codigo }) => {
        this.estado.limpiarBorrador();
        // La reserva queda PENDIENTE hasta que se pague en Wompi.
        this.router.navigate(['/pagos'], { queryParams: { reservaId: id, codigo } });
      },
      error: err => {
        this.estado.enviando.set(false);
        this.estado.errorReserva.set(err?.error?.message ?? err?.error?.error
          ?? 'No pudimos crear la reserva. Revisa tu conexión e intenta de nuevo.');
      },
    });
  }
}
