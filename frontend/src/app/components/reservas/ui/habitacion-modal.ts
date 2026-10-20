import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, computed, input, output, signal, viewChild,
} from '@angular/core';
import { Icono } from '../../../shared/icono';
import { HabitacionReservable } from '../reserva.catalogo';

/**
 * Ficha completa de una habitación: galería de fotos, camas, baño, capacidad
 * y servicios, con el botón para elegirla o quitarla de la reserva.
 */
@Component({
  selector: 'app-habitacion-modal',
  imports: [Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./reservas-ui.css', './habitacion-modal.css'],
  template: `
    <div class="fondo" (click)="cerrar.emit()"></div>
    <div class="ficha" role="dialog" aria-modal="true" [attr.aria-label]="habitacion().nombre" tabindex="-1" #dialogo>
      <button type="button" class="ficha__cerrar" (click)="cerrar.emit()" aria-label="Cerrar">
        <app-icono name="close" [size]="20" />
      </button>

      <div class="galeria">
        <img class="galeria__foto" [src]="fotos()[foto()]" [alt]="habitacion().nombre + ', foto ' + (foto() + 1)" />
        @if (fotos().length > 1) {
          <button type="button" class="galeria__flecha galeria__flecha--izq" (click)="mover(-1)" aria-label="Foto anterior">
            <app-icono name="chevron-left" [size]="20" />
          </button>
          <button type="button" class="galeria__flecha galeria__flecha--der" (click)="mover(1)" aria-label="Foto siguiente">
            <app-icono name="chevron-right" [size]="20" />
          </button>
          <span class="galeria__contador">{{ foto() + 1 }} / {{ fotos().length }}</span>
        }
        <span class="galeria__piso">Piso {{ habitacion().piso }}</span>
      </div>

      @if (fotos().length > 1) {
        <div class="miniaturas">
          @for (f of fotos(); track f; let i = $index) {
            <button type="button" class="miniatura" [class.miniatura--activa]="i === foto()" (click)="foto.set(i)"
                    [attr.aria-label]="'Ver foto ' + (i + 1)">
              <img [src]="f" alt="" />
            </button>
          }
        </div>
      }

      <div class="ficha__cuerpo">
        <div class="ficha__cabecera">
          <div>
            <h3>{{ habitacion().nombre }}</h3>
            @if (habitacion().destacado) {
              <span class="pastilla pastilla--dorada"><app-icono name="star" [size]="12" /> {{ habitacion().destacado }}</span>
            }
          </div>
        </div>

        <p class="ficha__descripcion">{{ habitacion().descripcion }}</p>

        <div class="datos">
          <div class="dato"><app-icono name="users" /><div><strong>{{ habitacion().capacidad }} personas</strong><span>Capacidad</span></div></div>
          <div class="dato"><app-icono name="bed" /><div><strong>{{ habitacion().camas }}</strong><span>Camas</span></div></div>
          <div class="dato"><app-icono name="bath" /><div><strong>{{ habitacion().bano }}</strong><span>Baño</span></div></div>
        </div>

        <h4 class="bloque-titulo">Incluye</h4>
        <ul class="servicios">
          @for (s of habitacion().servicios; track s) {
            <li><app-icono name="check" [size]="14" [stroke]="2.5" /> {{ s }}</li>
          }
        </ul>

        <div class="ficha__acciones">
          @if (ocupada()) {
            <div class="aviso aviso--error"><app-icono name="info" [size]="16" /> No está disponible en las fechas que elegiste.</div>
          } @else {
            <button type="button" class="btn btn-fantasma" (click)="cerrar.emit()">Seguir viendo</button>
            <button type="button" class="btn" [class.btn-primario]="!seleccionada()" [class.btn-contorno]="seleccionada()"
                    (click)="alternar.emit(); cerrar.emit()">
              @if (seleccionada()) { Quitar de mi reserva } @else { <app-icono name="check" [size]="16" [stroke]="2.5" /> Elegir esta habitación }
            </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class HabitacionModal implements AfterViewInit, OnDestroy {
  readonly habitacion = input.required<HabitacionReservable>();
  readonly seleccionada = input(false);
  readonly ocupada = input(false);
  readonly cerrar = output<void>();
  readonly alternar = output<void>();

  readonly foto = signal(0);
  readonly fotos = computed(() => this.habitacion().imagenes);
  private readonly dialogo = viewChild.required<ElementRef<HTMLElement>>('dialogo');

  /** Elemento que abrió la ficha: al cerrarla, el foco vuelve ahí. */
  private readonly origen = typeof document !== 'undefined' ? document.activeElement as HTMLElement | null : null;

  ngAfterViewInit(): void {
    this.dialogo().nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.origen?.focus?.();
  }

  mover(delta: number): void {
    const total = this.fotos().length;
    this.foto.set((this.foto() + delta + total) % total);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Tab') this.mantenerFoco(e);
    if (e.key === 'Escape') this.cerrar.emit();
    if (e.key === 'ArrowRight') this.mover(1);
    if (e.key === 'ArrowLeft') this.mover(-1);
  }

  /** Mientras la ficha está abierta, Tab recorre solo sus controles. */
  private mantenerFoco(e: KeyboardEvent): void {
    const enfocables = Array.from(this.dialogo().nativeElement.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'));
    if (!enfocables.length) return;
    const primero = enfocables[0], ultimo = enfocables[enfocables.length - 1];
    const activo = document.activeElement;
    if (e.shiftKey && (activo === primero || activo === this.dialogo().nativeElement)) {
      e.preventDefault(); ultimo.focus();
    } else if (!e.shiftKey && activo === ultimo) {
      e.preventDefault(); primero.focus();
    }
  }
}
