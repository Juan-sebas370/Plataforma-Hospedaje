import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, computed, inject, input, output, signal, viewChild,
} from '@angular/core';
import { Icono } from '../../../shared/icono';
import { HospedajeService } from '../../../services/hospedaje.service';
import { IdPolitica, VIGENTE_DESDE, documentosPoliticas } from '../../../data/politicas';
import { PoliticaDocumento } from '../../politicas/politica-documento';

/**
 * Políticas dentro del asistente: se leen sin salir de la reserva (los datos
 * escritos no se pierden). Pestañas para pasar entre los tres documentos.
 */
@Component({
  selector: 'app-politica-modal',
  imports: [Icono, PoliticaDocumento],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./reservas-ui.css', './habitacion-modal.css'],
  template: `
    <div class="fondo" (click)="cerrar.emit()"></div>
    <div class="ficha ficha--texto" role="dialog" aria-modal="true" aria-labelledby="politica-titulo" tabindex="-1" #dialogo>
      <button type="button" class="ficha__cerrar" (click)="cerrar.emit()" aria-label="Cerrar">
        <app-icono name="close" [size]="20" />
      </button>
      <div class="ficha__cuerpo">
        <h3 id="politica-titulo" class="politica__titulo">{{ documento().titulo }}</h3>
        <p class="politica__vigencia">Vigente desde el {{ vigente }}</p>
        <div class="politica__pestanas" role="tablist" aria-label="Documentos">
          @for (d of documentos(); track d.id) {
            <button type="button" role="tab" class="politica__pestana" [attr.aria-selected]="d.id === activo()"
                    (click)="activo.set(d.id); subir()">{{ d.corto }}</button>
          }
        </div>
        <app-politica-documento [documento]="documento()" />
        <div class="ficha__acciones">
          <button type="button" class="btn btn-primario" (click)="cerrar.emit()">Entendido</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .ficha--texto { width: min(760px, 100%); }
    .ficha--texto .ficha__cuerpo { padding-top: 1.6rem; }
    .politica__titulo { margin: 0 2.5rem .2rem 0; font-family: 'Playfair Display', Georgia, serif; font-size: 1.4rem; color: #0A3D6D; }
    .politica__vigencia { margin: 0 0 .9rem; font-size: .82rem; color: #5F5A54; }
    .politica__pestanas { display: flex; flex-wrap: wrap; gap: .4rem; margin-bottom: 1.1rem; }
    .politica__pestana {
      min-height: 38px; padding: .35rem .9rem; border-radius: 999px; border: 1.5px solid #E1D6C5;
      background: #fff; color: #0A3D6D; font: inherit; font-size: .85rem; font-weight: 700; cursor: pointer;
    }
    .politica__pestana[aria-selected="true"] { background: #0E5A9C; border-color: #0E5A9C; color: #fff; }
    .politica__pestana:focus-visible { outline: 3px solid #B87A1F; outline-offset: 2px; }
  `,
})
export class PoliticaModal implements AfterViewInit, OnDestroy {
  readonly inicial = input<IdPolitica>('reserva');
  readonly cerrar = output<void>();

  private readonly hospedaje = inject(HospedajeService);
  readonly vigente = VIGENTE_DESDE;
  readonly activo = signal<IdPolitica>('reserva');
  readonly documentos = computed(() => documentosPoliticas(this.hospedaje.datos()));
  readonly documento = computed(() => this.documentos().find(d => d.id === this.activo())!);
  private readonly dialogo = viewChild.required<ElementRef<HTMLElement>>('dialogo');

  /** Elemento que abrió la ventana: al cerrarla, el foco vuelve ahí. */
  private readonly origen = typeof document !== 'undefined' ? document.activeElement as HTMLElement | null : null;

  ngAfterViewInit(): void {
    this.activo.set(this.inicial());
    this.hospedaje.cargar();
    this.dialogo().nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.origen?.focus?.();
  }

  subir(): void {
    this.dialogo().nativeElement.scrollTop = 0;
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') this.cerrar.emit();
    if (e.key === 'Tab') this.mantenerFoco(e);
  }

  /** Mientras la ventana está abierta, Tab recorre solo sus controles. */
  private mantenerFoco(e: KeyboardEvent): void {
    const enfocables = Array.from(this.dialogo().nativeElement.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'));
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
