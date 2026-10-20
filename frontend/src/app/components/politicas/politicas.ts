import { ChangeDetectionStrategy, Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Icono } from '../../shared/icono';
import { HospedajeService } from '../../services/hospedaje.service';
import { IdPolitica, VIGENTE_DESDE, documentosPoliticas } from '../../data/politicas';
import { PoliticaDocumento } from './politica-documento';

/** /politicas — Política de reservas, Reglamento interno y Política de datos (una pestaña cada uno; #reserva, #reglamento, #datos). */
@Component({
  selector: 'app-politicas',
  imports: [Icono, PoliticaDocumento],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pol">
      <header class="pol__cabecera">
        <span class="etiqueta">Hospedaje Sebastián</span>
        <h1>Políticas y reglamento</h1>
        <p>Lo que aceptas al reservar. Vigente desde el {{ vigente }}.</p>
      </header>

      <div class="pestanas" role="tablist" aria-label="Documentos">
        @for (d of documentos(); track d.id) {
          <button type="button" role="tab" class="pestana" [id]="'tab-' + d.id"
                  [attr.aria-selected]="activo() === d.id" [attr.aria-controls]="'panel-' + d.id"
                  [attr.tabindex]="activo() === d.id ? 0 : -1"
                  (click)="elegir(d.id)" (keydown)="teclado($event)">{{ d.corto }}</button>
        }
      </div>

      @for (d of documentos(); track d.id) {
        @if (activo() === d.id) {
          <article class="pol__doc" role="tabpanel" [id]="'panel-' + d.id" [attr.aria-labelledby]="'tab-' + d.id">
            <div class="pol__doc-cabecera">
              <h2>{{ d.titulo }}</h2>
              <button type="button" class="imprimir" (click)="imprimir()">
                <app-icono name="imprimir" [size]="16" [stroke]="2" /> Imprimir
              </button>
            </div>
            <app-politica-documento [documento]="d" />
          </article>
        }
      }

      <p class="pol__contacto">
        ¿Dudas sobre estas políticas? Escríbenos a <a [href]="'mailto:' + hospedaje.datos().correo">{{ hospedaje.datos().correo }}</a>
        o por WhatsApp al {{ hospedaje.datos().whatsapp }}.
      </p>
    </section>
  `,
  styles: `
    :host { display: block; }
    .pol { max-width: 880px; margin: 0 auto; padding: calc(85px + 1.75rem) 1.25rem 3rem; }
    .etiqueta { font-size: .75rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #8A5A12; }
    h1 { margin: .3rem 0 .4rem; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(1.8rem, 4vw, 2.4rem); color: #0A3D6D; }
    .pol__cabecera p { margin: 0 0 1.5rem; color: #5F5A54; }
    .pestanas { display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: 1rem; }
    .pestana {
      min-height: 44px; padding: .55rem 1.1rem; border-radius: 999px;
      border: 1.5px solid #E1D6C5; background: #fff; color: #0A3D6D;
      font: inherit; font-weight: 700; font-size: .92rem; cursor: pointer;
    }
    .pestana[aria-selected="true"] { background: #0E5A9C; border-color: #0E5A9C; color: #fff; }
    .pestana:focus-visible, .imprimir:focus-visible { outline: 3px solid #B87A1F; outline-offset: 2px; }
    .pol__doc { background: #fff; border: 1px solid #E8DCCB; border-radius: 20px; padding: 1.6rem 1.75rem; box-shadow: 0 14px 40px rgba(10, 61, 109, .07); }
    .pol__doc-cabecera { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: .9rem; }
    h2 { margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 1.45rem; color: #0A3D6D; }
    .imprimir {
      display: inline-flex; align-items: center; gap: .4rem; flex-shrink: 0; min-height: 40px; padding: .4rem .9rem;
      border-radius: 999px; border: 1.5px solid #CBB99D; background: #fff; color: #0A3D6D; font: inherit; font-weight: 700; font-size: .85rem; cursor: pointer;
    }
    .pol__contacto { margin: 1.25rem 0 0; font-size: .9rem; color: #5F5A54; }
    .pol__contacto a { color: #0E5A9C; font-weight: 600; }
    @media (max-width: 560px) {
      .pol { padding-top: calc(72px + 1.25rem); }
      .pol__doc { padding: 1.2rem 1.1rem; }
      .pol__doc-cabecera { align-items: flex-start; }
    }
    @media print {
      .pol { padding: 0; }
      .pestanas, .imprimir, .pol__contacto { display: none; }
      .pol__doc { border: 0; box-shadow: none; padding: 0; }
    }
  `,
})
export class Politicas implements OnInit {
  readonly hospedaje = inject(HospedajeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly vigente = VIGENTE_DESDE;
  readonly documentos = computed(() => documentosPoliticas(this.hospedaje.datos()));
  readonly activo = signal<IdPolitica>('reserva');

  ngOnInit(): void {
    this.hospedaje.cargar();
    const f = this.route.snapshot.fragment;
    if (f === 'reglamento' || f === 'datos' || f === 'reserva') this.activo.set(f);
  }

  elegir(id: IdPolitica): void {
    this.activo.set(id);
    this.router.navigate([], { fragment: id, replaceUrl: true });
  }

  /** Flechas izquierda/derecha entre pestañas (patrón de pestañas accesibles). */
  teclado(e: KeyboardEvent): void {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const ids = this.documentos().map(d => d.id);
    const i = ids.indexOf(this.activo());
    const siguiente = ids[(i + (e.key === 'ArrowRight' ? 1 : ids.length - 1)) % ids.length];
    this.elegir(siguiente);
    if (this.isBrowser) setTimeout(() => document.getElementById('tab-' + siguiente)?.focus());
  }

  imprimir(): void {
    if (this.isBrowser) window.print();
  }
}
