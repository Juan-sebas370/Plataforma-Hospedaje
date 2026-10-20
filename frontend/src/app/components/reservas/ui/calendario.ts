import { ChangeDetectionStrategy, Component, OnInit, computed, input, output, signal } from '@angular/core';
import { Icono } from '../../../shared/icono';
import { Season, calcularTemporada, parseFecha, toDateStr } from '../reserva.catalogo';

interface Dia {
  fecha: string;
  num: number;
  pasado: boolean;
  hoy: boolean;
  temporada: Season;
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto',
  'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/**
 * Calendario para elegir un rango de fechas (llegada → salida) o un solo día
 * (pasadía / jornada). Muestra la temporada de cada día con un punto de color.
 */
@Component({
  selector: 'app-calendario',
  imports: [Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './calendario.css',
  template: `
    <div class="cal">
      <div class="cal-nav">
        <button type="button" class="cal-nav__btn" (click)="moverMes(-1)" [disabled]="!puedeRetroceder()" aria-label="Mes anterior">
          <app-icono name="chevron-left" />
        </button>
        <span class="cal-nav__mes" aria-live="polite">{{ tituloMes() }}</span>
        <button type="button" class="cal-nav__btn" (click)="moverMes(1)" aria-label="Mes siguiente">
          <app-icono name="chevron-right" />
        </button>
      </div>

      <div class="cal-grid cal-grid--semana" aria-hidden="true">
        @for (d of diasSemana; track $index) { <span>{{ d }}</span> }
      </div>

      <div class="cal-grid" role="group" [attr.aria-label]="tituloMes()">
        @for (_ of huecos(); track $index) { <span></span> }
        @for (dia of dias(); track dia.fecha) {
          <button type="button" class="cal-dia"
                  [class.cal-dia--hoy]="dia.hoy"
                  [class.cal-dia--inicio]="dia.fecha === entrada()"
                  [class.cal-dia--fin]="dia.fecha === salida()"
                  [class.cal-dia--rango]="enRango(dia.fecha)"
                  [class.cal-dia--rango-ini]="!!salida() && dia.fecha === entrada()"
                  [class.cal-dia--rango-fin]="dia.fecha === salida()"
                  [attr.data-temporada]="dia.temporada"
                  [disabled]="dia.pasado"
                  [attr.aria-pressed]="dia.fecha === entrada() || dia.fecha === salida()"
                  [attr.aria-label]="dia.num + ' de ' + tituloMes() + ', temporada ' + dia.temporada"
                  (click)="elegir(dia.fecha)">
            <span class="cal-dia__num">{{ dia.num }}</span>
            <span class="cal-dia__punto"></span>
          </button>
        }
      </div>

      <div class="cal-leyenda">
        <span><i data-temporada="baja"></i> Baja</span>
        <span><i data-temporada="media"></i> Media · fines de semana y festivos</span>
        <span><i data-temporada="alta"></i> Alta</span>
      </div>
    </div>
  `,
})
export class Calendario implements OnInit {
  readonly entrada = input('');
  readonly salida = input('');
  readonly unDia = input(false);
  readonly cambio = output<{ entrada: string; salida: string }>();

  readonly diasSemana = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  private readonly hoy = (() => { const h = new Date(); h.setHours(0, 0, 0, 0); return h; })();
  private readonly mes = signal(this.hoy.getMonth());
  private readonly anio = signal(this.hoy.getFullYear());

  readonly tituloMes = computed(() => `${MESES[this.mes()]} ${this.anio()}`);
  readonly puedeRetroceder = computed(() =>
    this.anio() > this.hoy.getFullYear() || this.mes() > this.hoy.getMonth());

  readonly huecos = computed(() => Array(new Date(this.anio(), this.mes(), 1).getDay()));

  readonly dias = computed<Dia[]>(() => {
    const total = new Date(this.anio(), this.mes() + 1, 0).getDate();
    const hoyStr = toDateStr(this.hoy);
    return Array.from({ length: total }, (_, i) => {
      const d = new Date(this.anio(), this.mes(), i + 1);
      const fecha = toDateStr(d);
      return { fecha, num: i + 1, pasado: d < this.hoy, hoy: fecha === hoyStr, temporada: calcularTemporada(d) };
    });
  });

  /** Abre el calendario en el mes de la fecha ya elegida. */
  ngOnInit(): void {
    const entrada = this.entrada();
    if (!entrada) return;
    const d = parseFecha(entrada);
    if (d >= this.hoy) {
      this.mes.set(d.getMonth());
      this.anio.set(d.getFullYear());
    }
  }

  moverMes(delta: number): void {
    let m = this.mes() + delta, a = this.anio();
    if (m < 0) { m = 11; a--; }
    if (m > 11) { m = 0; a++; }
    this.mes.set(m);
    this.anio.set(a);
  }

  enRango(fecha: string): boolean {
    const e = this.entrada(), s = this.salida();
    return !!e && !!s && fecha > e && fecha < s;
  }

  elegir(fecha: string): void {
    if (this.unDia()) {
      this.cambio.emit({ entrada: fecha, salida: '' });
      return;
    }
    const e = this.entrada(), s = this.salida();
    if (!e || s || fecha <= e) this.cambio.emit({ entrada: fecha, salida: '' });
    else this.cambio.emit({ entrada: e, salida: fecha });
  }
}
