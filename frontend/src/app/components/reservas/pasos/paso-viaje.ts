import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Icono } from '../../../shared/icono';
import { Calendario } from '../ui/calendario';
import { CAPACIDAD_MAXIMA, ConfigViaje, ReservaEstado } from '../reserva-estado';
import { TIPOS_RESERVA, TipoReservaId, formatFecha, plural } from '../reserva.catalogo';

type CampoPersonas = 'adultos' | 'ninos11' | 'ninos10' | 'ninos3';

/** Paso 1: qué plan, cuándo y quiénes vienen — todo en una sola pantalla. */
@Component({
  selector: 'app-paso-viaje',
  imports: [Icono, Calendario],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../ui/reservas-ui.css', './paso-viaje.css'],
  templateUrl: './paso-viaje.html',
})
export class PasoViaje {
  readonly estado = inject(ReservaEstado);
  readonly tipos = TIPOS_RESERVA;
  readonly formatFecha = formatFecha;
  readonly plural = plural;

  readonly grupos: { campo: CampoPersonas; titulo: string; detalle: string; nota?: string; min: number }[] = [
    { campo: 'adultos', titulo: 'Adultos', detalle: '18 años o más', min: 1 },
    { campo: 'ninos11', titulo: 'Jóvenes', detalle: '11 a 17 años', nota: 'Tarifa completa', min: 0 },
    { campo: 'ninos10', titulo: 'Niños', detalle: '4 a 10 años', nota: '60 % de la tarifa', min: 0 },
    { campo: 'ninos3', titulo: 'Bebés', detalle: '0 a 3 años', nota: 'Gratis · duermen con sus papás', min: 0 },
  ];

  readonly lleno = computed(() => this.estado.personasConCama() >= CAPACIDAD_MAXIMA);

  elegirTipo(tipo: TipoReservaId): void {
    this.estado.actualizarConfig({ tipo });
    this.estado.corregirPasoInexistente();
  }

  cambiarFechas(rango: { entrada: string; salida: string }): void {
    this.estado.actualizarConfig({ fechaEntrada: rango.entrada, fechaSalida: rango.salida });
  }

  limpiarFechas(): void {
    this.estado.actualizarConfig({ fechaEntrada: '', fechaSalida: '' });
  }

  valor(campo: CampoPersonas): number {
    return this.estado.config()[campo];
  }

  puedeSumar(campo: CampoPersonas): boolean {
    return campo === 'ninos3' ? this.valor(campo) < 6 : !this.lleno();
  }

  cambiar(campo: CampoPersonas, delta: number, min: number): void {
    if (delta > 0 && !this.puedeSumar(campo)) return;
    const nuevo = Math.max(min, this.valor(campo) + delta);
    this.estado.actualizarConfig({ [campo]: nuevo } as Partial<ConfigViaje>);
  }
}
