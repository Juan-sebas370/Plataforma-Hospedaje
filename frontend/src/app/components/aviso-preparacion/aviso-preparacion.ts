import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, input, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

const VISTO = 'aviso-preparacion-visto';

/**
 * Aviso de "aún no recibimos reservas" mientras el hospedaje se formaliza
 * (environment.reservasHabilitadas = false).
 *  - ventana: aparece una vez por visita sobre cualquier página (app.html).
 *  - página: reemplaza /reservas y /pagos (app.routes.ts).
 */
@Component({
  selector: 'app-aviso-preparacion',
  imports: [RouterLink, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #contenido>
      <span class="etiqueta">Próximamente</span>
      <h2 id="aviso-titulo">Aún no recibimos reservas en línea</h2>
      <p>Hospedaje Sebastián está terminando de preparar su apertura. Muy pronto podrás reservar y pagar tu estadía desde esta página.</p>
      <p class="aviso__suave">Mientras tanto, te invitamos a conocer nuestras habitaciones y servicios.</p>
    </ng-template>

    @if (ventana()) {
      <dialog #dialogo class="aviso aviso--ventana" aria-labelledby="aviso-titulo" (close)="cerrar()">
        <ng-container [ngTemplateOutlet]="contenido" />
        <div class="aviso__acciones">
          <button type="button" class="boton boton--principal" (click)="cerrar()">Entendido</button>
        </div>
      </dialog>
    } @else {
      <section class="pagina">
        <div class="aviso">
          <ng-container [ngTemplateOutlet]="contenido" />
          <div class="aviso__acciones">
            <a routerLink="/habitaciones" class="boton boton--principal">Ver habitaciones</a>
            <a routerLink="/" class="boton">Volver al inicio</a>
          </div>
        </div>
      </section>
    }
  `,
  styles: `
    .pagina { max-width: 640px; margin: 0 auto; padding: calc(85px + 2.5rem) 1.25rem 4rem; }
    .aviso {
      background: #fff; border: 1px solid #E8DCCB; border-radius: 18px;
      padding: 2rem 1.75rem; text-align: center; color: #2B2B2B;
      box-shadow: 0 18px 40px rgba(10, 61, 109, .12);
    }
    .aviso--ventana { width: min(480px, calc(100vw - 2rem)); margin: auto; }
    .aviso--ventana::backdrop { background: rgba(10, 30, 50, .55); }
    .etiqueta { font-size: .75rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #8A5A12; }
    h2 { margin: .4rem 0 .75rem; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(1.45rem, 4vw, 1.9rem); color: #0A3D6D; }
    p { margin: 0 0 .75rem; line-height: 1.6; }
    .aviso__suave { color: #5F5A54; }
    .aviso__acciones { display: flex; flex-wrap: wrap; justify-content: center; gap: .6rem; margin-top: 1.25rem; }
    .boton {
      display: inline-flex; align-items: center; justify-content: center; min-height: 44px;
      padding: .6rem 1.4rem; border-radius: 999px; border: 1.5px solid #E1D6C5;
      background: #fff; color: #0A3D6D; font: inherit; font-weight: 700; text-decoration: none; cursor: pointer;
    }
    .boton--principal { background: #D1902C; border-color: #D1902C; color: #1F1A12; }
    .boton:focus-visible { outline: 3px solid #B87A1F; outline-offset: 2px; }
    @media (max-width: 768px) { .pagina { padding-top: calc(72px + 1.5rem); } }
  `,
})
export class AvisoPreparacion {
  /** true: ventana emergente (una vez por visita); false: página completa. */
  readonly ventana = input(false);
  private readonly dialogo = viewChild<ElementRef<HTMLDialogElement>>('dialogo');

  constructor() {
    afterNextRender(() => {
      const dialogo = this.dialogo()?.nativeElement;
      // En /reservas y /pagos ya se muestra el aviso como página.
      if (!dialogo || /^\/(reservas|pagos)\b/.test(location.pathname)) return;
      try {
        if (sessionStorage.getItem(VISTO)) return;
      } catch { /* sin almacenamiento: se muestra igual */ }
      dialogo.showModal();
    });
  }

  cerrar(): void {
    const dialogo = this.dialogo()?.nativeElement;
    if (dialogo?.open) dialogo.close();
    try { sessionStorage.setItem(VISTO, '1'); } catch { /* sin almacenamiento */ }
  }
}
