import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Icono } from '../../../shared/icono';
import { HabitacionModal } from '../ui/habitacion-modal';
import { OpcionGrupo, ReservaEstado } from '../reserva-estado';
import { ESPACIOS, EspacioId, HabitacionReservable, formatCOP, formatFecha, plural } from '../reserva.catalogo';

type Vista = 'habitaciones' | 'pisos' | 'casa';

/**
 * Paso 2: dónde se quedan. Para grupos, primero una recomendación que compara
 * habitaciones sueltas, pisos y casa completa según presupuesto y privacidad;
 * después, la opción de armar la reserva a la medida viendo cada habitación.
 */
@Component({
  selector: 'app-paso-espacio',
  imports: [NgTemplateOutlet, Icono, HabitacionModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../ui/reservas-ui.css', './paso-espacio.css'],
  templateUrl: './paso-espacio.html',
})
export class PasoEspacio {
  readonly estado = inject(ReservaEstado);
  readonly formatCOP = formatCOP;
  readonly formatFecha = formatFecha;
  readonly plural = plural;


  readonly vista = signal<Vista>(
    this.estado.modo() === 'casa' ? 'casa' : this.estado.modo() === 'piso' ? 'pisos' : 'habitaciones');
  readonly detalle = signal<HabitacionReservable | null>(null);

  readonly pisos = ESPACIOS.filter(e => e.id !== 'completo');
  readonly casa = ESPACIOS.find(e => e.id === 'completo')!;

  readonly habitacionesPorPiso = computed(() => [1, 2].map(piso => ({
    piso,
    habitaciones: this.estado.habitaciones().filter(h => h.piso === piso),
  })).filter(g => g.habitaciones.length));

  readonly porcentajeCapacidad = computed(() => {
    const necesarias = Math.max(this.estado.personasConCama(), 1);
    return Math.min(100, Math.round(this.estado.capacidadElegida() / necesarias * 100));
  });

  elegida(h: HabitacionReservable): boolean {
    return this.estado.seleccion().includes(h.id);
  }

  espacioElegido(id: EspacioId): boolean {
    return this.estado.modo() !== 'habitaciones' && this.estado.espacio() === id && this.estado.seleccion().length > 0;
  }

  capacidadInsuficiente(id: EspacioId): boolean {
    return (ESPACIOS.find(e => e.id === id)?.capacidadMax ?? 0) < this.estado.personasConCama();
  }

  etiquetas(o: OpcionGrupo): string[] {
    const t: string[] = [];
    if (o.exclusivo) t.push(o.id === 'completo' ? 'Toda la casa para ustedes' : 'Piso exclusivo');
    return t;
  }

  elegirOpcion(o: OpcionGrupo): void {
    this.estado.elegirOpcion(o);
    this.vista.set(o.id === 'habitaciones' ? 'habitaciones' : o.id === 'completo' ? 'casa' : 'pisos');
  }
}
