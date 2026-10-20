import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Icono } from '../../../shared/icono';
import { PasoId, ReservaEstado } from '../reserva-estado';
import { formatCOP, formatFecha, plural } from '../reserva.catalogo';

/** Resumen vivo de la reserva: se actualiza con cada cambio y permite saltar a editar. */
@Component({
  selector: 'app-resumen-reserva',
  imports: [NgTemplateOutlet, Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./reservas-ui.css', './resumen-reserva.css'],
  template: `
    <div class="resumen">
      <div class="resumen__foto" [style.background-image]="'url(' + estado.imagenEspacio() + ')'">
        <span class="pastilla temporada--{{ estado.temporada() }}">Temporada {{ estado.nombreTemporada() }}</span>
      </div>

      <div class="resumen__cuerpo">
        <h3>Tu reserva</h3>

        <ul class="filas">
          <li>
            <app-icono [name]="estado.tipoInfo().icono" [size]="16" />
            <span>{{ estado.tipoInfo().nombre }}</span>
            <ng-container *ngTemplateOutlet="editar; context: { $implicit: 'viaje' }" />
          </li>
          <li [class.vacia]="!estado.config().fechaEntrada">
            <app-icono name="calendar" [size]="16" />
            @if (estado.config().fechaEntrada) {
              <span>
                {{ formatFecha(estado.config().fechaEntrada) }}
                @if (estado.config().fechaSalida) { → {{ formatFecha(estado.config().fechaSalida) }} }
                @if (estado.noches()) { <small>{{ plural(estado.noches(), 'noche') }}</small> }
              </span>
            } @else {
              <span>Sin fechas todavía</span>
            }
            <ng-container *ngTemplateOutlet="editar; context: { $implicit: 'viaje' }" />
          </li>
          <li>
            <app-icono name="users" [size]="16" />
            <span>{{ estado.resumenPersonas() }}</span>
            <ng-container *ngTemplateOutlet="editar; context: { $implicit: 'viaje' }" />
          </li>
          @if (!estado.esDia()) {
            <li [class.vacia]="!estado.nombreEspacio()">
              <app-icono name="home" [size]="16" />
              <span>{{ estado.nombreEspacio() || 'Espacio por elegir' }}</span>
              <ng-container *ngTemplateOutlet="editar; context: { $implicit: 'espacio' }" />
            </li>
          }
          @if (estado.datos().nombre && estado.visitados().has('datos')) {
            <li>
              <app-icono name="id" [size]="16" />
              <span>{{ estado.datos().nombre }} {{ estado.datos().apellido }}</span>
              <ng-container *ngTemplateOutlet="editar; context: { $implicit: 'datos' }" />
            </li>
          }
        </ul>

        @if (estado.precio().total > 0) {
          <div class="precio">
            <div class="precio__fila">
              <span>{{ formatCOP(estado.precio().porPersona) }} × persona{{ estado.esDia() ? '' : ' / noche' }}</span>
            </div>
            @if (estado.noches() > 1) {
              <div class="precio__fila">
                <span>{{ formatCOP(estado.precio().noche) }} por noche × {{ estado.noches() }}</span>
              </div>
            }
            <div class="precio__total">
              <span>Total</span>
              <strong>{{ formatCOP(estado.precio().total) }}</strong>
            </div>
          </div>
        } @else {
          <p class="sin-precio">
            @if (!estado.config().fechaEntrada || (!estado.esDia() && !estado.config().fechaSalida)) {
              Elige tus fechas para ver el precio.
            } @else {
              Elige un espacio para ver el precio.
            }
          </p>
        }

        <ul class="garantias">
          <li><app-icono name="check" [size]="13" [stroke]="2.5" /> Sin cargos ocultos</li>
          <li><app-icono name="lock" [size]="13" /> Pago seguro con Wompi</li>
          <li><app-icono name="mail" [size]="13" /> Confirmación por correo</li>
        </ul>
      </div>
    </div>

    <ng-template #editar let-paso>
      @if (estado.paso() !== paso && estado.puedeIrA(paso)) {
        <button type="button" class="editar" (click)="ir(paso)" [attr.aria-label]="'Editar ' + paso">
          <app-icono name="edit" [size]="13" />
        </button>
      }
    </ng-template>
  `,
})
export class ResumenReserva {
  readonly estado = inject(ReservaEstado);
  readonly formatCOP = formatCOP;
  readonly formatFecha = formatFecha;
  readonly plural = plural;

  ir(paso: PasoId): void {
    this.estado.irA(paso);
  }
}
