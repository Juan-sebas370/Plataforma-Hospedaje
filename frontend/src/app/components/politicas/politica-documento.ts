import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DocumentoPolitica } from '../../data/politicas';

/** Muestra un documento de políticas (secciones con párrafos y viñetas). Lo usan la página /politicas y el asistente de reservas. */
@Component({
  selector: 'app-politica-documento',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="doc__intro">{{ documento().intro }}</p>
    @for (s of documento().secciones; track s.titulo; let i = $index) {
      <section class="doc__seccion">
        <h3><span class="doc__num" aria-hidden="true">{{ i + 1 }}</span>{{ s.titulo }}</h3>
        @for (p of s.parrafos ?? []; track p) { <p>{{ p }}</p> }
        @if (s.puntos?.length) {
          <ul>@for (p of s.puntos; track p) { <li>{{ p }}</li> }</ul>
        }
      </section>
    }
  `,
  styles: `
    :host { display: block; color: #2B2B2B; line-height: 1.6; font-size: .95rem; }
    .doc__intro { margin: 0 0 1.2rem; color: #5F5A54; }
    .doc__seccion { margin: 0 0 1.25rem; }
    .doc__seccion:last-child { margin-bottom: 0; }
    h3 { display: flex; align-items: center; gap: .55rem; margin: 0 0 .45rem; font-size: 1.02rem; color: #0A3D6D; }
    .doc__num {
      flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%;
      display: grid; place-items: center; font-size: .75rem; font-weight: 700;
      background: #EAF2FA; color: #0A3D6D;
    }
    p { margin: 0 0 .5rem; }
    ul { margin: 0; padding-left: 1.2rem; }
    li { margin-bottom: .35rem; }
    li::marker { color: #B87A1F; }
  `,
})
export class PoliticaDocumento {
  readonly documento = input.required<DocumentoPolitica>();
}
