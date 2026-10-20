import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, afterNextRender, computed, inject, signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icono } from '../../shared/icono';
import { AccesibilidadService } from '../../services/accesibilidad.service';
import { LUGARES_TURISTICOS, LugarTuristico } from '../../data/guia-turistica';

/** Segundos que tarda cada lugar en cruzar: define la velocidad del desfile. */
const SEGUNDOS_POR_LUGAR = 5;

/** Intercala categorías (restaurante, mirador, atracción…) para que la cinta se vea variada. */
function intercalar(lugares: LugarTuristico[]): LugarTuristico[] {
  const grupos = new Map<string, LugarTuristico[]>();
  for (const l of lugares) grupos.set(l.categoria, [...(grupos.get(l.categoria) ?? []), l]);
  const filas = [...grupos.values()];
  const resultado: LugarTuristico[] = [];
  for (let i = 0; resultado.length < lugares.length; i++) {
    for (const fila of filas) if (fila[i]) resultado.push(fila[i]);
  }
  return resultado;
}

/**
 * "Cosas para hacer en Filandia": las fotos de los lugares desfilan solas en
 * una cinta continua. Se detiene con el mouse o el foco encima, tiene botón de
 * pausa (WCAG 2.2.2) y, si la persona pidió reducir el movimiento, queda quieta
 * y se recorre deslizando. Solo se anima mientras está a la vista.
 */
@Component({
  selector: 'app-guia-turistica',
  imports: [RouterLink, Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './guia-turistica.html',
  styleUrl: './guia-turistica.css',
})
export class GuiaTuristica {
  private readonly accesibilidad = inject(AccesibilidadService);

  // Los parqueaderos no son un plan: siguen en la guía completa de Servicios, no en la cinta.
  readonly lugares = intercalar(LUGARES_TURISTICOS.filter(l => l.categoria !== 'parqueaderos'));
  readonly duracion = `${this.lugares.length * SEGUNDOS_POR_LUGAR}s`;

  readonly pausadoPorUsuario = signal(false);
  private readonly reanudadoPorUsuario = signal(false);
  readonly visible = signal(false);
  readonly enMovimiento = computed(() =>
    !this.pausadoPorUsuario() && (this.reanudadoPorUsuario() || !this.accesibilidad.movimientoReducido()));

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    // La cinta solo se mueve cuando la sección está en pantalla.
    const host = inject(ElementRef<HTMLElement>).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observador = new IntersectionObserver(([e]) => this.visible.set(e.isIntersecting), { threshold: 0.1 });
      observador.observe(host);
      destroyRef.onDestroy(() => observador.disconnect());
    });
  }

  alternar(): void {
    const activo = this.enMovimiento();
    this.pausadoPorUsuario.set(activo);
    this.reanudadoPorUsuario.set(!activo);
  }
}
